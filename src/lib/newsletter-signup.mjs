const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getNewsletterSubmissionFeedback(email) {
  if (
    typeof email !== "string" ||
    email.trim() !== email ||
    !emailPattern.test(email)
  ) {
    return {
      kind: "invalid",
      message: "Enter a valid email address.",
    };
  }

  return {
    kind: "unavailable",
    message:
      "Newsletter sign-up is not configured yet. No email was sent or saved.",
  };
}
