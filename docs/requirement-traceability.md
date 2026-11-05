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
| Configurable API base URL | PASS | `.env.example`, `src/lib/api.js`, `src/lib/marketplace-proxy.js` | Source verified: `NEXT_PUBLIC_API_BASE_URL` configures public Express reads; server-only `SERVER_API_BASE_URL` configures the authenticated BFF upstream. Both default to `http://localhost:5000` in the example environment. Authentication secrets and the BFF upstream URL remain server-only. |
| Authenticated cross-origin marketplace requests | PARTIAL | `src/app/api/marketplace/[...path]/route.js`, `src/lib/marketplace-proxy.js`, `src/lib/api.js` | Source implementation and mocked-upstream unit tests cover the allowlist, methods, Origin/content-type checks, and filtered session-data cookie forwarding. In the current browser session, unauthenticated `GET /api/marketplace/studios/mine` returned HTTP 401 through the BFF, while direct public `GET /api/studios` returned HTTP 200. An authenticated Client → BFF → Express → JWKS request was not run: no explicit isolated test database is configured. Production behavior remains unverified. |
| Independent environments and deployment | PASS | Client and Server `.env.example` files and package manifests; both repositories | Source/repository boundaries verified. Production deployment, domain, and cookie transport have not been verified. See the Server README. |

## Authentication

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Email/password registration and validation | PASS | `src/components/auth/register-form.jsx`, `src/lib/auth.js` | Source validates name, email, optional HTTP(S) image and password length 6–128 with uppercase and lowercase. Integration test is opt-in and was skipped without dedicated test database configuration. |
| Registration auto-sign-in | PASS | `src/lib/auth.js` (`autoSignIn: true`); `src/components/auth/register-form.jsx`; `src/lib/signup-session.js` | The form requires a non-empty signup token, matching user email, and a freshly fetched session for the same user before showing success or redirecting. Regression tests cover response/session mismatch; MongoDB integration remains unrun without dedicated test database configuration. |
| Duplicate-email feedback | PARTIAL | `src/components/auth/register-form.jsx`, `src/lib/signup-session.js`, `tests/signup-session.test.mjs`, `tests/auth.integration.test.mjs` | Installed Better Auth 1.7.16 returns 422 `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` with `autoSignIn: true`; its generic duplicate success requires email verification or `autoSignIn: false`. The Client maps that error to neutral UI copy and does not redirect. The endpoint still exposes the status/code, so this is not full API-level anti-enumeration. Unit coverage exists; the MongoDB integration assertion was updated but not run. |
| Email/password login | PASS | `src/components/auth/login-form.jsx`, `src/lib/auth-client.js` | Source handles validation, pending state, errors, session refresh, and safe redirect. No recent browser login roundtrip was performed for this documentation milestone. |
| Google OAuth | PARTIAL / BLOCKED | `src/lib/auth.js`, `src/app/api/auth/google-status/route.js`, `src/components/auth/google-auth-button.jsx`, `src/lib/google-auth-flow.mjs`, `tests/google-auth.test.mjs` | The button waits for a no-store readiness response that exposes only `configured: boolean`; it is unavailable when either credential is missing. Both forms use the standard `/api/auth/callback/google` route; Login preserves a safe requested destination and Registration returns home. Focused mocked/configuration tests do not prove Google authentication. The local `.env.local` has paired Google credentials and valid local HTTP Better Auth URL/secret configuration, but production environment scopes could not be inspected because Vercel CLI/deployment metadata is unavailable. A live deployed OAuth roundtrip and exact Google Console redirect remain unverified. |
| Session cookies and persistence | PARTIAL | `src/lib/auth.js`, `src/app/api/auth/[...all]/route.js`, `tests/auth.integration.test.mjs` | Source configures HTTP-only cookies and a JWT-backed session-data cache. Integration source now asserts signup creates one session, cookies, credentials, duplicate behavior, login, lookup, and logout; it was skipped because dedicated MongoDB test configuration is unavailable. Persistence is not claimed as runtime-verified. |
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
| Explore sorting | PARTIAL | `src/components/studios/studio-results.jsx`, `src/lib/api.js`; Server `index.js` | Newest and price sorts are handled by the Server. “Highest rated” sorts only the currently fetched page in Client code; the Server has no rating sort or verified ratings source, so it is not globally ranked. |
| Explore loading, error, and empty results | PASS | `src/components/studios/studio-results.jsx`, `src/app/studios/loading.js` | Source includes loading, retry/error, and empty-state UI. No recent browser outage/empty-state simulation. |
| Static presentation vs marketplace data | PASS | `src/data/homepage.js`, `src/data/studios.js`, `src/app/page.js`, Explore/detail pages | Hero slides, category descriptions, booking-step and marketing copy are presentation data. `src/data/studios.js` remains as a legacy fixture module but is not the fallback source for current homepage, Explore, or detail API requests. |

