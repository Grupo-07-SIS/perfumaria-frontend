import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps } from "react-joyride";
import { useLocation, useNavigate } from "react-router";
import { PeractButtonPrimitive } from "../../shared/components/peract-button";
import { actionToast } from "../../shared/services/action-toast";
import type { SystemTourStep } from "./systemTour";
import { useIsMobile } from "../../shared/hooks/useIsMobile";

interface SystemTourRunnerProps {
  steps: SystemTourStep[];
  onFinish: () => void;
}

// Reserve space for the fixed controls and mobile safe-area insets.
const MOBILE_TOUR_PADDING = { top: 8, right: 8, bottom: 110, left: 8 };

export function SystemTourRunner({ steps, onFinish }: SystemTourRunnerProps) {
  const isMobile = useIsMobile();
  const isCompactSidebar = useIsMobile(1024);
  const location = useLocation();
  const navigate = useNavigate();
  const [tourSteps] = useState<SystemTourStep[]>(steps);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const originLocation = useRef({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
  });
  const direction = useRef<1 | -1>(1);
  const isLastStep = stepIndex === tourSteps.length - 1;
  const displayedSteps = useMemo<SystemTourStep[]>(() => tourSteps.map(step => {
    const compactTarget = isCompactSidebar ? step.compactTargetSelector : undefined;
    const presentedStep: SystemTourStep = {
      ...step,
      target: compactTarget ?? step.target,
      placement: compactTarget ? "bottom" : step.placement,
    };
    if (!isMobile) return presentedStep;
    return {
        ...presentedStep,
        placement: compactTarget ? "bottom" : "top",
        floaterProps: {
          ...step.floaterProps,
          disableFlip: false,
          options: {
            ...step.floaterProps?.options,
            flip: {
              ...step.floaterProps?.options?.flip,
              enabled: true,
              boundariesElement: "viewport",
              padding: MOBILE_TOUR_PADDING,
            },
            preventOverflow: {
              ...step.floaterProps?.options?.preventOverflow,
              enabled: true,
              boundariesElement: "viewport",
              padding: MOBILE_TOUR_PADDING,
            },
          },
        },
      };
  }), [isCompactSidebar, isMobile, tourSteps]);

  const finishTour = () => {
    setIsRunning(false);
    setIsActive(false);
    const origin = originLocation.current;
    if (location.pathname !== origin.pathname || location.search !== origin.search || location.hash !== origin.hash || location.state !== origin.state) {
      navigate({ pathname: origin.pathname, search: origin.search, hash: origin.hash }, { state: origin.state });
    }
    onFinish();
  };

  const advanceTourStep = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= tourSteps.length) {
      finishTour();
      return;
    }
    direction.current = nextIndex < stepIndex ? -1 : 1;
    setIsRunning(false);
    setStepIndex(nextIndex);
  };

  const skipMissingStep = (step: SystemTourStep, index: number) => {
    const title = typeof step.title === "string" ? ` "${step.title}"` : "";
    actionToast.error(`Não foi possível exibir a etapa${title} do tour.`, "A página ou seção não ficou disponível.");
    advanceTourStep(index + direction.current);
  };

  useEffect(() => {
    if (!isActive) return;
    const step = displayedSteps[stepIndex];
    if (!step) {
      finishTour();
      return;
    }

    setIsRunning(false);
    if (location.pathname !== step.route) {
      navigate(step.route);
      return;
    }

    let attempts = 0;
    let prepared = false;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (step.beforeTargetSelector && !prepared) {
        const activator = document.querySelector<HTMLElement>(step.beforeTargetSelector);
        if (activator) {
          if (activator.getAttribute("aria-pressed") !== "true") activator.click();
          prepared = true;
        }
      } else {
        const target = typeof step.target === "string" ? document.querySelector(step.target) : step.target;
        if (target?.isConnected) {
          window.clearInterval(timer);
          setIsRunning(true);
          return;
        }
      }
      if (attempts >= 60) {
        window.clearInterval(timer);
        skipMissingStep(step, stepIndex);
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [isActive, stepIndex, location.pathname, displayedSteps, navigate]);

  const handleTourCallback = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED || data.action === ACTIONS.CLOSE || data.action === ACTIONS.SKIP) {
      finishTour();
      return;
    }
    if (data.index !== stepIndex) return;
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      skipMissingStep(displayedSteps[stepIndex], stepIndex);
      return;
    }
    if (data.type !== EVENTS.STEP_AFTER) return;
    advanceTourStep(data.index + (data.action === ACTIONS.PREV ? -1 : 1));
  };

  return <>
    <Joyride
      callback={handleTourCallback}
      continuous
      disableOverlayClose
      disableScrollParentFix
      hideCloseButton
      locale={{ back: "Voltar", close: "Fechar", last: "Concluir", next: "Avançar", nextLabelWithProgress: "Avançar {step}/{steps}", skip: "Finalizar tour" }}
      run={isActive && isRunning}
      scrollDuration={250}
      scrollOffset={96}
      scrollToFirstStep
      showProgress
      showSkipButton
      spotlightPadding={8}
      stepIndex={stepIndex}
      steps={displayedSteps}
      styles={{
        options: {
          arrowColor: "#ffffff",
          backgroundColor: "#ffffff",
          overlayColor: "rgba(17, 24, 39, 0.48)",
          primaryColor: "#70243f",
          textColor: "#292524",
          width: 320,
          zIndex: 10000,
        },
        tooltip: isMobile
          ? {
              borderRadius: 10,
              padding: 14,
              maxWidth: "calc(100vw - 24px)",
              maxHeight: "max(80px, calc(100dvh - 150px))",
              overflowY: "auto",
              overscrollBehavior: "contain",
            }
          : { borderRadius: 10, padding: 14 },
        tooltipTitle: { fontSize: 17, lineHeight: 1.3, marginBottom: 4 },
        tooltipContent: { fontSize: 14, lineHeight: 1.45, padding: "4px 0" },
        tooltipFooter: isMobile ? { display: "none" } : { marginTop: 10 },
        buttonNext: { borderRadius: 7, fontSize: 13, padding: "7px 11px" },
        buttonBack: { color: "#57534e", fontSize: 13, padding: "7px 9px" },
        buttonSkip: { color: "#78716c", fontSize: 12, padding: "7px 8px" },
      }}
    />
    {isMobile && isActive && isRunning && typeof document !== "undefined" && createPortal(
        <>
          {isRunning && <div
            aria-label="Controles do tour"
            className="fixed z-[10002] flex max-w-[calc(100vw-1.5rem)] items-center justify-between rounded-lg border border-black/10 bg-white p-1.5 shadow-xl"
            role="group"
            style={{
              position: "fixed",
              left: "max(12px, env(safe-area-inset-left, 0px))",
              right: "max(12px, env(safe-area-inset-right, 0px))",
              maxWidth: 420,
              marginLeft: "auto",
              bottom: "max(12px, env(safe-area-inset-bottom, 0px))",
              zIndex: 10002,
            }}
          >
          <PeractButtonPrimitive
            aria-label="Finalizar tour"
            title="Finalizar tour"
            className="h-10 gap-1.5 border-stone-300 bg-white px-2.5 text-xs text-stone-700"
            onClick={finishTour}
            variant="outline"
          >
            <X aria-hidden="true" size={15} />
            <span className="hidden min-[360px]:inline">Finalizar</span>
          </PeractButtonPrimitive>
          <PeractButtonPrimitive
            aria-label="Voltar"
            title="Voltar"
            className="h-10 gap-1.5 border-stone-300 bg-white px-2.5 text-xs text-stone-700"
            disabled={stepIndex === 0}
            onClick={() => advanceTourStep(stepIndex - 1)}
            variant="outline"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            <span className="hidden min-[360px]:inline">Voltar</span>
          </PeractButtonPrimitive>
          <span aria-label={`Etapa ${stepIndex + 1} de ${tourSteps.length}`} aria-live="polite" className="whitespace-nowrap px-1 text-xs peract-font-color-muted">
            {stepIndex + 1}/{tourSteps.length}
          </span>
          <PeractButtonPrimitive
            aria-label={isLastStep ? "Concluir tour" : "Avançar"}
            title={isLastStep ? "Concluir tour" : "Avançar"}
            className="h-10 gap-1.5 px-2.5 text-xs"
            onClick={() => advanceTourStep(stepIndex + 1)}
            variant="default"
          >
            {isLastStep ? <Check aria-hidden="true" size={15} /> : null}
            <span className="hidden min-[360px]:inline">{isLastStep ? "Concluir" : "Avançar"}</span>
            {!isLastStep ? <ArrowRight aria-hidden="true" size={15} /> : null}
          </PeractButtonPrimitive>
          </div>}
        </>,
        document.body,
    )}
  </>;
}