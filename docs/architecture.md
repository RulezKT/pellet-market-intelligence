# Architecture

Astro pre-renders 17 static HTML routes; the shared shell is Astro. React hydrates the interactive analytical workspace. Tailwind is integrated through Vite, with shared design tokens and responsive CSS. ECharts renders observed series and model comparisons. No runtime backend, paid API or database is needed.

`src/data/*.json` holds public products, independently changing offers, manufacturers, indices, observations and source status. Zod validates data at import/build time and manual browser import, including references between products, manufacturers and offers. Data does not invent producer/brand relationships.

`src/lib/calculations` is independent of React and used by all model pages and Vitest. Decimal.js handles pack price normalization, VAT extraction, purchase rounding and contribution arithmetic. Physics uses finite numeric inputs and wet-basis fractions.

Scenario documents have a version and complete required numeric sections. They are validated before import. Browser state is stored under versioned `pmi-*` keys; preferences and private observations are separate from the public seed dataset. No imported confidential data is uploaded.

Builds accept SITE_URL and BASE_PATH. All internal navigation, favicon and Astro asset paths respect the base path. Workflows separate validation, collection and publication. Collection is serialized and writes through one PR branch. Failed or unconfigured sources preserve last verified observations.
