# Technical specification

## 1. Design tokens and typography

`assets/theme.css` defines the layout and component primitives; `snippets/css-variables.liquid` supplies merchant-selected fonts and palette through global settings. Defaults are Libre Baskerville headings with Assistant body text. Local serif/sans fallbacks avoid invisible text during font loading. Shopify-hosted fonts use `font-display: swap`; no external font service or icon library is required. Only the configured regular faces load. Introduce actual bold/italic faces only when merchandising needs them and measure their cost.

| Token | Default / purpose |
| --- | --- |
| `--background` | `#F9F6F0`, warm eggshell |
| `--ink` | `#1A1A1A`, charcoal |
| `--line` | `#E5E0D8`, subtle separators |
| `--accent` | `#89432F`, terracotta focus/detail |
| `--muted` | `#625B53`, secondary copy |
| `--surface` | `#FFFDF8`, badge and raised surfaces |
| `--space-*` | 4, 8, 12, 16, 24, 32, 48, 64 px at default root size |
| `--radius` | 2 px; layout edges otherwise square |
| `--shadow` | restrained 12 px / 40 px shadow at 12% charcoal |
| `--container` | 1440 px **content width**; fluid gutters outside |
| `--gutter` | `clamp(1rem, 4vw, 4rem)` |
| `--text-body` | `clamp(1rem, .96rem + .2vw, 1.125rem)` |
| `--text-h1` | `clamp(2.5rem, 1.5rem + 4vw, 5.75rem)` |
| `--text-h2` | `clamp(2rem, 1.3rem + 2.5vw, 4rem)` |

The implementation uses visible text labels, a thin-border button system, 3:4 product portraits, generous editorial blocks, and denser four-column desktop merchandising. Below 900 px, product grids become two columns and split stories stack. Motion respects `prefers-reduced-motion`.

## 2. Theme architecture

```text
shopify-theme/                  # repository root when uploaded
├── assets/
│   ├── theme.css
│   ├── theme.js                # ES module entry point
│   ├── header.js
│   ├── product-card.js
│   ├── product-form.js
│   ├── dialog.js
│   ├── quick-buy.js
│   ├── cart-drawer.js
│   ├── predictive-search.js
│   └── hero-slider.js
├── layout/theme.liquid
├── templates/
│   ├── index.json
│   ├── product.json
│   ├── collection.json
│   ├── cart.json
│   ├── page.json
│   ├── search.json
│   └── 404.json
├── sections/
│   ├── header-group.json
│   ├── footer-group.json
│   ├── header-beatnik.liquid
│   ├── hero-split-slider.liquid
│   ├── editorial-grid.liquid
│   ├── editorial-split.liquid
│   ├── main-product.liquid
│   ├── main-collection.liquid
│   ├── main-cart.liquid
│   ├── main-page.liquid
│   ├── main-search.liquid
│   ├── main-404.liquid
│   ├── predictive-search.liquid
│   ├── quick-buy.liquid
│   ├── cart-drawer.liquid
│   └── footer.liquid
├── snippets/
│   ├── css-variables.liquid
│   ├── product-card.liquid
│   ├── product-form.liquid
│   ├── price.liquid
│   ├── swatches.liquid
│   ├── quick-add-drawer.liquid
│   ├── shipping-progress.liquid
│   └── pagination.liquid
├── config/{settings_schema.json,settings_data.json}
├── locales/en.default.json
├── .github/workflows/deploy-theme.yml
├── scripts/validate.mjs
├── docs/
├── .gitignore
├── .gitattributes
├── .shopifyignore
├── .theme-check.yml
├── package.json
└── package-lock.json
```

JSON templates own page composition. Header/footer section groups support the Theme Editor. The cart is a static globally rendered section so its ID can be requested from any storefront route. `quick-buy` and `predictive-search` are server-rendered utility sections, fetched with a product or search context. App blocks are supported by the main product section. Product descriptions and richtext settings intentionally render trusted merchant HTML; plain labels are escaped.

The scaffold covers the listed routes. Blog/article, password, gift card, contact, localization selector, collection filtering and legacy customer account templates are additional scope if the store needs them. Use Shopify's hosted customer accounts for the supplied account link. This is not a Shopify Theme Store submission package.

## 3. Header and product cards

### Header contract

