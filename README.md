# LOOR Editorial — Shopify OS 2.0 foundation

Original, boutique storefront code inspired by the editorial direction described in the brief. No Symmetry source, licensed assets, or proprietary components are included.

Read [the six-module technical specification](docs/TECHNICAL-SPECIFICATION.md), [repository and deployment instructions](docs/REPOSITORY-AND-DEPLOYMENT.md), and [release validation](docs/VALIDATION.md).

```powershell
Set-Location 'C:\Users\rajvi\Documents\ChatGPT\LOOR\shopify-theme'
npm.cmd ci
npm.cmd run check
$ShopifyStore = Read-Host 'Store domain, e.g. your-store.myshopify.com'
npm.cmd run dev -- --store $ShopifyStore
```

This folder is the root of the standalone theme repository. The surrounding LOOR workspace already has Git; follow the guide to copy this theme to an independent directory before initializing and uploading it. No store connection, GitHub remote, commit, push, theme upload, publication, or Lighthouse run has been performed.

The code is a validated foundation, not a launch certification. Configure imagery, collections, navigation, shipping rules and recommendations in Shopify, then execute the storefront acceptance checklist. Theme Check cannot verify runtime cart behavior or store-specific purchase rules.
