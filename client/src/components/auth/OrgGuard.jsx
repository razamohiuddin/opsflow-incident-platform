import { useSelector } from 'react-redux';
import { CreateOrgPrompt } from '../../features/organizations/CreateOrgPrompt.jsx';

export function OrgGuard({ children }) {
  const authOrgs = useSelector((s) => s.auth.organizations);
  const orgList = useSelector((s) => s.organization.list);
  const active = useSelector((s) => s.organization.active);

  const organizations = orgList.length > 0 ? orgList : authOrgs;
  const hasActiveOrg = active?.id && organizations.some((o) => o.id === active.id);

  if (!organizations.length || !hasActiveOrg) {
    return <CreateOrgPrompt />;
  }

  return children;
}
