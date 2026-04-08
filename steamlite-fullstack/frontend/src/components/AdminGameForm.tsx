import { FormEvent, useEffect, useState } from "react";
import { AdminDeveloper, Game, GamePayload } from "../types";

type AdminGameFormProps = {
  developers: AdminDeveloper[];
  selectedGame: Game | null;
  onSubmit: (payload: GamePayload) => Promise<void>;
  onCancel: () => void;
  heading?: string;
  showDeveloperField?: boolean;
  showDiscountField?: boolean;
};

const emptyForm: GamePayload = {
  title: "",
  description: "",
  price: 0,
  discountPercent: 0,
  genre: "",
  coverImageUrl: "",
  releaseDate: "",
  developerId: "",
};

export const AdminGameForm = ({
  developers,
  selectedGame,
  onSubmit,
  onCancel,
  heading,
  showDeveloperField = true,
  showDiscountField = true,
}: AdminGameFormProps) => {
  const [form, setForm] = useState<GamePayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedGame) {
      setForm({
        title: selectedGame.title,
        description: selectedGame.description,
        price: selectedGame.price,
        discountPercent: selectedGame.discountPercent || 0,
        genre: selectedGame.genre || "",
        coverImageUrl: selectedGame.coverImageUrl || "",
        releaseDate: selectedGame.releaseDate.slice(0, 10),
        developerId: selectedGame.developerId || "",
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
          : name === "discountPercent"
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
        <h3>{heading || (selectedGame ? "Edit game" : "Create new game")}</h3>
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

      {showDiscountField && (
        <label>
          Discount (%)
          <input
            type="number"
            step="1"
            min="0"
            max="90"
            value={form.discountPercent || 0}
            onChange={(event) => handleChange("discountPercent", event.target.value)}
          />
        </label>
      )}

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
        Genre
        <input
          value={form.genre || ""}
          onChange={(event) => handleChange("genre", event.target.value)}
          placeholder="RPG, Strategy, Racing..."
        />
      </label>

      <label>
        Cover image URL
        <input
          type="url"
          value={form.coverImageUrl || ""}
          onChange={(event) => handleChange("coverImageUrl", event.target.value)}
          placeholder="https://example.com/game-cover.jpg"
        />
      </label>

      {showDeveloperField && (
        <label>
          Developer
          <select
            value={form.developerId}
            onChange={(event) => handleChange("developerId", event.target.value)}
          >
            <option value="">Independent / no developer</option>
            {developers.map((developer) => (
              <option key={developer.id} value={developer.id}>
                {developer.company} ({developer.username})
              </option>
            ))}
          </select>
        </label>
      )}

      <button className="button button-primary" type="submit" disabled={submitting}>
        {submitting ? "Saving..." : selectedGame ? "Update game" : "Create game"}
      </button>
    </form>
  );
};
