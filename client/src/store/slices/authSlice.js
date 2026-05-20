import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/authService.js';
import { STORAGE_KEYS } from '../../constants/index.js';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.signup(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Signup failed');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.fetchMe();
    } catch {
      return rejectWithValue('Session expired');
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const initialState = {
  user: null,
  accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  organizations: [],
  status: 'idle',
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, action.payload.accessToken);
      }
      if (action.payload.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, action.payload.refreshToken);
      }
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.organizations = [];
      state.error = null;
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORG_ID);
    },
    setInitialized(state) {
      state.initialized = true;
    },
    setOrganizations(state, action) {
      state.organizations = action.payload;
    },
  },
  extraReducers: (builder) => {
    const handleAuthSuccess = (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.organizations = action.payload.organizations || [];
      state.status = 'succeeded';
      state.error = null;
      state.initialized = true;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, action.payload.refreshToken);
      }
    };

    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, handleAuthSuccess)
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signup.fulfilled, handleAuthSuccess)
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.organizations = action.payload.organizations || [];
        state.initialized = true;
        state.status = 'succeeded';
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.organizations = [];
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORG_ID);
      })
      .addMatcher(
        (action) => action.type === 'organization/create/fulfilled',
        (state, action) => {
          if (!state.organizations.some((o) => o.id === action.payload.id)) {
            state.organizations.push(action.payload);
          }
        }
      )
      .addMatcher(
        (action) => action.type === 'organization/acceptInvite/fulfilled',
        (state, action) => {
          state.organizations = action.payload;
        }
      );
  },
});

export const { setTokens, clearAuth, setInitialized, setOrganizations } = authSlice.actions;
export default authSlice.reducer;