## Studio details and management

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Studio details | PASS | `src/app/studios/[id]/page.js`, `src/lib/api.js`; `GET /api/studios/:id` | Reads by MongoDB ID or slug from Express; 404 uses the route not-found UI and API failures have retry/back UI. Source verified; detail route was not browser-tested in this milestone. |
| Gallery, host, review display | PARTIAL | `src/components/studios/studio-gallery.jsx`, `src/app/studios/[id]/page.js`, `src/lib/api.js`; Server `index.js` | Gallery consumes API image fields and falls back to one local image when none exist. Host fields are limited by the API; normalizer supplies display defaults. The detail response now exposes only validated public fields for existing embedded reviews, derives rating/count from those records, and otherwise returns a zero count with no rating; the Client shows “New” and an explicit empty state. There is no review submission API. Source and Server route test are covered; no live MongoDB review record or browser display was verified. |
| Booking call-to-action on details | PASS | `src/app/studios/[id]/page.js`, `src/components/studios/booking-dialog.jsx`; `POST /api/bookings` | CTA submits booking date and times to Express for an authenticated request. A successful response means a pending request, not a confirmed booking. No payment or host approval flow. |
| Add Studio | PASS | `src/app/add-studio/page.js`, `src/lib/add-studio-form.mjs`, `src/lib/api.js`; `POST /api/studios` | Displays session-derived host name/email as read-only fields. After a successful create it shows a success toast and navigates to `/my-listings`. The create payload contains studio data only; ownership remains derived server-side from verified JWT identity. Image input remains an HTTP(S) URL. Client tests cover host values, URL validation, success target, and omission of ownership fields; Server tests cover insert, validation, ownership-field handling, and auth failures. |
| Studio image upload | DEFERRED / PARTIAL | `src/app/add-studio/page.js` | The assignment's current Add Studio flow accepts a hosted image URL; direct file upload and upload-provider integration are not implemented in this milestone. |
| My Listings | PASS | `src/app/my-listings/page.js`, `src/lib/api.js`; `GET /api/studios/mine` | Authenticated API filters by verified user ID; UI has loading/error/retry/empty states and edit links. Server tests cover owner-only result filtering. |
| Edit Studio and ownership | PASS | `src/app/studios/edit/[id]/page.js`, `src/lib/add-studio-form.mjs`, `src/lib/api.js`; `PATCH /api/studios/:id` | Displays current session name/email as selectable read-only host information. After a successful update it shows a success toast and navigates to `/my-listings`. Edit payload excludes host identity and owner fields; Server ownership still comes from verified JWT identity. Client tests cover missing host values, target path, and payload; Server tests cover owner update, forbidden update, not-found, validation, and ownership-field protection. |
| Delete Studio | PASS | Client `src/app/my-listings/page.js`, `src/lib/api.js`, `src/lib/marketplace-proxy.js`; Server `index.js` | My Listings has a confirmation dialog, pending/disabled state, success-only local removal, and clear error toasts. `deleteStudio()` uses the same-origin BFF; its allowlist permits only `DELETE /api/marketplace/studios/:id` and validates mutation Origin. Express authenticates with the existing JWT middleware and checks stored ownership. It returns 409 (`STUDIO_HAS_BOOKINGS`) when any booking references the studio and never cascade-deletes bookings. Automated Server route, Client BFF, and helper tests cover these behaviors; Client build/lint pass. No live browser deletion or real MongoDB persistence test was performed in this milestone. |

