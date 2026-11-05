# StudioSpace Client

StudioSpace Client is an independent Next.js application. It owns Better Auth
authentication and communicates with the separately maintained StudioSpace
Express server over HTTP for marketplace APIs. The Client and Server remain
separate repositories, with independent dependencies, environment variables,
Git histories, and deployments.

## Requirements

- Node.js and npm
- MongoDB available to the Next.js server runtime for Better Auth
- The separate StudioSpace Server running for marketplace API access

## Local setup

1. Install the client dependencies:

   ```bash
   npm install
   ```

2. Create the local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Configure the Client's server-only authentication variables in `.env.local`:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017
   MONGODB_DB_NAME=studiospace
   BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_SECRET=<a random secret of at least 32 characters>
   GOOGLE_CLIENT_ID=<Google OAuth client ID>
   GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
   ```

   Keep `NEXT_PUBLIC_API_BASE_URL` set to the Express API origin
   (`http://localhost:5000` by default) for public studio reads. Set the
   server-only `SERVER_API_BASE_URL` to that same Express origin for protected
   marketplace requests forwarded by the Next.js BFF. Never add a
   `NEXT_PUBLIC_` prefix to MongoDB, Better Auth, or upstream API configuration.

4. Configure and run the Express Server from its own checkout and environment.
   Then start the Client:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Better Auth endpoints are
   served by the Next.js application at `/api/auth`. Protected marketplace
   requests use the same-origin `/api/marketplace/*` BFF and are forwarded to
   the separately configured Express API.

## Authentication

- Register at `/register` with a name, email, and password. Passwords must be
  6 to 128 characters and contain at least one uppercase and one lowercase
  letter.
  A photo URL is optional. Registration uses `autoSignIn: true`; after signup,
  the Client verifies the returned user and confirms that the current session
  belongs to that user before showing success or redirecting to the safe
  `returnTo` destination (or `/`).
- Better Auth 1.7.16 returns a duplicate-email error (`422`,
  `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`) with the current configuration,
  rather than its generic success response, which requires
  `autoSignIn: false` or email verification. The registration UI gives this
  error a neutral message and does not state whether the email is registered.
  The Better Auth endpoint still returns a distinguishable status/code; the
  neutral UI message does not eliminate that API-level behavior. Changing
  `autoSignIn` or adding a response-masking layer requires a separate security
  decision.
- Login at `/login` with email/password, or continue with Google.
- Google OAuth requires the server-only Client variables
  `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. The local callback is
  `http://localhost:3000/api/auth/callback/google`. Update the authorized
  redirect URI manually in Google Cloud Console; the deployed callback must use
  the deployed Next.js origin.
- Better Auth stores users in MongoDB's `user` collection, credential accounts
  (including password hashes) in `account`, sessions in `session`, and signing
  keys in `jwks`. The browser never connects to MongoDB and never stores
  passwords or authentication tokens in local or session storage. Session
  cookies are HTTP-only.

Next.js Better Auth and Express use the same MongoDB database with separate
connections: Next.js owns the authentication collections, while Express owns
marketplace data such as studios, bookings, and reviews. Express verifies the
Client's JWT-backed session-data cookie (`better-auth.session_data`) using `jose`
against the Next.js Client's remote JWKS endpoint (`/api/auth/jwks`). Express no
longer maintains a local Better Auth instance or authentication endpoints.

The browser sends protected marketplace requests to the same-origin Next.js
route `/api/marketplace/*`. This BFF allows only the Client's existing studio
and booking endpoints, validates mutation `Origin` and JSON content type, and
forwards only Better Auth's supported session-data cookie (including valid
chunks) to the configured Express origin. It never forwards the opaque
`session_token`, arbitrary browser cookies, Authorization headers, or
client-supplied upstream URLs. Express remains responsible for verifying the
session and authorizing the requested resource. Public studio reads continue to
use `NEXT_PUBLIC_API_BASE_URL` directly; `SERVER_API_BASE_URL` is server-only and
controls the BFF upstream. Authenticated browser-to-Express behavior still
requires the deployed Next.js URL, Better Auth origin, CORS, and Express JWKS
configuration to agree.

### MongoDB integration test

`npm test` runs the Node test suite and clearly skips the database integration
test if either test variable is missing. Its opt-in integration test exercises
the real Better Auth handler and MongoDB adapter, including auto-sign-in on
new signup, duplicate-email behavior, credentials, session cookies, session
lookup, and logout. The test was not run against MongoDB in this checkout
because dedicated test database configuration is unavailable. To run it,
provide an explicit dedicated test MongoDB URI and a database name that clearly
includes `test`:

```powershell
$env:MONGODB_TEST_URI = "<dedicated MongoDB test URI>"
$env:MONGODB_TEST_DB_NAME = "studiospace_auth_test"
npm run test:auth-integration
Remove-Item Env:\MONGODB_TEST_URI
Remove-Item Env:\MONGODB_TEST_DB_NAME
```

The test never falls back to `MONGODB_URI`, never drops a database, uses a
unique email, and removes only its own user, account, session, and newly
generated signing-key records. Do not point these variables at a normal or
production database.

## Marketplace and Express API

The browser uses `NEXT_PUBLIC_API_BASE_URL` for public Express marketplace
reads (default: `http://localhost:5000`); protected requests use the Next.js
same-origin BFF, which forwards to the server-only `SERVER_API_BASE_URL`
(default: `http://localhost:5000`). The browser never connects to MongoDB.
Configure both API origins independently from the Client's server-only
authentication variables. Run the Express Server from its own checkout and
configure its `CLIENT_URL`, `CLIENT_AUTH_URL`, and MongoDB variables there.

- The homepage requests up to six newest studios from
  `GET /api/studios?limit=6&sort=newest`. It shows loading, API-error, and
  empty states; it does not fall back to the old studio fixtures.
- Homepage quick-search submits a native GET request to `/studios` with
  `search` and `category`. Explore uses the Express API for search, category,
  maximum hourly price, sorting, and pagination.
- Studio details come from `GET /api/studios/:id`; studio creation, owner
  listings, and edits use the protected Express API. The Server derives
  ownership from the verified Better Auth identity.
- Booking requests are persisted by the Express API with `Pending` status.
  Users can view and cancel their own pending bookings. There is no host
  approval/confirmation UI or API, payment flow, or review API.
- Static hero imagery, category descriptions, marketing content, and booking
  step copy remain presentation content. `src/data/studios.js` remains as an
  unused legacy fixture module; it is not the fallback source for the live
  homepage, Explore, or details routes.

For local development, start the independently configured Server with
`npm run dev` in its repository, then start this Client with `npm run dev`.
Run `npm test`, `npm run lint`, and `npm run build` in the Client checkout.
See [docs/requirement-traceability.md](./docs/requirement-traceability.md)
for source evidence, verification levels, and known limitations.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm test
npm run test:auth-integration
npm start
```

`npm run test:auth-integration` requires the explicit dedicated test database
variables described above.
