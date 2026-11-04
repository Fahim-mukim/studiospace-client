# StudioSpace Client

StudioSpace Client is an independent Next.js application. It communicates with
the separately maintained StudioSpace Express server over HTTP; this repository
does not contain server code, database connections, or server credentials.

## Requirements

- Node.js and npm
- The separate StudioSpace Server running for live authentication and API access

## Local setup

1. Install the client dependencies:

   ```bash
   npm install
   ```

2. Create the local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Keep `NEXT_PUBLIC_API_BASE_URL` set to the origin of the Express API, without
   `/api/auth`. The default local value is:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

4. In a separate terminal and the separate server checkout, configure its own
   environment and start the Express server. Then start the client:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

The client uses `http://localhost:5000/api/auth` for BetterAuth endpoints. The
deployed frontend must set `NEXT_PUBLIC_API_BASE_URL` to the deployed Express
API origin and the server must allow the deployed frontend origin through its
credentialed CORS and BetterAuth trusted-origin configuration. Client and server
environment variables, dependencies, deployments, and Git histories remain
independent.

## Authentication

- Register at `/register` with a name, email, and password. Passwords must be
  6 to 128 characters and contain at least one uppercase and one lowercase
  letter.
  A photo URL is optional.
- Registration does not automatically sign in; successful registration
  redirects to `/login`.
- Login at `/login` with email/password, or continue with Google.
- Google OAuth requires valid Google credentials configured only in the
  Express server environment. The provider callback remains
  `http://localhost:5000/api/auth/callback/google` in local development; set
  the corresponding deployed callback in the Google provider configuration
  when deploying.
- BetterAuth manages sessions on the server. Session cookies are HTTP-only;
  the client sends credentialed HTTP requests and never reads or stores session
  cookies, tokens, or passwords in browser storage.

The server remains authoritative for session validation and authorization.
Client-side session state only controls the displayed account UI; it is not an
authorization boundary.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm start
```
