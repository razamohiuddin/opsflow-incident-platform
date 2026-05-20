import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/index.js';
import { ProtectedRoute } from '../components/auth/ProtectedRoute.jsx';
import { OrgGuard } from '../components/auth/OrgGuard.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { LoginPage } from '../features/auth/LoginPage.jsx';
import { SignupPage } from '../features/auth/SignupPage.jsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.jsx';
import { IncidentListPage } from '../features/incidents/IncidentListPage.jsx';
import { IncidentDetailPage } from '../features/incidents/IncidentDetailPage.jsx';
import { IncidentFormPage } from '../features/incidents/IncidentFormPage.jsx';
import { OrganizationSettingsPage } from '../features/organizations/OrganizationSettingsPage.jsx';
import { AcceptInvitePage } from '../features/organizations/AcceptInvitePage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

      <Route
        path={ROUTES.INVITE_ACCEPT}
        element={
          <ProtectedRoute>
            <AcceptInvitePage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <OrgGuard>
              <AppLayout />
            </OrgGuard>
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.INCIDENTS} element={<IncidentListPage />} />
        <Route path={ROUTES.INCIDENT_NEW} element={<IncidentFormPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="/incidents/:id/edit" element={<IncidentFormPage />} />
        <Route path={ROUTES.ORG_SETTINGS} element={<OrganizationSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
