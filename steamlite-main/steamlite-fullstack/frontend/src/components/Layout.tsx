import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { AssistantWidget } from "./AssistantWidget";

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link nav-link-active" : "nav-link";

export const Layout = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const canAccessStoreFeatures = user?.role === "CUSTOMER" || user?.role === "DEVELOPER";

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">SL</div>
          <div>
            <h1>SteamLite</h1>
            <p>Game marketplace for gamers by gamers</p>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" className={navClass}>
            Store
          </NavLink>

          {canAccessStoreFeatures && (
            <>
              <NavLink to="/library" className={navClass}>
                Library
              </NavLink>
              <NavLink to="/wishlist" className={navClass}>
                Wishlist
              </NavLink>
              <NavLink to="/cart" className={navClass}>
                Cart ({cartCount})
              </NavLink>
              <NavLink to="/orders" className={navClass}>
                Orders
              </NavLink>
            </>
          )}

          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}

          {user?.role === "DEVELOPER" && (
            <NavLink to="/my-games" className={navClass}>
              My Games
            </NavLink>
          )}
        </nav>

        <div className="session-block">
          {user ? (
            <>
              <div className="user-chip">
                <span>{user.username}</span>
                <strong>{user.role}</strong>
              </div>
              <button className="button button-secondary" type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/auth" className="button button-primary button-link">
              Login / Register
            </NavLink>
          )}
        </div>
      </header>

      <main className="page-wrap">
        <Outlet />
      </main>

      <AssistantWidget />
    </div>
  );
};
