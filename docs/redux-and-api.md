# Redux and backend API calls

## Rule: HTTP calls live in slices, not `src/lib`

All requests to the FastAPI backend (`/api/...`) belong in **`src/store/slices/*Slice.ts`**, inside `createAsyncThunk` handlers (or small private helpers in the same file).

Do **not** add `src/lib/*-api.ts` modules for domain endpoints. `src/lib` is for UI helpers, formatting, storage keys, and config — not fetch wrappers.

| Location | Purpose |
|----------|---------|
| `src/store/slices/*.ts` | `fetch` + thunks + slice state |
| `src/lib/api-config.ts` | Base URL only (`apiUrl`) |
| `src/store/api-utils.ts` | Cross-slice helpers (e.g. `readApiError`) — not endpoints |
| Components / pages | `dispatch(thunk())`, selectors — **no** `fetch` to `/api` |

## Pattern

1. Define types in `src/types/`.
2. Add `createAsyncThunk` in the relevant slice; call `apiUrl("/api/...")` there.
3. On non-OK responses, `throw new Error(await readApiError(response))` and use `rejectWithValue` in the thunk `catch`.
4. Wire UI with `useAppDispatch` / `useAppSelector` and exported selectors.

Example (auth login):

```ts
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const body = new URLSearchParams({
        username: credentials.email.trim(),
        password: credentials.password,
      });
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      const tokenResponse = (await response.json()) as TokenResponse;
      // ... further calls in the same thunk if needed
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login failed.",
      );
    }
  },
);
```

## Auth token in other slices

Slices that need the logged-in user should read the token from Redux state (see `productSlice` → `getAccessToken(getState)`), not from a separate API module.

## Exceptions

- **`apiUrl`** — shared base URL builder; stays in `lib/api-config.ts`.
- **`readApiError`** — parses FastAPI error JSON; lives in `store/api-utils.ts` because many slices reuse it.
- **Local-only persistence** (e.g. cart in `localStorage`) may stay in `lib/` without HTTP.
- Legacy direct `fetch` in a component should be moved into a slice when that area is touched (e.g. verify-email → `authSlice` thunks).

## Adding a new feature

1. Create or extend a slice under `src/store/slices/`.
2. Register the reducer in `src/store/index.ts` if it is new.
3. Export thunks and selectors from the slice file.
4. Components dispatch thunks only — they do not import endpoint URLs.
