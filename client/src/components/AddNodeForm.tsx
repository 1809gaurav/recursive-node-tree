import { useState, type FormEvent } from "react";

interface Props {
  placeholder: string;
  buttonLabel: string;
  onAdd: (name: string) => Promise<void>;
}

export default function AddNodeForm({ placeholder, buttonLabel, onAdd }: Props) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onAdd(trimmed);
      setName(""); // only clear when the save worked
    } catch {
      /* the error is shown by the parent; keep the text so it can be retried */
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder}
        maxLength={200}
        aria-label={placeholder}
      />
      <button type="submit" disabled={busy || !name.trim()}>
        {busy ? "Adding…" : buttonLabel}
      </button>
    </form>
  );
}