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
  const [form, setForm] = useState<any>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

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
      setForm({
        ...emptyForm,
        price: "", // Use empty string for new game to avoid default 0
        discountPercent: "",
      });
    }
    setPreviewFailed(false);
  }, [selectedGame]);

  const handleChange = (name: keyof GamePayload, value: string) => {
    setForm((current: any) => ({
      ...current,
      [name]:
        name === "price" || name === "discountPercent"
          ? value // Keep as string while typing
          : name === "developerId"
          ? (value === "" ? "" : Number(value))
          : value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    // Convert numeric strings back to numbers before submission
    const finalPayload: GamePayload = {
      ...form,
      price: Number(form.price) || 0,
      discountPercent: Number(form.discountPercent) || 0,
    };

    try {
      await onSubmit(finalPayload);
      if (!selectedGame) {
        setForm({
          ...emptyForm,
          price: "",
          discountPercent: "",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="panel game-form-container" onSubmit={handleSubmit}>
      <header className="section-header">
        <div>
          <span className="eyebrow">{selectedGame ? "Developer Tools" : "Marketplace Entry"}</span>
          <h2>{heading || (selectedGame ? "Edit game" : "Create new game")}</h2>
        </div>
        {selectedGame && (
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Cancel edit
          </button>
        )}
      </header>

      <div className="game-form-body">
        {/* Left Column: Basic Info */}
        <div className="game-form-main">
          <div className="form-group">
            <label className="eyebrow-label">General Information</label>
            <div className="field-block">
              <label>Title</label>
              <input
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                placeholder="Name of your masterpiece"
                required
              />
            </div>
            <div className="field-block">
              <label>Description</label>
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                placeholder="Tell the players why they should play this game..."
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="eyebrow-label">Media & Categorization</label>
            <div className="form-row">
              <div className="field-block">
                <label>Genre</label>
                <input
                  value={form.genre || ""}
                  onChange={(event) => handleChange("genre", event.target.value)}
                  placeholder="RPG, Strategy, etc."
                />
              </div>
              <div className="field-block">
                <label>Release Date</label>
                <input
                  type="date"
                  value={form.releaseDate}
                  onChange={(event) => handleChange("releaseDate", event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field-block">
              <label>Cover Image URL</label>
              <input
                type="text"
                value={form.coverImageUrl || ""}
                onChange={(event) => handleChange("coverImageUrl", event.target.value)}
                placeholder="https://example.com/cover.jpg"
              />
              <span className="field-hint">Paste the full public URL of your game's cover art.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Preview */}
        <aside className="game-form-aside">
          <div className="form-group">
            <label className="eyebrow-label">Pricing & Access</label>
            <div className="form-row">
              <div className="field-block">
                <label>Base Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(event) => handleChange("price", event.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              {showDiscountField && (
                <div className="field-block">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="90"
                    value={form.discountPercent}
                    onChange={(event) => handleChange("discountPercent", event.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            {showDeveloperField && (
              <div className="field-block">
                <label>Developer Identity</label>
                <select
                  value={form.developerId}
                  onChange={(event) => handleChange("developerId", event.target.value)}
                >
                  <option value="">Independent / no developer</option>
                  {developers.map((developer) => (
                    <option key={developer.id} value={developer.id}>
                      {developer.company}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="cover-preview-card">
            <label className="eyebrow-label">Visual Preview</label>
            {form.coverImageUrl && !previewFailed ? (
              <img
                className="cover-preview-media"
                src={form.coverImageUrl}
                alt="Game cover preview"
                onError={() => setPreviewFailed(true)}
              />
            ) : (
              <div className="cover-preview-empty">
                <strong>{form.title ? form.title.slice(0, 2).toUpperCase() : "SL"}</strong>
                <p>
                  {form.coverImageUrl
                    ? "Image load failed"
                    : "Ready for your art"}
                </p>
              </div>
            )}
            <div className="preview-meta">
              <strong>{form.title || "Untitled Game"}</strong>
              <span className="price-tag">${(Number(form.price) || 0).toFixed(2)}</span>
            </div>
          </div>

          <button className="button button-primary create-submit-btn" type="submit" disabled={submitting}>
            {submitting ? "Saving changes..." : selectedGame ? "Update Marketplace Data" : "Publish to SteamLite"}
          </button>
        </aside>
      </div>
    </form>
  );
};
