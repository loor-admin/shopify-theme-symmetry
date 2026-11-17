# Validation and launch acceptance

## Automated checks

Run from repository root:

```powershell
npm.cmd ci
npm.cmd run check
```

`scripts/validate.mjs` parses standalone JSON and embedded section schema JSON, checks template section/block references and static render/section targets, and executes Node's syntax check for every JS module. Official Shopify Theme Check then analyzes Liquid, schema and theme best practices. The pipeline fails on warnings as well as errors; no checks are disabled.

Four targeted Node tests exercise localized cart request paths and line keys, inventory error propagation, mutation queue recovery, and null-section fallback without replaying a cart mutation. These use isolated request/DOM doubles; storefront interaction still requires the browser checklist below.

Theme Check and structural checks were run successfully on this scaffold. Exact final results are recorded in `VALIDATION-RESULTS.txt`. This is static validation; no Shopify storefront, browser interaction, authenticated deployment or Lighthouse measurement was available during creation.

## Storefront acceptance checklist

Complete in an unpublished Shopify theme with realistic catalog data and actual apps:

| Area | Required scenarios |
| --- | --- |
| Navigation | Desktop/mobile; three tiers; matching promo columns; root links; Escape/outside click; Tab order; scroll reveal with focused/open menus; no-JS mobile links |
| Theme Editor | Add/remove/reorder each preset; change fonts/colors/logo; select hidden hero blocks and promo blocks; reload sections without duplicate listeners |
| Cards | Portrait/square; missing image; secondary hover; swatch image and variant URL; sale/variable compare-at; sold-out; tracked/untracked inventory; preorder; threshold boundary |
| Quick buy | Default-only add; variant combinations; sold-out options; quantity rules; valid selling plan; failed product request; close during fetch; modal focus return |
| AJAX cart | Add/change/remove; remove final line; API 422; double-click; distinct line properties/plans; discount allocations; null sections and failed fallback rendering; cart count; checkout |
| Drawer accessibility | Escape, close/backdrop, screen reader title/status/error, focus trap, return to opener, scroll lock, reduced motion |
| Recommendations | Empty configuration; unavailable or already-added items excluded; optioned upsell chooser and return to cart |
| Markets | Localized routes; USD/other configured currency; missing threshold currency; checkout currency; threshold amount and real shipping destination rules |
| Product page | Prices/unit prices; variant selector; selling-plan compatibility; image loading; structured data; product app blocks |
| Search/collection | Debounce and stale-request cancellation; keyboard links; empty results; search fallback; sorting; pagination |
| Progressive enhancement | JS disabled: navigation, product POST forms, collection sorting, search and cart page work; quick-buy links lead to product pages |
| Performance | Real media/apps on home, collection, PDP/cart; three mobile/desktop Lighthouse cold runs; median performance ≥90; inspect LCP/CLS and request waterfalls |
| Deployment | PR fails on invalid Liquid/schema; PR never deploys; main deploy reaches only staging; existing composition remains; previous-theme rollback tested |

## Known scope boundaries

* The baseline enumerated variant picker is for products within Liquid's 250-variant enumeration limit. High-variant catalogs require a server-rendered option-value picker before launch.
* Product-level summary prices do not update on selection; exact variant prices are visible inside the chooser. Complex selling-plan pricing needs an allocation-aware selector.
* The announcement is static; no continuous ticker is implemented. The hero is manually controlled, with no autoplay.
* Cross-sells are merchant-curated, with no algorithmic recommendation request.
* Shipping progress is a configured estimate, not a checkout shipping-rate guarantee.
* No filter UI, localization selector, blog, password, gift-card or legacy-account templates are included. Add those routes if required by the store.
* A foundation passing Theme Check still requires Shopify runtime and accessibility testing. No claim of a measured 90+ Lighthouse score or production deployment is made.
