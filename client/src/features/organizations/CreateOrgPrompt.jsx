import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Building2 } from 'lucide-react';
import { createOrganization } from '../../store/slices/organizationSlice.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';

export function CreateOrgPrompt() {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }
    setLoading(true);
    setError('');
    const result = await dispatch(createOrganization({ name: name.trim() }));
    if (createOrganization.rejected.match(result)) {
      setError(result.payload || 'Failed to create organization');
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
            <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Create your organization
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You need an org to manage incidents
            </p>
          </div>
        </div>
        {error && <Alert variant="error">{error}</Alert>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input
            label="Organization name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Engineering"
          />
          <Button type="submit" className="w-full" loading={loading}>
            Create organization
          </Button>
        </form>
      </div>
    </div>
  );
}
