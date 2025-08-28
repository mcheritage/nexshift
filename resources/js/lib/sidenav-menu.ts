import { Link } from "@inertiajs/react";
import AppLogo from "@/components/app-logo";
import { NavItem } from "@/types";
import { BookOpen, Folder, LayoutGrid } from "lucide-react";

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
  },
];

const footerNavItems: NavItem[] = [

];

export {
  mainNavItems,
  footerNavItems
}