"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";
import { useIsMobile } from "../ui/use-mobile";
import { cn } from "../ui/utils";
import { PeractButtonPrimitive as Button } from "../peract-button";
import { PeractInputControl as Input } from "../peract-input";
import { PeractSeparator as Separator } from "../peract-separator";
import { PeractSheet as Sheet, PeractSheetContent as SheetContent, PeractSheetDescription as SheetDescription, PeractSheetHeader as SheetHeader, PeractSheetTitle as SheetTitle } from "../peract-sheet";
import { PeractSkeleton as Skeleton } from "../peract-skeleton";
import { PeractTooltip as Tooltip, PeractTooltipContent as TooltipContent, PeractTooltipProvider as TooltipProvider, PeractTooltipTrigger as TooltipTrigger } from "../peract-tooltip";
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};
const SidebarContext = React.createContext<SidebarContextProps | null>(null);
function usePeractSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
function PeractSidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback((value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value;
    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      _setOpen(openState);
    }

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, [setOpenProp, open]);

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo<SidebarContextProps>(() => ({
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar
  }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]);
  return <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div data-slot="sidebar-wrapper" style={{
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      } as React.CSSProperties} className={cn("peract-sans-font group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full", className)} {...props}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>;
}
function PeractSidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const {
    isMobile,
    state,
    openMobile,
    setOpenMobile
  } = usePeractSidebar();
  if (collapsible === "none") {
    return <div data-slot="sidebar" className={cn("peract-sans-font bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col", className)} {...props}>
        {children}
      </div>;
  }
  if (isMobile) {
    return <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent data-sidebar="sidebar" data-slot="sidebar" data-mobile="true" className="peract-sans-font bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden" style={{
        "--sidebar-width": SIDEBAR_WIDTH_MOBILE
      } as React.CSSProperties} side={side}>
          <SheetHeader className="peract-sans-font sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="peract-sans-font flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>;
  }
  return <div className="peract-sans-font group peer text-sidebar-foreground hidden md:block" data-state={state} data-collapsible={state === "collapsed" ? collapsible : ""} data-variant={variant} data-side={side} data-slot="sidebar">
      {/* This is what handles the sidebar gap on desktop */}
      <div data-slot="sidebar-gap" className={cn("peract-sans-font relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "peract-sans-font group-data-[collapsible=offcanvas]:w-0", "peract-sans-font group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)")} />
      <div data-slot="sidebar-container" className={cn("peract-sans-font fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex", side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
    // Adjust the padding for floating and inset variants.
    variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l", className)} {...props}>
        <div data-sidebar="sidebar" data-slot="sidebar-inner" className="peract-sans-font bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm">
          {children}
        </div>
      </div>
    </div>;
}
function PeractSidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const {
    toggleSidebar
  } = usePeractSidebar();
  return <Button data-sidebar="trigger" data-slot="sidebar-trigger" variant="ghost" size="icon" className={cn("peract-sans-font size-7", className)} onClick={event => {
    onClick?.(event);
    toggleSidebar();
  }} {...props}>
      <PanelLeftIcon />
      <span className="peract-sans-font sr-only">Toggle Sidebar</span>
    </Button>;
}
function PeractSidebarRail({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const {
    toggleSidebar
  } = usePeractSidebar();
  return <button data-sidebar="rail" data-slot="sidebar-rail" aria-label="Toggle Sidebar" tabIndex={-1} onClick={toggleSidebar} title="Toggle Sidebar" className={cn("peract-sans-font hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex", "peract-sans-font in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize", "peract-sans-font [[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "peract-sans-font hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full", "peract-sans-font [[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "peract-sans-font [[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className)} {...props} />;
}
function PeractSidebarInset({
  className,
  ...props
}: React.ComponentProps<"main">) {
  return <main data-slot="sidebar-inset" className={cn("peract-sans-font peract-bg-page relative flex w-full flex-1 flex-col", "peract-sans-font md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2", className)} {...props} />;
}
function PeractSidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return <Input data-slot="sidebar-input" data-sidebar="input" className={cn("peract-sans-font peract-bg-page h-8 w-full shadow-none", className)} {...props} />;
}
function PeractSidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" data-sidebar="header" className={cn("peract-sans-font flex flex-col gap-2 p-2", className)} {...props} />;
}
function PeractSidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" data-sidebar="footer" className={cn("peract-sans-font flex flex-col gap-2 p-2", className)} {...props} />;
}
function PeractSidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="sidebar-separator" data-sidebar="separator" className={cn("peract-sans-font bg-sidebar-border mx-2 w-auto", className)} {...props} />;
}
function PeractSidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-content" data-sidebar="content" className={cn("peract-sans-font flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)} {...props} />;
}
function PeractSidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group" data-sidebar="group" className={cn("peract-sans-font relative flex w-full min-w-0 flex-col p-2", className)} {...props} />;
}
function PeractSidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "div";
  return <Comp data-slot="sidebar-group-label" data-sidebar="group-label" className={cn("peract-sans-font text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center peract-radius-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "peract-sans-font group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className)} {...props} />;
}
function PeractSidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="sidebar-group-action" data-sidebar="group-action" className={cn("peract-sans-font text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center peract-radius-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
  // Increases the hit area of the button on mobile.
  "peract-sans-font after:absolute after:-inset-2 md:after:hidden", "peract-sans-font group-data-[collapsible=icon]:hidden", className)} {...props} />;
}
function PeractSidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group-content" data-sidebar="group-content" className={cn("peract-sans-font w-full text-sm", className)} {...props} />;
}
function PeractSidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" data-sidebar="menu" className={cn("peract-sans-font flex w-full min-w-0 flex-col gap-1", className)} {...props} />;
}
function PeractSidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn("peract-sans-font group/menu-item relative", className)} {...props} />;
}
const sidebarMenuButtonVariants = cva("peract-sans-font peer/menu-button flex w-full items-center gap-2 overflow-hidden peract-radius-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    variant: {
      default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
    },
    size: {
      default: "h-8 text-sm",
      sm: "h-7 text-xs",
      lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
function PeractSidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button";
  const {
    isMobile,
    state
  } = usePeractSidebar();
  const button = <Comp data-slot="sidebar-menu-button" data-sidebar="menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants({
    variant,
    size
  }), className)} {...props} />;
  if (!tooltip) {
    return button;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip} />
    </Tooltip>;
}
function PeractSidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="sidebar-menu-action" data-sidebar="menu-action" className={cn("peract-sans-font text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center peract-radius-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
  // Increases the hit area of the button on mobile.
  "peract-sans-font after:absolute after:-inset-2 md:after:hidden", "peract-sans-font peer-data-[size=sm]/menu-button:top-1", "peract-sans-font peer-data-[size=default]/menu-button:top-1.5", "peract-sans-font peer-data-[size=lg]/menu-button:top-2.5", "peract-sans-font group-data-[collapsible=icon]:hidden", showOnHover && "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0", className)} {...props} />;
}
function PeractSidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-menu-badge" data-sidebar="menu-badge" className={cn("peract-sans-font text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center peract-radius-md px-1 text-xs font-medium tabular-nums select-none", "peract-sans-font peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peract-sans-font peer-data-[size=sm]/menu-button:top-1", "peract-sans-font peer-data-[size=default]/menu-button:top-1.5", "peract-sans-font peer-data-[size=lg]/menu-button:top-2.5", "peract-sans-font group-data-[collapsible=icon]:hidden", className)} {...props} />;
}
function PeractSidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return <div data-slot="sidebar-menu-skeleton" data-sidebar="menu-skeleton" className={cn("peract-sans-font flex h-8 items-center gap-2 peract-radius-md px-2", className)} {...props}>
      {showIcon && <Skeleton className="peract-sans-font size-4 peract-radius-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton className="peract-sans-font h-4 max-w-(--skeleton-width) flex-1" data-sidebar="menu-skeleton-text" style={{
      "--skeleton-width": width
    } as React.CSSProperties} />
    </div>;
}
function PeractSidebarMenuSub({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu-sub" data-sidebar="menu-sub" className={cn("peract-sans-font border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5", "peract-sans-font group-data-[collapsible=icon]:hidden", className)} {...props} />;
}
function PeractSidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-sub-item" data-sidebar="menu-sub-item" className={cn("peract-sans-font group/menu-sub-item relative", className)} {...props} />;
}
function PeractSidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : "a";
  return <Comp data-slot="sidebar-menu-sub-button" data-sidebar="menu-sub-button" data-size={size} data-active={isActive} className={cn("peract-sans-font text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden peract-radius-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", "peract-sans-font data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "peract-sans-font group-data-[collapsible=icon]:hidden", className)} {...props} />;
}
export { PeractSidebar, PeractSidebarContent, PeractSidebarFooter, PeractSidebarGroup, PeractSidebarGroupAction, PeractSidebarGroupContent, PeractSidebarGroupLabel, PeractSidebarHeader, PeractSidebarInput, PeractSidebarInset, PeractSidebarMenu, PeractSidebarMenuAction, PeractSidebarMenuBadge, PeractSidebarMenuButton, PeractSidebarMenuItem, PeractSidebarMenuSkeleton, PeractSidebarMenuSub, PeractSidebarMenuSubButton, PeractSidebarMenuSubItem, PeractSidebarProvider, PeractSidebarRail, PeractSidebarSeparator, PeractSidebarTrigger, usePeractSidebar };
