import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import organizationReducer from './slices/organizationSlice.js';
import incidentsReducer from './slices/incidentsSlice.js';
import dashboardReducer from './slices/dashboardSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    incidents: incidentsReducer,
    dashboard: dashboardReducer,
  },
});
