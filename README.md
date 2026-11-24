# francescodelsesto.com

Personal portfolio, research archive, and verifiable AI systems showcase for Francesco Del Sesto.

## Stack

- Vite + TypeScript + semantic HTML5 (100% readable with JavaScript disabled)
- Almanac editorial design system (OKLCH tokens, Hanken Grotesk, Newsreader, IBM Plex Mono)
- Interactive Infinite 3D Spatial Archival Index (`perspective` + GPU `translate3d`/`rotateX`/`rotateY`, wheel/drag/keyboard, pause control, `prefers-reduced-motion` fallback)
- Static research PDFs (`/papers/`) and zero-upload client-side lab tools (`/lab/`)

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment (Vercel)

1. Move the existing Excel AI landing page project on Vercel from `francescodelsesto.com` to `excel.francescodelsesto.com` (CNAME to `cname.vercel-dns.com`).
2. Import this repository in Vercel and attach `francescodelsesto.com` (and `www.francescodelsesto.com`).
3. Configure MX / Email Routing for `francesco@francescodelsesto.com` in your DNS provider.
