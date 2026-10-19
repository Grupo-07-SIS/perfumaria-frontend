import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SystemTourStep } from "./systemTour";

const { isMobileState, joyrideProps } = vi.hoisted(() => ({
  isMobileState: { value: false },
  joyrideProps: { current: undefined as unknown },
}));

vi.mock("../../shared/hooks/useIsMobile", () => ({
  useIsMobile: () => isMobileState.value,
}));

vi.mock("react-joyride", () => ({
  default: (props: unknown) => {
    joyrideProps.current = props;
    return null;
  },
  ACTIONS: { CLOSE: "close", PREV: "prev", SKIP: "skip" },
  EVENTS: { STEP_AFTER: "step:after" },
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
    joyrideProps.current = undefined;
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
    expect((joyrideProps.current as { styles: { tooltipFooter: object } }).styles.tooltipFooter).toEqual({ display: "none" });
    const mobileProps = joyrideProps.current as {
      steps: Array<{
        placement: string;
        floaterProps: {
          disableFlip: boolean;
          options: {
            modifiers: {
              flip: { enabled: boolean };
              preventOverflow: { boundariesElement: string };
            };
          };
        };
      }>;
      styles: { tooltip: { maxHeight: string } };
    };
    expect(mobileProps.steps[0].placement).toBe("top");
    expect(mobileProps.steps[0].floaterProps.disableFlip).toBe(true);
    expect(mobileProps.steps[0].floaterProps.options.modifiers.flip.enabled).toBe(false);
    expect(mobileProps.steps[0].floaterProps.options.modifiers.preventOverflow.boundariesElement).toBe("window");
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
});