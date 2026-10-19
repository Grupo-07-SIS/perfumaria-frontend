import { useEffect, useRef, useState } from "react";
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { useLocation, useNavigate } from "react-router";
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

  return <Joyride
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
      steps={tourSteps as Step[]}
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
        tooltip: { borderRadius: 10, padding: 14 },
        tooltipTitle: { fontSize: 17, lineHeight: 1.3, marginBottom: 4 },
        tooltipContent: { fontSize: 14, lineHeight: 1.45, padding: "4px 0" },
        tooltipFooter: isMobile
          ? {
              marginTop: 10,
              position: "fixed",
              right: 12,
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
              zIndex: 10001,
              borderRadius: 10,
              backgroundColor: "#ffffff",
              padding: 8,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            }
          : { marginTop: 10 },
        buttonNext: { borderRadius: 7, fontSize: 13, padding: "7px 11px" },
        buttonBack: { color: "#57534e", fontSize: 13, padding: "7px 9px" },
        buttonSkip: { color: "#78716c", fontSize: 12, padding: "7px 8px" },
      }}
    />;
}