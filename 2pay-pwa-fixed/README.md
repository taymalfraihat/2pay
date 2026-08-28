# 2Pay PWA

2Pay packaged as an installable, offline-capable Progressive Web App, built with Vite + React.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview   # sanity-check the built output locally
```

`npm run build` outputs static files to `dist/`. Deploy that folder to any static host
(Netlify, Vercel, Cloudflare Pages, your own server, etc.) served over **HTTPS**
(or `localhost` for local testing) — service workers and install prompts require it.

## Deployment note

The manifest, service worker, and icon links use root-relative paths (`/manifest.webmanifest`,
`/icons/...`). That's correct for a custom domain or a host that serves the app from `/`
(Netlify, Vercel, Cloudflare Pages, your own server). If you deploy to a **subpath**
(e.g. GitHub Pages project sites at `username.github.io/2pay/`), set `base: '/2pay/'` in
`vite.config.js` and update the manifest/service-worker paths to match, or the icons and
offline cache won't resolve correctly.

## What's here

- Real local persistence via `localStorage` — works fully offline, nothing leaves the device.
- A service worker (`public/sw.js`) that caches the app shell for offline use, network-first
  for HTML (fresh when online) and cache-first for JS/CSS/fonts/icons.
- A web app manifest with proper `any` and `maskable` icons for install/home-screen use.
- An "Install 2Pay" control in Settings (Android/Chrome) and Add-to-Home-Screen instructions
  on iOS, plus a small offline indicator in the header.
