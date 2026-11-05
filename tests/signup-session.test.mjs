import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getNewlyRegisteredUser,
  isAuthenticatedAsNewSignup,
  isDuplicateEmailError,
} from "../src/lib/signup-session.js";

const registeredUser = {
  id: "new-user-id",
  email: "new-user@example.com",
};

test("recognizes a newly registered user only with a real signup token", () => {
  assert.deepEqual(
    getNewlyRegisteredUser(
      { data: { token: "opaque-session-token", user: registeredUser } },
      " NEW-USER@example.com ",
    ),
    registeredUser,
  );
  assert.equal(
    getNewlyRegisteredUser(
      {
        data: {
          token: null,
          user: { id: "synthetic-id", email: registeredUser.email },
        },
      },
      registeredUser.email,
    ),
    null,
  );
  assert.equal(
    getNewlyRegisteredUser(
      { data: { token: "token", user: registeredUser } },
      "someone-else@example.com",
    ),
    null,
  );
});

test("requires the refreshed session to belong to the newly registered user", () => {
  assert.equal(
    isAuthenticatedAsNewSignup({ data: { user: registeredUser } }, registeredUser),
    true,
  );
  assert.equal(
    isAuthenticatedAsNewSignup(
      { data: { user: { id: "old-user-id", email: registeredUser.email } } },
      registeredUser,
    ),
    false,
  );
  assert.equal(
    isAuthenticatedAsNewSignup(
      { error: { status: 401 }, data: null },
      registeredUser,
    ),
    false,
  );
});

test("recognizes Better Auth duplicate-email errors without exposing them", () => {
  assert.equal(
    isDuplicateEmailError({
      error: { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" },
    }),
    true,
  );
  assert.equal(isDuplicateEmailError({ error: { code: "INVALID_EMAIL" } }), false);
  assert.equal(isDuplicateEmailError({ data: { token: "token" } }), false);
});
