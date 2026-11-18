# AGENTS.md — Project Knowledge for AI Coding Agents

> Read this file before working in this repo. It summarizes the architecture, build flow, key files, and conventions so an agent can reason about the codebase without re-deriving everything from scratch.

## What this project is

**APEX Material BI Dashboard** is an Oracle APEX **Region Type plugin** (internal name `APEX.BI.DASHBOARD.D3`, display name `APEX Material BI Dashboard`, MIT-licensed, by Ronny Weiß).

- It renders a fully configurable, masonry-layout dashboard inside an APEX page region.
- **Key selling point:** end users can configure/rearrange dashboard items at *runtime* without a developer touching the page — items can be sorted, resized, and re-fed with data without a page submit.
- Supported item display types ("features"): `map`, `table`, `charts`, `clock`, `calendar`, `note`, `calendarheatmap`, `html`, `cards` (KPI), `badge`, `list`.
- Requirements: APEX 5.1.3+ and Oracle 12c+ (sample app needs APEX 20.2+).

The repo is a **source/build workspace for the plugin**, not a running APEX app. It contains the plugin's SQL install script, the client-side JS/CSS sources, a standalone demo harness, and a demo APEX app.

## Repository layout

| Path | Purpose |
|------|---------|
| `region_type_plugin_apex_bi_dashboard_d3.sql` | **THE APEX install script.** Large (~3.4 MB) APEX export file. `create_plugin` (REGION TYPE) + PL/SQL code, region attributes, and Dynamic Actions. This is the artifact that gets imported into APEX. |
| `apexplugin.json` | apex.world plugin manifest (metadata, keywords, Oracle/APEX version compatibility). |
| `js/script.js` | **Core client-side engine (~222 KB).** Exposes global `apexBIDashBoard(...)` with `.initialize(...)`. All item drawing logic lives here (`drawTable`, `drawD3Map`, `drawClock`, `drawCalendar`, `drawNoteEditor`, `drawHTML`, `drawCard`, `drawBadges`, `drawList`). |
| `js/bridge.js` | Abstraction layer `bridge` between the plugin engine and the host framework. In APEX these `server.plugin` / `server.pluginUrl` callbacks are provided by the server-side JS function generated in the install SQL; in the standalone demo they call a local `ajaxCall`. Also holds `util` (spinner, `escapeHTML`), `locale`, and `date` helpers. |
| `js/lib/*.js` | Vendored third-party libs: `masonry.pkgd.js` (layout), `d3.js` + `maptopojson.js` (world map), `nbillboard.js` (charts), `fullCalendar.js`/`fullCalendarLocales.js` (calendar), `pell.js` (rich-text note editor), `purify.js` (DOMPurify HTML sanitizer). |
| `css/*.css` | Per-feature stylesheets (`table.css`, `charts.css`, `map.css`, `clock.css`, `calendarHeatmap.css`, `cards.css`, `badges.css`, `list.css`, `note`/`html.css`, plus vendored lib CSS and `style.css`, `masonry.css`). |
| `map/world-tour.json`, `map/world-zoom.json` | TopoJSON world maps consumed by the D3 map feature. |
| `data/data.js`, `data/dataAsync.js`, `data/dataBadge.js` | Sample/mock item data used by the standalone demo. |
| `index.html` | **Minified demo harness** — loads `build/*.min.*` assets. |
| `indexRaw.html` | **Raw demo harness** — loads un-minified `js/` + `css/` assets directly. Use this for local development (fast, readable, debuggable). |
| `demoApp/Demo_App.sql` | Importable APEX sample application (app 55310). |
| `demoApp/ddl/tables.sql`, `demoApp/ddl/packages.sql` | DDL for demo schema (`T_DASHBOARD_ITEMS`, `T_DASHBOARD_ITEM_TYPES`, etc.). |
| `demoApp/dml/data.sql` | Seed data (dashboard item types: map, table, charts, clock, calendar, note, ...). |
| `gulpfile.js` | Build tasks (concat + minify JS and CSS into `build/`). |
| `.clineignore` | Cline search/index exclusions. **Note:** `*.sql` and image extensions are excluded from search/indexing, but you can still read them by explicit path. If a change must be findable via search, check these rules. |

