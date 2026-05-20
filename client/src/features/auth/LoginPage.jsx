import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Zap } from 'lucide-react';
import { login } from '../../store/slices/authSlice.js';
import { loadOrganizations } from '../../store/slices/organizationSlice.js';
import { ROUTES } from '../../constants/index.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const error = useSelector((s) => s.auth.error);
  const [email, setEmail] = useState('alex@acme.io');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const fromLocation = location.state?.from;
  const from = fromLocation
    ? `${fromLocation.pathname}${fromLocation.search || ''}`
    : ROUTES.DASHBOARD;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      await dispatch(loadOrganizations());
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-indigo-100 via-slate-50 to-white p-12 lg:flex dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-2">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">OpsFlow</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Multi-tenant incident management
          </h2>
          <p className="mt-4 max-w-md text-slate-600 dark:text-slate-400">
            Collaborate across organizations, track severity, assign work, and monitor ops
            metrics in real time.
          </p>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-600">
          Demo: alex@acme.io / password123
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 lg:hidden dark:text-white">OpsFlow</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            No account?{' '}
            <Link
              to={ROUTES.SIGNUP}
              state={{ from: location.state?.from }}
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
