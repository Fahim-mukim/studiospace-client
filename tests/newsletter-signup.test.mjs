import assert from "node:assert/strict";
import { test } from "node:test";
import { getNewsletterSubmissionFeedback } from "../src/lib/newsletter-signup.mjs";

test("newsletter signup rejects missing and malformed email addresses", () => {
  for (const email of ["", "not-an-email", "person@example", " person@example.com"]) {
    assert.deepEqual(getNewsletterSubmissionFeedback(email), {
      kind: "invalid",
      message: "Enter a valid email address.",
    });
  }
});

test("valid newsletter email receives honest unavailable feedback without claiming signup", () => {
  assert.deepEqual(
    getNewsletterSubmissionFeedback("person@example.com"),
    {
      kind: "unavailable",
      message:
        "Newsletter sign-up is not configured yet. No email was sent or saved.",
    },
  );
});
