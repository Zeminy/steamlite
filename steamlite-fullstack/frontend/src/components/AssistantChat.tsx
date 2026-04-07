import { FormEvent, useEffect, useRef, useState } from "react";
import { apiRequest, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { AssistantChatMessagePayload, AssistantChatResponse, Role } from "../types";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  content: string;
};

const getScopeCopy = (role?: Role) => {
  if (role === "DEVELOPER") {
    return "Pricing, review summaries, discount ideas, player feedback, and revenue insight for your own games only.";
  }

  if (role === "ADMIN") {
    return "Moderation, toxic reviews, suspicious behavior, discount strategy, and revenue split.";
  }

  return "Game recommendations, budget advice, ratings, reviews, wishlist, cart, library, and purchase help. No admin or developer business topics.";
};

const buildWelcomeMessage = (role?: Role): ChatMessage => ({
  id: 1,
  role: "assistant",
  content: `Ask me naturally in Vietnamese or English. I only support SteamLite topics. Right now I can help with ${getScopeCopy(role).toLowerCase()}`,
});

export const AssistantChat = ({
  compact = false,
  onClose,
}: {
  compact?: boolean;
  onClose?: () => void;
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([buildWelcomeMessage(user?.role)]);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const nextMessageIdRef = useRef(2);

  useEffect(() => {
    nextMessageIdRef.current = 2;
    setMessages([buildWelcomeMessage(user?.role)]);
    setInput("");
  }, [user?.id, user?.role]);

  useEffect(() => {
    const thread = threadRef.current;

    if (!thread) {
      return;
    }

    thread.scrollTop = thread.scrollHeight;
  }, [messages, compact]);

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !user) {
      return;
    }

    const userMessageId = nextMessageIdRef.current++;
    const assistantMessageId = nextMessageIdRef.current++;

    setSubmitting(true);
    setMessages((current) => [...current, { id: userMessageId, role: "user", content: trimmedMessage }]);

    try {
      const response = await apiRequest<AssistantChatResponse>("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({
          message: trimmedMessage,
          history: messages
            .filter((entry) => entry.id !== 1)
            .slice(-8)
            .map(
              (entry): AssistantChatMessagePayload => ({
                role: entry.role,
                content: entry.content,
              })
            ),
        }),
      });

      const replyText = response.response?.trim() || "The assistant did not return an answer. Please try again.";

      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          content: replyText,
        },
      ]);
      setInput("");
    } catch (error) {
      const errorText =
        error instanceof ApiError ? error.message : "The assistant could not answer right now.";

      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          content: errorText,
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await sendMessage(input);
  };

  if (!user) {
    return null;
  }

  return (
    <section className={`panel assistant-panel ${compact ? "assistant-panel-compact" : ""}`}>
      <div className="assistant-header">
        <div className="assistant-header-copy">
          {compact ? null : <span className="eyebrow">SteamLite assistant</span>}
          <h3>{compact ? "SteamLite AI" : "Role-aware AI support"}</h3>
          <p className={compact ? "assistant-role-pill" : "muted"}>
            {compact ? `${user.role.toLowerCase()} mode` : getScopeCopy(user.role)}
          </p>
        </div>

        {onClose ? (
          <button
            className="button button-secondary assistant-close-button"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        ) : null}
      </div>

      <div ref={threadRef} className="assistant-thread">
        {messages.map((message, index) => (
          <article
            key={message.id || `${message.role}-${index}`}
            className={
              message.role === "assistant"
                ? "assistant-message assistant-message-bot"
                : "assistant-message assistant-message-user"
            }
          >
            <strong>{message.role === "assistant" ? "SteamLite AI" : "You"}</strong>
            <p>{message.content}</p>
          </article>
        ))}
      </div>

      <form className="assistant-form" onSubmit={handleSubmit}>
        <textarea
          rows={compact ? 2 : 4}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything related to SteamLite..."
        />
        <button className="button button-primary assistant-send-button" type="submit" disabled={submitting}>
          {submitting ? "Thinking..." : "Send"}
        </button>
      </form>
    </section>
  );
};
