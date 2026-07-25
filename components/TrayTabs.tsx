"use client";

type Tray = { name: string; count: number };

type Props = {
  trays: readonly Tray[];
  total: number;
  active: string | null;
  onSelect: (name: string | null) => void;
};

/** The carousel trays: one tab per design type, canonicalized by the darkroom. */
export function TrayTabs({ trays, total, active, onSelect }: Props) {
  return (
    <nav className="trays" aria-label="Design type trays">
      <button
        className="tray"
        aria-pressed={active === null}
        onClick={() => onSelect(null)}
      >
        All slides <span className="tray-count">{total}</span>
      </button>
      {trays.map((tray) => (
        <button
          key={tray.name}
          className="tray"
          aria-pressed={active === tray.name}
          onClick={() => onSelect(active === tray.name ? null : tray.name)}
        >
          {tray.name} <span className="tray-count">{tray.count}</span>
        </button>
      ))}
    </nav>
  );
}
