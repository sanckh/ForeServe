# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Backend API (Express + TypeScript)

1. Install backend dependencies

   ```bash
   npm install express cors dotenv morgan
   npm install -D tsx @types/node @types/express @types/cors @types/morgan
   ```

2. Configure environment (optional)

   - Copy `.env.example` to `.env` and adjust values.
   - `PORT` (default 4000)
   - `CORS_ORIGIN` (comma-separated, `*` in dev)
   - `STAFF_TOKEN` (defaults to `changeme` for local dev)
   - `EXPO_PUBLIC_API_URL` e.g. `http://localhost:4000/api`

3. Scripts

   - Dev (watch + run TS directly): `npm run server:dev`
   - Build to JS: `npm run server:build`
   - Start compiled server: `npm run server:start`

4. Headers and auth

   - Tenant: provide `?tenant=manatee-gc` or header `X-Tenant: manatee-gc`.
   - Staff auth (for protected endpoints):
     - `Authorization: Bearer <STAFF_TOKEN>` or `X-Staff-Token: <STAFF_TOKEN>`
     - Optional: `X-Staff-User: cart-1` to attribute actions.

5. Endpoints

   - Healthcheck
     - GET `/api/health`
   - Echo (debug)
     - POST `/api/echo` body: any
   - Course profile
     - GET `/api/course?tenant=slug`
   - Menu
     - GET `/api/menu?tenant=slug`
     - POST `/api/menu/86?tenant=slug` body: `{ productId: string, is86: boolean }` (staff-only)
   - Orders
     - POST `/api/orders?tenant=slug` body: `{ items: [{ productId, qty }] }`
     - GET `/api/orders/:id?tenant=slug` (fetch order status)
     - POST `/api/orders/:id/claim?tenant=slug` (staff-only)
     - POST `/api/orders/:id/status?tenant=slug` body: `{ status: 'accepted' | 'en_route' | 'delivered' }` (staff-only)

6. Roles (MVP)

   - `golfer` places orders via app.
   - `cart`, `admin`, `maintenance` treated as staff for protected endpoints (token-based).

7. cURL examples

   ```bash
   # Course profile
   curl "http://localhost:4000/api/course?tenant=manatee-gc"

   # Menu
   curl "http://localhost:4000/api/menu?tenant=manatee-gc"

   # Toggle 86 on an item (staff)
   curl -X POST "http://localhost:4000/api/menu/86?tenant=manatee-gc" \
     -H "Authorization: Bearer changeme" \
     -H "Content-Type: application/json" \
     -d '{"productId":"p_103","is86":true}'

   # Create order
   curl -X POST "http://localhost:4000/api/orders?tenant=manatee-gc" \
     -H "Content-Type: application/json" \
     -d '{"items":[{"productId":"p_101","qty":2}]}'

   # Claim order (replace ORDER_ID)
   curl -X POST "http://localhost:4000/api/orders/ORDER_ID/claim?tenant=manatee-gc" \
     -H "Authorization: Bearer changeme" \
     -H "X-Staff-User: cart-1"

   # Update status (replace ORDER_ID)
   curl -X POST "http://localhost:4000/api/orders/ORDER_ID/status?tenant=manatee-gc" \
     -H "Authorization: Bearer changeme" \
     -H "Content-Type: application/json" \
     -d '{"status":"en_route"}'
   ```

## Backend Architecture & Mock Data (MVP)

This repository contains an Expo app and a TypeScript Express backend. The backend is intentionally in-memory for speed while we iterate. Everything here is documented so we can remove or swap parts later without surprises.

### What’s Implemented

* __TypeScript Express server__: `server/src/index.ts`
* __In-memory store__: orders, tenant-product pricing/active flags, and 86 status
* __Mock CMS adapter__: returns menu items per tenant (in-memory)
* __Multi-tenant resolution__: via `?tenant=slug` or `X-Tenant` header
* __Basic staff auth__: shared token via `Authorization: Bearer <STAFF_TOKEN>` or `X-Staff-Token`
* __Routes__: `/course`, `/menu`, `/menu/86`, `/orders`, `/orders/:id/claim`, `/orders/:id/status`
* __Type augmentation__: `req.tenant` and `req.staffUser` added to `Express.Request`

### Project Structure (server/)

```
server/
  src/
    cms/
      adapter.ts        # CmsAdapter interface + in-memory implementation (seed/getMenu)
      index.ts          # cms singleton export
    middleware/
      tenant.ts         # resolve tenant from query/header
      staffAuth.ts      # require staff token; sets req.staffUser
    routes/
      courses.ts        # GET /course
      menu.ts           # GET /menu, POST /menu/86
      orders.ts         # POST /orders, POST /orders/:id/claim, POST /orders/:id/status
    services/
      menuService.ts    # merges CMS items with tenant flags and 86 status
    store/
      memory.ts         # in-memory data + seed helper
    types/
      domain.ts         # domain models (Tenant, Order, MenuItemView, etc.)
      express.d.ts      # Express.Request augmentation
    index.ts            # express app, CORS, seeding, route mounting
  tsconfig.json         # includes src/**/*.d.ts
```

### Domain Model

