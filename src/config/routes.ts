import {
  BarChart3,
  BookOpenCheck,
  GraduationCap,
  Brain,
  LayoutDashboard,
  Settings,
  Shield,
  Trophy,
  User,
  WalletCards,
} from "lucide-react";

export const publicNav = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/#faq" },
];

export const appNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Practice", href: "/practice", icon: BookOpenCheck },
  { label: "Mock Exam", href: "/exam", icon: GraduationCap },
  { label: "Flashcards", href: "/flashcards", icon: Brain },
  { label: "Progress", href: "/progress", icon: BarChart3 },
  { label: "Weekly Quiz", href: "/weekly-quiz", icon: Trophy },
  { label: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
  { label: "Upgrade", href: "/upgrade", icon: WalletCards },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const adminNav = [{ label: "Admin", href: "/admin", icon: Shield }];
