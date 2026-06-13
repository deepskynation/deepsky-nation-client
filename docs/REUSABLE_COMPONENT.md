# Reusable components and UI playbook

Canonical guide for shared UI in the Deepsky Nation client. **Read this before adding new pages, dialogs, lists, or filters.**

Related docs:

- [redux-and-api.md](./redux-and-api.md) — HTTP calls live in Redux slices, not `src/lib`
- [AGENTS.md](../AGENTS.md) — agent entry point

---

## Quick decision tree

| Need | Use |
|------|-----|
| Loading / empty / error for a **shop list** | `ListSectionState` + `GlassInlineAlert` |
| Loading / error for a **full page** (auth, checkout) | `PageStateGate`, `CenteredLoading`, `AuthRequiredPage` |
| Loading / error for an **admin form or panel** | `PanelSectionState` |
| Shop / glass surfaces | `glass-styles.ts` + glass feedback components |
| Admin forms, tables, dashboards | `panel-styles.ts` |
| Delete confirmation | `ConfirmDeleteDialog` |
| Order receipt (user or admin) | `OrderReceiptDialog` / `OrderReceiptSummary` |
| Payment proof image | `PaymentProofDialog` / `PaymentProofPreview` |
| Category / sort / status filters (shop) | `GlassPillFilter`, `GlassOptionsMenu` |
| Date range filter | `DateRangeFilter` + `lib/date-range-filter` |
| Collapsible admin filter drawer | `ListFilterPanel` + `useFilterPanel` |
| Product grid card | `ProductCard` |
| Paginated admin tables | `TablePagination` |
| Paginated shop tabs | `TabPagination` |
| Toast notifications | `ToastProvider` in layout + `useToast()` |
| API data | Redux slice thunks only — see [redux-and-api.md](./redux-and-api.md) |

---

## Architecture rules

### Where code lives

| Location | Purpose |
|----------|---------|
| `src/components/common/` | Reusable UI shared across user, admin, landing |
| `src/lib/` | Style tokens, formatters, filter helpers — **no** `/api` fetch |
| `src/components/{feature}/modules/` | Feature-specific pieces (table-row, order-card, filter bars) |
| `src/components/{feature}/list.tsx` | Full page shell + data wiring when appropriate |
| `src/store/slices/` | All backend HTTP |

### Naming and structure

- **No `admin-*` names** inside `common/` — use generic names (`PanelSectionState`, `panel-styles.ts`).
- **One primary export per small module file** when splitting (e.g. `table-header.tsx`, `table-row.tsx`).
- **Single `return`** with ternary branches for UI state gates (avoid early returns).
- **No thin wrappers** — e.g. use `ToastProvider` directly in layouts, not `*-toast-shell.tsx`.
- **No deprecated re-export shims** — import from the real source.
- **Avoid `*-page-content.tsx`** when `list.tsx` can own the page header, stats, and content.

### Layout providers

Wrap app sections with `ToastProvider` so `useToast()` works:

- Admin: `src/app/admin/layout.tsx`
- User: `src/app/user/layout.tsx` (via `UserToastShell`, which only re-exports `ToastProvider`)

---

## Style tokens (`src/lib/`)

### Glass (user shop, checkout, landing)

**File:** `src/lib/glass-styles.ts`

| Export | Use for |
|--------|---------|
| `glassCardClassName` | Frosted cards (products, orders list container) |
| `glassCardHoverClassName` | Hover lift on cards |
| `glassMediaFrameClassName` | Product image frames |
| `glassPriceClassName` | Price badges on product cards |
| `glassFilterPillClassName` / `glassFilterPillSimpleClassName` | Category/sort pills |
| `glassInputFlatClassName` | Flat checkout inputs |
| `glassPanelFlatClassName` | Flat checkout panels |
| `glassSectionLightClassName` / `glassSectionMutedClassName` | Page section backgrounds |

**Auth/shop search inputs:** `src/components/(auth)/modules/auth-glass-styles.ts` → `authGlassInputClassName`

### Panel (admin, profile forms, solid tables)

**File:** `src/lib/panel-styles.ts`