## Build flow (how source becomes the shipped plugin)

1. Source JS/CSS live in `js/` and `css/`.
2. `gulp concatall` concatenates + minifies into `build/`:
   - `build/bida.pkgd.min.js` ← `js/lib/masonry.pkgd.js` + `js/lib/pell.js` + `js/lib/purify.js` + `js/script.js`
   - `build/bida-ddd.pkgd.min.js` ← `js/lib/d3.js` + `js/lib/maptopojson.js`
   - `build/bida-chart.pkgd.min.js` ← `js/lib/nbillboard.js`
   - `build/bida-calendar.pkgd.min.js` ← `js/lib/fullCalendar.js` + `js/lib/fullCalendarLocales.js`
   - `build/bida.pkgd.min.css` ← `css/lib/*.css` + `css/items/*.css` + `css/*.css`
3. The install SQL references these built assets (uploaded as static files in the plugin).
4. **Dev workflow:** edit sources in `js/`/`css/`, open `indexRaw.html` to test with un-minified assets; only run gulp + use `index.html` (minified) when verifying the final bundle.

There are **no tests** and no linter in the current `package.json` (only gulp + concat/terser/uglifycss). Verify behavior by loading the demo harness in a browser.

## Client-side API contract

`apexBIDashBoard(bridge, $, DOMPurify, Masonry, pell).initialize(...)` is called from:
- **APEX** — server-generated onload JS in the install SQL (uses `APEX_JAVASCRIPT.ADD_ONLOAD_CODE` / `ADD_VALUE`, `APEX_PLUGIN.GET_AJAX_IDENTIFIER`).
- **Demo** — `index.html` / `indexRaw.html` `init()` function.

The `initialize` parameter list (see `js/script.js`):
```
initialize(
  pRegionID, pRegionIDRefresh, pAjaxID, pNoDataMsg, pErrMsg,
  pDefaultConfigJSON,        // mainConf
  pLoadingMethod,            // 'A' (AJAX) or 'I' (inline/static)
  pFeatures,                // e.g. 'map:table:charts:clock:calendar:note:calendarheatmap'
  pChartConfigJSON, pItems2Submit, pItems2SubmitImg,
  pRequireHTMLEscape, pPurifyOptions, pMapURL, pMapOptions,
  pTableConfigJSON, pClockOptions, pCalendarOptions
)
```

Data is pulled through `bridge.server.plugin(ajaxID, pItems, pOptions)`. The demo's `ajaxCall(ajaxID, pItems, pOptions)` switches on `pItems.x01`:
- `"items"` → full dashboard item list (initial layout)
- `"itemData"` → async data for a single item
- `"noteUpload"` → save note editor content
- `"imageDownload"` → (only for Unleash RTE image loading; effectively unused outside APEX)

`bridge.server.pluginUrl` provides the base URL the plugin uses to load images (only relevant with the Unleash RTE plugin).

**Security:** all HTML rendered into items is sanitized with DOMPurify using a configurable allow-list, controlled by `pRequireHTMLEscape` + the Sanitizer configJSON attribute. Preserve/extend the sanitizer config when touching HTML rendering.

## Runtime Architecture (the "bridge" pattern)

The dashboard engine is framework-agnostic. The global factory `apexBIDashBoard(apex, $, DOMPurify, Masonry, pell)` only requires the **first argument** to expose a small duck-typed surface ("the bridge"):

- **In APEX:** the install SQL passes the **real APEX JS API global** — `apexBIDashBoard(apex, $, DOMPurify, Masonry, pell).initialize(...)` (SQL L568).
- **In the standalone demo:** `indexRaw.html` / `index.html` pass a local `bridge` object (defined in `js/bridge.js`) that re-implements the same surface; `bridge.server.plugin` simply delegates to a local `ajaxCall(ajaxID, pItems, pOptions)` that switches on `pItems.x01`.

