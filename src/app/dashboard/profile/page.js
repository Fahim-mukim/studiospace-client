import { Suspense } from "react";
import { ProfileContent } from "@/components/dashboard/profile-content";

export const metadata = {
  title: "Profile",
  description: "Manage your StudioSpace profile.",
};

function ProfileFallback() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-40 animate-pulse rounded-3xl bg-muted" />
      <div className="h-64 animate-pulse rounded-3xl bg-muted" />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileContent />
    </Suspense>
  );
}
