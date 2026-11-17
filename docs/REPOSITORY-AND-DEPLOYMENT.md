# Repository setup, upload and delivery

## Repository ownership

Use a dedicated theme repository with `assets`, `config`, `layout`, `locales`, `sections`, `snippets` and `templates` at its root. Keep application/database architecture and catalog/media processing outside this repository. Shopify's GitHub integration expects the standard theme structure at repository root.

The supplied theme is inside an existing LOOR Git workspace. These PowerShell commands copy only the theme to a sibling directory before initializing Git. They deliberately exclude dependencies and CLI state. Use a fresh destination; the command aborts if it already exists.

Prerequisites: Git, Node.js 22.12+ (22 LTS is used by CI), GitHub CLI (`gh`), a GitHub account and authorized access to your Shopify store. Install the Git and GitHub CLIs using their official installers if the commands are unavailable. Shopify CLI is installed locally from package-lock.json.

## Initialize and upload with GitHub CLI (HTTPS)

These are executable PowerShell commands. `Read-Host` supplies account-specific values without embedded guessed names. Enter your own Git commit name/email; the email may be your GitHub no-reply address. Do not run the SSH alternative after creating a remote this way.

```powershell
$ThemeSource = 'C:\Users\rajvi\Documents\ChatGPT\LOOR\shopify-theme'
$ThemeRepo = 'C:\Users\rajvi\Documents\ChatGPT\loor-editorial-theme'
if (Test-Path -LiteralPath $ThemeRepo) { throw 'Destination already exists; choose a new directory.' }
New-Item -ItemType Directory -Path $ThemeRepo | Out-Null
robocopy $ThemeSource $ThemeRepo /E /XD node_modules .git .shopify /XF '*.log'
if ($LASTEXITCODE -ge 8) { throw 'Theme copy failed.' }
Set-Location $ThemeRepo

node --version
git --version
gh --version
npm.cmd ci
npm.cmd run check
if ($LASTEXITCODE -ne 0) { throw 'Validation failed; resolve before committing.' }

$GitName = Read-Host 'Git commit author name'
$GitEmail = Read-Host 'Git commit author email'
git init --initial-branch=main
git config user.name $GitName
git config user.email $GitEmail
git add .
git diff --cached --stat
git commit -m "Initialize editorial Shopify OS 2.0 theme"

gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git --hostname github.com
$GitHubOwner = Read-Host 'GitHub username or organization'
$GitHubRepository = Read-Host 'New GitHub repository name, e.g. loor-editorial-theme'
$GitHubFullName = "$GitHubOwner/$GitHubRepository"
gh repo create $GitHubFullName --private --source . --remote origin --push
git remote -v
git status --short
```

`gh repo create --push` pushes main and establishes the upstream. To make it explicit on later pushes:

```powershell
git push --set-upstream origin main
```

Use a private repository until the brand's asset and code licensing policy is settled. `.gitignore` excludes credentials, dependencies, CLI state, logs and temp files. It deliberately **tracks** `config/settings_data.json`, section groups, JSON templates, theme assets and the dependency lockfile. All source CSS/JS is directly deployable; there is no compiled asset build directory to ignore.

## Alternative: attach an existing empty repository using SSH or HTTPS

Run these after the local initialization/commit above, instead of `gh repo create`. Create an empty repository on GitHub first, without a README or initial commit. SSH requires a key already registered on GitHub; HTTPS uses Git Credential Manager or `gh auth setup-git`.

```powershell
$GitHubOwner = Read-Host 'GitHub username or organization'
$GitHubRepository = Read-Host 'Existing empty repository name'
$GitHubSSH = "git@github.com:${GitHubOwner}/${GitHubRepository}.git"
git remote add origin $GitHubSSH
git push --set-upstream origin main
```

For HTTPS, replace only the `git remote add` line with:

```powershell
git remote add origin "https://github.com/$GitHubOwner/$GitHubRepository.git"
```

If `origin` already exists, inspect `git remote -v` before intentionally changing it with `git remote set-url origin $GitHubSSH`. Do not stage files from the parent LOOR folder.

## Local theme preview and staging bootstrap

```powershell
$ShopifyStore = Read-Host 'Shopify store domain, e.g. your-store.myshopify.com'
npx.cmd --no-install shopify theme dev --store $ShopifyStore
```

The first interactive command authenticates through Shopify. Stop the preview with Ctrl+C. For stable CI, create a normal unpublished staging theme rather than relying on an ephemeral CLI development theme:

```powershell
npx.cmd --no-install shopify theme push --store $ShopifyStore --unpublished --theme 'LOOR Editorial Staging'
npx.cmd --no-install shopify theme list --store $ShopifyStore
```

Bootstrap once with the full scaffold, including templates and settings. Configure that staging theme's collections, images and menus in the Theme Editor. Record its numeric theme ID from the list. Do not substitute your live theme ID.

## GitHub Actions staging deployment

`.github/workflows/deploy-theme.yml` contains two jobs:

1. All pull requests and main pushes: install with `npm ci`, check JSON/template references/JavaScript syntax, then `shopify theme check --fail-level warning`.
2. Successful main push/manual main run: deploy to the existing unpublished theme using pinned CLI 5.0.0. Deployment concurrency is serialized and PRs never receive Shopify secrets.

