"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/services/auth";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  initials: string;
}

export function UserMenu({ initials }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await signOut();
      setIsOpen(false);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-softblue text-center text-sm font-semibold leading-9 text-primary hover:bg-primary/10 transition"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {initials}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 z-50"
          role="menu"
        >
          {/* Menu items */}
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-softblue hover:text-primary transition border-b border-border"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4" />
            My Profile
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-softblue hover:text-primary transition border-b border-border"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
            role="menuitem"
          >
            <LogOut className="h-4 w-4" />
            {isLoading ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}
