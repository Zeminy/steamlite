import { AssistantChat } from "../components/AssistantChat";
import { useAuth } from "../context/AuthContext";

export const AssistantPage = () => {
  const { user } = useAuth();

  return (
    <div className="stack-gap">
      <section className="hero-grid">
        <div className="panel">
          <span className="eyebrow">SteamLite assistant</span>
          <h2>Role-aware AI support</h2>
          <p>
            This assistant adapts to the logged-in role. Customers get shopping help, developers
            get pricing and feedback insight, and admins get moderation and revenue guidance.
          </p>
        </div>

        <div className="panel">
          <span className="eyebrow">Supported scope</span>
          <p>
            {user?.role === "CUSTOMER" &&
              "Customer support covers recommendations, ratings, reviews, budget, wishlist, cart, library, and purchase-related questions."}
            {user?.role === "DEVELOPER" &&
              "Developer support covers pricing, review summaries, player feedback, discounts, and revenue insight for your own games."}
            {user?.role === "ADMIN" &&
              "Admin support covers moderation, toxic reviews, suspicious behavior signals, discount strategy, and revenue split."}
          </p>
          <p className="muted">
            If you ask about something outside SteamLite, the assistant will say it is not supported.
          </p>
        </div>
      </section>

      <AssistantChat />
    </div>
  );
};
