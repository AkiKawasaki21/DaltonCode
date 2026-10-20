# Dalton Coding

Interactive single-page site for Dalton Coding, a Mercedes car-coding shop in
Podgorica, Montenegro.

A speedometer sweeps to 260 km/h while the intro clip buffers, the driver's
door opens and the camera travels into the cabin, and the dashboard is
annotated with the services applied at each point in the interior.

**Live:** https://akikawasaki21.github.io/DaltonCode/

## Local development

```bash
npm install
npm run dev     # http://localhost:3100
```

## Build

```bash
npm run build   # production build
```

The deployed site is a static export. GitHub Actions builds it on every push to
`main` (see `.github/workflows/deploy.yml`) with `NEXT_PUBLIC_BASE_PATH` set,
because project pages are served from a subpath.

## Notes

- `src/lib/hotspots.ts` holds all annotation copy and pin coordinates. Pin
  positions are percentages of the dashboard plate; label positions are
  percentages of the viewport.
- `.impeccable.md` records the art direction. Read it before changing styling.
- Assets must go through `asset()` in `src/lib/asset.ts` or they 404 on Pages.
