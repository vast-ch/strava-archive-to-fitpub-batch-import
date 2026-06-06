#!/usr/bin/env python3
"""
Batch-zip Strava activities for fitpub.social import.

Usage:
    python3 strava_archive_to_fitpub_batch_import.py <activities_folder> <output_folder>

- Decompresses .fit.gz → .fit on the fly
- Passes .gpx and .fit through directly
- Skips any other file types
- Splits into ZIPs of ≤1000 files and ≤500 MB each
"""

import gzip
import os
import sys
import zipfile

MAX_FILES = 1000
MAX_BYTES = 500 * 1024 * 1024  # 500 MB


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 strava_archive_to_fitpub_batch_import.py <activities_folder> <output_folder>")
        sys.exit(1)

    activities_dir = os.path.abspath(sys.argv[1])
    if not os.path.isdir(activities_dir):
        print(f"Error: '{activities_dir}' is not a directory.")
        sys.exit(1)

    out_dir = os.path.abspath(sys.argv[2])

    os.makedirs(out_dir, exist_ok=True)
    print(f"Output folder: {out_dir}")

    # Collect supported files
    all_files = sorted(os.listdir(activities_dir))
    supported = []
    skipped = 0
    for name in all_files:
        lower = name.lower()
        if lower.endswith(".fit.gz") or lower.endswith(".fit") or lower.endswith(".gpx"):
            supported.append(name)
        else:
            skipped += 1

    print(f"Found {len(supported)} supported files ({skipped} skipped).")

    batch_num = 1
    current_zip_path = None
    current_zf = None
    current_count = 0
    current_size = 0

    def open_new_batch():
        nonlocal batch_num, current_zip_path, current_zf, current_count, current_size
        if current_zf:
            current_zf.close()
            print(f"  → Closed batch {batch_num - 1}: {current_count} files, "
                  f"{current_size / 1024 / 1024:.1f} MB (uncompressed)")
        zip_name = f"batch_{batch_num:03d}.zip"
        current_zip_path = os.path.join(out_dir, zip_name)
        current_zf = zipfile.ZipFile(current_zip_path, "w", zipfile.ZIP_DEFLATED, allowZip64=True)
        current_count = 0
        current_size = 0
        print(f"Creating {zip_name} ...")
        batch_num += 1

    open_new_batch()

    for i, name in enumerate(supported, 1):
        src_path = os.path.join(activities_dir, name)

        # Determine archive name and read data
        lower = name.lower()
        if lower.endswith(".fit.gz"):
            arc_name = name[:-3]  # strip .gz
            with gzip.open(src_path, "rb") as f:
                data = f.read()
        else:
            arc_name = name
            with open(src_path, "rb") as f:
                data = f.read()

        file_size = len(data)

        # Roll over if adding this file would breach a limit
        if current_count > 0 and (
            current_count >= MAX_FILES or current_size + file_size > MAX_BYTES
        ):
            open_new_batch()

        current_zf.writestr(arc_name, data)
        current_count += 1
        current_size += file_size

        if i % 500 == 0 or i == len(supported):
            print(f"  [{i}/{len(supported)}] processed ...")

    # Close last batch
    if current_zf:
        current_zf.close()
        print(f"  → Closed batch {batch_num - 1}: {current_count} files, "
              f"{current_size / 1024 / 1024:.1f} MB (uncompressed)")

    # Summary
    zips = sorted(f for f in os.listdir(out_dir) if f.endswith(".zip"))
    print(f"\nDone! Created {len(zips)} ZIP(s) in '{out_dir}':")
    for z in zips:
        size_mb = os.path.getsize(os.path.join(out_dir, z)) / 1024 / 1024
        print(f"  {z}  ({size_mb:.1f} MB on disk)")


if __name__ == "__main__":
    main()