| Export | Use for |
|--------|---------|
| `fieldClassName` / `textareaClassName` | Inputs and textareas |
| `labelClassName` / `hintClassName` | Labels and helper text |
| `cardClassName` / `sectionClassName` | Admin page cards and form sections |
| `tableWrapClassName` / `tableHeadClassName` / `tableRowClassName` | Data tables |
| `segmentListClassName` / `segmentTabClassName()` | Dashboard tab bars |
| `emptyStateClassName` | Dashed empty panels |
| `alertErrorClassName` / `alertSuccessClassName` / `alertWarningClassName` | Inline alerts |

### Charts (admin dashboard)

**File:** `src/lib/chart-theme.ts` — `CHART_COLORS`, `CHART_TOOLTIP_STYLE`, `CHART_AXIS_TICK`, `CHART_GRID_STROKE`

---

## Lib helpers (not components)

| File | Purpose |
|------|---------|
| `lib/order-display.ts` | Order formatters, status badges, `buildOrderReceiptLineItems`, `ORDERS_TABLE_GRID_CLASS` |
| `lib/date-range-filter.ts` | Date range value types, `resolveDateRangeBounds`, `dateRangeFromBounds`, quick presets |
| `lib/storefront-categories.ts` | `groupProductsByCategory`, `filterProductsByCategoryId`, `STOREFRONT_CATALOG_QUERY` |
| `lib/shop-filters.ts` | `productSortOptions`, `SHOP_PRODUCTS_PAGE_SIZE` |
| `lib/user-order-filters.ts` | `USER_ORDER_STATUS_FILTER_OPTIONS`, `myOrdersHasActiveFilters` |
| `lib/admin-user-status.ts` | Admin user role/status formatters |
| `lib/admin-order-filters.ts` | Admin order filter helpers |
| `lib/product-image.ts` | `getProductThumbnailSrc`, `getProductCarouselSrcs` |
| `lib/product-variants.ts` | `formatVariantLabel`, `getVariantUnitPrice` |
| `lib/chart-theme.ts` | Recharts styling constants |
| `lib/pagination-range.ts` | `getPaginationRange` for page number ellipsis |

---

## Component catalog

### `common/feedback/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `PageStateGate` | `@/components/common/feedback/page-state-gate` | Full-page loading, auth gate, or error before main content | `authChecking`, `authRequired`, `loading`, `error`, `children` |
| `CenteredLoading` | same | Standalone spinner block | `message`, `className` |
| `AuthRequiredPage` | same | Signed-out gate with CTA | `title`, `description`, `action`, `layout` |
| `ListSectionState` | `@/components/common/feedback/list-section-state` | Shop list: loading → empty → children | `loading`, `empty`, `emptyMessage`, `children` |
| `PanelSectionState` | `@/components/common/feedback/panel-section-state` | Admin inline panel: loading → error (+ optional action) → children | `loading`, `error`, `errorAction`, `children` |
| `GlassInlineAlert` | `@/components/common/feedback/glass-inline-alert` | Shop error banner above list | `message`, `surface`, `variant` |
| `GlassMessagePanel` | `@/components/common/feedback/glass-message-panel` | Centered message card with optional action link | `title`, `description`, `action`, `variant` |
| `GlassHighlightCallout` | `@/components/common/feedback/glass-highlight-callout` | Icon + title + description callout (checkout delivery) | `icon`, `title`, `description` |
| `ToastProvider` | `@/components/common/feedback/toast-provider` | Layout wrapper for toasts | `children` |
| `useToast()` | same | `toast.success()` / `toast.error()` in components | — |
| `StatCardsSkeleton` | `@/components/common/feedback/stat-cards-skeleton` | Admin dashboard stat cards loading | `rows` |
| `ChartPanelsSkeleton` | `@/components/common/feedback/chart-panels-skeleton` | Admin chart area loading | `columns` |
| `ChartCard` | `@/components/common/feedback/chart-panel` | Chart card chrome with title | `title`, `description`, `children` |
| `ChartEmptyState` | same | Empty chart placeholder | `message` |

