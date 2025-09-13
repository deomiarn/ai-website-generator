import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Providers } from "../providers";
import { Sidebar } from "./components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <Providers>
      <div className="with-sidebar">
        <Sidebar />
        <main className="app-shell">{children}</main>
      </div>
    </Providers>
  );
}
