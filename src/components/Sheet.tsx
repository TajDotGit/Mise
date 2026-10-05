import { useEffect, useId, type ReactNode } from 'react';
import { XIcon } from './icons';

/** A bottom sheet on phones, a centered panel on wider screens. */
export function Sheet({
  title,
  onClose,
  children,
  tall = false,
  header,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Use most of the screen height (for long lists). */
  tall?: boolean;
  /** Pinned content under the title that doesn't scroll (e.g. a search box). */
  header?: ReactNode;
}) {
  const titleId = useId();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex w-full max-w-md flex-col rounded-t-3xl bg-canvas pb-[env(safe-area-inset-bottom)] shadow-xl sm:rounded-3xl ${tall ? 'h-[92dvh] sm:h-[85dvh]' : 'max-h-[85dvh]'}`}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-12 place-items-center rounded-full text-muted hover:bg-line/50"
          >
            <XIcon />
          </button>
        </div>
        {header ? <div className="px-5 pb-3">{header}</div> : null}
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}
