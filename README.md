# Strava to FitPub

<img src="docs/logo.svg" alt="Strava to FitPub logo" width="120" />

Tools for moving your activity history from [Strava](https://www.strava.com) to [FitPub](https://codeberg.org/fitpub/fitpub) (such as [fitpub.social](https://fitpub.social)).


Strava exports activities as `.fit.gz`, `.fit`, and `.gpx` files. FitPub's batch import accepts `.fit` and `.gpx` only, with a limit of **1,000 files** and **500 MB** per ZIP. These tools decompress and repackage everything into ready-to-upload batches.

---

## Web app

**[https://vast-ch.github.io/strava-archive-to-fitpub-batch-import/](https://vast-ch.github.io/strava-archive-to-fitpub-batch-import/)**

Runs entirely in the browser — no install, no server. Extract your Strava archive, select the files from the `activities/` folder, configure batch limits via sliders, and download ready-to-upload ZIPs.

---

## Python script

Requires Python 3.6+, no third-party dependencies.

```bash
python3 strava_archive_to_fitpub_batch_import.py <activities_folder> <output_folder>
```

| Argument | Description |
|---|---|
| `activities_folder` | Path to the `activities/` folder from your Strava export |
| `output_folder` | Path where the output ZIPs will be written (created if it doesn't exist) |

### Example

```bash
python3 strava_archive_to_fitpub_batch_import.py \
  ~/Downloads/export_14041018/activities \
  ~/Desktop/strava-fitpub-upload
```

---

## Getting your Strava export

1. Go to **Settings → My Account → Download or Delete Your Account**
2. Click **Request Your Archive** and wait for the email
3. Unzip the downloaded archive — the `activities/` folder is inside

## Uploading to FitPub

1. Go to **Upload → Batch Import**
2. Click **Select zip file**, choose a `batch_XXX.zip`, and click **Upload**
3. Wait for the batch to finish processing, then repeat for each remaining ZIP