The interface members the engine consumes (both must exist in the host object):

| Member | Purpose |
|--------|---------|
| `server.plugin(ajaxID, pItems, pOptions)` | All data AJAX: `items`, `itemData`, `noteUpload` |
| `server.pluginUrl(ajaxID, pItems)` | Base URL for Unleash-RTE image loading (meaningful only in APEX; never called in the demo) |
| `server.chunk(str)` | Splits large strings (note CLOBs) into ≤8000-char chunks (native only in APEX 18.2+; `bridge` re-implements it, see `bridge.js` L82) |
| `util.showSpinner(pObj)` / `util.escapeHTML(str)` | Loading indicator + HTML escaping |
| `debug.info / debug / error / warn` | Logging (demo `bridge.debug` gates output by `logLevel`) |
| `locale.getLanguage / getAbbrevMonthNames / getAbbrevDayNames / getSetting` | Locale settings for clock/calendar |
| `date.format(date, fmt)` | Date formatting |
| `navigation.dialog` | `optionsLink` edit dialogs (appears in demo data as `javascript:` URLs) |

**Implication:** any host (React, Vue, a plain jQuery page) can run the dashboard by implementing exactly these callbacks — this is the intended extension point. `script.js` never references APEX globals directly.

## script.js — Engine Internals

`js/script.js` (~5k lines) is one factory function returning the `initialize` API. Verified anchors (current file; re-verify before large edits):

- **`initialize` (L432)** — takes the 20 parameters listed above; merges each configJSON via `util.jsonSaveExtend` (L174; explicit `srcConfig` overrides `targetConfig`, which overrides hardcoded defaults) into `pDefaultConfig` + feature list; then loads data (`getData`, L956) for loading method `A`, or uses the static `items` array for method `I`.
- **`getData` (L956) → `apex.server.plugin(pAjaxID, {pageItems, x01:"items"}, {success, error, dataType:"json"})` (L978)** → on success `drawGridItems` (L1007) iterates items, calling `drawItemRegion` (L1177) per item.
- **`drawItemRegion` (L1177)** — per-item orchestration: resolves async `itemData` (only when the item carries `async` data), shows/hides loader, then `drawItemRegionContent` (L1501).
- **`drawItemRegionContent` (L1501)** — renders item chrome (title via `drawItemTitle` L1411, subtext, backColor/color, boxShadow, `optionsLink`/`optionsLinkTop` dialogs) then **dispatches** via `switch (pAjaxItems.itemType)` (L1614). Feature activation is double-checked with `$.inArray(type, pDefaultConfig.features)` — an item whose feature isn't enabled renders an error message instead.
- **Feature draw functions** (current line anchors): `drawHTML` L1764 · `drawTable` L1986 (DataTables: search/sort/paging; DOMPurify-sanitized cells) · `drawList` L2075 · `drawBadges` L2261 · `drawCard` L2411 (KPI cards) · `drawChart` L2558 (Billboard.js) · `drawClock` L3199 (analog + digital; `#date#` / `#time#` token substitution in labels) · `drawCalendar` L3604 (FullCalendar) · `drawNoteEditor` L3791 (Pell RTE; Save → `noteUpload` AJAX) · `drawCalendarHeatmap` L4034 (Billboard.js) · `drawD3Map` L4247 (D3 + TopoJSON, loads `map/world-*.json` from `pMapURL`).
- **`util` helpers (L13–L180)**: `isDefinedAndNotNull` (L13) · `splitString2Array` (L151, 8000-char CLOB chunking — mirrors `apex.server.chunk`) · `jsonSaveExtend` (L174) · `featureDetails` (name/description for log messages) · `loader.start/stop` · `errorMessage.show/stop` (renders the `errorMessage` attribute inline, auto-hides after 5 s) · `noDataMessage.show/stop`.
- **Masonry API (`resizeMasonry` L508, `updateItemColSpan`)** — call after data arrival or item resize; masonry re-layouts the `bida-container`.
- **AJAX payload contract**: `pItems = { pageItems, x01:<type>, x02:itemID, x03:pk, x04:ajaxReference, f01:chunkArr }`; `pOptions = { success, error, dataType }`. For `itemData`, success receives `(pData, pMethod, pRequest)` and the engine validates `pRequest.getResponseHeader("ajax-reference") === x04` to discard expired async responses (stale-refresh guard, L1331). `noteUpload` sends `f01` = the CLOB chunk array.
- **Config precedence (every feature):** per-item `itemConfig` → region attribute configJSON (e.g. `mapOptions`, `tableConfigJSON`) → hardcoded defaults in `script.js`, resolved via `setObjectParameter` / `util.jsonSaveExtend`.
## Server-Side Integration (install SQL)

