# TikTok Analyzer deployment

This branch contains a standalone Analyzer frontend and a Vercel serverless metadata endpoint.

## Cloudflare Pages (frontend)

1. Import this repository into Cloudflare Pages.
2. Select branch: `deploy/tiktok-analyzer-cloudflare-vercel`.
3. Framework preset: **None**.
4. Build command: leave empty.
5. Build output directory: `/` (repository root; enter `.` if required).
6. Deploy.

After deploying the backend to Vercel, open `config.js` on this branch and replace the empty API origin with your Vercel deployment origin, for example `https://your-project.vercel.app`. Commit that change and redeploy Cloudflare Pages.

## Vercel (backend)

1. Import the same repository into Vercel.
2. Select branch: `deploy/tiktok-analyzer-cloudflare-vercel`.
3. Framework preset: **Other**.
4. Root directory: repository root.
5. Deploy. Vercel detects `api/tiktok-resolve.js` as a serverless function.

The API allows browser requests from the Cloudflare Pages frontend. The endpoint is public and has no API key.

## Current feature scope

- Public TikTok URL validation.
- Public post metadata via TikWM: creator, caption, cover, region, publish time, duration, views, likes, comments, shares, and saves.
- Engagement rate calculation in the browser.
- No API key is embedded in the repository.
- FPS, resolution, bitrate, and codec are not implemented yet. The current endpoint returns public post metadata only; technical stream analysis needs a separate media inspection implementation.

TikWM is a third-party service. Availability, rate limits, and returned fields can change independently of this repository.
