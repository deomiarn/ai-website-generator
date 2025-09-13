import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ProjectsPageClient from "./ProjectsPageClient";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <ProjectsPageClient />;
}
