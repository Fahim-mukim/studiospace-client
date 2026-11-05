# StudioSpace Client Requirement Traceability

This document records the current Client source and its integration with the
independent Express Server against the original StudioSpace assignment brief.
Statuses describe only the evidence identified here.

## Status and evidence legend

- **PASS**: source behavior is implemented as described; the verification
  column states whether it is also covered by tests or runtime checks.
- **PARTIAL**: some behavior exists, with a specific limitation remaining.
- **FAIL**: the current implementation contradicts the documented requirement
  or desired behavior.
- **BLOCKED**: assessment depends on an unavailable requirement or external
  setup.
- **NOT REQUIRED**: the original assignment brief does not require this
  workflow; it is not treated as a missing feature.
- **DEFERRED / PARTIAL**: the basic workflow is present, while the brief's
  optional or later enhancement is intentionally deferred.
- **UNVERIFIABLE**: source or runtime evidence is insufficient to confirm it.

Source inspection, automated test execution, current browser checks, and
historical browser checks are called out separately. A test in source is not
described as passing unless it was run successfully.

## Architecture and data boundaries

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Client and Server remain independent Next.js and Express applications | PASS | Client `package.json`; Server repository and its own `package.json`; separate Git remotes | Git remotes and Client/Server state were inspected independently for this audit. No shared package root or cross-repository imports. |
| Client-side Better Auth; Express verifies Client identity | PASS | `src/lib/auth.js`, `src/app/api/auth/[...all]/route.js`, `src/lib/auth-client.js`; Server `src/middleware/require-auth.js`, `index.js` | Source verified. Protected Express APIs verify the JWT-backed session-data cookie against the Client JWKS endpoint; the opaque session-token cookie is not treated as a JWT. |
| MongoDB ownership | PASS | `src/lib/auth.js`; Server `src/config/database.js`, `index.js` | Source verified: Client runtime owns Better Auth `user`, `account`, `session`, and `jwks` collections; Express owns marketplace `studios` and `bookings`. The browser does not connect to MongoDB. |
| Configurable API base URL | PARTIAL | `.env.example`, `src/lib/api.js`, `src/lib/marketplace-proxy.js`, Client README | `NEXT_PUBLIC_API_BASE_URL` configures public Express reads, defaults to localhost only outside production, and fails explicitly when missing in production. Server-only `SERVER_API_BASE_URL` configures the BFF; it accepts an absolute HTTP(S) origin and normalizes whitespace and a trailing slash. Production GET probes currently return `503 UPSTREAM_NOT_CONFIGURED`, confirming the Client deployment's server-only upstream setting is absent or invalid; Vercel settings cannot be inspected or changed from this repository. |
| Authenticated cross-origin marketplace requests | PARTIAL | `src/app/api/marketplace/[...path]/route.js`, `src/lib/marketplace-proxy.js`, `src/lib/api.js`, `tests/marketplace-proxy.test.mjs` | Source and mocked-upstream tests cover all protected studio and booking paths, methods, Origin/content-type checks, and filtered session-data cookie forwarding. Current production unauthenticated `GET /api/marketplace/studios/mine` and `/bookings/mine` return HTTP 503 `UPSTREAM_NOT_CONFIGURED` before contacting Express. After Vercel configuration is corrected, unauthenticated requests should reach Express and return 401; no authenticated Client → BFF → Express → JWKS request was run because no explicit isolated test database/session is configured. |
| Independent environments and deployment | PARTIAL | Client and Server `.env.example` files and package manifests; both repositories | Repositories and environment boundaries remain independent. Read-only production probes verified Server health/readiness, with MongoDB connected, and identified the Client BFF configuration failure. Vercel settings and authenticated browser-to-Server cookie transport were not independently verified. |