Create a `staging` GitHub Environment and set these values there:

| Kind | Name | Value |
| --- | --- | --- |
| Variable | `SHOPIFY_STORE` | Full `your-store.myshopify.com` domain |
| Variable | `SHOPIFY_THEME_ID` | Numeric unpublished staging theme ID |
| Secret | `SHOPIFY_CLI_THEME_TOKEN` | Password generated by Shopify's Theme Access app for this store |

The workflow validates the domain and numeric ID. It has no `--publish` or `--allow-live`, so the CLI's live-theme guard remains in effect. Protect main with a required `check` status and peer review. Configure environment reviewer requirements according to your team's release policy. Keep production credentials out of this environment.

The following commands configure the same environment after `gh auth login`. Creating an environment through the API can require repository admin rights. The secret prompt accepts hidden input; do not paste the token into a shell command or committed TOML file.

```powershell
$ShopifyThemeId = Read-Host 'Numeric unpublished staging theme ID'
gh api --method PUT "repos/$GitHubFullName/environments/staging"
gh variable set SHOPIFY_STORE --env staging --repo $GitHubFullName --body $ShopifyStore
gh variable set SHOPIFY_THEME_ID --env staging --repo $GitHubFullName --body $ShopifyThemeId
gh secret set SHOPIFY_CLI_THEME_TOKEN --env staging --repo $GitHubFullName
```

**Settings ownership:** CI deliberately skips `config/settings_data.json`, `templates/*.json` and `sections/*-group.json` to preserve staging merchant composition. These files are still versioned. A new template, new section group or intentional composition change therefore requires a reviewed content deployment; it will not silently reach staging through the default workflow.

For such a change, first pull the remote composition to a temporary folder, compare/merge it into a feature branch, then push the reviewed files explicitly while the merchant pauses edits:

```powershell
$RemoteSnapshot = Join-Path $env:TEMP ('loor-theme-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $RemoteSnapshot | Out-Null
npx.cmd --no-install shopify theme pull --store $ShopifyStore --theme $ShopifyThemeId --path $RemoteSnapshot --only 'config/settings_data.json' --only 'templates/*.json' --only 'sections/*-group.json'
git diff --no-index -- config/settings_data.json "$RemoteSnapshot/config/settings_data.json"
# Compare templates/ and sections/*-group.json in your editor as well.
# After merging and reviewing your intended composition:
npm.cmd run check
npx.cmd --no-install shopify theme push --store $ShopifyStore --theme $ShopifyThemeId --only 'config/settings_data.json' --only 'templates/*.json' --only 'sections/*-group.json'
```

`git diff --no-index` returns 1 when differences exist; this is expected. The snapshot stays available for review. Store-specific product/collection IDs and image references in settings must be mapped when moving between stores.

For normal code changes:

```powershell
git switch -c codex/editorial-refinement
# Edit source files.
npm.cmd run check
git add .
git commit -m "Refine editorial storefront"
git push --set-upstream origin codex/editorial-refinement
gh pr create --base main --head codex/editorial-refinement --title 'Refine editorial storefront' --body 'Update editorial storefront components. Validation: npm run check.'
```

## Alternative deployment owner: Shopify's native GitHub integration

Use native integration **instead of the Actions deploy job for the same theme**. Keep the check job, and remove/disable the deploy job before connecting that theme. Two writers can race; the integration does not wait for an Actions check on a commit already pushed to its connected branch.

1. In Shopify Admin open **Online Store → Themes → Add theme → Connect from GitHub**.
2. Install/authorize Shopify's GitHub app for the specific repository. An organization owner may need to approve repository access.
3. Select the account, repository and branch. Theme folders must be at repository root.
4. Connect to an unpublished theme first, wait for synchronization, then preview and customize.
5. Test a small commit and verify it appears in the theme. Theme Editor/code editor changes also commit back to the connected branch.
6. Publish through the Shopify Admin only after release acceptance.

Use `main` as a tested integration branch or a separate release branch with controlled promotion. Native synchronization includes merchant settings and cannot apply the CI file-ignore policy. Establish one content owner, pull/rebase before code changes, and review settings/template diffs. Never combine native sync and CLI deployment against the same target theme.

## Release and rollback

CI deploys staging only. Preview in the intended market, test checkout and execute `VALIDATION.md` before publishing. Retain the previous live theme in the theme library. Publish the approved candidate in Admin, record the deployed commit and create a release tag:

```powershell
$ReleaseTag = Read-Host 'Release tag, e.g. v0.1.0'
git tag -a $ReleaseTag -m "Approved theme release $ReleaseTag"
git push origin $ReleaseTag
```

For storefront rollback, republish the retained previous live theme in Admin; this restores its own settings and composition. For code rollback on staging, revert the defective commit through a pull request and allow CI to deploy the revert. A code revert alone does not restore overwritten merchant settings; retain the theme copy and reviewed snapshots.

Official documentation: [theme push](https://shopify.dev/docs/api/shopify-cli/theme/theme-push), [Theme Check](https://shopify.dev/docs/api/shopify-cli/theme/theme-check), [Shopify GitHub integration](https://shopify.dev/docs/storefronts/themes/tools/github), [GitHub CLI repository creation](https://cli.github.com/manual/gh_repo_create).
