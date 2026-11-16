import { useEffect, useState } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SystemTourStep } from "./systemTour";

const { isMobileState, compactSidebarState, joyrideProps, toastError } = vi.hoisted(() => ({
  isMobileState: { value: false },
  compactSidebarState: { value: false },
  joyrideProps: { current: undefined as unknown },
  toastError: vi.fn(),
}));

vi.mock("../../shared/hooks/useIsMobile", () => ({
  useIsMobile: (breakpoint?: number) => breakpoint === 1024 ? compactSidebarState.value : isMobileState.value,
}));
vi.mock("../../shared/services/action-toast", () => ({ actionToast: { error: toastError } }));

vi.mock("react-joyride", () => ({
  default: (props: unknown) => {
    joyrideProps.current = props;
    return null;
  },
  ACTIONS: { CLOSE: "close", PREV: "prev", SKIP: "skip" },
  EVENTS: { STEP_AFTER: "step:after", TARGET_NOT_FOUND: "error:target_not_found" },
  STATUS: { FINISHED: "finished", SKIPPED: "skipped" },
}));

import { SystemTourRunner } from "./SystemTourRunner";

const steps: SystemTourStep[] = [{
  target: "[data-tour='test-target']",
  content: "Texto explicativo do tour.",
  route: "/",
}];

function renderTour(isMobile: boolean) {
  isMobileState.value = isMobile;
  compactSidebarState.value = isMobile;
  const onFinish = vi.fn();

  render(
    <MemoryRouter initialEntries={["/"]}>
      <div data-tour="test-target" />
      <SystemTourRunner steps={steps} onFinish={onFinish} />
    </MemoryRouter>,
  );

  return onFinish;
}

