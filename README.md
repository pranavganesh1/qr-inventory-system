# QR Inventory System

QR Inventory System is a full‑stack application for managing inventory using QR codes. It lets you create items, generate and download QR codes, scan codes to view or update quantities, and track all changes via transaction logs. The app provides dashboards, filtering, and reporting tools to keep stock under control.

## Features

- JWT authentication (register, login, current user)
- Item CRUD scoped to the logged‑in user
- Auto‑generated QR code on item creation (Base64 Data URL)
- QR scanner to view/add/remove stock quantities
- Transaction history with quantity deltas and timestamps
- Item status auto‑calculated from `quantity` vs `reorderPoint`
- Search and filter inventory (by status, name, SKU)
- Dashboard with stock overview and recent activity
- Reports with charts and CSV export

## Tech Stack

- Backend: `Node.js`, `Express`, `MongoDB (Mongoose)`, `JWT`, `bcryptjs`, `qrcode`
- Frontend: `React` (React Router), `axios`, `html5-qrcode`, `qrcode.react`, `recharts`

## Monorepo Structure

```
qr-inventory-system/
├── backend/           # Express API, models, auth, QR generator
├── frontend/          # React app (dashboard, inventory, scanner, reports)
└── docs/              # (placeholders) API, setup, deployment
```

Key backend files:
- `backend/server.js` – app bootstrap and route wiring
- `backend/middleware/auth.js` – JWT `protect` middleware
- `backend/models/User.js` – user schema with password hashing
- `backend/models/Item.js` – item schema, status pre‑save hook
- `backend/models/Transaction.js` – transaction schema
- `backend/routes/auth.js` – register/login/me
- `backend/routes/items.js` – items CRUD, search, QR scan
- `backend/routes/transactions.js` – transaction listing
- `backend/utils/qrGenerator.js` – QR code generator (`toDataURL`)

Key frontend files:
- `frontend/src/App.js` – routing with auth guard
- `frontend/src/services/api.js` – axios client with `Authorization` header
- `frontend/src/pages/*` – pages: Dashboard, Inventory, Scanner, AddItem, ItemDetail, Reports, Login
- `frontend/src/components/Navbar.jsx` – navigation + logout

## Quick Start

Prerequisites:
- Node.js 18+
- MongoDB (local or Atlas cluster)

1) Backend
- Open a terminal in `backend`
- Create `.env` with:
  - `PORT=5000`
  - `MONGODB_URI=<your-mongodb-connection-string>`
  - `JWT_SECRET=<your-random-secret>`
  - `JWT_EXPIRE=7d` (optional)
- Install and run:
  - `npm install`
  - `npm run dev` (or `npm start`)

2) Frontend
- Open a terminal in `frontend`
- Install and run:
  - `npm install`
  - `npm start`
- The app opens at `http://localhost:3000` by default.

Note: The frontend API base URL defaults to `http://localhost:5000/api` (see `frontend/src/services/api.js`). If your backend runs elsewhere, update that `baseURL` accordingly.

## Authentication

- Register and login via `/api/auth/register` and `/api/auth/login`
- The backend returns a JWT; the frontend stores it in `localStorage`
- All protected routes require `Authorization: Bearer <token>` header
- `GET /api/auth/me` returns the current user when authorized

## Inventory and QR Codes

- Creating an item (`POST /api/items`) auto‑generates a QR code and stores it in the `qrCode` field as a Data URL.
- QR content formats used:
  - Frontend preview/download: `{"sku":"...","name":"..."}`
  - Backend stored QR (generated): `{"id":"<itemId>","sku":"...","name":"...","userId":"<userId>"}`
- Scanning: The scanner expects at least a `sku` in the QR JSON. On scan, the app fetches the item and shows details. Choose an action (`view`, `add`, `remove`) and quantity to update stock.

## Status Logic

Item `status` is computed automatically on save (see `Item.js`):
- `Out of Stock` when `quantity === 0`
- `Critical` when `quantity <= reorderPoint / 2`
- `Low Stock` when `quantity <= reorderPoint`
- `In Stock` otherwise

## API Overview

Auth:
- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login and receive JWT
- `GET /api/auth/me` – Get current user (protected)

Items (all protected):
- `GET /api/items` – List current user’s items
- `GET /api/items/search?q=<query>` – Search current user’s items by name/SKU/description.
- `GET /api/items/:id` – Get an item (only if it belongs to the user)
- `POST /api/items` – Create item; QR code is generated server‑side
- `PUT /api/items/:id` – Update item; logs a transaction if quantity changes
- `DELETE /api/items/:id` – Delete item
- `POST /api/items/scan` – Scan QR to view/add/remove stock
  - body: `{ sku, action: 'view'|'add'|'remove', quantity?: number }`

Transactions (protected):
- `GET /api/transactions` – List recent transactions (populated with item/user)
- `GET /api/transactions/item/:itemId` – List transactions for a specific item

## Data Models

User:
- `name`, `email` (unique, validated), `password` (hashed), `role` (`user`|`admin`)

Item:
- Core: `sku` (unique, uppercase), `name`, `description`, `quantity`, `location`, `reorderPoint`, `supplier`, `category`, `purchaseDate`, `expiryDate`
- QR: `qrCode` (Base64 Data URL)
- Metadata: `status`, `lastScanned`, `createdBy` (User ref), timestamps

Transaction:
- Links: `item` (Item ref), `performedBy` (User ref)
- Data: `itemName`, `sku`, `type` (`add`|`remove`|`adjust`|`scan`), `quantity`, `previousQuantity`, `newQuantity`, `notes`, timestamps

## Frontend Pages

- `Dashboard` – Stock status charts, recent activity, alerts
- `Inventory` – List, filter, search, delete, navigate to item detail
- `AddItem` – Form with live QR preview and download
- `ItemDetail` – View/edit item; download QR with added `id`
- `Scanner` – Camera scanner using `html5-qrcode`; update quantities
- `Reports` – Stock distribution, category analysis, CSV export
- `Login` – Register/login, stores JWT in localStorage

## Development Scripts

Backend:
- `npm run dev` – start with `nodemon`
- `npm start` – start with `node`

Frontend:
- `npm start` – start React dev server
- `npm run build` – build production assets

## Deployment Notes

- Set required environment variables in backend
- Serve the frontend build (`npm run build`) via any static host
- Ensure CORS allows your frontend origin
- Update frontend API `baseURL` if backend runs on a different host/port

## Known Limitations / Considerations

- `Item.sku` is globally unique; for multi‑tenant setups, consider scoping uniqueness per user (`sku + createdBy`).
- `GET /api/transactions` returns all transactions; consider filtering by current user’s items.
- Frontend API `baseURL` is hardcoded; optionally externalize via environment.
- No rate limiting or advanced validation beyond basic checks.

## License

 MIT License 
