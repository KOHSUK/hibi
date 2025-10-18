import Link from "next/link";
import { KanbanSquare, LayoutDashboard, ListTodo } from "lucide-react";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";

const navItems = [
  { href: "/summary", label: "サマリー", icon: LayoutDashboard },
  { href: "/projects", label: "プロジェクト", icon: KanbanSquare },
  { href: "/tasks", label: "タスク管理", icon: ListTodo },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 flex-col border-r border-border/60 bg-card/70 px-5 py-8 sm:flex">
        <div className="text-lg font-semibold">Hibi</div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <nav className="flex h-16 items-center justify-between border-b border-border/60 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold sm:hidden">Hibi</span>
            <div className="flex items-center gap-2 sm:hidden">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md border border-border/60 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        </nav>
        <main className="flex-1 w-full px-4 py-6 sm:px-6">{children}</main>
        <footer className="flex items-center justify-between border-t border-border px-4 py-4 text-xs sm:px-6">
          <p>
            Powered by{" "}
            <a
              href="https://kohsuk.tech"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              KOHSUK
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </div>
  );
}
