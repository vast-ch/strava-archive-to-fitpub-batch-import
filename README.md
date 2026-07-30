# Strava to FitPub

<img src="docs/logo.svg" alt="Strava to FitPub logo" width="120" />

A tool for moving your activity history from [Strava](https://www.strava.com) to [FitPub](https://codeberg.org/fitpub/fitpub) (such as [fitpub.social](https://fitpub.social)).


Strava exports activities as `.fit.gz`, `.fit`, `.gpx`, and `.tcx`/`.tcx.gz` files. FitPub's batch import accepts `.fit`, `.gpx`, and `.tcx`, with a limit of **1,000 files** and **5.0 GB** per ZIP. This tool decompresses and repackages everything into ready-to-upload batches.

---

## Web app

**[https://vast-ch.github.io/strava-archive-to-fitpub-batch-import/](https://vast-ch.github.io/strava-archive-to-fitpub-batch-import/)**

Runs entirely in the browser — no install, no server. Extract your Strava archive, select the files from the `activities/` folder, configure batch limits via sliders, and download ready-to-upload ZIPs.

Want to try it without a real export? [`examples/sample-activities-export.zip`](examples/sample-activities-export.zip) contains a mock `activities/` folder with one of each supported format (`.fit`, `.fit.gz`, `.gpx`, `.tcx`, `.tcx.gz`) plus a few unsupported files (`.txt`, `.jpg`, `.csv`) to see the unrecognized-file warning in action.

---

## Getting your Strava export

1. Go to **Settings → My Account → Download or Delete Your Account**
2. Click **Request Your Archive** and wait for the email
3. Unzip the downloaded archive — the `activities/` folder is inside

## Uploading to FitPub

1. Go to **Upload → Batch Import**
2. Click **Select zip file**, choose a `batch_XXX.zip`, and click **Upload**
3. Wait for the batch to finish processing, then repeat for each remaining ZIP
