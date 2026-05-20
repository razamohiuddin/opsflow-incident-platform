import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, Mail, Copy, Check } from 'lucide-react';
import {
  loadMembers,
  loadInvites,
  sendInvite,
} from '../../store/slices/organizationSlice.js';
import { usePermissions } from '../../hooks/usePermissions.js';
import { ROLES, ROLE_LABELS } from '../../constants/index.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { RoleBadge } from '../../components/ui/Badge.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { formatRelative } from '../../utils/format.js';
import { buildInviteAcceptUrl } from '../../utils/invite.js';

export function OrganizationSettingsPage() {
  const dispatch = useDispatch();
  const active = useSelector((s) => s.organization.active);
  const members = useSelector((s) => s.organization.members);
  const invites = useSelector((s) => s.organization.invites);
  const { can } = usePermissions();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES.DEVELOPER);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(loadMembers());
    dispatch(loadInvites());
  }, [dispatch, active?.id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!can('org:invite')) return;
    setError('');
    setSuccess('');
    setInviteLink('');
    setCopied(false);
    setLoading(true);
    const trimmedEmail = email.trim();
    const result = await dispatch(sendInvite({ email: trimmedEmail, role }));
    if (sendInvite.fulfilled.match(result)) {
      setSuccess(`Invite created for ${trimmedEmail}. Share the link below (email delivery is not configured).`);
      setEmail('');
      if (result.payload.token) {
        setInviteLink(buildInviteAcceptUrl(result.payload.token));
      }
    } else {
      setError(result.payload || 'Failed to send invite');
    }
    setLoading(false);
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy link. Select and copy manually.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organization settings</h1>
        <p className="text-slate-600 dark:text-slate-400">{active?.name}</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Team members
        </h2>
        <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">{m.name}</p>
                <p className="text-sm text-slate-500">{m.email}</p>
              </div>
              <RoleBadge role={m.role} />
            </li>
          ))}
        </ul>
      </section>

      {can('org:invite') && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Invite user
          </h2>
          <form onSubmit={handleInvite} className="mt-4 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="colleague@company.com"
              />
              <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                {Object.values(ROLES).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" loading={loading}>
              Send invite
            </Button>
          </form>

          {inviteLink && (
            <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50/80 p-4 dark:border-indigo-500/30 dark:bg-indigo-950/40">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Invite link</p>
              <p className="mt-1 break-all text-xs text-slate-600 dark:text-slate-400">{inviteLink}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                The invitee must sign up or log in with the same email, then open this link.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy link
                  </>
                )}
              </Button>
            </div>
          )}

          {invites.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Pending invites
              </h3>
              <ul className="mt-2 space-y-2">
                {invites
                  .filter((i) => i.status === 'pending')
                  .map((inv) => (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{inv.email}</span>
                      <span className="text-slate-500">
                        {ROLE_LABELS[inv.role]} · {formatRelative(inv.createdAt)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {!can('org:invite') && (
        <Alert variant="info">Your role cannot send invites. Contact an admin or manager.</Alert>
      )}
    </div>
  );
}
