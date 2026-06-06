let selectedFiles = [];
let batches = [];

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileStats = document.getElementById('fileStats');
const fileStatsText = document.getElementById('fileStatsText');
const fileError = document.getElementById('fileError');
const fileErrorText = document.getElementById('fileErrorText');
const maxFilesSlider = document.getElementById('maxFilesSlider');
const maxSizeSlider = document.getElementById('maxSizeSlider');
const maxFilesVal = document.getElementById('maxFilesVal');
const maxSizeVal = document.getElementById('maxSizeVal');
const processBtn = document.getElementById('processBtn');
const progressSection = document.getElementById('progressSection');
const progressBar = document.getElementById('progressBar');
const progressPct = document.getElementById('progressPct');
const progressDetail = document.getElementById('progressDetail');
const resultsSection = document.getElementById('resultsSection');
const batchList = document.getElementById('batchList');
const downloadAllBtn = document.getElementById('downloadAllBtn');

// Drag & drop
dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.classList.add('border-indigo-400', 'bg-indigo-50');
  dropzone.classList.remove('border-slate-200');
});

['dragleave', 'dragend'].forEach(evt =>
  dropzone.addEventListener(evt, () => {
    dropzone.classList.remove('border-indigo-400', 'bg-indigo-50');
    dropzone.classList.add('border-slate-200');
  })
);

dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('border-indigo-400', 'bg-indigo-50');
  dropzone.classList.add('border-slate-200');
  handleFiles([...e.dataTransfer.files]);
});

fileInput.addEventListener('change', () => handleFiles([...fileInput.files]));

// Sliders
maxFilesSlider.addEventListener('input', () => {
  maxFilesVal.textContent = maxFilesSlider.value;
});
maxSizeSlider.addEventListener('input', () => {
  maxSizeVal.textContent = maxSizeSlider.value + ' MB';
});

function handleFiles(files) {
  const supported = files.filter(f => {
    const n = f.name.toLowerCase();
    return n.endsWith('.fit.gz') || n.endsWith('.fit') || n.endsWith('.gpx');
  });
  const skipped = files.length - supported.length;

  fileStats.classList.add('hidden');
  fileError.classList.add('hidden');
  resultsSection.classList.add('hidden');
  progressSection.classList.add('hidden');
  batches = [];

  if (supported.length === 0) {
    fileErrorText.textContent = 'No supported files found. Select .fit, .fit.gz, or .gpx files.';
    fileError.classList.remove('hidden');
    processBtn.disabled = true;
    selectedFiles = [];
    return;
  }

  selectedFiles = supported;
  let msg = `${supported.length} file${supported.length !== 1 ? 's' : ''} ready`;
  if (skipped > 0) msg += ` · ${skipped} ignored`;
  fileStatsText.textContent = msg;
  fileStats.classList.remove('hidden');
  processBtn.disabled = false;
}

// Main processing
processBtn.addEventListener('click', async () => {
  const maxFiles = parseInt(maxFilesSlider.value);
  const maxBytes = parseInt(maxSizeSlider.value) * 1024 * 1024;

  processBtn.disabled = true;
  progressSection.classList.remove('hidden');
  resultsSection.classList.add('hidden');
  batchList.innerHTML = '';
  batches = [];

  const files = [...selectedFiles];
  const total = files.length;

  // Batch buckets: [{arcName: Uint8Array}]
  const entries = [{}];
  const counts = [0];
  const sizes = [0];

  setProgress(0, `Reading file 0 of ${total}…`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const lower = file.name.toLowerCase();

    let data;
    try {
      const buf = await file.arrayBuffer();
      data = new Uint8Array(buf);
      if (lower.endsWith('.fit.gz')) {
        data = fflate.gunzipSync(data);
      }
    } catch (e) {
      console.warn(`Skipping ${file.name}:`, e);
      continue;
    }

    const arcName = lower.endsWith('.fit.gz') ? file.name.slice(0, -3) : file.name;
    const fileSize = data.length;

    const last = entries.length - 1;
    if (counts[last] > 0 && (counts[last] >= maxFiles || sizes[last] + fileSize > maxBytes)) {
      entries.push({});
      counts.push(0);
      sizes.push(0);
    }

    const cur = entries.length - 1;
    entries[cur][arcName] = [data, { level: 1 }]; // level:1 = fast compression (FIT is already binary)
    counts[cur]++;
    sizes[cur] += fileSize;

    const pct = Math.round((i + 1) / total * 75);
    setProgress(pct, `Reading file ${i + 1} of ${total}…`);

    if ((i + 1) % 25 === 0) await tick();
  }

  // Zip each batch
  for (let i = 0; i < entries.length; i++) {
    setProgress(75 + Math.round((i / entries.length) * 24), `Zipping batch ${i + 1} of ${entries.length}…`);
    await tick();

    const zipData = fflate.zipSync(entries[i]);
    batches.push({
      name: `batch_${String(i + 1).padStart(3, '0')}.zip`,
      data: zipData,
      count: counts[i],
      uncompressedSize: sizes[i],
    });
  }

  setProgress(100, `Done — ${batches.length} batch${batches.length !== 1 ? 'es' : ''} created.`);
  renderResults();
  processBtn.disabled = false;
});

function setProgress(pct, detail) {
  progressBar.style.width = pct + '%';
  progressPct.textContent = pct + '%';
  progressDetail.textContent = detail;
}

function tick() {
  return new Promise(r => setTimeout(r, 0));
}

function renderResults() {
  resultsSection.classList.remove('hidden');
  batchList.innerHTML = '';

  batches.forEach(batch => {
    const uncompMB = (batch.uncompressedSize / 1024 / 1024).toFixed(1);
    const zipMB = (batch.data.length / 1024 / 1024).toFixed(1);

    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors group';
    row.innerHTML = `
      <div class="min-w-0">
        <span class="font-mono text-sm font-semibold text-slate-700">${batch.name}</span>
        <span class="ml-2 text-xs text-slate-400">${batch.count} files &nbsp;·&nbsp; ${uncompMB} MB uncompressed &nbsp;·&nbsp; ${zipMB} MB ZIP</span>
      </div>
      <button class="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg bg-white group-hover:bg-indigo-100 ring-1 ring-slate-200 group-hover:ring-indigo-200 transition-colors">
        Download
      </button>
    `;
    row.querySelector('button').addEventListener('click', () => triggerDownload(batch));
    batchList.appendChild(row);
  });

  downloadAllBtn.onclick = async () => {
    for (const batch of batches) {
      triggerDownload(batch);
      await new Promise(r => setTimeout(r, 600));
    }
  };
}

function triggerDownload(batch) {
  const blob = new Blob([batch.data], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = batch.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
