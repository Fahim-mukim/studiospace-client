import { redirect } from "next/navigation";

export const metadata = {
  title: "My Studio Listings",
  description: "Manage your studio listings.",
};

export default function MyStudiosPage() {
  redirect("/my-listings");
}