`sections/header-beatnik.liquid` contains the complete Liquid and schema. It exposes a logo, width, main menu, centered/left alignment, announcement/link and scroll-up reveal. Navigation renders the three available Shopify menu tiers. Dropdowns use native `details`/`summary` for touch and keyboard access; links remain links and the root destination appears as an explicit Explore link.

Two configurable block types attach to top-level menu titles after `handleize` normalization:

* `mega_menu`: an extra linked menu column with heading.
* `promo`: lazy responsive image, heading, CTA label and destination.

Keep top-level menu titles unique after normalization. Use menu children for normal collection links and these blocks for extra curated columns. The schema supports up to six of each block type; keep actual dropdowns to roughly 3–6 columns for readability.

`<beatnik-header>` reveals on upward scroll and hides only after scrolling below twice its height. An open menu, keyboard focus or Theme Editor mode keeps it visible. Animation uses a transform; scroll work is gated by requestAnimationFrame. Escape closes a dropdown and returns focus to its summary; clicking outside closes open dropdowns. Listener teardown supports Theme Editor section replacement. The announcement is deliberately static; a continuous marquee/ticker is not included. Add a pauseable ticker only if required by the final content design.

### Product card contract

```liquid
{% render 'product-card',
  card_product: product,
  ratio: 'portrait',
  card_context: section.id,
  eager: false
%}
```

Use `square` for 1:1. Pass a unique context per placement to avoid repeated form IDs. Images use Shopify `image_url` + `image_tag`, responsive widths, explicit sizes and intrinsic image dimensions; a reserved aspect ratio prevents card layout shift. Only below-fold images are universally lazy. The first collection row can be eager; the actual hero/PDP lead image receives high fetch priority. The secondary image fades in on pointer hover and stays lazy. Swatch selection disables the secondary overlay so the selected preview stays visible.

Swatches use Shopify's native `product_option_value.swatch` color/image. Values without swatch data retain readable labels within a swatched option; options without swatch data render no row. Configure native category/metafield swatches in Admin. A swatch updates the preview and product/quick-buy destinations using its associated variant; it does not pretend that choosing a color also chooses a size. Up to eight swatches are shown, with the complete set on the PDP.

Default-only products without selling plans use a normal product POST form enhanced by AJAX. Products with options or plans open `<quick-buy>`, fetching `?section_id=quick-buy` on their localized product URL. The chooser lists full available variant combinations with each price, and quantity rules update on variant change. It includes a selling-plan chooser when present. Server validation remains authoritative for inventory, quantity, and plan compatibility; errors display next to the submit button.

Badges:

* Sale: compare-at versus current price. A percentage is shown only when price and compare-at values do not vary, avoiding a misleading mixed-variant percentage.
* Pre-order: the selected/first available variant is inventory-managed, has no remaining quantity and allows continued selling. This label describes that variant's availability and is not a delivery-date promise.
* Low stock: only default-only, inventory-managed products with positive inventory at or below the configurable threshold. Multi-option cards avoid implying all variants have the same stock level.
* Sold out: product availability is false.

Price output supports compare-at, currency and unit prices. The product form's option text is the authoritative price for each variant; the summary price above it remains a product-level range/minimum. PDP description, image gallery and structured data are included.

**Catalog boundary:** the foundational chooser loops `product.variants`. Before using products exceeding Liquid's variant enumeration limit (250), replace it with an option-value/Section Rendering picker designed for high-variant products. Complex per-variant selling-plan allocations, bundles, volume pricing, combined listings and personalized required properties need dedicated UI and store testing. Do not launch those catalogs with this baseline picker unchanged.

## 4. Cart and quick-buy architecture

`<cart-drawer>` owns all enhanced product form submissions and line mutations. Locale-aware paths use `Shopify.routes.root`. Native product/cart forms and the cart page remain available as fallbacks.

```text
Product form → POST /{locale}/cart/add.js
                 FormData: id, quantity, selling_plan (optional), sections, sections_url
Line form    → POST /{locale}/cart/change.js
                 JSON: id (line key), quantity, sections: [section ID], sections_url
             → parse returned sections[section ID]
             → replace only [data-cart-content], preserving the open native dialog
             → update header count and live status
```

Shopify supports bundled rendering of up to five sections; this theme requests one. Mutations are serialized within the drawer, add buttons are disabled while pending and line items use keys rather than variant IDs. This distinguishes lines with different properties/plans. Cart content is always rendered by Liquid so prices, discounts and translations follow Shopify's calculations.

