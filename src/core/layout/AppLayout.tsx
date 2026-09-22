import { PeractButtonPrimitive } from "../../shared/components/peract-button";
import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router";
import logoImg from "figma:asset/19603bc35fe7f283ff1a83c590f928c9d0bfe9cf.png";
import { LayoutDashboard, Package, ChevronDown, ChevronRight, Menu, X, User, ChevronLeft, Droplets, ShoppingBag, Users, Settings, Bell, LogOut, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import { useApp } from "../../app/context/AppContext";
import { PeractButton } from "../../shared/components/peract-button";
import { PeractTag } from "../../shared/components/peract-tag";
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
  }[];
}
const ALL_NAV_ITEMS: NavItem[] = [{
  label: "Início",
  icon: <LayoutDashboard size={20} />,
  path: "/"
}, {
  label: "Estoque",
  icon: <Package size={20} />,
  adminOnly: true,
  children: [{
    label: "Produtos",
    path: "/estoque/produtos"
  }, {
    label: "Categorias",
    path: "/estoque/categorias"
  }]
}, {
  label: "Decants",
  icon: <Droplets size={20} />,
  path: "/decants"
}, {
  label: "Body Splash",
  icon: <Sparkles size={20} />,
  path: "/bodysplash"
}, {
  label: "Vendas",
  icon: <ShoppingBag size={20} />,
  children: [{
    label: "Registrar Venda",
    path: "/vendas/registrar"
  }, {
    label: "Histórico de Vendas",
    path: "/vendas/historico"
  }, {
    label: "Pedidos Online",
    path: "/vendas/pedidos"
  }]
}, {
  label: "Gestão de Pessoas",
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
      {!collapsed && open ? <div className="mt-1 ml-8 flex flex-col gap-1">
          {item.children?.map(child => <NavLink key={child.path} className="rounded-lg px-3 py-2 text-sm transition-all duration-150" onClick={onMobileClose} style={({
        isActive
      }) => isActive ? {
        background: `${C.accent}18`,
        color: C.accent,
        fontWeight: 500
      } : {
        color: C.textMid
      }} to={child.path}>
              {child.label}
            </NavLink>)}
        </div> : null}
    </div>;
}
function NotificationPanel({
  onClose
}: {
  onClose: () => void;
}) {
  const {
    notifications,
    dismissNotification,
    markAllRead
  } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);
  const unreadCount = notifications.filter(notification => !notification.read).length;
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return "Agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return new Date(timestamp).toLocaleDateString("pt-BR");
  };
  return <div ref={ref} className="peract-bg-card peract-border-default peract-radius-xl absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b peract-border-color px-4 py-3">
        <div>
          <p className="text-sm font-medium peract-font-color-default">Notificações</p>
          {unreadCount > 0 ? <p className="text-xs peract-font-color-accent">{unreadCount} não lida(s)</p> : null}
        </div>
        {notifications.length > 0 ? <PeractButtonPrimitive className="text-xs peract-font-color-muted transition-colors hover:text-gray-600" onClick={markAllRead} variant="plain" size="plain">Marcar todas lidas</PeractButtonPrimitive> : null}
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? <div className="flex flex-col items-center justify-center py-10 peract-font-color-muted">
            <Bell size={28} className="mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma notificação</p>
            <p className="mt-0.5 text-xs">Alertas de estoque aparecem aqui</p>
          </div> : notifications.map(notification => <div key={notification.id} className={`flex items-start gap-3 border-b border-gray-50 px-4 py-3 last:border-0 ${!notification.read ? "bg-amber-50/40" : "peract-bg-card"}`}>
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{
          background: notification.type === "out_of_stock" ? "#fee2e2" : "#fef3c7"
        }}>
              <Package size={14} style={{
            color: notification.type === "out_of_stock" ? "#dc2626" : "#92400e"
          }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-snug peract-font-color-default">{notification.message}</p>
              <p className="mt-0.5 text-xs peract-font-color-muted">{formatTime(notification.timestamp)}</p>
            </div>
            <PeractButtonPrimitive aria-label="Dispensar" className="mt-0.5 shrink-0 text-gray-300 transition-colors hover:text-gray-500" onClick={() => dismissNotification(notification.id)} variant="plain" size="plain">
              <X size={13} />
            </PeractButtonPrimitive>
          </div>)}
      </div>
    </div>;
}
export function AppLayout() {
  const {
    notifications,
    logout,
    currentUser
  } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const isAdmin = currentUser?.cargo === "Administrador";
  const navItems = ALL_NAV_ITEMS.filter(item => isAdmin || !item.adminOnly);
  const unread = notifications.filter(notification => !notification.read).length;
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Início";
    if (path === "/estoque/produtos") return "Estoque – Produtos";
    if (path === "/estoque/categorias") return "Categorias";
    if (path === "/decants") return "Decants";
    if (path === "/bodysplash") return "Body Splash";
    if (path === "/vendas/registrar") return "Registrar Venda";
    if (path === "/vendas/historico") return "Histórico de Vendas";
    if (path === "/vendas/pedidos") return "Pedidos Online";
    if (path === "/clientes") return "Gestão de Pessoas";
    if (path === "/configuracoes") return "Configurações";
    return "Canal Perfumado Decants";
  };
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

        <div className="hidden shrink-0 border-t p-2 lg:block" style={{
        borderColor: C.border
      }}>
          <PeractButton action={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full justify-center gap-2 text-sm hover:bg-gray-100" style={{
          color: C.textMid
        }} theme="secondary">
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!sidebarCollapsed ? <span>Recolher</span> : null}
          </PeractButton>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="peract-header-shell flex h-14 shrink-0 items-center gap-3 px-4">
          <PeractButton action={() => setMobileMenuOpen(true)} className="h-9 w-9 rounded-lg hover:bg-gray-100 lg:hidden" size="icon" style={{
          color: C.textMid
        }} theme="secondary"><Menu size={22} /></PeractButton>
          <span className="truncate text-sm font-medium" style={{
          color: C.dark
        }}>{getPageTitle()}</span>

          <div className="ml-auto flex items-center gap-1">
            <div className="relative">
              <PeractButton action={() => setNotifOpen(!notifOpen)} aria-label="Notificações" className="relative h-9 w-9 rounded-lg hover:bg-gray-100" size="icon" style={{
              color: C.textMid
            }} theme="secondary">
                <Bell size={18} />
                {unread > 0 ? <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white" style={{
                background: "#dc2626"
              }}>{unread > 9 ? "9+" : unread}</span> : null}
              </PeractButton>
              {notifOpen ? <NotificationPanel onClose={() => setNotifOpen(false)} /> : null}
            </div>

            <div className="ml-1 flex items-center gap-2 border-l pl-2" style={{
            borderColor: C.border
          }}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-white" style={{
              background: isAdmin ? C.accent : "#6366f1"
            }}>
                <User size={16} />
              </div>
              <div className="hidden md:block">
                <p className="max-w-[120px] truncate text-xs font-medium leading-tight" style={{
                color: C.dark
              }}>{currentUser?.nome ?? "Usuário"}</p>
                <PeractTag className="mt-1 w-fit border-0 px-0" icon={isAdmin ? <ShieldCheck size={10} /> : <UserCheck size={10} />} style={{
                background: "transparent",
                color: isAdmin ? C.accent : "#6366f1"
              }}>{currentUser?.cargo ?? ""}</PeractTag>
              </div>
              <PeractButton action={() => void logout()} aria-label="Sair" className="ml-1 gap-2 rounded-lg hover:bg-gray-100" icon={<LogOut size={15} />} size="sm" style={{
              color: C.textMid
            }} theme="secondary" title="Sair">
                <span className="hidden md:inline">Sair</span>
              </PeractButton>
            </div>
          </div>
        </header>

        {!isAdmin ? <div className="shrink-0 border-b px-4 py-1.5 text-xs text-[#4f46e5]" style={{
        background: "rgba(99,102,241,0.07)",
        borderColor: "rgba(99,102,241,0.15)"
      }}>
            <div className="flex items-center gap-2">
              <UserCheck size={12} />
              <span>Você está logado como <strong>Funcionário</strong>. Algumas funcionalidades administrativas estão ocultas.</span>
            </div>
          </div> : null}

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>;
}