* __Roles__: `golfer`, `cart`, `admin`, `maintenance` (MVP treats non-golfer as staff via token)
* __Orders__: status flow `placed → accepted → en_route → delivered`
* __Menu view__: derived per tenant: `price`, `active`, `is86`, `available = active && !is86`

### Mock Data and Seeding

Seeding occurs in `server/src/index.ts` at startup and persists only in memory (resets on restart).

* __Tenant__
  - id: `t_manatee`
  - slug: `manatee-gc`
  - name: `Manatee Golf Club`
  - colors: `{ primary: '#1e90ff', secondary: '#0f172a' }`

* __CMS menu items__ (`cms.seed('manatee-gc', ...)`)
  - `p_101`: `cold-brew` – Cold Brew Coffee (desc: "Strong and smooth")
  - `p_102`: `club-sandwich` – Club Sandwich (desc: "Turkey, bacon, lettuce, tomato")
  - `p_103`: `gatorade` – Gatorade (desc: "Thirst quencher")

* __Tenant product flags & pricing__ (`seedWithTenantAndProducts`)
  - `p_101`: price `5.0`, `active: true`, `is86: false`
  - `p_102`: price `9.5`, `active: true`, `is86: false`
  - `p_103`: price `4.0`, `active: true`, `is86: false`

### Middleware & Headers

* __Tenant resolution__: `?tenant=manatee-gc` or `X-Tenant: manatee-gc`
* __Staff auth__: `Authorization: Bearer <STAFF_TOKEN>` or `X-Staff-Token: <STAFF_TOKEN>`
  - Optional attribution header: `X-Staff-User: cart-1`

### Environment

See `.env.example`.

* __PORT__: default `4000`
* __CORS_ORIGIN__: `*` in dev or comma-separated list
* __STAFF_TOKEN__: default `changeme` (replace in prod)
* __EXPO_PUBLIC_API_URL__: e.g. `http://localhost:4000/api` (read by the app)

### Development & Scripts

* __Start dev server__: `npm run server:dev` (tsx watch `server/src/index.ts`)
* __Build__: `npm run server:build` (outputs `server/dist`)
* __Start built__: `npm run server:start`

### Testing the API

See cURL examples above. For staff endpoints, include the token headers.

#### New: GET /orders/:id

Fetch an order by ID (used by the mobile Order Status screen). Tenant is required.

```bash
curl "http://localhost:4000/api/orders/ORDER_ID?tenant=manatee-gc"
```

### Type Augmentation

`server/src/types/express.d.ts` augments `Express.Request` with `tenant?: Tenant` and `staffUser?: string`.

### Limitations (MVP)

* __In-memory data__: restarts clear all tenants, products, 86 statuses, and orders.
* __Global staff token__: a shared token gates staff endpoints (no per-user auth yet).
* __No persistence__: no DB; CMS is mocked in-memory.
* __Single seeded tenant__: `manatee-gc` only (easy to extend).

### Future Work

* Replace in-memory store with a database (e.g., Supabase/Postgres).
* Replace `InMemoryCmsAdapter` with a real CMS integration.
* Proper staff accounts/roles and auth.
* Multi-tenant admin/config UI.
* Payments and fulfillment tracking.
* Remove deprecated `server/index.js` once TS path is fully adopted.

---

## Mobile App (Expo) Quickstart

The app is a React Native + Expo Router project with TypeScript. It consumes the backend documented above.

### Prerequisites

* Node 18+
* Expo CLI (npx is fine)
* Backend running locally (see Backend section)

### Environment

Create `.env` in the project root (mobile reads only variables prefixed with `EXPO_PUBLIC_`):

```
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

On iOS simulator/Android emulator, `localhost` works. For real devices, use your machine IP (e.g., `http://192.168.1.100:4000/api`).

### Run

```
npm install
npx expo start
```

Open the app in a simulator or device from the Expo dev menu.

### Screens (MVP)

* __CourseSelect__ (`app/(tabs)/course-select.tsx`)
  - Enter or scan a tenant slug (e.g., `manatee-gc`); fetches `/course`.
* __Menu__ (`app/(tabs)/menu.tsx`)
  - Loads `/menu` (merged CMS + tenant flags); add items and place order.
* __OrderStatus__ (`app/(tabs)/orders.tsx`)
  - Placeholder until `GET /orders/:id` is added; shows last order ID.
* __Staff Orders__ (`app/(tabs)/staff.tsx`)
  - Actions for claim/advance status; requires staff token.
* __IssueReport__ (`app/(tabs)/issue.tsx`)
  - Simple placeholder to report course issues.

Tabs are defined in `app/(tabs)/_layout.tsx`. App providers are wired in `app/_layout.tsx`:

* `TenantProvider` – global tenant slug
* `StaffProvider` – staff token and user label
* `CartProvider` – cart state and last order ID

### Staff Mode

In the Staff tab, set:

* Token: the value of `STAFF_TOKEN` (default `changeme`).
* Optional user label: appears as `X-Staff-User` on claim.

The staff token and optional user label are securely persisted on device using Expo SecureStore. If you haven't already, install it:

```
npm install expo-secure-store
```

### Notes

* The app expects the backend headers and query params documented in this README.
* Ensure `EXPO_PUBLIC_API_URL` matches the backend URL accessible from your device/emulator.
* We intentionally mock CMS and persistence for now; see Future Work to replace with Supabase and a real CMS.
