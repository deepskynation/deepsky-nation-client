import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredUser,
  setStoredAuth,
} from "@/lib/auth-session";
import { readApiError } from "@/store/api-utils";
import type {
  ApiUser,
  AuthState,
  EmailVerifyCodeCredentials,
  GoogleSendCodeResponse,
  GoogleVerifyCodeCredentials,
  LoginCredentials,
  MessageResponse,
  SignupCredentials,
  SignupResponse,
  TokenResponse,
  UpdateProfilePayload,
  UpdateAccountPayload,
} from "@/types/auth";
import type { User } from "@/types";

type AuthRootState = {
  auth: AuthState;
};

function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.username,
    role: apiUser.role,
    phone_number: apiUser.phone_number ?? null,
    home_address: apiUser.home_address ?? null,
    city: apiUser.city ?? null,
    region: apiUser.region ?? null,
    country: apiUser.country ?? null,
    postal_code: apiUser.postal_code ?? null,
  };
}

async function fetchCurrentUser(accessToken: string): Promise<User> {
  const response = await fetch(apiUrl("/api/auth/me"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  const body = (await response.json()) as ApiUser;
  return mapApiUserToUser(body);
}

async function completeTokenLogin(accessToken: string) {
  const user = await fetchCurrentUser(accessToken);
  setStoredAuth(accessToken, user);
  return { user, accessToken };
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
  initialized: false,
  profileUpdateStatus: "idle",
  profileUpdateError: null,
  accountUpdateStatus: "idle",
  accountUpdateError: null,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    const token = getStoredAccessToken();
    if (!token) {
      return { user: null, accessToken: null };
    }

    try {
      const user = await fetchCurrentUser(token);
      setStoredAuth(token, user);
      return { user, accessToken: token };
    } catch {
      clearStoredAuth();
      return rejectWithValue("Session expired. Please sign in again.");
    }
  },
);

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
      return completeTokenLogin(tokenResponse.access_token);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed. Please try again.";
      return rejectWithValue(message);
    }
  },
);

