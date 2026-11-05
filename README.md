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
   (`http://localhost:5000` by default). It is only for marketplace HTTP APIs.
   Never add a `NEXT_PUBLIC_` prefix to MongoDB or Better Auth secrets.

4. Configure and run the Express Server from its own checkout and environment.
   Then start the Client:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Better Auth endpoints are
   served by the Next.js application at `/api/auth`; marketplace requests continue
   to use the separately configured Express API base URL.

## Authentication

- Register at `/register` with a name, email, and password. Passwords must be
  6 to 128 characters and contain at least one uppercase and one lowercase
  letter.
  A photo URL is optional.
- Registration signs the user in automatically (`autoSignIn: true`). Once
  Better Auth creates the account, the Client refreshes the session and
  redirects to the safe `returnTo` destination, or `/` when none was supplied,
  so the authenticated navbar and protected routes are available immediately
  and the session survives a page refresh. This is a deliberate, user-requested
  deviation from the written assignment, which asks for a redirect to the Login
  page after a successful signup; both behaviors are not claimed to be the
  same. If Better Auth reports a failure — including an email address that is
  already registered — the Client shows an error toast and does not redirect or
  claim that an account was created.
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
longer maintains a local Better Auth instance or authentication endpoints. Note
that direct browser-to-Express cross-origin cookie transport requires compatible
domain configuration or a same-origin proxy; see the Server README for details.

### MongoDB integration test

`npm test` runs the Node test suite and clearly skips the database integration
test if either test variable is missing. To run it, provide an explicit
dedicated test MongoDB URI and a database name that clearly includes `test`:

```powershell
$env:MONGODB_TEST_URI = "<dedicated MongoDB test URI>"
$env:MONGODB_TEST_DB_NAME = "studiospace_auth_test"
npm run test:auth-integration
Remove-Item Env:\MONGODB_TEST_URI
Remove-Item Env:\MONGODB_TEST_DB_NAME
```

The test never falls back to `MONGODB_URI`, never drops a database, uses a
unique email, and removes only its own user, account, session, and newly
generated signing-key records. It verifies signup persistence, password
hashing, duplicate-email behavior, login, HTTP-only cookies, session/JWKS
validation, and logout. Do not point these variables at a normal or production
database.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm test
npm start
```
