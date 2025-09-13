import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to dashboard (protected route) so auth middleware handles it
  redirect("/dashboard");
}
