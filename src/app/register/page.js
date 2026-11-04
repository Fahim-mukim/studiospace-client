import { Suspense } from "react";
import {
  AuthPageFallback,
  AuthPageShell,
} from "@/components/auth/auth-page-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register",
  description: "Create your StudioSpace account.",
};

function hasValue(value) {
  return typeof value === "string" && value.length > 0;
}

async function RegisterPageContent({ searchParams }) {
  const query = searchParams ? await searchParams : {};

  return (
    <AuthPageShell
      description="Create an account to find and share inspiring creative spaces."
      eyebrow="Join the community"
      title="Make space for your next idea."
    >
      <RegisterForm oauthError={hasValue(query.error)} />
    </AuthPageShell>
  );
}

const pageContent = {
  description: "Create an account to find and share inspiring creative spaces.",
  eyebrow: "Join the community",
  title: "Make space for your next idea.",
};

export default function RegisterPage({ searchParams }) {
  return (
    <Suspense fallback={<AuthPageFallback {...pageContent} />}>
      <RegisterPageContent searchParams={searchParams} />
    </Suspense>
  );
}
