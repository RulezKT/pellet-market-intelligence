# Calculation conventions

- Pack price / kg × 1,000 gives normalized €/t. Whole purchase count uses ceil(target kg / pack kg), then exact pack price × count rounded to cents. A 65 × 15 kg pallet weighs 975 kg.
- Offer VAT is source-specific. Gross / (1 + VAT rate) gives net. Model input values are net, avoiding a blanket assumed tax rate.
- Unknown shipping gives no delivered total. Included shipping is explicitly zero. Estimated and quoted shipping remain distinct; postcode confirmation is required for a real quote.
- Resale purchase volume is before product losses. Acquisition and associated freight/storage/handling are allocated to saleable tonnes; administration is entered per saleable tonne. Margin = contribution / revenue; markup = contribution / cost.
- Packaging annual output = line rate × hours × operating days × utilization. Fixed OPEX is divided by actual annual output. Variable packaging cost includes product losses, bags, pallet/film, labour, electricity and outbound freight. Zero production means no defined unit cost, while fixed expenses remain.
- Factory nameplate rate is finished pellet tonnes/hour. Availability and utilization reduce annual output. Loss is a dry-matter loss that changes feedstock demand, not a second multiplier of finished output.
- Wet input dry matter = input × (1 − initial moisture). Retained dry matter = dry matter × (1 − dry loss). Finished mass = retained dry matter / (1 − final moisture). Water evaporated = input water − finished water, floored at zero. Inputs below desired final moisture are not treated as negative drying credits; water addition is outside this MVP.
- Volume purchase price uses user-entered **wet** density in t/m³, specific to solid or loose volume. Moisture controls dry yield independently. No universal timber conversion is assumed.
- Useful drying heat = evaporated water × kWh/t water. Boiler useful heat cost = fuel €/t / (as-received MWh/t × efficiency). Own pellets use the foregone sales price.
- Factory variable OPEX comprises raw feed and inbound freight, variable electricity, drying heat and other user costs. Base electrical load is charged for available scheduled hours even at zero production and added to annual fixed OPEX.
- EBITDA = contribution × annual sales − fixed OPEX. Depreciation = CAPEX / years. Financing assumes the full CAPEX is financed at the entered annual rate; there is no amortizing debt schedule. Model tax applies only to positive EBITDA − depreciation − interest. Cash flow = EBITDA − interest − model tax. It excludes debt principal, sustaining CAPEX and changes in working capital.
- Break-even tonnes = fixed OPEX / positive contribution; otherwise no finite break-even. Simple payback = initial investment / positive annual result (factory uses model cash flow and includes initial working capital). No discounted payback or NPV is claimed.
- Sensitivity changes one factor at a time, clamps moisture below 100% and utilization to 100%. Interest and construction CAPEX do not affect EBITDA directly. Downside/upside cases are editable combined shocks to raw materials, electricity, selling price and utilization.

Factory, heat, port and equipment defaults are assumptions; all estimates are marked. The three equipment configurations are parameter sets, not real manufacturer offers. Combined business comparisons use common selling price and annual volume. Capacity exceedance is reported. OPEX and payback are simplified and exclude complete tax/debt modelling.

## Independent packaging economics

The independent calculator is `src/components/PackagingEconomics.tsx`; its pure Decimal.js calculation functions and Zod input schema are in `src/lib/calculations/packaging-economics.ts`.

- Finished pallet mass = bag kg × positive integer bags. Normalized results use that exact mass in tonnes; a 975 kg pallet is not rounded to one tonne.
- Sale revenue net = selected bag/pallet price converted from gross when applicable. Purchase rates for bulk and ready-packed resale independently convert to net using their stated/assumed VAT. Other expense inputs are net. VAT is assumed recoverable; this is not a model for businesses unable to reclaim input VAT.
- Model B raw cost = net bulk €/t × finished tonnes / (1 − material loss). Bags and other finished-product costs are not multiplied by raw loss. Model A uses its own normalized ready-packed procurement price and does not incur B's packaging losses or equipment/labour costs.
- Both models include warehouse, delivery, other expenses, seller commission on net revenue, and the same editable monthly fixed expense. Packaging labour and electricity apply to B only. Shared fixed expenses avoid an unrequested assumption about differing overhead between models.
- Full pallet cost includes fixed expense allocated over the entered monthly sales tonnes. At zero monthly volume and positive fixed expenses, unit cost/result is undefined and shown as a dash; monthly result still charges fixed expense.
- Return on sales = pallet result / net pallet revenue. Zero revenue gives no defined percentage. Break-even monthly tonnes = monthly fixed expense / positive contribution per tonne. Break-even net pallet sale price solves for the revenue needed to cover non-commission costs plus allocated fixed expenses, including the commission revenue share.
- Monthly and annual results use independently entered sales tonnes. Annual fixed expense equals 12 × monthly fixed expense. Results exclude unmodelled taxes, financing and other costs and are not labelled net profit.
- Optimistic shock raises selling price and lowers procurement/operating/fixed cost by the entered percentage; pessimistic shock does the opposite. Commission remains a share of revenue; volumes and physical losses are unchanged.
- Source offer application copies bag/pallet data, price and source VAT where known, without touching bulk purchase assumptions. An offer for several bags is normalized back to one bag when used as the bag selling-price reference. No index is treated as a factory procurement quote.