describe("SystemTourRunner controls", () => {
  beforeEach(() => {
    isMobileState.value = false;
    compactSidebarState.value = false;
    joyrideProps.current = undefined;
    toastError.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("portals fixed controls to the viewport on mobile and hides Joyride footer", async () => {
    const onFinish = renderTour(true);

    const controls = await screen.findByRole("group", { name: "Controles do tour" });
    await waitFor(() => expect(joyrideProps.current).toBeDefined());

    expect(controls.parentElement).toBe(document.body);
    expect(controls).toHaveStyle({ position: "fixed" });
    expect(screen.getAllByRole("button").map(button => button.getAttribute("aria-label"))).toEqual([
      "Finalizar tour",
      "Voltar",
      "Concluir tour",
    ]);
    expect(screen.getByRole("button", { name: "Voltar" })).toBeDisabled();
    expect(screen.getByLabelText("Etapa 1 de 1")).toHaveTextContent("1/1");
    expect((joyrideProps.current as { styles: { tooltipFooter: object } }).styles.tooltipFooter).toEqual({ display: "none" });
    const mobileProps = joyrideProps.current as {
      steps: Array<{
        placement: string;
        floaterProps: {
          disableFlip: boolean;
          options: {
            flip: { enabled: boolean };
            preventOverflow: { boundariesElement: string; padding: { bottom: number } };
          };
        };
      }>;
      styles: { tooltip: { maxHeight: string } };
    };
    expect(mobileProps.steps[0].placement).toBe("top");
    expect(mobileProps.steps[0].floaterProps.disableFlip).toBe(false);
    expect(mobileProps.steps[0].floaterProps.options.flip.enabled).toBe(true);
    expect(mobileProps.steps[0].floaterProps.options.preventOverflow.boundariesElement).toBe("viewport");
    expect(mobileProps.steps[0].floaterProps.options.preventOverflow.padding.bottom).toBeGreaterThan(53);
    expect(mobileProps.styles.tooltip.maxHeight).toContain("100dvh");

    fireEvent.click(screen.getByRole("button", { name: "Finalizar tour" }));
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("keeps the Joyride controls on desktop", async () => {
    renderTour(false);

    await waitFor(() => expect(joyrideProps.current).toBeDefined());

    expect(screen.queryByRole("group", { name: "Controles do tour" })).not.toBeInTheDocument();
    expect((joyrideProps.current as { styles: { tooltipFooter: object } }).styles.tooltipFooter).toEqual({ marginTop: 10 });
  });

  it.each([
    [false, false, '[data-tour="sidebar"]', "right"],
    [false, true, '[data-tour="menu"]', "bottom"],
    [true, true, '[data-tour="menu"]', "bottom"],
  ])("highlights the visible navigation for mobile=%s and compact sidebar=%s", async (mobile, compact, target, placement) => {
    isMobileState.value = mobile;
    compactSidebarState.value = compact;
    render(
      <MemoryRouter>
        <nav data-tour="sidebar" />
        <button data-tour="menu">Abrir menu</button>
        <SystemTourRunner steps={[{
          route: "/",
          target: '[data-tour="sidebar"]',
          compactTargetSelector: '[data-tour="menu"]',
          placement: "right",
          content: "Navegação",
        }]} onFinish={vi.fn()} />
      </MemoryRouter>,
    );

    await waitFor(() => expect((joyrideProps.current as { run: boolean }).run).toBe(true));
    expect((joyrideProps.current as { steps: SystemTourStep[] }).steps[0]).toMatchObject({ target, placement });
  });

  it("waits for a late tab before displaying its target", async () => {
    function DelayedTab() {
      const [ready, setReady] = useState(false);
      const [selected, setSelected] = useState(false);
      useEffect(() => {
        const timer = window.setTimeout(() => setReady(true), 150);
        return () => window.clearTimeout(timer);
      }, []);
      return <>
        {ready && <button data-tour="tab" aria-pressed={selected} onClick={() => setSelected(true)}>Selecionar aba</button>}
        {selected && <div data-tour="tab-content">Conteúdo selecionado</div>}
      </>;
    }

    render(
      <MemoryRouter>
        <DelayedTab />
        <SystemTourRunner steps={[{
          route: "/",
          target: '[data-tour="tab-content"]',
          beforeTargetSelector: '[data-tour="tab"]',
          content: "Aba",
        }]} onFinish={vi.fn()} />
      </MemoryRouter>,
    );

    await screen.findByText("Conteúdo selecionado");
    await waitFor(() => expect((joyrideProps.current as { run: boolean }).run).toBe(true));
    expect(toastError).not.toHaveBeenCalled();
  });

  it("preserves filters when consecutive steps use the selected tab", async () => {
    isMobileState.value = true;
    compactSidebarState.value = true;
    const resetFilters = vi.fn();
    render(
      <MemoryRouter>
        <button data-tour="tab" aria-pressed="true" onClick={resetFilters}>Clientes</button>
        <input aria-label="Busca" defaultValue="Ana" />
        <div data-tour="search">Busca</div>
        <div data-tour="results">Resultados</div>
        <SystemTourRunner steps={[
          { route: "/", target: '[data-tour="search"]', beforeTargetSelector: '[data-tour="tab"]', content: "Busca" },
          { route: "/", target: '[data-tour="results"]', beforeTargetSelector: '[data-tour="tab"]', content: "Resultados" },
        ]} onFinish={vi.fn()} />
      </MemoryRouter>,
    );

    await screen.findByRole("group", { name: "Controles do tour" });
    expect(resetFilters).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
    await waitFor(() => expect((joyrideProps.current as { stepIndex: number; run: boolean })).toMatchObject({ stepIndex: 1, run: true }));
    expect(resetFilters).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Busca" })).toHaveValue("Ana");
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    await waitFor(() => expect((joyrideProps.current as { stepIndex: number; run: boolean })).toMatchObject({ stepIndex: 0, run: true }));
    expect(resetFilters).not.toHaveBeenCalled();
  });

  it("reports a missing target and continues to the next step", () => {
    vi.useFakeTimers();
    try {
      render(
        <MemoryRouter>
          <div data-tour="available" />
          <SystemTourRunner steps={[
            { route: "/", target: '[data-tour="missing"]', title: "Ausente", content: "Ausente" },
            { route: "/", target: '[data-tour="available"]', content: "Disponível" },
          ]} onFinish={vi.fn()} />
        </MemoryRouter>,
      );
      act(() => vi.advanceTimersByTime(3000));
      expect(toastError).toHaveBeenCalledWith(
        'Não foi possível exibir a etapa "Ausente" do tour.',
        "A página ou seção não ficou disponível.",
      );
      act(() => vi.advanceTimersByTime(100));
      expect((joyrideProps.current as { stepIndex: number; run: boolean })).toMatchObject({ stepIndex: 1, run: true });
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps moving backward when a previous target becomes unavailable", () => {
    vi.useFakeTimers();
    try {
      isMobileState.value = true;
      compactSidebarState.value = true;
      function Targets() {
        const [middleVisible, setMiddleVisible] = useState(true);
        return <>
          <div data-tour="first" />
          {middleVisible && <div data-tour="middle" />}
          <div data-tour="last" />
          <button onClick={() => setMiddleVisible(false)}>Remover alvo</button>
        </>;
      }
      render(
        <MemoryRouter>
          <Targets />
          <SystemTourRunner steps={[
            { route: "/", target: '[data-tour="first"]', content: "Primeira" },
            { route: "/", target: '[data-tour="middle"]', title: "Intermediária", content: "Intermediária" },
            { route: "/", target: '[data-tour="last"]', content: "Última" },
          ]} onFinish={vi.fn()} />
        </MemoryRouter>,
      );
      act(() => vi.advanceTimersByTime(100));
      fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
      act(() => vi.advanceTimersByTime(100));
      fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
      act(() => vi.advanceTimersByTime(100));
      fireEvent.click(screen.getByRole("button", { name: "Remover alvo" }));
      fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
      act(() => vi.advanceTimersByTime(3000));
      expect(toastError).toHaveBeenCalledWith(
        'Não foi possível exibir a etapa "Intermediária" do tour.',
        "A página ou seção não ficou disponível.",
      );
      act(() => vi.advanceTimersByTime(100));
      expect((joyrideProps.current as { stepIndex: number; run: boolean })).toMatchObject({ stepIndex: 0, run: true });
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns to the original path, query and fragment when the tour ends", async () => {
    isMobileState.value = true;
    compactSidebarState.value = true;
    const onFinish = vi.fn();
    function LocationDisplay() {
      const { pathname, search, hash } = useLocation();
      return <output data-testid="location">{pathname}{search}{hash}</output>;
    }
    render(
      <MemoryRouter initialEntries={["/configuracoes?secao=seguranca#conta"]}>
        <Routes>
          <Route path="/configuracoes" element={<div>Configurações</div>} />
          <Route path="/destino" element={<div data-tour="destination">Destino</div>} />
        </Routes>
        <LocationDisplay />
        <SystemTourRunner steps={[{ route: "/destino", target: '[data-tour="destination"]', content: "Destino" }]} onFinish={onFinish} />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Concluir tour" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/configuracoes?secao=seguranca#conta");
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("restores the original route state when the tour ends on the starting path", async () => {
    isMobileState.value = true;
    compactSidebarState.value = true;
    function LocationDisplay() {
      const location = useLocation();
      return <output data-testid="location-state">{location.state?.source}</output>;
    }
    render(
      <MemoryRouter initialEntries={[{ pathname: "/inicio", state: { source: "original" } }]}>
        <Routes>
          <Route path="/inicio" element={<div data-tour="start">Início</div>} />
          <Route path="/destino" element={<div data-tour="destination">Destino</div>} />
        </Routes>
        <LocationDisplay />
        <SystemTourRunner steps={[
          { route: "/destino", target: '[data-tour="destination"]', content: "Destino" },
          { route: "/inicio", target: '[data-tour="start"]', content: "Início" },
        ]} onFinish={vi.fn()} />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Avançar" }));
    fireEvent.click(await screen.findByRole("button", { name: "Concluir tour" }));
    expect(screen.getByTestId("location-state")).toHaveTextContent("original");
  });
});