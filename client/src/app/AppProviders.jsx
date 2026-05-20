import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../store/index.js';
import { fetchMe, clearAuth, setInitialized } from '../store/slices/authSlice.js';
import { loadOrganizations } from '../store/slices/organizationSlice.js';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { AppRoutes } from './routes.jsx';

function AuthBootstrap({ children }) {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.accessToken);

  useEffect(() => {
    const onLogout = () => dispatch(clearAuth());
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe()).then((result) => {
        if (fetchMe.fulfilled.match(result)) {
          dispatch(loadOrganizations());
        }
      });
    } else {
      dispatch(setInitialized());
    }
  }, [dispatch, token]);

  return children;
}

export function AppProviders() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthBootstrap>
            <AppRoutes />
          </AuthBootstrap>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