## Authentication

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Email/password registration and validation | PASS | `src/components/auth/register-form.jsx`, `src/lib/auth.js` | Source validates name, email, optional HTTP(S) image and password length 6–128 with uppercase and lowercase. The owner confirms production registration/login work. The opt-in local MongoDB integration test was skipped because a dedicated test database is not configured. |
| Registration auto-sign-in | PASS | `src/lib/auth.js` (`autoSignIn: true`); `src/components/auth/register-form.jsx`; `src/lib/signup-session.js` | The form requires a non-empty signup token, matching user email, and a freshly fetched session for the same user before showing success or redirecting. Regression tests cover response/session mismatch; MongoDB integration remains unrun without dedicated test database configuration. |
| Duplicate-email feedback | PARTIAL | `src/components/auth/register-form.jsx`, `src/lib/signup-session.js`, `tests/signup-session.test.mjs`, `tests/auth.integration.test.mjs` | Installed Better Auth 1.7.16 returns 422 `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` with `autoSignIn: true`; its generic duplicate success requires email verification or `autoSignIn: false`. The Client maps that error to neutral UI copy and does not redirect. The endpoint still exposes the status/code, so this is not full API-level anti-enumeration. Unit coverage exists; the MongoDB integration assertion was updated but not run. |
| Email/password login | PASS | `src/components/auth/login-form.jsx`, `src/lib/auth-client.js` | Source handles validation, pending state, errors, session refresh, and safe redirect. The owner confirms production login works; a credentialed browser roundtrip was not independently performed in this audit. |
| Google OAuth | PASS | `src/lib/auth.js`, `src/app/api/auth/google-status/route.js`, `src/components/auth/google-auth-button.jsx`, `src/lib/google-auth-flow.mjs`, `tests/google-auth.test.mjs` | The owner confirms production Google registration/login work. A read-only probe returned `configured: true`; focused mocked/configuration tests pass. Neither a live OAuth roundtrip nor Vercel environment values were independently inspected. |
| Session cookies and persistence | PARTIAL | `src/lib/auth.js`, `src/app/api/auth/[...all]/route.js`, `tests/auth.integration.test.mjs` | Source configures HTTP-only cookies and a JWT-backed session-data cache. The owner confirms successful production registration/login, and unauthenticated production `get-session` returned HTTP 200 with no user. The opt-in MongoDB suite was skipped without a dedicated test database; cookie-authenticated session persistence was not independently exercised. |
| Logout and session refresh | PASS | `src/components/site-header.jsx`, `src/lib/auth-client.js`; Client integration test source | Source uses Better Auth sign-out/session hooks. This is source-level evidence only: no current browser logout/refresh verification; integration assertions were not executed. |
| Protected pages and safe return target | PASS | `src/proxy.js`, `src/lib/safe-return-to.js`, `tests/safe-return-to.test.mjs` | Proxy gates dashboard, add-studio, listings, bookings, my-studios, and edit routes by session-cookie presence. Express still verifies signed identity. Safe-return unit tests passed in the last Client suite; cookie-presence gating is optimistic, not complete authorization. |
| No browser storage for passwords/tokens | PASS | `src/lib/auth-client.js`, auth forms and Better Auth cookie configuration | Source inspection found no password or token persistence to localStorage/sessionStorage in the inspected auth flow; browser cookies are HTTP-only. |

## Homepage and Explore

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Homepage featured studios | PASS | `src/app/page.js`, `src/lib/api.js`; `GET /api/studios?limit=6&sort=newest` | Fetches up to six newest live records with `cache: "no-store"`. There is no static-fixture fallback on API failure. API unit test passed; live Server response and homepage were verified in Phase O.4.1A. |
| Homepage loading, error, and empty states | PASS | `src/app/page.js` (`FeaturedStudiosFallback`, `FeaturedStudios`) | Source includes skeleton, API-unavailable message, and empty message. Error and empty branches were not forced in the browser during the last runtime check. |
| Homepage quick-search | PASS | `src/app/page.js`, `src/app/studios/page.js` | Native GET form sends `search` and `category` to `/studios`; it does not send an unsupported location parameter. Search-only, category-only, and combined query behavior was browser-verified historically in Phase O.4.1A. |
| Explore live results and filters | PASS | `src/app/studios/page.js`, `src/components/studios/studio-results.jsx`, `src/lib/api.js`; `GET /api/studios` | Server-backed category, text search, maximum price, sorting, and page query state; interactive filters update the URL and refetch. API supports minPrice too, but the current UI exposes maximum price only. |
| Explore sorting | PARTIAL | `src/components/studios/studio-results.jsx`, `src/lib/api.js`; Server `index.js`, `tests/studios.test.js` | Newest, price, and highest-rated sorts are applied by the Server before pagination; the Client forwards the selected sort and preserves server order. Client and Server regression tests cover this contract. The MongoDB path and quality of existing stored rating metadata were not verified against a dedicated test database. |
| Explore loading, error, and empty results | PASS | `src/components/studios/studio-results.jsx`, `src/app/studios/loading.js` | Source includes loading, retry/error, and empty-state UI. No recent browser outage/empty-state simulation. |
| Static presentation vs marketplace data | PASS | `src/data/homepage.js`, `src/data/studios.js`, `src/app/page.js`, Explore/detail pages | Hero slides, category descriptions, booking-step and marketing copy are presentation data. `src/data/studios.js` remains as a legacy fixture module but is not the fallback source for current homepage, Explore, or detail API requests. |

