import { useDispatch, useSelector } from 'react-redux';
import { LogOut, ChevronDown } from 'lucide-react';
import { logoutThunk } from '../../store/slices/authSlice.js';
import { OrgSwitcher } from '../../features/organizations/OrgSwitcher.jsx';
import { Button } from '../ui/Button.jsx';
import { RoleBadge } from '../ui/Badge.jsx';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';

export function Header() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const role = useSelector((s) => s.organization.active?.role);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/30">
      <OrgSwitcher />

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        {role && <RoleBadge role={role} />}
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(logoutThunk())}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
