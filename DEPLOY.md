# TikTok Analyzer deployment

This branch adds a standalone Analyzer frontend at the repository root and a Vercel serverless metadata endpoint.

## Cloudflare Pages (frontend)

1. Import this repository into Cloudflare Pages.
2. Select branch: `deploy/tiktok-analyzer-cloudflare-vercel`.
3. Framework preset: **None**.
4. Build command: leave empty.
5. Build output directory: `/` (repository root, enter `.` if the dashboard requires a relative path).
6. Deploy.

The frontend calls `/api/tiktok-resolve`. Configure the API origin in Cloudflare Pages by setting up a Pages redirect/proxy to the Vercel deployment, or use the same Vercel domain for both frontend and API. For a split-domain deployment, update the API base URL in `app.js` to the Vercel deployment URL and enable CORS in the API.

## Vercel (backend)

1. Import the same repository into Vercel.
2. Select branch: `deploy/tiktok-analyzer-cloudflare-vercel`.
3. Framework preset: **Other**.
4. Root directory: repository root.
5. Deploy. Vercel detects `api/tiktok-resolve.js` as a serverless function.

## Current feature scope

- Public TikTok URL validation.
- Public post metadata via TikWM: creator, caption, cover, region, publish time, duration, views, likes, comments, shares, and saves.
- Engagement rate calculation in the browser.
- No API key is embedded in the repository.

FPS, resolution, bitrate, and codec are intentionally not fabricated. The current public metadata response does not reliably provide those stream-level fields. A separate media inspection implementation is required before those values can be shown accurately.

TikWM is a third-party service. Availability, rate limits, and returned fields can change independently of this repository.
