import { PeractButtonPrimitive } from "../../shared/components/peract-button";
import { useState } from "react";
import { Navigate, Outlet, NavLink, useLocation } from "react-router";
import logoImg from "figma:asset/19603bc35fe7f283ff1a83c590f928c9d0bfe9cf.png";
import { LayoutDashboard, Package, ChevronDown, ChevronRight, Menu, X, ChevronLeft, Droplets, ShoppingBag, Users, Settings, LogOut, ShieldCheck, UserCheck, Sparkles, FlaskConical, Tags, ClipboardPlus, History, ShoppingCart } from "lucide-react";
import { useApp } from "../store/AppContext";
import { PeractButton } from "../../shared/components/peract-button";
import { PeractTag } from "../../shared/components/peract-tag";
import { GuidedSystemTour } from "./GuidedSystemTour";
const C = {
  accent: "var(--color-sidebar-primary)",
  border: "var(--color-sidebar-border)",
  dark: "var(--color-sidebar-foreground)",
  text: "var(--color-sidebar-foreground)",
  textMid: "var(--color-muted-foreground)"
};
interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  adminOnly?: boolean;
  children?: {
    label: string;
    path: string;
    icon?: React.ReactNode;
    adminOnly?: boolean;
  }[];
}
const ALL_NAV_ITEMS: NavItem[] = [{
  label: "Início",
  icon: <LayoutDashboard size={20} />,
  path: "/"
}, {
  label: "Estoque",
  icon: <Package size={20} />,
  children: [{
    label: "Perfumes",
    path: "/estoque/produtos",
    icon: <FlaskConical size={16} />,
    adminOnly: true
  }, {
    label: "Body Splash",
    path: "/bodysplash",
    icon: <Sparkles size={16} />
  }, {
    label: "Decants",
    path: "/decants",
    icon: <Droplets size={16} />
  }, {
    label: "Categorias",
    path: "/estoque/categorias",
    icon: <Tags size={16} />,
    adminOnly: true
  }]
}, {
  label: "Vendas",
  icon: <ShoppingBag size={20} />,
  children: [{
    label: "Registrar Venda",
    path: "/vendas/registrar",
    icon: <ClipboardPlus size={16} />
  }, {
    label: "Histórico de Vendas",
    path: "/vendas/historico",
    icon: <History size={16} />,
    adminOnly: true
  }, {
    label: "Pedidos Online",
    path: "/vendas/pedidos",
    icon: <ShoppingCart size={16} />
  }]
}, {
  label: "Gerenciamento",
  icon: <Users size={20} />,
  path: "/clientes",
  adminOnly: true
}, {
  label: "Configurações",
  icon: <Settings size={20} />,
  path: "/configuracoes",
  adminOnly: true
}];
function SidebarItem({
  item,
  collapsed,
  onMobileClose
}: {
  item: NavItem;
  collapsed: boolean;
  onMobileClose?: () => void;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(() => item.children ? item.children.some(child => location.pathname.startsWith(child.path)) : false);
  const isChildActive = item.children?.some(child => location.pathname === child.path) ?? false;
  if (item.path) {
    return <NavLink className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150" end={item.path === "/"} onClick={onMobileClose} style={({
      isActive
    }) => isActive ? {
      background: C.accent,
      color: "#fff"
    } : {
      color: C.text
    }} title={collapsed ? item.label : undefined} to={item.path}>
        <span className="shrink-0">{item.icon}</span>
        {!collapsed ? <span className="truncate text-sm">{item.label}</span> : null}
        {collapsed ? <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded border px-2 py-1 text-xs text-white opacity-0 shadow-lg group-hover:opacity-100" style={{
        background: C.dark,
        borderColor: C.border
      }}>
            {item.label}
          </div> : null}
      </NavLink>;
  }
  return <div>
      <PeractButton action={() => setOpen(!open)} className="group relative w-full justify-start gap-3 px-3 py-2.5" style={{
      color: isChildActive ? C.accent : C.text
    }} theme="secondary" title={collapsed ? item.label : undefined}>
        <span className="shrink-0">{item.icon}</span>
        {!collapsed ? <>
            <span className="flex-1 truncate text-left text-sm">{item.label}</span>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </> : null}
        {collapsed ? <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded border px-2 py-1 text-xs text-white opacity-0 shadow-lg group-hover:opacity-100" style={{
        background: C.dark,
        borderColor: C.border
      }}>
            {item.label}
          </div> : null}
      </PeractButton>
      {!collapsed && open ? <div className="animate-in fade-in-0 slide-in-from-top-1 duration-150 mt-1 ml-8 flex flex-col gap-1">
          {item.children?.map(child => <NavLink key={child.path} className="rounded-lg px-3 py-2 text-sm transition-all duration-150" onClick={onMobileClose} style={({
        isActive
      }) => isActive ? {
        background: `${C.accent}18`,
        color: C.accent,
        fontWeight: 500
      } : {
        color: C.textMid
      }} to={child.path}>
             <span className="flex items-center gap-2">
               {child.icon ? <span className="shrink-0">{child.icon}</span> : null}
               {child.label}
             </span>
           </NavLink>)}
        </div> : null}
    </div>;
}
export function AppLayout() {
  const {
    logout,
    currentUser
  } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = currentUser?.cargo === "Administrador";
  const navItems = ALL_NAV_ITEMS
    .filter(item => isAdmin || !item.adminOnly)
    .map(item => ({
      ...item,
      children: item.children?.filter(child => isAdmin || !child.adminOnly),
    }));
  const isAdminRoute = ALL_NAV_ITEMS.some(item => {
    const protectedPaths = item.adminOnly
      ? [item.path, ...(item.children?.map(child => child.path) ?? [])]
      : item.children?.filter(child => child.adminOnly).map(child => child.path) ?? [];
    return protectedPaths.some(path =>
      path && (location.pathname === path || location.pathname.startsWith(`${path}/`)));
  });
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Início";
    if (path === "/estoque/produtos") return "Estoque – Perfumes";
    if (path === "/estoque/categorias") return "Categorias";
    if (path === "/decants") return "Decants";
    if (path === "/bodysplash") return "Body Splash";
    if (path === "/vendas/registrar") return "Registrar Venda";
    if (path === "/vendas/historico") return "Histórico de Vendas";
    if (path === "/vendas/pedidos") return "Pedidos Online";
    if (path === "/clientes") return "Gerenciamento";
    if (path === "/configuracoes") return "Configurações";
    return "Canal Perfumado Decants";
  };
  if (!currentUser) return null;
  if (currentUser.cargo !== "Administrador" && currentUser.cargo !== "Funcionário") {
    return <div className="p-6" role="alert">
      <p className="text-sm text-red-600">Não foi possível verificar suas permissões. Entre novamente.</p>
      <PeractButtonPrimitive onClick={logout} variant="plain" size="plain" className="mt-3 px-3 py-2 border peract-border-color rounded-lg">Sair</PeractButtonPrimitive>
    </div>;
  }
  if (!isAdmin && isAdminRoute) return <Navigate to="/" replace />;
  const pageTitle = getPageTitle();
  const pageNavItem = ALL_NAV_ITEMS.find(item => item.path === location.pathname || item.children?.some(child => child.path === location.pathname));
  const userName = currentUser.nome?.trim() || "Usuário";
  const userInitials = userName.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  return <div className="peract-bg-page flex h-screen overflow-hidden">
      {mobileMenuOpen ? <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)} /> : null}

      <aside className={`peract-sidebar-shell fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col transition-all duration-300 lg:relative ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        <div className={`flex shrink-0 items-center gap-3 border-b px-3 py-4 ${sidebarCollapsed ? "justify-center" : ""}`} style={{
        borderColor: C.border
      }}>
          <img src={logoImg} alt="Canal Perfumado" className="h-10 w-10 shrink-0 rounded-full border-2 object-cover" style={{
          borderColor: C.accent
        }} />
          {!sidebarCollapsed ? <div className="min-w-0">
              <p className="truncate text-xs font-medium leading-tight" style={{
            color: C.dark
          }}>Canal Perfumado</p>
              <PeractTag className="w-fit px-0" style={{
            background: "transparent",
            color: C.accent
          }}>Decants</PeractTag>
            </div> : null}
          <PeractButton action={() => setMobileMenuOpen(false)} className="ml-auto h-8 w-8 rounded-lg peract-font-color-muted hover:bg-gray-100 lg:hidden" size="icon" theme="secondary"><X size={18} /></PeractButton>
        </div>

        {!sidebarCollapsed && currentUser ? <div className="mx-3 mt-2 mb-1 flex items-center gap-2 rounded-lg px-3 py-1.5" style={{
        background: "var(--color-sidebar-accent)",
        border: "1px solid var(--color-sidebar-border)"
      }}>
            {isAdmin ? <ShieldCheck size={13} style={{
          color: "var(--color-sidebar-primary)"
        }} /> : <UserCheck size={13} style={{
          color: "#6366f1"
        }} />}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium" style={{
            color: isAdmin ? "var(--color-sidebar-primary)" : "#6366f1"
          }}>{currentUser.nome}</p>
              <p className="truncate text-xs" style={{
            color: "var(--color-muted-foreground)"
          }}>{currentUser.cargo}</p>
            </div>
          </div> : null}

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {navItems.map(item => <SidebarItem key={item.label} collapsed={sidebarCollapsed} item={item} onMobileClose={() => setMobileMenuOpen(false)} />)}
        </nav>

        <GuidedSystemTour collapsed={sidebarCollapsed} isAdmin={isAdmin} onStart={() => setMobileMenuOpen(false)} />

        <div className="hidden shrink-0 border-t p-2 lg:block" style={{
        borderColor: C.border
      }}>
          <PeractButton action={() => setSidebarCollapsed(!sidebarCollapsed)} className="h-9 min-h-9 w-full justify-center gap-2 px-3 py-2 text-xs hover:bg-gray-100" style={{
          color: C.textMid
        }} theme="secondary">
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!sidebarCollapsed ? <span>Recolher</span> : null}
          </PeractButton>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="peract-header-shell flex h-14 sm:h-16 shrink-0 items-center gap-3 px-3 sm:px-6">
          <PeractButtonPrimitive onClick={() => setMobileMenuOpen(true)} className="h-9 w-9 shrink-0 rounded-md peract-font-color-muted hover:bg-gray-100 lg:hidden" variant="plain" size="plain" aria-label="Abrir menu" title="Abrir menu">
            <Menu size={20} />
          </PeractButtonPrimitive>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span aria-hidden="true" className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md peract-bg-accent-soft peract-font-color-accent sm:flex">
              {pageNavItem?.icon ?? <LayoutDashboard size={20} />}
            </span>
            <span className="truncate text-sm font-semibold peract-font-color-default" title={pageTitle}>{pageTitle}</span>
          </div>

          <div className="flex shrink-0 items-center gap-3 border-l peract-border-color pl-3 sm:gap-4 sm:pl-4">
            <div className="flex min-w-0 items-center gap-2.5" title={`${userName} (${currentUser.cargo})`}>
              <span role="img" aria-label={`Perfil de ${userName}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border peract-border-color peract-bg-accent-soft text-xs font-semibold peract-font-color-accent">
                {userInitials}
              </span>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-[160px] truncate text-xs font-medium peract-font-color-default">{userName}</p>
                {userName !== currentUser.cargo && <p className="mt-0.5 text-[11px] leading-tight peract-font-color-muted">{currentUser.cargo}</p>}
              </div>
            </div>
            <PeractButtonPrimitive onClick={() => void logout()} aria-label="Sair" className="h-9 w-9 shrink-0 rounded-md border peract-border-color peract-font-color-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700" variant="plain" size="plain" title="Sair">
              <LogOut size={17} />
            </PeractButtonPrimitive>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>;
}