`region_type_plugin_apex_bi_dashboard_d3.sql` registers a **REGION TYPE** plugin with two PL/SQL entry points:

**`F_RENDER` (L512)** — emits `<div id="{staticId}-c" class="bida-container"></div>` (L566), conditionally registers feature bundles (`bida-ddd.pkgd.min` for charts/map/clock/calendarheatmap, `bida-chart.pkgd.min` for charts, `bida-calendar.pkgd.min` for calendar — L533–557), plus `bida.pkgd.min` JS + CSS always, and appends the onload init call (L568–587):

```
apexBIDashBoard(apex, $, DOMPurify, Masonry, pell).initialize(
  staticId, staticIdRefresh, APEX_PLUGIN.GET_AJAX_IDENTIFIER,
  noDataMsg, attr13(WhenError), attr01(configJSON), attr02(DataLoading),
  attr04(features), attr05(chartsJSON), items2Submit, items2SubmitImg,
  escapeOutput, attr06(sanitizerJSON), FILE_PREFIX||'map/', attr08(mapJSON),
  attr09(tableJSON), attr10(clockJSON), attr12(calendarJSON))
```

`APEX_PLUGIN.GET_AJAX_IDENTIFIER` (L571) is the token that routes every `apex.server.plugin(ajaxID, …)` call to `F_AJAX`.

**`F_AJAX` (L361)** — reads the function type from `APEX_APPLICATION.G_X01` and dispatches:

| x01 | Behavior |
|-----|----------|
| `items` | Executes the region's **Region Source SQL** (bindings recovered via undocumented `WWV_FLOW_UTILITIES.GET_BINDS`, L431), wraps each row's `JSON_BLOB` into `{"items":[ … ]}` (L437–452, row order preserved via a temp LOB — see L433), streams it as `application/json` via `DOWNLOAD_FILE` (L454). |
| `itemData` | Executes `ATTRIBUTE_03` (PL/SQL async-data block) bound with `G_X02` (item ID); returns the JSON BLOB; sets an `ajax-reference` response header (`G_X04`) that the JS side uses to reject expired async responses (L388–427). |
| `noteUpload` | `STORE_NOTE` (L473) — reassembles the CLOB chunks from `G_F01` and executes `ATTRIBUTE_14` (PL/SQL save block) with `G_X02` (item ID). |
| `imageDownload` | `GET_IMAGE` (L479) — runs `ATTRIBUTE_07` (PL/SQL image-source block) with `G_X03` (pk) + `G_X02` (item ID), downloads the BLOB with the returned mime-type/filename/cache-time (L496–503). |

Errors are surfaced via `OWA_UTIL.STATUS_LINE` (404 not-found, 416 on error) and logged with `APEX_DEBUG.ERROR`.

**Hybrid data loading:** if the region source SQL already returns `itemData`, the async `itemData` call is skipped for that item (documented in the plugin help text, L723) — the async PL/SQL block is only the fallback source.

## APEX region attributes (the plugin's configuration surface)

