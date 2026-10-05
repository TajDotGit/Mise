import { NavLink, Outlet } from 'react-router';
import { BookIcon, CalendarIcon, CartIcon, ClockIcon } from './icons';

const tabs = [
  { to: '/', label: 'Week', Icon: CalendarIcon, end: true },
  { to: '/recipes', label: 'Recipes', Icon: BookIcon, end: false },
  { to: '/groceries', label: 'Groceries', Icon: CartIcon, end: false },
  { to: '/use-soon', label: 'Use soon', Icon: ClockIcon, end: false },
];

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-[env(safe-area-inset-top)]">
        <Outlet />
      </main>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {tabs.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
                    isActive ? 'text-brand' : 'text-muted'
                  }`
                }
              >
                <Icon />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
