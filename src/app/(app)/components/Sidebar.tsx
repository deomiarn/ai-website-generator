"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FolderKanban, LayoutDashboard, Library, LogOut, PanelLeftClose, PanelLeftOpen, Settings, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavItem } from "./NavItem";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Overview",
  },
  {
    href: "/projects",
    icon: FolderKanban,
    label: "Projects",
  },
  {
    href: "/library",
    icon: Library,
    label: "Library",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(newCollapsed));
    }
  };

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar-collapsed");
      if (stored) {
        setIsCollapsed(stored === "true");
      }
    }
  }, []);

  const user = session?.user;
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-200",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">AI Website Generator</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="ml-auto h-8 w-8 p-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={isCollapsed ? "" : item.label}
              className={isCollapsed ? "justify-center px-2" : ""}
            />
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Section */}
      <div className="p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2",
            isCollapsed && "justify-center"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || "user@example.com"}
              </p>
            </div>
          )}

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
