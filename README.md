# Pellet Market Intelligence

Static Astro / TypeScript application built from CODEX.md. Russian is the default language; navigation and primary calculator labels support German and English. A light and dark theme and responsive layouts are included.

## Run locally

Requires Node.js 24 and npm.

```powershell
npm ci
npm run dev
```

Open the printed local URL (normally http://localhost:4321). For a production preview, run `npm run build` then `npm run preview`.

## Verify

```powershell
npm run validate:data
npm run check
npm test
npm run build
```

`npm run test:e2e` runs browser checks against the GitHub Pages base-path build. First install its browser with `npx playwright install chromium`.

## Implemented MVP

- All 16 requested routes plus a manufacturer detail route.
- Dashboard with independently sourced market segments, catalog with actual listing photos, searchable/sortable offer comparisons, manufacturer directory and favourites.
- Pack normalization, whole-pack purchase quantities, delivery fee model, VAT normalization and unknown-delivery states.
- Resale, packaging, supply-chain waterfall, factory dry-matter balance, energy, useful heat, CAPEX/OPEX, EBITDA, depreciation, financing, model tax, cash flow, break-even and simple payback.
- Editable port logistics, weighted location scoring, five business model comparisons on equal sales volume, sensitivity chart and downside/base/upside cases.
- Real observations only in price history; no synthetic historical trend.
- Browser-local scenario autosave, validated JSON import/export, private market-data import and settings persistence. Clear browser data to remove local records. Export before changing browsers or devices.
- Daily/manual collection workflow with permission gates, reports, validation and update PRs; GitHub Pages deployment and PR validation workflows.

## Data and monitoring limits

The initial dataset contains **two manually verified public offers**, **one manufacturer**, and **two September 2026 DEPI indices**. Sources and dates are in [docs/data-sources.md](docs/data-sources.md) and `/sources`. Offers are marked stale after seven days. The two real retail observations are from a single date.

**No automated market-price source is enabled.** Reuse permissions and source-specific parsers have not been established. `npm run collect` reports all sources as not connected; it does not pretend to refresh their prices. The adapter registry is intentionally empty. Add an adapter only after confirming access/reuse conditions and testing the parser. Anti-bot protections are not bypassed. Manual JSON import works locally without publishing confidential offers.

Published OBI freight conditions are not a confirmed quote for Berlin 14163, and a single parcel charge must not be multiplied into a truck or pallet tariff. The catalog keeps the actual pellet manufacturer unknown when only the brand's responsible supplier is disclosed. The Wismar contact address is not represented as a verified production-site address.

Model defaults are illustrative assumptions, not actual equipment specifications, port tariffs, business profits, or investment advice. Financial calculators use net prices; listed retail prices retain their stated VAT. Some technical details and source notes remain in English across locales.

## GitHub Pages

No repository was created and nothing was published. To deploy later, push to your explicitly selected repository, enable Pages with GitHub Actions, and run Deploy GitHub Pages. It obtains the origin/base path from `configure-pages`, so links and assets work under the repository path. The intended repository name in CODEX.md is `pellet-market-intelligence`.

To reproduce a project-path build locally:

```powershell
$env:BASE_PATH='/pellet-market-intelligence'
npm run build
npm run preview
```

Open `/pellet-market-intelligence/`. Remove the environment variable with `Remove-Item Env:BASE_PATH` when returning to root-path development.

Scheduled updates use a dedicated PR branch. GitHub must allow Actions to create pull requests. Changes are published after review/merge. If the repository blocks PR creation, collection reports are still uploaded. Use a least-privilege bot or GitHub App only if you need workflows triggered by bot PRs; GITHUB_TOKEN-created PRs may not trigger other workflows automatically.

See [architecture](docs/architecture.md), [calculations](docs/calculations.md) and [remaining work](docs/roadmap.md).

## Packaging economics

`/packaging-economics/` is an independent client calculator; the existing `/packaging/` model remains available. Choose a bag or pallet offer to apply its price, VAT basis and pack dimensions. Missing pallet counts remain explicit user assumptions. The original source price, date, manufacturer (or unknown) and URL are displayed separately from editable scenario fields. Private browser-imported market data is supported.

The calculator compares ready-packed resale (A) and bulk purchase with own packaging (B), on the same finished pallet mass and user-defined monthly/annual sales. It supports separate purchase/sale VAT rates, commission, losses, fixed expenses, optimistic/base/pessimistic assumptions, clipboard copy and CSV export with inputs, results and source provenance. Values autosave under `pmi-packaging-economics-v1`. Default values and scenario shocks are demonstration assumptions. No DEPI index is used as a purchase cost.