export const sendGoogleCode = createAsyncThunk(
  "auth/sendGoogleCode",
  async (credential: string, { rejectWithValue }) => {
    try {
      const response = await fetch(apiUrl("/api/auth/google/send-code"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      return (await response.json()) as GoogleSendCodeResponse;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not send verification code. Try again.";
      return rejectWithValue(message);
    }
  },
);

export const verifyGoogleCode = createAsyncThunk(
  "auth/verifyGoogleCode",
  async (credentials: GoogleVerifyCodeCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch(apiUrl("/api/auth/google/verify-code"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentials.credential,
          code: credentials.code.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const tokenResponse = (await response.json()) as TokenResponse;
      return completeTokenLogin(tokenResponse.access_token);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid or expired code.";
      return rejectWithValue(message);
    }
  },
);

export const sendEmailCode = createAsyncThunk(
  "auth/sendEmailCode",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch(apiUrl("/api/auth/email/send-code"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      return (await response.json()) as MessageResponse;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not send code. Try again.";
      return rejectWithValue(message);
    }
  },
);

export const verifyEmailCode = createAsyncThunk(
  "auth/verifyEmailCode",
  async (credentials: EmailVerifyCodeCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch(apiUrl("/api/auth/email/verify-code"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email.trim(),
          code: credentials.code.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const tokenResponse = (await response.json()) as TokenResponse;
      return completeTokenLogin(tokenResponse.access_token);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid or expired code.";
      return rejectWithValue(message);
    }
  },
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch(apiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username.trim(),
          email: credentials.email.trim(),
          password: credentials.password,
          phone_number: credentials.phone_number.trim(),
          home_address: credentials.home_address.trim(),
          city: credentials.city.trim(),
          region: credentials.region.trim(),
          country: credentials.country.trim(),
          postal_code: credentials.postal_code.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      return (await response.json()) as SignupResponse;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Sign up failed. Please try again.";
      return rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    const token = (getState() as AuthRootState).auth.accessToken;
    if (token) {
      try {
        await fetch(apiUrl("/api/auth/logout"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Clear local session even if the server call fails.
      }
    }
    clearStoredAuth();
  },
);

export const updateProfile = createAsyncThunk<
  User,
  UpdateProfilePayload,
  { state: AuthRootState; rejectValue: string }
>("auth/updateProfile", async (payload, { getState, rejectWithValue }) => {
  const token = getState().auth.accessToken;
  if (!token) {
    return rejectWithValue("You must be signed in to update your profile.");
  }

  try {
    const response = await fetch(apiUrl("/api/auth/me"), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const body = (await response.json()) as ApiUser;
    const user = mapApiUserToUser(body);
    setStoredAuth(token, user);
    return user;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile.";
    return rejectWithValue(message);
  }
});

export const updateAccount = createAsyncThunk<
  User,
  UpdateAccountPayload,
  { state: AuthRootState; rejectValue: string }
>("auth/updateAccount", async (payload, { getState, rejectWithValue }) => {
  const token = getState().auth.accessToken;
  if (!token) {
    return rejectWithValue("You must be signed in to update your account.");
  }

  try {
    const response = await fetch(apiUrl("/api/auth/me/account"), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const body = (await response.json()) as ApiUser;
    const user = mapApiUserToUser(body);
    setStoredAuth(token, user);
    return user;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update account.";
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
      state.profileUpdateError = null;
      if (state.status === "error") {
        state.status = state.user ? "authenticated" : "idle";
      }
    },
    clearProfileUpdateError(state) {
      state.profileUpdateError = null;
      if (state.profileUpdateStatus === "failed") {
        state.profileUpdateStatus = "idle";
      }
    },
    clearAccountUpdateError(state) {
      state.accountUpdateError = null;
      if (state.accountUpdateStatus === "failed") {
        state.accountUpdateStatus = "idle";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = action.payload.user ? "authenticated" : "idle";
        state.error = null;
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.status = "idle";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Session expired. Please sign in again.";
        state.initialized = true;
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
        state.error = null;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Login failed. Please try again.";
      })
      .addCase(sendGoogleCode.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendGoogleCode.fulfilled, (state) => {
        state.status = "idle";
        state.error = null;
      })
      .addCase(sendGoogleCode.rejected, (state, action) => {
        state.status = "error";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Could not send verification code. Try again.";
      })
      .addCase(verifyGoogleCode.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyGoogleCode.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
        state.error = null;
        state.initialized = true;
      })
      .addCase(verifyGoogleCode.rejected, (state, action) => {
        state.status = "error";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Invalid or expired code.";
      })
      .addCase(sendEmailCode.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendEmailCode.fulfilled, (state) => {
        state.status = "idle";
        state.error = null;
      })
      .addCase(sendEmailCode.rejected, (state, action) => {
        state.status = "error";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Could not send code. Try again.";
      })
      .addCase(verifyEmailCode.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyEmailCode.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
        state.error = null;
        state.initialized = true;
      })
      .addCase(verifyEmailCode.rejected, (state, action) => {
        state.status = "error";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Invalid or expired code.";
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.status = "idle";
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "error";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Sign up failed. Please try again.";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "idle";
        state.error = null;
        state.initialized = true;
      })
      .addCase(updateProfile.pending, (state) => {
        state.profileUpdateStatus = "loading";
        state.profileUpdateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.profileUpdateStatus = "succeeded";
        state.profileUpdateError = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileUpdateStatus = "failed";
        state.profileUpdateError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update profile.";
      })
      .addCase(updateAccount.pending, (state) => {
        state.accountUpdateStatus = "loading";
        state.accountUpdateError = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.user = action.payload;
        state.accountUpdateStatus = "succeeded";
        state.accountUpdateError = null;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.accountUpdateStatus = "failed";
        state.accountUpdateError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update account.";
      });
  },
});

export const { clearAuthError, clearProfileUpdateError, clearAccountUpdateError } =
  authSlice.actions;

export const selectAuth = (state: AuthRootState) => state.auth;
export const selectAuthUser = (state: AuthRootState) => state.auth.user;
export const selectAuthToken = (state: AuthRootState) => state.auth.accessToken;
export const selectIsAuthenticated = (state: AuthRootState) =>
  Boolean(state.auth.accessToken && state.auth.user);
export const selectIsAdmin = (state: AuthRootState) =>
  state.auth.user?.role === "admin";
export const selectIsCustomer = (state: AuthRootState) =>
  state.auth.user?.role === "user";
export const selectAuthStatus = (state: AuthRootState) => state.auth.status;
export const selectAuthError = (state: AuthRootState) => state.auth.error;
export const selectAuthInitialized = (state: AuthRootState) => state.auth.initialized;
export const selectIsAuthLoading = (state: AuthRootState) =>
  state.auth.status === "loading" || !state.auth.initialized;
export const selectProfileUpdateStatus = (state: AuthRootState) =>
  state.auth.profileUpdateStatus;
export const selectProfileUpdateError = (state: AuthRootState) =>
  state.auth.profileUpdateError;
export const selectAccountUpdateStatus = (state: AuthRootState) =>
  state.auth.accountUpdateStatus;
export const selectAccountUpdateError = (state: AuthRootState) =>
  state.auth.accountUpdateError;

/** Optimistic UI before initializeAuth completes (reads localStorage). */
export function getAuthBootstrapUser(): ReturnType<typeof getStoredUser> {
  return getStoredUser();
}

export default authSlice.reducer;