A missing/null section response triggers one read-only Section Rendering request. The successful mutation is never replayed. If rendering still fails, stale contents are hidden and a persistent View cart link remains available. HTTP/API errors display without closing the chooser. No third-party cart store is required.

Both drawers use native `<dialog>.showModal()` for focus trapping and background inertness, with Escape, close control, backdrop click, body scroll lock and focus return. Avoid opening arbitrary third-party modals over these drawers without testing focus ownership. Theme events use `theme:cart:updated` for local extensions; Shopify's newer standard storefront events/action adapters are not implemented here.

### Free-shipping progress

Configure one threshold per storefront currency in global settings, for example:

```text
USD:100
CAD:140
GBP:80
```

Amounts are major currency units; Liquid converts them to Shopify monetary subunits and calculates `min(100, cart.total_price / threshold * 100)`. Shipping eligibility may depend on destination, shipping profile, weight and discounts. The display is explicitly an estimate; configure amounts to match actual shipping rules. Unsupported currencies or a blank setting hide the meter. No currency conversion is guessed. The default is blank until the merchant supplies rules.

### Cross-selling

The global `cart_upsells` product-list setting holds up to three merchant-curated recommendations. The drawer excludes products already in the cart and unavailable products. It reuses the same cards/chooser; inventory and prices are server-rendered after every cart mutation. This is deterministic curated cross-selling; algorithmic Shopify Product Recommendations is an optional replacement.

## 5. Editorial split gallery schema and presets

The complete executable `{% schema %}` JSON is in `sections/editorial-split.liquid`, immediately after its markup. It is validated as JSON by `npm run check:structure` and by Theme Check. No placeholder schema fragments require manual assembly.

Section settings control alternating image placement, desktop full width, mobile full bleed and image/text-first mobile order. Each of up to eight story blocks has:

| Setting | Type / choices |
| --- | --- |
| image | image_picker |
| image_position | select: left / right (used if alternation is disabled) |
| text_align | select: left / center / right |
| badge | text |
| heading | text |
| heading_size | select: md / lg / xl |
| text | richtext |
| subtext | text |
| button_label, button_link | text + url |
| secondary_label, secondary_link | text + url |

Presets add a single Editorial split banner or a two-story Alternating editorial gallery. Images follow the same responsive-image pipeline and default to lazy loading. Place this gallery below the hero; if repurposed as the first above-fold section, add a first-image eager/high-priority condition just as the hero does. Blocks include `block.shopify_attributes` for editor selection.

## 6. Repository and deployment

See [REPOSITORY-AND-DEPLOYMENT.md](REPOSITORY-AND-DEPLOYMENT.md) for complete PowerShell commands, GitHub setup, settings ownership, CI secrets, Shopify connection and rollback. The checked-in workflow installs pinned Shopify CLI 5.0.0 from the lockfile, validates structure and runs the official `shopify theme check`, then pushes to an existing staging theme on main. It never supplies `--publish` or `--allow-live`.

### Performance contract

90+ mobile/desktop Lighthouse performance is an acceptance target, not a measured result. Record production-like home, collection, product and cart runs with real imagery, installed apps, consent behavior and the intended market. Use the median of three cold runs at consistent throttling. Target LCP ≤2.5 s, CLS ≤0.1 and field INP ≤200 ms; Lighthouse does not substitute for field INP.

Budget custom JS at ≤30 KB gzip, CSS at ≤25 KB gzip, initial hero transfer near ≤200 KB and two font faces. Avoid autoplay, eager secondary images, third-party libraries and synchronous scripts. Asset code is native modules with no bundler or jQuery. Revisit request count if the module graph grows; bundle into a single entry point only if measurements justify it. Audit installed app scripts separately; their cost is outside this scaffold's control.

### Official references

* [Theme architecture](https://shopify.dev/docs/storefronts/themes/architecture)
* [Cart AJAX API and bundled sections](https://shopify.dev/docs/api/ajax/reference/cart)
* [Section Rendering API](https://shopify.dev/docs/api/ajax/section-rendering)
* [Native swatches](https://shopify.dev/docs/api/liquid/objects/swatch)
* [Theme Check command](https://shopify.dev/docs/api/shopify-cli/theme/theme-check)
* [Theme push command](https://shopify.dev/docs/api/shopify-cli/theme/theme-push)
* [Shopify GitHub integration](https://shopify.dev/docs/storefronts/themes/tools/github)
