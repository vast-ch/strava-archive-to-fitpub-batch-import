# Changelog

## Unreleased

- Removed the Python CLI script (`strava_archive_to_fitpub_batch_import.py`). The web app (`docs/`) is now the only supported version of this tool.
- Added support for `.tcx` and `.tcx.gz` files, matching FitPub's current batch import formats.
- Raised the max uncompressed size per ZIP slider from 500 MB to 5.0 GB, matching FitPub's current batch import limit.
- Unrecognized files are now listed by name in an on-page warning instead of only being silently counted as "ignored".
