import { Suspense } from "react";
import {
  AuthPageFallback,
  AuthPageShell,
} from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeReturnTo } from "@/lib/safe-return-to";

export const metadata = {
  title: "Login",
  description: "Log in to your StudioSpace account.",
};

function firstString(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.find((entry) => typeof entry === "string");
  return undefined;
}

async function LoginPageContent({ searchParams }) {
  const query = searchParams ? await searchParams : {};
  const returnTo = getSafeReturnTo(
    firstString(query.callbackURL) ?? firstString(query.returnTo),
  );

  return (
    <AuthPageShell
      description="Sign in to pick up where your next creative project begins."
      eyebrow="Welcome back"
      title="Good to have you here."
    >
      <LoginForm
        oauthError={firstString(query.error) === "google"}
        signupSubmitted={firstString(query.signup) === "submitted"}
        returnTo={returnTo}
      />
    </AuthPageShell>
  );
}

const pageContent = {
  description: "Sign in to pick up where your next creative project begins.",
  eyebrow: "Welcome back",
  title: "Good to have you here.",
};

export default function LoginPage({ searchParams }) {
  return (
    <Suspense fallback={<AuthPageFallback {...pageContent} />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}
