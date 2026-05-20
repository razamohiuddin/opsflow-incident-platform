import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../../store/slices/authSlice.js';
import { loadOrganizations } from '../../store/slices/organizationSlice.js';
import { ROUTES } from '../../constants/index.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';

export function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const error = useSelector((s) => s.auth.error);
  const fromLocation = location.state?.from;
  const redirectTo = fromLocation
    ? `${fromLocation.pathname}${fromLocation.search || ''}`
    : ROUTES.DASHBOARD;
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setLocalError('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await dispatch(
      signup({ name: form.name, email: form.email, password: form.password })
    );
    if (signup.fulfilled.match(result)) {
      await dispatch(loadOrganizations());
      navigate(redirectTo);
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Start managing incidents for your team
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {(error || localError) && <Alert variant="error">{error || localError}</Alert>}
          <Input label="Full name" value={form.name} onChange={update('name')} required />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={update('email')}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={update('password')}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            value={form.confirm}
            onChange={update('confirm')}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            state={{ from: location.state?.from }}
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
