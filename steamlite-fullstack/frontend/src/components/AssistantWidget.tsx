import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AssistantChat } from "./AssistantChat";

type DockSide = "left" | "right";

const DOCK_STORAGE_KEY = "steamlite_assistant_dock_side";

export const AssistantWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [dockSide, setDockSide] = useState<DockSide>(() =>
    localStorage.getItem(DOCK_STORAGE_KEY) === "left" ? "left" : "right"
  );
  const location = useLocation();
  const dragStartXRef = useRef<number | null>(null);
  const suppressToggleRef = useRef(false);
  const shouldHideWidget = !user || location.pathname === "/assistant";

  useEffect(() => {
    localStorage.setItem(DOCK_STORAGE_KEY, dockSide);
  }, [dockSide]);

  const stopDragging = () => {
    dragStartXRef.current = null;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStartXRef.current = event.clientX;
    suppressToggleRef.current = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (dragStartXRef.current === null) {
        return;
      }

      if (Math.abs(moveEvent.clientX - dragStartXRef.current) > 12) {
        suppressToggleRef.current = true;
        setDockSide(moveEvent.clientX < window.innerWidth / 2 ? "left" : "right");
      }
    };

    const handlePointerUp = () => {
      stopDragging();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleToggle = () => {
    if (suppressToggleRef.current) {
      suppressToggleRef.current = false;
      return;
    }

    setOpen((current) => !current);
  };

  if (shouldHideWidget) {
    return null;
  }

  return (
    <div className={`assistant-widget assistant-widget-${dockSide}`}>
      {open ? (
        <div className="assistant-widget-panel">
          <AssistantChat compact onClose={() => setOpen(false)} />
        </div>
      ) : null}

      <button
        type="button"
        className="assistant-widget-toggle"
        onPointerDown={handlePointerDown}
        onClick={handleToggle}
        aria-label={open ? "Close SteamLite Guide" : "Open SteamLite Guide"}
        title="Drag left or right to move SteamLite Guide"
      >
        <span>...</span>
      </button>
    </div>
  );
};
