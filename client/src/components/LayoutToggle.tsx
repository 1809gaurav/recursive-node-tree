export type Layout = "horizontal" | "vertical";

interface Props {
  layout: Layout;
  onChange: (layout: Layout) => void;
}

const OPTIONS: { value: Layout; label: string }[] = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
];

// Two-button switch: which direction the tree flows.
export default function LayoutToggle({ layout, onChange }: Props) {
  return (
    <div className="layout-toggle" role="group" aria-label="Tree direction">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          className={layout === o.value ? "active" : ""}
          aria-pressed={layout === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