## Booking

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Booking request creation and persistence | PASS | `src/components/studios/booking-dialog.jsx`, `src/lib/api.js`; Server `tests/bookings.test.js`; `POST /api/bookings` | The Server has 30 booking-focused route-test cases using an isolated in-memory mock with production route registration. They cover creation and server-derived values, lookup, validation, confirmed/pending overlaps and adjacent windows, ownership-filtered My Bookings, cancellation/status validation, and authentication. These tests do not establish real MongoDB persistence. The current Server suite run passed 164 tests, failed 0, and skipped 1 timezone-conditional test. The DST duration case was separately reported as 30/30 passing in the supplied historical verification; it was not rerun under `America/New_York` in this milestone. Live database booking persistence remains unverified. |
| Booking messaging | PASS | `src/app/page.js`, `src/app/studios/[id]/page.js`, `src/components/studios/booking-dialog.jsx` | Copy now distinguishes persisted Pending requests from unavailable host confirmation and payment processing. Source updated; no browser copy verification in this milestone. |
| Server-side total | PASS | Server `index.js` booking handler | Source calculates rounded hourly rate × duration (maximum 24 hours); it does not include security deposit. Do not infer assignment pricing compliance because the original assignment price rule is unavailable. |
| Confirmed overlap | PARTIAL | Server `index.js` booking handler; `409 BOOKING_CONFLICT` | Handler checks for an overlapping `Confirmed` booking and returns HTTP 409. It then inserts in a separate operation; there is no atomic reservation/unique-window enforcement, and concurrent requests can race. Pending bookings do not block another request. |
| My Bookings | PASS | `src/app/my-bookings/page.js`, `src/lib/api.js`; Server `tests/bookings.test.js`; `GET /api/bookings/mine` | Source returns only the authenticated user's bookings, newest first; UI shows status, summary, loading/error/retry and empty states. Server route tests cover ownership filtering and empty results using an isolated in-memory mock, not real MongoDB persistence. |
| Pending booking cancellation | PASS | `src/app/my-bookings/page.js`, `src/lib/api.js`; Server `tests/bookings.test.js`; `PATCH /api/bookings/:id/cancel` | Source enforces owner-only cancellation and changes only `Pending` to `Cancelled`. Server route tests cover owner cancellation, non-owner rejection, missing records, and invalid statuses using an isolated in-memory mock; they do not establish real MongoDB persistence. |
| Booking status display | PASS | `src/app/my-bookings/page.js` | Displays the status returned by the Server, including Pending, Confirmed, Cancelled, and Completed. The Client allows cancellation of Pending bookings; other status transitions are not implemented here. |
| Host approval or confirmation workflow | NOT REQUIRED | Original StudioSpace assignment brief; Server `index.js` | The original brief does not require a separate host-approval workflow. The app currently creates Pending booking requests and does not provide an API/UI to transition them to Confirmed; this is not treated as a missing assignment requirement. |

## Dashboard and profile

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Dashboard data and counts | PASS | `src/components/dashboard/dashboard-content.jsx`; `GET /api/studios/mine`, `GET /api/bookings/mine` | Source fetches API-backed listing and booking data and derives total, pending, confirmed, and recent counts. Loading/error/retry UI is present. No recent browser or API integration check. |
| Profile update | PASS | `src/components/dashboard/profile-content.jsx`, `src/lib/auth-client.js` | Source updates Better Auth name and optional HTTP(S) image; email is read-only. Uses session refetch and user feedback. No profile-update integration test or recent browser verification. |

## Responsive design, accessibility, and runtime evidence

| Area | Status | Source evidence | Verification and remaining limitation |
|---|---|---|---|
| Responsive layouts and controls | PARTIAL | `src/app/`, `src/components/` | Responsive breakpoints and accessible labels/states are visible in source. Historical Phase O.4.1A browser measurements found no horizontal overflow at 320, 375, 768, 1024, and 1440 CSS pixels after a card sizing fix; this is historical homepage-only evidence, not a current full-site retest. |
| Loading, error, empty, not-found states | PASS | Homepage, Explore, detail, listings, dashboard and booking pages cited above | Source inspection confirms states; runtime branch coverage is incomplete. |
| Automated Client checks | PARTIAL | `tests/add-studio-form.test.mjs`, `tests/google-auth.test.mjs`, `tests/api.test.mjs`, `tests/marketplace-proxy.test.mjs`, `tests/safe-return-to.test.mjs`, `tests/signup-session.test.mjs`, `tests/auth.integration.test.mjs` | Current run: `npm test` passed 36, failed 0, skipped 1; `npm run lint` and `npm run build` passed. The skipped opt-in auth integration test requires explicit `MONGODB_TEST_URI` and `MONGODB_TEST_DB_NAME`; those variables are absent, so signup/session persistence was not verified. |
| Original assignment compliance | PARTIAL | Original StudioSpace assignment brief provided with the current milestone | The brief has been located and is used for this audit. This matrix records the reviewed requirements and does not certify every assignment item. |

## Next recommended milestone

Run a browser workflow against an explicitly isolated staging/test database to
verify the authenticated Delete Studio flow end-to-end, including the booking
history conflict, without touching development or production data. The current
delete route tests use in-memory mocks and do not establish live MongoDB
behavior or browser accessibility/layout behavior. Separately, define an
approval/confirmation workflow before describing Pending booking requests as
confirmed.