Defined in `region_type_plugin_apex_bi_dashboard_d3.sql` (`create_plugin_attribute`, scope `COMPONENT`). These map 1:1 to the `initialize` parameters above:

1. `configJSON` (JAVASCRIPT) — main default config: `colSpan`, `isSortable`, `height`, `refresh`, `itemClasses`, `backColor`, `color`, `boxShadow`, `optionsLink`, `optionsLinkTop`, `title`.
2. `Data Loading` (SELECT LIST) — `A` = AJAX, `I` = inline/static.
3. `PL/SQL Block for async Loading of Data` — per-item async data source.
4. `Activated Features` — which display types are enabled (e.g. `map:table:charts:...`).
5. `Charts configJSON`
6. `Sanitizer configJSON`
7. `PL/SQL Block for download Unleash RTE Images in HTML Items`
8. `Map ConfigJSON`
9. `Table ConfigJSON`
10. `Clock ConfigJSON`
11. `Items2Submit (Only non SSP)` — item names to submit with AJAX (not available under Server-Side Protection).
12. `Calendar ConfigJSON`
13. `When Error occured`
14. `PL/SQL Block for Saving Short Notes`

**Dynamic Actions** exposed by the plugin (usable in APEX page designer): `refreshed`, `rendered`, `shortnotesaved`, `sortorder` (item sort stopped). Use `sortorder` to persist new item ordering from the user's drag-and-drop.

The install SQL also embeds PL/SQL helpers, e.g. `IS_IN_STR_LIST` (checks a string is present in a colon-separated list) and `STORE_NOTE` (persists note editor CLOBs via `DBMS_LOB`/`APEX_APPLICATION.G_F01`).

## Conventions & gotchas

- **File roles matter for changes:**
  - New dashboard feature/item type → add draw logic in `js/script.js` (the `case "<type>":` dispatch block), add CSS in `css/`, add a feature keyword in the `pFeatures` string + `apexplugin.json` keywords, ensure it's enabled via the `Activated Features` attribute, and wire any new asset into the correct gulp task.
  - Config options → update both the client JS default config AND the matching `create_plugin_attribute` in the install SQL (and the `configJSON`/`*ConfigJSON` defaults).
  - **Keep the APEX install SQL in sync with the JS** — the SQL generates the exact `apexBIDashBoard(...).initialize(...)` call and its arguments, so parameter ordering must match `js/script.js`.
- `js/lib/` files are **vendored/third-party** — don't hand-edit unless fixing a vendored bug; prefer overriding behavior in `js/script.js`.
- `indexRaw.html` (dev) vs `index.html` (minified demo) must stay consistent in their shared inline `init()`/`ajaxCall()` and config objects (`mainConf`, `sanitizerConf`, `tableConf`, `clockConf`, `chartConf`, `mapConf`).
- The APEX install SQL uses `wwv_flow_api.id(...)` for stable IDs — don't renumber these when editing.
- `.clineignore` excludes `*.sql`, images, `node_modules`, `build/`, `.git/`, `*.log`, video. **Search tools won't find SQL/image files — read them by explicit path** (e.g. `git ls-files`, or read `region_type_plugin_apex_bi_dashboard_d3.sql` directly).

## Quick commands

```powershell
# Dev preview (un-minified, editable)
Start-Process .\indexRaw.html

# Minified preview
Start-Process .\index.html

# Build minified bundles into build/
npm install
gulp concatall   # or: gulp concatmainjs / concatd3js / concatbbjs / concatcaljs / concatcss

# List tracked files
git ls-files

# Inspect plugin attributes
#   Select-String -Path region_type_plugin_apex_bi_dashboard_d3.sql -Pattern "p_prompt=>|p_attribute_sequence=>"
```

## Useful links
- Demo app: https://apex.oracle.com/pls/apex/f?p=103428
- Tutorial: https://www.youtube.com/watch?v=amzzRHLT5KY
- apex.world / repo: https://github.com/RonnyWeiss/APEX-Material-BI-Dashboard

