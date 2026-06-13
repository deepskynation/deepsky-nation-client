<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Frontend conventions

- **Reusable UI:** Before adding pages, dialogs, lists, or filters, read [docs/REUSABLE_COMPONENT.md](./docs/REUSABLE_COMPONENT.md).
- **Backend HTTP:** All `/api/...` `fetch` calls go in `src/store/slices/*Slice.ts` (inside `createAsyncThunk`), not in `src/lib/*-api.ts`. See [docs/redux-and-api.md](./docs/redux-and-api.md).
- **`src/lib`:** UI helpers, storage, `apiUrl` base URL only — no domain API modules.
- **`src/store/api-utils.ts`:** Shared slice helpers (e.g. `readApiError`), not endpoints.