## Studio details and management

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Studio details | PASS | `src/app/studios/[id]/page.js`, `src/lib/api.js`; `GET /api/studios/:id` | Reads by MongoDB ID or slug from Express; 404 uses the route not-found UI and API failures have retry/back UI. The detail route was browser-tested locally against a read-only production listing; no production data was changed. |
| Gallery, host, review display | PARTIAL | `src/components/home/studio-card.jsx`, `src/components/studios/studio-gallery.jsx`, `src/components/studios/studio-image.jsx`, `src/components/studios/studio-image-fallback.jsx`, `src/app/studios/[id]/page.js`, `src/lib/api.js`; Server `index.js` | Cards and the detail gallery replace failed remote images with an accessible, neutral unavailable-image state; a broken live image was verified in both views using read-only production data. A local image is used only when the API supplies no image. Host fields are limited by the API; normalizer supplies display defaults. The detail response exposes only validated public review fields, derives rating/count from valid records, and otherwise returns no rating; the Client shows “New” and an empty state. There is no review submission API. MongoDB review behavior remains unverified. |
| Booking call-to-action on details | PARTIAL | `src/app/studios/[id]/page.js`, `src/components/studios/booking-dialog.jsx`; Client BFF `POST /api/marketplace/bookings`; Server `POST /api/bookings` | The CTA submits only booking date/time and studio ID; the Server derives identity and price, and successful requests remain Pending. The live Client BFF's invalid/missing upstream setting blocks protected calls before they reach Express. No production booking mutation was attempted. |
| Add Studio | PARTIAL | `src/app/add-studio/page.js`, `src/lib/add-studio-form.mjs`, `src/lib/api.js`; Client BFF `POST /api/marketplace/studios`; Server `POST /api/studios` | The form uses session-derived read-only host information and sends no owner identity; Server derives ownership. URL validation, success redirect, payload, Server validation, and auth behavior are covered by tests. Production creation is blocked by the Client BFF upstream configuration; no production mutation was attempted. |
| Studio image upload | DEFERRED / PARTIAL | `src/app/add-studio/page.js` | The assignment's current Add Studio flow accepts a hosted image URL; direct file upload and upload-provider integration are not implemented in this milestone. |
| My Listings | PARTIAL | `src/app/my-listings/page.js`, `src/lib/api.js`; Client BFF `GET /api/marketplace/studios/mine`; Server `GET /api/studios/mine` | UI, API helper, BFF allowlist, and Server owner filtering are implemented and covered by source/unit or Server route tests. The live Client BFF currently returns `503 UPSTREAM_NOT_CONFIGURED`; production listings remain unavailable until the Client Vercel `SERVER_API_BASE_URL` is configured and redeployed. |
| Edit Studio and ownership | PARTIAL | `src/app/studios/edit/[id]/page.js`, `src/lib/add-studio-form.mjs`, `src/lib/api.js`; Client BFF `PATCH /api/marketplace/studios/:id`; Server `PATCH /api/studios/:id` | The edit payload excludes host identity and owner fields; the Server enforces stored ownership. Client and Server tests cover payload and owner/forbidden/not-found/validation paths. The deployed BFF upstream configuration currently blocks the protected request before Express; no production mutation was attempted. |
| Delete Studio | PARTIAL | Client `src/app/my-listings/page.js`, `src/lib/api.js`, `src/lib/marketplace-proxy.js`; Client BFF `DELETE /api/marketplace/studios/:id`; Server `DELETE /api/studios/:id` | Confirmation, disabled/pending state, success-only local removal, and errors are implemented. The BFF allowlist and mutation Origin checks are tested; Express enforces owner authorization and returns 409 when booking history exists. The deployed BFF upstream configuration blocks the request before Express; no production deletion or real MongoDB persistence test was performed. |

