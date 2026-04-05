import { FormEvent, useEffect, useState } from "react";
import { Game, GamePayload } from "../types";

type AdminGameFormProps = {
  selectedGame: Game | null;
  onSubmit: (payload: GamePayload) => Promise<void>;
  onCancel: () => void;
};

const emptyForm: GamePayload = {
  title: "",
  description: "",
  price: 0,
  releaseDate: "",
  developerId: 1,
};

export const AdminGameForm = ({ selectedGame, onSubmit, onCancel }: AdminGameFormProps) => {
  const [form, setForm] = useState<GamePayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedGame) {
      setForm({
        title: selectedGame.title,
        description: selectedGame.description,
        price: selectedGame.price,
        releaseDate: selectedGame.releaseDate.slice(0, 10),
        developerId: selectedGame.developerId || 1,
      });
    } else {
      setForm(emptyForm);
    }
  }, [selectedGame]);

  const handleChange = (name: keyof GamePayload, value: string) => {
    setForm((current) => ({
      ...current,
      [name]:
        name === "price"
          ? Number(value)
          : name === "developerId"
          ? (value === "" ? "" : Number(value))
          : value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(form);
      if (!selectedGame) {
        setForm(emptyForm);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <div className="section-header">
        <h3>{selectedGame ? "Edit game" : "Create new game"}</h3>
        {selectedGame && (
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Cancel edit
          </button>
        )}
      </div>

      <label>
        Title
        <input
          value={form.title}
          onChange={(event) => handleChange("title", event.target.value)}
          required
        />
      </label>

      <label>
        Description
        <textarea
          rows={4}
          value={form.description}
          onChange={(event) => handleChange("description", event.target.value)}
          required
        />
      </label>

      <label>
        Price
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(event) => handleChange("price", event.target.value)}
          required
        />
      </label>

      <label>
        Release date
        <input
          type="date"
          value={form.releaseDate}
          onChange={(event) => handleChange("releaseDate", event.target.value)}
          required
        />
      </label>

      <label>
        Developer ID
        <input
          type="number"
          min="1"
          value={form.developerId}
          onChange={(event) => handleChange("developerId", event.target.value)}
        />
      </label>

      <button className="button button-primary" type="submit" disabled={submitting}>
        {submitting ? "Saving..." : selectedGame ? "Update game" : "Create game"}
      </button>
    </form>
  );
};
