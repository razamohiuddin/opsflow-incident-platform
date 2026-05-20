import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as incidentService from '../../services/incidentService.js';

export const fetchIncidents = createAsyncThunk(
  'incidents/list',
  async (params, { rejectWithValue }) => {
    try {
      return await incidentService.listIncidents(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const fetchIncidentById = createAsyncThunk(
  'incidents/detail',
  async (id, { rejectWithValue }) => {
    try {
      return await incidentService.getIncident(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const createIncident = createAsyncThunk(
  'incidents/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await incidentService.createIncident(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const updateIncident = createAsyncThunk(
  'incidents/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await incidentService.updateIncident(id, data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error?.message || err.response?.data?.error?.code
      );
    }
  }
);

export const deleteIncident = createAsyncThunk(
  'incidents/delete',
  async (id, { rejectWithValue }) => {
    try {
      await incidentService.deleteIncident(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const fetchComments = createAsyncThunk('incidents/comments', async (id) => {
  return { incidentId: id, comments: await incidentService.listComments(id) };
});

export const postComment = createAsyncThunk(
  'incidents/comment',
  async ({ incidentId, body }, { rejectWithValue }) => {
    try {
      const comment = await incidentService.addComment(incidentId, body);
      return { incidentId, comment };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

const defaultFilters = {
  q: '',
  status: '',
  severity: '',
  assigneeId: '',
  from: '',
  to: '',
  sort: 'createdAt',
  order: 'desc',
  page: 1,
  limit: 10,
};

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState: {
    items: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    filters: defaultFilters,
    selected: null,
    activity: [],
    comments: [],
    status: 'idle',
    detailStatus: 'idle',
    error: null,
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage(state, action) {
      state.filters.page = action.payload;
    },
    resetFilters(state) {
      state.filters = defaultFilters;
    },
    patchIncidentInList(state, action) {
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.selected?.id === action.payload.id) {
        state.selected = action.payload;
      }
    },
    clearSelected(state) {
      state.selected = null;
      state.activity = [];
      state.comments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchIncidentById.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchIncidentById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selected = action.payload.incident;
        state.activity = action.payload.activity || [];
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload.comments;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        state.comments.push(action.payload.comment);
      })
      .addCase(updateIncident.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(deleteIncident.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export const { setFilters, setPage, resetFilters, patchIncidentInList, clearSelected } =
  incidentsSlice.actions;
export default incidentsSlice.reducer;