## Booking

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Booking request creation and persistence | PARTIAL | `src/components/studios/booking-dialog.jsx`, `src/lib/api.js`; Client BFF `POST /api/marketplace/bookings`; Server `POST /api/bookings`, `tests/bookings.test.js` | The dialog submits only studio ID/date/time; Server derives user, owner, rate, and total. Server route tests cover validation, ownership, conflicts, and adjacent windows using isolated in-memory mocks, not real MongoDB. The production BFF GET probes confirm its shared upstream configuration is invalid or missing; the POST path uses that same setting and no production booking mutation was attempted. |
| Booking messaging | PASS | `src/app/page.js`, `src/app/studios/[id]/page.js`, `src/components/studios/booking-dialog.jsx` | Copy now distinguishes persisted Pending requests from unavailable host confirmation and payment processing. Source updated; no browser copy verification in this milestone. |
| Server-side total | PASS | Server `index.js` booking handler | Source calculates rounded hourly rate × duration (maximum 24 hours); it does not include security deposit. Do not infer assignment pricing compliance because the original assignment price rule is unavailable. |
| Confirmed overlap | PARTIAL | Server `index.js` booking handler; `409 BOOKING_CONFLICT` | Handler checks for an overlapping `Confirmed` booking and returns HTTP 409. It then inserts in a separate operation; there is no atomic reservation/unique-window enforcement, and concurrent requests can race. Pending bookings do not block another request. |
| My Bookings | PARTIAL | `src/app/my-bookings/page.js`, `src/lib/api.js`; Client BFF `GET /api/marketplace/bookings/mine`; Server `GET /api/bookings/mine`, `tests/bookings.test.js` | Source returns only the authenticated user's bookings; UI shows status, summary, loading/error/retry and empty states. Server route tests cover owner filtering and empty results using isolated in-memory mocks, not MongoDB. The live Client BFF currently returns `503 UPSTREAM_NOT_CONFIGURED`, blocking the deployed page until Vercel configuration is corrected and redeployed. |
| Pending booking cancellation | PARTIAL | `src/app/my-bookings/page.js`, `src/lib/api.js`; Client BFF `PATCH /api/marketplace/bookings/:id/cancel`; Server `PATCH /api/bookings/:id/cancel`, `tests/bookings.test.js` | Source and Server tests enforce owner-only cancellation of Pending bookings. The mutation is currently blocked by the same deployed BFF upstream configuration failure; no production write was attempted. Tests use an isolated in-memory mock, not real MongoDB persistence. |
| Booking status display | PASS | `src/app/my-bookings/page.js` | Displays the status returned by the Server, including Pending, Confirmed, Cancelled, and Completed. The Client allows cancellation of Pending bookings; other status transitions are not implemented here. |
| Host approval or confirmation workflow | NOT REQUIRED | Original StudioSpace assignment brief; Server `index.js` | The original brief does not require a separate host-approval workflow. The app currently creates Pending booking requests and does not provide an API/UI to transition them to Confirmed; this is not treated as a missing assignment requirement. |

## Dashboard and profile

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Dashboard data and counts | PARTIAL | `src/components/dashboard/dashboard-content.jsx`; Client BFF `GET /api/marketplace/studios/mine`, `/bookings/mine` | Source fetches both owner-scoped datasets and derives total, pending, confirmed, and recent counts. Loading/error/retry UI is present. Both live production BFF reads currently return `503 UPSTREAM_NOT_CONFIGURED`; correct the Client Vercel `SERVER_API_BASE_URL` and redeploy before claiming the deployed dashboard works. |
| Profile update | PASS | `src/components/dashboard/profile-content.jsx`, `src/lib/auth-client.js` | Source updates Better Auth name and optional HTTP(S) image; email is read-only. Uses session refetch and user feedback. No profile-update integration test or recent browser verification. |

## Responsive design, accessibility, and runtime evidence

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Responsive layouts and controls | PARTIAL | `src/app/`, `src/components/` | Responsive breakpoints and accessible labels/states are visible in source. Historical Phase O.4.1A browser measurements found no horizontal overflow at 320, 375, 768, 1024, and 1440 CSS pixels after a card sizing fix; this is historical homepage-only evidence, not a current full-site retest. |
| Loading, error, empty, not-found states | PASS | Homepage, Explore, detail, listings, dashboard and booking pages cited above | Source inspection confirms states; runtime branch coverage is incomplete. |
| Automated Client checks | PARTIAL | `tests/add-studio-form.test.mjs`, `tests/google-auth.test.mjs`, `tests/api.test.mjs`, `tests/marketplace-proxy.test.mjs`, `tests/safe-return-to.test.mjs`, `tests/signup-session.test.mjs`, `tests/auth.integration.test.mjs` | Latest run: `npm test` passed 39, failed 0, skipped 1; `npm run lint` and `npm run build` passed. Tests now distinguish missing/invalid `SERVER_API_BASE_URL`, reject using the public URL as a fallback, and verify origin normalization. The skipped opt-in auth integration test requires explicit `MONGODB_TEST_URI` and `MONGODB_TEST_DB_NAME`; neither was configured. |
| Automated Server checks | PARTIAL | Server `tests/`, `package.json` | Latest full run: `npm test` passed 171, failed 0, skipped 1; `npm run check` passed. Route tests use mocks and do not verify persistence against a dedicated MongoDB test database. |
| Original assignment compliance | PARTIAL | Assignment checklist supplied in the current user request; Client/Server source and traceability | The supplied checklist allows source-level assessment. The listed Client workflows and required UI structures are present by source inspection, and repository history currently contains 21 Client and 17 Server commits; this count is not a claim that every commit is assignment-notable. Full compliance remains unverified because authenticated production workflows are blocked by the Client Vercel upstream setting, isolated MongoDB integration is unavailable, and examiner credentials were not provided. |

## Next recommended milestone

Set `SERVER_API_BASE_URL` in the Client Vercel project's Production environment
to the verified Express API origin documented in the README, then redeploy.
Recheck public BFF GETs return 401 without a session and verify an authenticated
Client-to-BFF-to-Express/JWKS roundtrip. Also run Better Auth and marketplace
integration tests against explicitly isolated MongoDB databases. Do not test by
writing to production.