**Used in:** `user/products/list.tsx`, `user/orders/list.tsx`, `user/checkout/list.tsx`, `admin/dashboard/modules/*`, `admin/product/modules/add-product-form.tsx`

### `common/filters/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `GlassPillFilter` | `@/components/common/filters/glass-pill-filter` | Horizontal category/status pills (shop) | `options`, `value`, `onChange`, `variant` |
| `GlassOptionsMenu` | `@/components/common/filters/glass-options-menu` | Sort/options via ⋮ menu (shop) | `options`, `value`, `onChange`, `menuTitle` |
| `DateRangeFilter` | `@/components/common/filters` | Date range trigger + popover panel | `value`, `onChange`, `label`, `placeholder` |
| `DateRangeFilterPanel` | `@/components/common/filters/date-range-filter-panel` | Standalone date panel (rare; usually inside `DateRangeFilter`) | `value`, `onChange` |
| `FilterPanelToggle` | `@/components/common/filters/list-filter-panel` | Collapsible filter drawer toggle | `open`, `onToggle`, `hasActiveFilters` |
| `ListFilterHeader` | same | Filter panel header row | `title`, `onClear` |
| `FilterPanelSection` | same | Section inside filter drawer | `title`, `children` |
| `FilterSearchField` | same | Search field inside admin filter panel | `value`, `onChange`, `onApply` |
| `OptionalFilterRow` | same | Optional filter row wrapper | `label`, `children` |
| `useFilterPanel` | `@/components/common/filters/use-list-filter-panel` | Open/close state for filter drawer | `initialOpen` |

**Used in:** `user/products/list.tsx`, `user/orders/modules/user-orders-filter-bar.tsx`, `admin/orders/modules/admin-orders-filter-panel.tsx`, `admin/product/modules/admin-product-search-panel.tsx`, `admin/users/list.tsx`

### `common/dialogs/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `ConfirmDeleteDialog` | `@/components/common/dialogs/confirm-delete-dialog` | Generic delete confirmation (admin or user) | `open`, `title`, `description`, `onConfirm`, `isDeleting`, `error` |

**Used in:** `admin/product/modules/catalog-setup.tsx`, `admin/product/modules/TableRow.tsx`

### `common/orders/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `OrderReceiptDialog` | `@/components/common/orders/order-receipt-dialog` | Modal receipt; enriches line items from catalog | `order`, `open`, `onOpenChange`, `itemLabels?`, `title?`, `description?` |
| `OrderReceiptSummary` | `@/components/common/orders/order-receipt-summary` | Receipt body (also embeddable without dialog) | `order`, `lineItems`, `compact?` |
| `PaymentProofDialog` | `@/components/common/orders/payment-proof-dialog` | Full-screen payment receipt image | `orderId`, `scope`, `open` |
| `PaymentProofPreview` | same | Thumbnail preview that opens dialog | `orderId`, `scope`, `onClick` |

**Used in:** `user/orders/*`, `user/checkout/modules/checkout-order-placed-dialog.tsx`, `admin/orders/modules/order-detail-dialog.tsx`

### `common/order/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `OrderTotalsSummary` | `@/components/common/order/order-totals-summary` | Subtotal + shipping + total block | `subtotal`, `shippingFee`, `total`, `shippingNote?` |
| `OrderLinesList` | `@/components/common/order/order-lines-list` | Cart/checkout line items list | `lines`, `onQuantityChange?` |
| `OrderLineRow` | `@/components/common/order/order-line-row` | Single cart line row | `line`, `onQuantityChange?` |

**Used in:** `user/checkout/*`, `user/cart/page.tsx`

### `common/product/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `ProductCard` | `@/components/common/product/ProductCard` | Shop/landing product tile with carousel | `product`, `href?`, `variant` (`shop` \| `landing`), `priority?` |
| `ProductImageGrid` | `@/components/common/product/product-image-grid` | Product image thumbnail grid | `images`, `onImageClick?` |

**Used in:** `user/products/modules/products-category-section.tsx`, landing dashboard

