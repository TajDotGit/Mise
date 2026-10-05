import { MonitorIcon, MoonIcon, SunIcon } from '../../components/icons';
import { useTheme, type ThemePreference } from '../theme/ThemeContext';

const options: { value: ThemePreference; label: string; Icon: typeof SunIcon }[] = [
  { value: 'system', label: 'System', Icon: MonitorIcon },
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
];

export function ThemeSwitch() {
  const { preference, setPreference } = useTheme();
  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-1 rounded-2xl bg-canvas p-1 ring-1 ring-line">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={preference === value}
          onClick={() => setPreference(value)}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
            preference === value ? 'bg-surface text-brand shadow-sm ring-1 ring-line' : 'text-muted'
          }`}
        >
          <Icon width={18} height={18} /> {label}
        </button>
      ))}
    </div>
  );
}
