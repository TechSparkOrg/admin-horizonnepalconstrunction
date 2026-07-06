"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {  LayoutDashboard,  FolderKanban,  Tags,  MessageCircle,  ImageIcon,  Newspaper,  FileText,  Activity,  Star,  Box,  Calculator,  PhoneCall,  Sun,  Users,  Building2,  Settings,  LogOut,  ChevronDown,  VideoIcon,  Landmark} from "lucide-react";
import { useAuthStore } from "@/app/store/auth-store";
import {  Sidebar,  SidebarContent,  SidebarFooter,  SidebarGroup,  SidebarGroupContent,  SidebarHeader,  SidebarMenu,  SidebarMenuItem,  SidebarMenuButton,  SidebarMenuSub,  SidebarMenuSubItem,  SidebarMenuSubButton,  SidebarRail} from "@/components/ui/sidebar";

type NavLink = {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
};

const navLinks: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },

  { label: "Categories", href: "/categories", icon: Tags ,
    children: [
      { label: "Services Category", href: "/categories" },
      { label: "Blog Category", href: "/categories/blogs" },
      // { label: "FAQ Category", href: "/categories/faqs" },
      { label: "Project Category", href: "/categories/projects" },
            { label: "Attribute Categories", href: "/categories/attributes" },
    ],
  },
    { label: "Emi", href: "/emi/banks", icon: Landmark,
    children: [
          { label: "Banks", href: "/emi/banks" },
        { label: "Emi Requests", href: "/emi/request" },

      ]
    
   },

  { label: "Media", href: "/media/images", icon: ImageIcon,
    children: [
          { label: "Images", href: "/media/images" },
        { label: "Videos", href: "/media/videos" },
        { label: "3D Models", href: "/media/models"  },
        { label: "Banners", href: "/media/banners" },
      ]
    
   },
  {
    label: " Content",
    href: "/blogs",
    icon: Newspaper,
    children: [
      { label: "Blogs", href: "/blogs" },
            { label: "Projects", href: "/projects" },
                       { label: "Courses", href: "/edu-course" },
                      { label: "Vastu", href: "/vastu"},
          { label: "Building Permit", href: "/building-permit" },
  
    ],
  },
  { label: "Pages", href: "/pages", icon: FileText ,
    children: [
      { label: "Pages", href: "/pages" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  { label: "Costumer Relations", href: "#", icon: Activity ,
    children: [
      { label: "Enquiries", href: "/customer-enquires" },

        { label: "Reviews", href: "/reviews"},
          // { label: "Consultation", href: "/dashboard/consultation" }
    ],
  },


  { label: "Resources Management", href: "/material-list", icon: Calculator ,
    children: [
      { label: "Material list", href: "/material-list" },
    
             { label: "Vendor", href: "/vendor" },
               { label: "Unit Converter", href: "/material-list/unit-converter" }
    ],
  },
    { label: "Accounting", href: "/billing-calculations", icon: Calculator ,
    children: [
   
         { label: "Billing calculation", href: "/billing-calculations" },
         { label: "Project Accounting", href: "/accounting" },
               { label: "Team  Accounting", href: "/accounting-team" },

    ],
  },


  { label: "Documents", href: "/documents/templates", icon: Calculator ,
    children: [
         { label: "Templates", href: "/documents/templates" },
      // { label: "Project Agreements", href: "/documents/project-agreements" },
      // { label: "Project Documents", href: "/documents/private-documents" },
      //   // { label: "Bid Documents", href: "/documents/bid-documents"}
      
  
    ],
  },



  { label: "System Admin", href: "/team", icon: Users ,    children: [
        { label: "Staff", href: "/team" },
                  { label: "Roles & Permissions", href: "/team/roles-permissions" },
      { label: "Admin Users", href: "/team/admin-users" }
        
    ],},

  { label: "Settings", href: "/core", icon: Settings },
];

function NavItem({
  label,
  href,
  icon: Icon,
  children,
  pathname,
}: NavLink & { pathname: string }) {
  const isActive = (h: string) => pathname === h || pathname.startsWith(h + "/");
  const [open, setOpen] = useState(() => isActive(href));

  if (children) {
    const active = isActive(href);
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setOpen((o) => !o)}
          isActive={active}
          className={active ? "bg-sidebar-primary/10 text-sidebar-primary font-medium hover:bg-sidebar-primary/10 hover:text-sidebar-primary" : ""}
        >
          <Icon />
          <span>{label}</span>
          <ChevronDown className="ml-auto size-3 transition-transform data-open:rotate-180" data-open={open || undefined} />
        </SidebarMenuButton>
        {open && (
          <SidebarMenuSub>
            {children.map((child) => {
              const childActive = isActive(child.href);
              return (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={childActive}
                    className={childActive ? "bg-sidebar-primary/10 text-sidebar-primary font-medium" : ""}
                  >
                    <Link href={child.href}>{child.label}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  const active = isActive(href);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        className={active ? "bg-sidebar-primary/10 text-sidebar-primary font-medium hover:bg-sidebar-primary/10 hover:text-sidebar-primary" : ""}
      >
        <Link href={href}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center gap-2 border-b border-sidebar-border px-4 py-3 group-data-[collapsible=icon]:px-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Building2 className="size-4" />
        </div>
        <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
          <span className="text-sm font-semibold">Horizon Nepal</span>
          <span className="text-[11px] text-sidebar-foreground/60">Admin Panel</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => (
                <NavItem key={link.href} {...link} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:p-2">
        {user && (
          <div className="mb-1 flex items-center gap-3 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-500 text-white text-xs font-semibold uppercase">
              {user.name?.[0] ?? user.email?.[0] ?? "?"}
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</span>
              <span className="truncate text-[11px] text-sidebar-foreground/60">{user.email}</span>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="text-sidebar-foreground/70 hover:!text-red-500 hover:!bg-red-50"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
