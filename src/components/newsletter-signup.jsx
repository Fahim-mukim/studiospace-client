"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getNewsletterSubmissionFeedback } from "@/lib/newsletter-signup.mjs";

export function NewsletterSignup() {
  const [feedback, setFeedback] = useState(null);
  const emailInput = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    const input = emailInput.current;
    if (!input?.checkValidity()) {
      const message = input?.value
        ? "Enter a valid email address."
        : "Enter an email address.";
      setFeedback({ kind: "invalid", message });
      input?.reportValidity();
      toast.error(message);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const result = getNewsletterSubmissionFeedback(formData.get("email"));
    setFeedback(result);

    if (result.kind === "invalid") {
      emailInput.current?.focus();
      toast.error(result.message);
      return;
    }

    toast.info(result.message);
  }

  return (
    <>
      <p className="mt-2 text-sm leading-6 text-muted-foreground" id="newsletter-help">
        Sign-up is not available yet. No email will be sent or stored.
      </p>
      <form className="mt-4 space-y-2" noValidate onSubmit={handleSubmit}>
        <Label htmlFor="newsletter-email">Email address</Label>
        <Input
          aria-describedby="newsletter-help newsletter-feedback"
          aria-invalid={feedback?.kind === "invalid" || undefined}
          autoComplete="email"
          id="newsletter-email"
          name="email"
          placeholder="Your email address"
          ref={emailInput}
          required
          type="email"
        />
        <Button className="w-full" type="submit">
          Check availability
        </Button>
        <p
          aria-live="polite"
          className={`min-h-5 text-xs leading-5 ${
            feedback?.kind === "invalid"
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
          id="newsletter-feedback"
          role="status"
        >
          {feedback?.message || ""}
        </p>
      </form>
    </>
  );
}
