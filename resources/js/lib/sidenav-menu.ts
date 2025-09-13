import { Link } from "@inertiajs/react";
import AppLogo from "@/components/app-logo";
import { NavItem } from "@/types";
import {
  BookOpen,
  Folder,
  LayoutGrid,
  FileText,
  Building2,
  UserCheck,
  Shield,
  Users,
  Settings,
} from "lucide-react";

// Care Home Admin Navigation Items
const careHomeAdminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
];

// Admin Navigation Items
const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutGrid,
  },
  {
    title: "Care Homes",
    href: "/admin/carehomes",
    icon: Building2,
  },
  {
    title: "Health Care Workers",
    href: "/admin/healthcare-workers",
    icon: UserCheck,
  },
  {
    title: "Document Verification",
    href: "/admin/documents",
    icon: FileText,
  },
];

// Health Care Worker Navigation Items
const healthCareWorkerNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
];

const footerNavItems: NavItem[] = [];

// Function to get navigation items based on user role
export function getMainNavItems(userRole?: string): NavItem[] {
  switch (userRole) {
    case "admin":
      return adminNavItems;
    case "health_care_worker":
      return healthCareWorkerNavItems;
    case "care_home_admin":
    default:
      return careHomeAdminNavItems;
  }
}

// Export the default items for backward compatibility
export const mainNavItems = careHomeAdminNavItems;
export { footerNavItems };
