# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Browser-based tool that decompresses `.fit.gz` files and repackages Strava activity exports into batched ZIPs for FitPub's batch import.

- `docs/index.html`, `docs/app.js`, `docs/style.css` — the app, served via GitHub Pages. No build step, no server. Uses Tailwind CSS (CDN) and fflate (CDN) for in-browser ZIP creation and gzip decompression.

No tests, no build step, no linting configuration.

Dependencies loaded from CDN:
- Tailwind CSS (`cdn.tailwindcss.com`)
- fflate `0.8.2` (`cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js`) — exposes `fflate` as a global

Batch limits (max files per ZIP, max uncompressed size per ZIP) are configurable via sliders. Output ZIPs are downloaded client-side via `URL.createObjectURL`.

There used to be an equivalent Python CLI script (`strava_archive_to_fitpub_batch_import.py`); it was removed to keep only the web app.

## Branding & copy conventions

- The fitness platform is **FitPub** (capital F, capital P) — never `fitpub` or `Fitpub`.
- "Strava" in the UI links to `https://www.strava.com/account`.
- "FitPub" in the main heading links to `https://fitpub.social/batch-upload`.
- When referencing FitPub as a project/source, link to `https://codeberg.org/fitpub/fitpub`.
- fitpub.social is mentioned only as an example instance ("such as fitpub.social"), not as the canonical name for the platform.
- ActivityPub is mentioned in the footer with a link to `https://activitypub.rocks`.

## Logo

**Concept:** A minimalist human runner in mid-stride, built from one continuous rounded line reminiscent of a recorded GPS track. Three horizontal speed streaks behind the figure communicate velocity and forward progress. Geometric, modern, lightweight, app-icon friendly. No text.

**Color gradient (left to right, trailing → leading edge):**
- Orange — activity capture, recording, the Strava source
- Azure — transformation and data processing
- Indigo/Purple — the destination product, analysis, refinement

The gradient tells the story of the tool: Orange (source) → Azure (conversion) → Indigo (destination).

**Generation prompt:**

> Minimalist app icon of a human runner in mid-stride, constructed from a single continuous rounded line evoking a GPS track. Three short horizontal speed streaks trail behind the figure. The line flows through a left-to-right gradient: orange at the trailing edge, azure in the center, indigo-purple at the leading edge. White background. Geometric, modern, no text.
