import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as organizationService from '../../services/organizationService.js';
import { getApiErrorMessage } from '../../services/api.js';
import { STORAGE_KEYS } from '../../constants/index.js';
import { setTokens, logoutThunk, setOrganizations } from './authSlice.js';

const isMongoObjectId = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

export const loadOrganizations = createAsyncThunk(
  'organization/load',
  async (_, { rejectWithValue }) => {
    try {
      return await organizationService.listOrganizations();
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const createOrganization = createAsyncThunk(
  'organization/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await organizationService.createOrganization(payload);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const switchOrganization = createAsyncThunk(
  'organization/switch',
  async (orgId, { rejectWithValue, dispatch }) => {
    try {
      const result = await organizationService.switchOrganization(orgId);
      if (result.accessToken) {
        dispatch(setTokens({ accessToken: result.accessToken }));
      }
      return result.organization || { id: orgId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const loadMembers = createAsyncThunk('organization/members', async () => {
  return organizationService.listMembers();
});

export const loadInvites = createAsyncThunk('organization/invites', async () => {
  return organizationService.listInvites();
});

export const sendInvite = createAsyncThunk(
  'organization/invite',
  async (payload, { rejectWithValue }) => {
    try {
      return await organizationService.createInvite(payload);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const acceptInvite = createAsyncThunk(
  'organization/acceptInvite',
  async ({ token }, { rejectWithValue, dispatch }) => {
    try {
      const data = await organizationService.acceptInvite({ token });
      const orgs = data.organizations || [];
      dispatch(setOrganizations(orgs));
      return orgs;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

const savedOrgId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORG_ID);

const organizationSlice = createSlice({
  name: 'organization',
  initialState: {
    list: [],
    active: savedOrgId && isMongoObjectId(savedOrgId) ? { id: savedOrgId } : null,
    members: [],
    invites: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setActiveOrg(state, action) {
      state.active = action.payload;
      if (action.payload?.id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, action.payload.id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrganizations.fulfilled, (state, action) => {
        state.list = action.payload;
        if (!state.active && action.payload.length) {
          const first = action.payload[0];
          state.active = first;
          localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, first.id);
        } else if (state.active?.id) {
          const match = action.payload.find((o) => o.id === state.active.id);
          if (match) {
            state.active = match;
          } else if (action.payload.length) {
            state.active = action.payload[0];
            localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, action.payload[0].id);
          } else {
            state.active = null;
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORG_ID);
          }
        }
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.active = action.payload;
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, action.payload.id);
      })
      .addCase(switchOrganization.fulfilled, (state, action) => {
        state.active = action.payload;
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, action.payload.id);
      })
      .addCase(loadMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      })
      .addCase(loadInvites.fulfilled, (state, action) => {
        state.invites = action.payload;
      })
      .addCase(sendInvite.fulfilled, (state, action) => {
        const { token: _token, ...invite } = action.payload;
        if (!state.invites.some((i) => i.id === invite.id)) {
          state.invites.push(invite);
        }
      })
      .addCase(acceptInvite.fulfilled, (state, action) => {
        const prevIds = new Set(state.list.map((o) => o.id));
        state.list = action.payload;
        if (action.payload.length) {
          const joined =
            action.payload.find((o) => !prevIds.has(o.id)) ||
            action.payload[action.payload.length - 1];
          state.active = joined;
          localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, joined.id);
        }
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.list = [];
        state.active = null;
        state.members = [];
        state.invites = [];
      });
  },
});

export const { setActiveOrg } = organizationSlice.actions;
export default organizationSlice.reducer;
