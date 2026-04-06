# Traceability from report to implementation

## Use cases mapped to modules

| Report use case | Backend module | Frontend page |
|---|---|---|
| Login | `modules/auth` | `pages/AuthPage.tsx` |
| Register | `modules/auth` | `pages/AuthPage.tsx` |
| Browse and Search Games | `modules/games` | `pages/StorePage.tsx` |
| View Game Details | `modules/games` | `pages/GameDetailsPage.tsx` |
| Game Reviews | `modules/games` | `pages/GameDetailsPage.tsx` |
| Add to Cart | `modules/cart` | `pages/StorePage.tsx`, `pages/CartPage.tsx` |
| Purchase Game | `modules/orders` | `pages/CartPage.tsx`, `pages/OrdersPage.tsx` |
| View Library | `modules/library` | `pages/LibraryPage.tsx` |
| Manage Games (Admin) | `modules/games`, `modules/admin` | `pages/AdminDashboardPage.tsx` |
| Manage Own Games (Developer) | `modules/games` | `pages/DeveloperGamesPage.tsx` |
| Manage Users (Admin) | `modules/admin` | `pages/AdminDashboardPage.tsx` |
| Wishlist | `modules/wishlist` | `pages/WishlistPage.tsx` |

## Data dictionary mapped to Prisma models

| Report entity | Prisma model |
|---|---|
| User | `User` |
| Developer | `Developer` |
| Admin | `Admin` |
| Game | `Game` |
| Cart | `Cart` |
| CartItem | `CartItem` |
| Order | `Order` |
| OrderItem | `OrderItem` |
| Payment | `Payment` |
| Wishlist | `Wishlist` |
| WishlistItem | `WishlistItem` |
| Review | `Review` |
| Library | `LibraryItem` |

## MVC alignment

The project keeps the spirit of the report's MVC discussion:

- **Model**: Prisma schema and database access
- **Controller / Request handling**: Express route modules and middleware
- **View**: React components and pages

## Roles implemented

- **Customer**: browse, search, view details, wishlist, cart, checkout, library, reviews
- **Admin**: dashboard, game CRUD, role management, user moderation, monitor orders
- **Developer**: manage own game catalog, create/edit/delete owned games

## Notes

The lab report focuses on system modeling rather than exact implementation technology.  
This codebase keeps the report's behavior and entities while choosing a practical web stack for delivery.
