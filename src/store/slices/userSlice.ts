import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { userClient } from "../../libs/api/userClient";
import {
  parseTokenPayload,
  type LoginFormData,
  type AuthResponse,
  type TokenPayload,
  type StaffPayload,
  type RegisterRequest,
} from "../../schemas/auth.schema";

interface BaseUser {
  sub: string;
  email: string;
  firstName: string | undefined;
  lastName: string | undefined;
  fullName: string;
  accountType: TokenPayload["accountType"];
}

export interface PatientUser extends BaseUser {
  accountType: "PATIENT";
  patientId: string;
}

export interface StaffUser extends BaseUser {
  accountType: "STAFF";
  staffRole: StaffPayload["staffRole"];
  staffId: string;
}

export type AuthUser = PatientUser | StaffUser;

interface UserState {
  user: AuthUser | null;
  accessToken: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  isInitialized: boolean;
}

const storedToken = localStorage.getItem("accessToken");

const initialState: UserState = {
  user: tryUserFromStorage(),
  accessToken: storedToken,
  status: "idle",
  error: null,
  isInitialized: !storedToken,
};

function userFromToken(token: string): AuthUser {
  const payload: TokenPayload = parseTokenPayload(token);

  const base: BaseUser = {
    sub: payload.sub,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    fullName:
      [payload.firstName, payload.lastName].filter(Boolean).join(" ") ||
      payload.email.split("@")[0],
    accountType: payload.accountType,
  };

  if (payload.accountType === "PATIENT") {
    return {
      ...base,
      accountType: "PATIENT",
      patientId: payload.patientId,
    };
  }

  return {
    ...base,
    accountType: "STAFF",
    staffRole: payload.staffRole,
    staffId: payload.staffId,
  };
}

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

function tryUserFromStorage(): AuthUser | null {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    return userFromToken(token);
  } catch {
    return null;
  }
}

type AxiosLike = {
  response?: { data?: { message?: string } };
  message?: string;
};

function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong"
): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  const ax = err as AxiosLike | undefined;
  return ax?.response?.data?.message ?? ax?.message ?? fallback;
}

export const login = createAsyncThunk<
  AuthResponse,
  LoginFormData,
  { rejectValue: string }
>("user/login", async (creds, { rejectWithValue }) => {
  try {
    return await userClient.login(creds);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "Login failed"));
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  RegisterRequest,
  { rejectValue: string }
>("user/register", async (payload, { rejectWithValue }) => {
  try {
    return await userClient.register(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "Registration failed"));
  }
});

export const autoRefresh = createAsyncThunk<
  AuthResponse | null,
  void,
  { rejectValue: string }
>("user/autoRefresh", async (_, { rejectWithValue }) => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    return await userClient.refresh(refreshToken);
  } catch (err) {
    clearTokens();
    return rejectWithValue(getErrorMessage(err, "Session expired"));
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout(state) {
      clearTokens();
      state.user = null;
      state.accessToken = null;
      state.status = "idle";
      state.error = null;
      state.isInitialized = true;
    },
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) =>
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        const { accessToken, refreshToken } = action.payload;
        storeTokens(accessToken, refreshToken);
        state.accessToken = accessToken;
        state.user = userFromToken(accessToken);
        state.status = "succeeded";
        state.isInitialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Login failed";
        state.isInitialized = true;
      })

      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          const { accessToken, refreshToken } = action.payload;
          storeTokens(accessToken, refreshToken);
          state.accessToken = accessToken;
          state.user = userFromToken(accessToken);
          state.status = "succeeded";
          state.isInitialized = true;
        }
      )
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Registration failed";
        state.isInitialized = true;
      })

      .addCase(autoRefresh.pending, (state) => {
        state.status = "loading";
      })
      .addCase(autoRefresh.fulfilled, (state, action) => {
        state.isInitialized = true;

        if (action.payload) {
          const { accessToken, refreshToken } = action.payload;
          storeTokens(accessToken, refreshToken);
          state.accessToken = accessToken;
          state.user = userFromToken(accessToken);
          state.status = "succeeded";
        } else {
          state.user = null;
          state.accessToken = null;
          state.status = "idle";
        }
      })
      .addCase(autoRefresh.rejected, (state) => {
        state.isInitialized = true;
        state.user = null;
        state.accessToken = null;
        state.status = "idle";
      }),
});

export const { logout, clearError } = userSlice.actions;
export default userSlice.reducer;