### `common/pagination/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `TablePagination` | `@/components/common/pagination/table-pagination` | Admin tables with page size selector | `page`, `totalPages`, `pageSize`, `onPageChange`, `onPageSizeChange`, `bordered?` |
| `TabPagination` | `@/components/common/pagination/tab-pagination` | Shop category pagination (simpler) | `page`, `totalPages`, `onPageChange` |

### `common/forms/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `FormField` | `@/components/common/forms/form-field` | Label + control wrapper | `id`, `label`, `children` |

**Used in:** `profile/profile-page-content.tsx`, `user/checkout/modules/checkout-delivery-form.tsx`

### `common/navigation/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `CartIconButton` | `@/components/common/navigation/cart-icon-button` | Header cart link with badge | `href`, `itemCount?` |
| `OrdersIconButton` | `@/components/common/navigation/orders-icon-button` | Header orders link | `href` |

### `common/marketing/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `EmailSubscribeSection` | `@/components/common/marketing/email-subscribe-section` | Footer newsletter block on shop pages | `className?` |
| `SocialIconLinks` | `@/components/common/marketing/social-icon-links` | Facebook/Instagram links | `className?` |

### `common/animation/`

| Component | Import | Use when | Key props |
|-----------|--------|----------|-----------|
| `AnimateInView` | `@/components/common/animation/animate-in-view` | Fade/slide-in on scroll | `children`, `delay?` |

### `common/icons/`

| Component | Import | Use when |
|-----------|--------|----------|
| `FacebookIcon` / `InstagramIcon` | `@/components/common/icons/social-icons` | Social links (used by `SocialIconLinks`) |

---

## Feature modules worth reusing (not yet in `common/`)

Import these from their feature paths, or **promote to `common/`** when used in a second feature.

| Module | Path | Pattern |
|--------|------|---------|
| `OrderCard` | `user/orders/modules/order-card.tsx` | Mobile-friendly order summary card |
| `OrdersViewToggle` | `user/orders/modules/orders-view-toggle.tsx` | Cards / List view tabs |
| `ProductsCategorySection` | `user/products/modules/products-category-section.tsx` | Category heading + responsive product grid |
| Admin `table-header` / `table-row` | `admin/{users,subscribers,product,orders}/modules/` | Per-entity table rows (not generic enough for one shared table yet) |
| `UserOrdersFilterBar` | `user/orders/modules/user-orders-filter-bar.tsx` | Orders-specific filter row |

---

## Anti-patterns — do not duplicate

| Do not create | Use instead |
|---------------|-------------|
| `*-page-content.tsx` thin wrapper | Put shell in `list.tsx` |
| `admin-*` files in `common/` | Generic name + `panel-styles.ts` |
| `admin-toast-shell`, `admin-form-styles` shims | Direct imports |
| `delete-product-dialog.tsx`, `delete-catalog-item-dialog.tsx` | `ConfirmDeleteDialog` |
| `order-receipt-dialog` under `user/orders/modules/` | `common/orders/order-receipt-dialog` |
| Hardcoded storefront sections (`top`/`bottom`/`essential`) | `groupProductsByCategory()` in `storefront-categories.ts` |
| `FALLBACK_SHIPPING_FEE` without null guard | Wait for `fetchShippingFee` or handle `shippingFee === null` explicitly |
| `fetch('/api/...')` in components | Redux thunk in slice |
| Fixed 18-char product description truncation | `line-clamp-*` on `ProductCard` |

---

## Promotion checklist (feature → `common/`)

When moving a component to `common/`:

1. Used in **2+ features** (e.g. admin + user, or two admin areas)?
2. **No hardcoded feature copy** — or accepts `title` / `description` props?
3. **Generic file and export names** (no `admin-`, `user-` prefix in path)?
4. Update **this file** and fix all imports.
5. **Delete** the old feature-local file.

---

## Maintenance

Update this doc when you:

- Add or promote a component under `common/`
- Add shared tokens to `glass-styles.ts` or `panel-styles.ts`
- Remove a shim, wrapper, or duplicate dialog
- Establish a new pattern (e.g. card/list view toggle)
