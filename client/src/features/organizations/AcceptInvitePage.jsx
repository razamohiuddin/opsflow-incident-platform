import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MailCheck } from 'lucide-react';
import { acceptInvite } from '../../store/slices/organizationSlice.js';
import { ROUTES } from '../../constants/index.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';

export function AcceptInvitePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((s) => s.auth.user);
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams.get('token');
    if (fromUrl) setToken(fromUrl);
  }, [searchParams]);

  const handleAccept = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Invite token is required');
      return;
    }
    setError('');
    setLoading(true);
    const result = await dispatch(acceptInvite({ token: token.trim() }));
    if (acceptInvite.fulfilled.match(result)) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else {
      setError(result.payload || 'Failed to accept invite');
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-600/20">
            <MailCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Accept invitation</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Join an organization using your invite link
            </p>
          </div>
        </div>

        {user && (
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Signed in as <span className="font-medium text-slate-800 dark:text-slate-200">{user.email}</span>
            . The invite must be for this email.
          </p>
        )}

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleAccept} className="mt-4 space-y-4">
          <Input
            label="Invite token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token from invite link"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Join organization
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link
            to={ROUTES.DASHBOARD}
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
