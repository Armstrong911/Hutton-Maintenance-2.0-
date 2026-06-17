"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface NavItem { label: string; href: string; }

interface SidebarProps { buildingId?: string; buildingName?: string; }

export function Sidebar({ buildingId, buildingName }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const globalNav: NavItem[] = [
    { label: "All Buildings", href: "/buildings" },
    ...(session?.user?.isSuperAdmin ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  const buildingNav: NavItem[] = buildingId ? [
    { label: "Overview",    href: `/buildings/${buildingId}` },
    { label: "Maintenance", href: `/buildings/${buildingId}/maintenance` },
    { label: "Users",       href: `/buildings/${buildingId}/users` },
  ] : [];

  function isActive(href: string) {
    if (href === `/buildings/${buildingId}`) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-60 min-h-screen border-r border-zinc-100 flex flex-col bg-white shrink-0">
      {/* Brand */}
      <div className="h-14 border-b border-zinc-100 flex items-center px-6">
        <span className="font-serif font-bold text-sm tracking-widest uppercase">Hutton</span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-1">
          <p className="text-xs uppercase tracking-widest text-zinc-300 py-2 font-serif">Portfolio</p>
        </div>
        {globalNav.map(item => (
          <Link key={item.href} href={item.href}
            className={isActive(item.href) && !buildingId ? "sidebar-link-active" : "sidebar-link"}>
            {item.label}
          </Link>
        ))}

        {buildingId && (
          <>
            <div className="px-4 mt-4 mb-1">
              <p className="text-xs uppercase tracking-widest text-zinc-300 py-2 font-serif truncate">
                {buildingName ?? "Building"}
              </p>
            </div>
            {buildingNav.map(item => (
              <Link key={item.href} href={item.href}
                className={isActive(item.href) ? "sidebar-link-active" : "sidebar-link"}>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-zinc-100 p-4">
        <p className="text-xs text-zinc-500 font-serif truncate mb-2">{session?.user?.email}</p>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-zinc-400 hover:text-black font-serif transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  );
}