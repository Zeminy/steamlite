import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, ApiError } from "../api/client";
import { LibraryItem } from "../types";
import { useAuth } from "../context/AuthContext";

export const LibraryPage = () => {
  const { user } = useAuth();
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLibrary = async () => {
    setLoading(true);

    try {
      const response = await apiRequest<{ library: LibraryItem[] }>("/library/me");
      setLibrary(response.library);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  if (loading) {
    return (
      <div className="panel">
        <p>Loading library...</p>
      </div>
    );
  }

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">Library</span>
            <h2>Your owned games</h2>
          </div>
          <button className="button button-secondary" onClick={loadLibrary}>
            Refresh
          </button>
        </div>

        {message && <div className="status-banner status-error">{message}</div>}

        {!library.length ? (
          <div className="empty-state">
            <h3>Your library is empty.</h3>
            <p>Complete a purchase to add games to your permanent collection.</p>
          </div>
        ) : (
          <div className="list-grid">
            {library.map((entry) => {
              const isCreator = user?.role === "DEVELOPER" && entry.game.developerUserId === user.id;

              return (
                <article key={entry.id} className="panel list-card">
                  <div className="library-card-content">
                    <div className="library-cover">
                      {entry.game.coverImageUrl ? (
                        <img
                          className="library-cover-media"
                          src={entry.game.coverImageUrl}
                          alt={`${entry.game.title} cover`}
                        />
                      ) : (
                        <span>{entry.game.title.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    <div>
                      <h3>{entry.game.title}</h3>
                      <p className="muted">{entry.game.developerCompany}</p>
                      <p>{entry.game.description}</p>
                      <div className="meta-row">
                        <span>Genre: {entry.game.genre || "Uncategorized"}</span>
                        <span>
                          {isCreator ? "Created" : "Purchased"}:{" "}
                          {new Date(entry.purchasedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="list-card-actions">
                    <strong>${entry.game.price.toFixed(2)}</strong>
                    <Link
                      className="button button-primary button-link"
                      to={`/games/${entry.game.id}`}
                    >
                      View details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
