import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AssistantPage } from "./pages/AssistantPage";
import { AuthPage } from "./pages/AuthPage";
import { CartPage } from "./pages/CartPage";
import { DeveloperGamesPage } from "./pages/DeveloperGamesPage";
import { GameDetailsPage } from "./pages/GameDetailsPage";
import { LibraryPage } from "./pages/LibraryPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { OrdersPage } from "./pages/OrdersPage";
import { StorePage } from "./pages/StorePage";
import { VerifyCodePage } from "./pages/VerifyCodePage";
import { WishlistPage } from "./pages/WishlistPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<StorePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/verify-code" element={<VerifyCodePage />} />
              <Route path="/games/:id" element={<GameDetailsPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/assistant" element={<AssistantPage />} />
              </Route>

              <Route element={<ProtectedRoute requiredRole={["CUSTOMER", "DEVELOPER"]} />}>
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id/confirmation" element={<OrderConfirmationPage />} />
              </Route>

              <Route element={<ProtectedRoute requiredRole="DEVELOPER" />}>
                <Route path="/my-games" element={<DeveloperGamesPage />} />
              </Route>

              <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Route>
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
