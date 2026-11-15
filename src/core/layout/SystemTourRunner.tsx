import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { useLocation, useNavigate } from "react-router";
import { PeractButtonPrimitive } from "../../shared/components/peract-button";
import type { SystemTourStep } from "./systemTour";
import { useIsMobile } from "../../shared/hooks/useIsMobile";

interface SystemTourRunnerProps {
  steps: SystemTourStep[];
  onFinish: () => void;
}

export function SystemTourRunner({ steps, onFinish }: SystemTourRunnerProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [tourSteps] = useState<SystemTourStep[]>(steps);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const originPath = useRef(location.pathname);
  const isLastStep = stepIndex === tourSteps.length - 1;
  const displayedSteps = useMemo(() => isMobile
    ? tourSteps.map(step => ({
        ...step,
        placement: "top" as const,
        floaterProps: {
          ...step.floaterProps,
          disableFlip: true,
          options: {
            ...step.floaterProps?.options,
            modifiers: {
              ...step.floaterProps?.options?.modifiers,
              flip: { enabled: false },
              preventOverflow: {
                enabled: true,
                boundariesElement: "window",
                padding: 8,
              },
            },
          },
        },
      }))
    : tourSteps, [isMobile, tourSteps]);

  const finishTour = () => {
    setIsRunning(false);
    setIsActive(false);
    if (location.pathname !== originPath.current) navigate(originPath.current);
    onFinish();
  };

  const advanceTourStep = (nextIndex: number) => {
    if (nextIndex >= tourSteps.length) {
      finishTour();
      return;
    }
    setIsRunning(false);
    setStepIndex(nextIndex);
  };

  useEffect(() => {
    if (!isActive) return;
    const step = tourSteps[stepIndex];
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
        document.querySelector<HTMLElement>(step.beforeTargetSelector)?.click();
        prepared = true;
      }
      if (document.querySelector(step.target as string)) {
        window.clearInterval(timer);
        setIsRunning(true);
      } else if (attempts >= 40) {
        window.clearInterval(timer);
        advanceTourStep(stepIndex + 1);
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [isActive, stepIndex, location.pathname, tourSteps, navigate]);

  const handleTourCallback = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED || data.action === ACTIONS.CLOSE || data.action === ACTIONS.SKIP) {
      finishTour();
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
      steps={displayedSteps as Step[]}
      styles={{
        options: {
          arrowColor: "#ffffff",
          backgroundColor: "#ffffff",
          overlayColor: "rgba(17, 24, 39, 0.48)",
          primaryColor: "#a67449",
          textColor: "#292524",
          width: 320,
          zIndex: 10000,
        },
        tooltip: isMobile
          ? {
              borderRadius: 10,
              padding: 14,
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
              width: "min(420px, calc(100vw - 24px))",
              right: "max(12px, env(safe-area-inset-right, 0px))",
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