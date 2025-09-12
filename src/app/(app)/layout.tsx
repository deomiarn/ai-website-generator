import { Providers } from "../providers";
import { Sidebar } from "./components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="with-sidebar">
        <Sidebar />
        <main className="app-shell">{children}</main>
      </div>
    </Providers>
  );
}
