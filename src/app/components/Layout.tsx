import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router";
import logoImg from "figma:asset/19603bc35fe7f283ff1a83c590f928c9d0bfe9cf.png";
import {
  LayoutDashboard, Package, ChevronDown, ChevronRight, Menu, X,
  User, ChevronLeft, Droplets, ShoppingBag, Users, Settings,
  Bell, LogOut, ShieldCheck, UserCheck, Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";

/* ─── Brand palette — resolved via CSS vars so high-contrast overrides apply ─── */
const C = {
  bg:      "var(--color-sidebar)",
  pageBg:  "var(--color-background)",
  accent:  "var(--color-sidebar-primary)",
  dark:    "var(--color-sidebar-foreground)",
  text:    "var(--color-sidebar-foreground)",
  textMid: "var(--color-muted-foreground)",
  hover:   "var(--color-sidebar-accent)",
  border:  "var(--color-sidebar-border)",
};

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  adminOnly?: boolean;
  children?: { label: string; path: string }[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  { label: "Início",   icon: <LayoutDashboard size={20} />, path: "/" },
  {
    label: "Estoque",
    icon: <Package size={20} />,
    adminOnly: true,
    children: [
      { label: "Produtos",    path: "/estoque/produtos" },
      { label: "Categorias",  path: "/estoque/categorias" },
    ],
  },
  { label: "Decants",     icon: <Droplets size={20} />, path: "/decants" },
  { label: "Body Splash", icon: <Sparkles size={20} />, path: "/bodysplash" },
  {
    label: "Vendas",
    icon: <ShoppingBag size={20} />,
    children: [
      { label: "Registrar Venda",     path: "/vendas/registrar" },
      { label: "Histórico de Vendas", path: "/vendas/historico" },
      { label: "Pedidos Online",      path: "/vendas/pedidos" },
    ],
  },
  { label: "Gestão de Pessoas", icon: <Users size={20} />, path: "/clientes", adminOnly: true },
  { label: "Configurações",     icon: <Settings size={20} />,     path: "/configuracoes", adminOnly: true },
];

function SidebarItem({ item, collapsed, onMobileClose }: {
  item: NavItem; collapsed: boolean; onMobileClose?: () => void;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(() =>
    item.children ? item.children.some((c) => location.pathname.startsWith(c.path)) : false
  );
  const isChildActive = item.children?.some((c) => location.pathname === c.path) ?? false;

  if (item.path) {
    return (
      <NavLink to={item.path} onClick={onMobileClose} end={item.path === "/"} title={collapsed ? item.label : undefined}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative"
        style={({ isActive }) => isActive
          ? { background: C.accent, color: "#fff" }
          : { color: C.text }
        }
      >
        {({ isActive }) => (
          <>
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-sm truncate">{item.label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border"
                style={{ background: C.dark, borderColor: C.border }}>
                {item.label}
              </div>
            )}
          </>
        )}
      </NavLink>
    );
  }

  return (
    <div>
      <button onClick={() => setOpen(!open)} title={collapsed ? item.label : undefined}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative"
        style={{ color: isChildActive ? C.accent : C.text }}>
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="text-sm truncate flex-1 text-left">{item.label}</span>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </>
        )}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border"
            style={{ background: C.dark, borderColor: C.border }}>
            {item.label}
          </div>
        )}
      </button>
      {!collapsed && open && (
        <div className="ml-8 mt-1 flex flex-col gap-1">
          {item.children?.map((child) => (
            <NavLink key={child.path} to={child.path} onClick={onMobileClose}
              className="text-sm px-3 py-2 rounded-lg transition-all duration-150"
              style={({ isActive }) => isActive
                ? { background: `${C.accent}18`, color: C.accent, fontWeight: 500 }
                : { color: C.textMid }
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Notification panel ─── */
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, dismissNotification, markAllRead } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "Agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return new Date(ts).toLocaleDateString("pt-BR");
  };

  return (
    <div ref={ref} className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-800">Notificações</p>
          {unreadCount > 0 && <p className="text-xs" style={{ color: C.accent }}>{unreadCount} não lida(s)</p>}
        </div>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Marcar todas lidas</button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Bell size={28} className="mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma notificação</p>
            <p className="text-xs mt-0.5">Alertas de estoque aparecem aqui</p>
          </div>
        ) : notifications.map((n) => (
          <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${!n.read ? "bg-amber-50/40" : "bg-white"}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: n.type === "out_of_stock" ? "#fee2e2" : "#fef3c7" }}>
              <Package size={14} style={{ color: n.type === "out_of_stock" ? "#dc2626" : "#92400e" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-800 leading-snug">{n.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatTime(n.timestamp)}</p>
            </div>
            <button onClick={() => dismissNotification(n.id)} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5" aria-label="Dispensar">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Layout() {
  const { notifications, logout, currentUser } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();

  const isAdmin = currentUser?.cargo === "Administrador";
  const navItems = ALL_NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly);
  const unread = notifications.filter((n) => !n.read).length;

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

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.pageBg }}>
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`flex flex-col shrink-0 transition-all duration-300 z-50 fixed lg:relative inset-y-0 left-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarCollapsed ? "w-16" : "w-64"}`}
        style={{ background: C.bg, borderRight: `1px solid ${C.border}` }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-3 py-4 shrink-0 ${sidebarCollapsed ? "justify-center" : ""}`}
          style={{ borderBottom: `1px solid ${C.border}` }}>
          <img src={logoImg} alt="Canal Perfumado" className="w-10 h-10 rounded-full object-cover shrink-0 border-2" style={{ borderColor: C.accent }} />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium leading-tight truncate" style={{ color: C.dark }}>Canal Perfumado</p>
              <p className="text-xs truncate" style={{ color: C.accent }}>Decants</p>
            </div>
          )}
          <button className="lg:hidden ml-auto p-1 rounded transition-colors hover:bg-gray-100" style={{ color: C.textMid }} onClick={() => setMobileMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Role badge */}
        {!sidebarCollapsed && currentUser && (
          <div className="mx-3 mt-2 mb-1 px-3 py-1.5 rounded-lg flex items-center gap-2"
            style={{ background: "var(--color-sidebar-accent)", border: "1px solid var(--color-sidebar-border)" }}>
            {isAdmin
              ? <ShieldCheck size={13} style={{ color: "var(--color-sidebar-primary)" }} />
              : <UserCheck size={13} style={{ color: "#6366f1" }} />}
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: isAdmin ? "var(--color-sidebar-primary)" : "#6366f1" }}>{currentUser.nome}</p>
              <p className="text-xs truncate" style={{ color: "var(--color-muted-foreground)" }}>{currentUser.cargo}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <SidebarItem key={item.label} item={item} collapsed={sidebarCollapsed} onMobileClose={() => setMobileMenuOpen(false)} />
          ))}
        </nav>

        <div className="p-2 hidden lg:block shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all text-sm hover:bg-gray-100"
            style={{ color: C.textMid }}>
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!sidebarCollapsed && <span>Recolher</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="shrink-0 flex items-center gap-3 px-4 h-14 z-30"
          style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
          <button className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-gray-100" style={{ color: C.textMid }} onClick={() => setMobileMenuOpen(true)}>
            <Menu size={22} />
          </button>

          <span className="text-sm font-medium truncate" style={{ color: C.dark }}>{getPageTitle()}</span>

          <div className="ml-auto flex items-center gap-1">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg transition-all hover:bg-gray-100"
                style={{ color: C.textMid }} aria-label="Notificações">
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-medium"
                    style={{ background: "#dc2626" }}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>

            <div className="flex items-center gap-2 ml-1 pl-2" style={{ borderLeft: `1px solid ${C.border}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shrink-0"
                style={{ background: isAdmin ? C.accent : "#6366f1" }}>
                <User size={16} />
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-medium leading-tight truncate max-w-[120px]" style={{ color: C.dark }}>{currentUser?.nome ?? "Usuário"}</p>
                <p className="text-xs flex items-center gap-1" style={{ color: isAdmin ? C.accent : "#6366f1" }}>
                  {isAdmin ? <ShieldCheck size={10} /> : <UserCheck size={10} />}
                  {currentUser?.cargo ?? ""}
                </p>
              </div>
              <button onClick={logout} className="ml-1 p-1.5 rounded-lg transition-all hover:bg-gray-100"
                style={{ color: C.textMid }} title="Sair" aria-label="Sair">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Funcionário notice */}
        {!isAdmin && (
          <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 text-xs" style={{ background: "rgba(99,102,241,0.07)", borderBottom: "1px solid rgba(99,102,241,0.15)", color: "#4f46e5" }}>
            <UserCheck size={12} />
            <span>Você está logado como <strong>Funcionário</strong>. Algumas funcionalidades administrativas estão ocultas.</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}