import { lazy, Suspense, useState } from "react";
import { CircleHelp } from "lucide-react";
import { PeractButtonPrimitive } from "../../shared/components/peract-button";
import { PeractPopover, PeractPopoverContent, PeractPopoverTrigger } from "../../shared/components/peract-popover";
import { getSystemTourSections, type SystemTourStep } from "./systemTour";

const SystemTourRunner = lazy(async () => {
  const module = await import("./SystemTourRunner");
  return { default: module.SystemTourRunner };
});

interface GuidedSystemTourProps {
  isAdmin: boolean;
  collapsed: boolean;
  onStart?: () => void;
}

export function GuidedSystemTour({ isAdmin, collapsed, onStart }: GuidedSystemTourProps) {
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [selectedSteps, setSelectedSteps] = useState<SystemTourStep[] | null>(null);
  const sections = getSystemTourSections(isAdmin);
  const startTour = (steps: SystemTourStep[]) => {
    onStart?.();
    setIsSectionMenuOpen(false);
    setSelectedSteps(steps);
  };

  return <>
      <div className="shrink-0 border-t p-2" style={{ borderColor: "var(--color-sidebar-border)" }}>
        <PeractPopover open={isSectionMenuOpen} onOpenChange={setIsSectionMenuOpen}>
          <PeractPopoverTrigger asChild>
            <PeractButtonPrimitive
              aria-label="Escolher tour do sistema"
              aria-expanded={isSectionMenuOpen}
              className="h-9 min-h-9 w-full justify-center gap-2 px-3 py-2 text-xs peract-font-color-muted hover:bg-gray-100"
              onClick={() => setIsSectionMenuOpen(open => !open)}
              title="Tour pelo sistema"
              variant="plain"
              size="plain"
            >
              <CircleHelp size={16} />
              {!collapsed ? <span>Tour pelo sistema</span> : null}
            </PeractButtonPrimitive>
          </PeractPopoverTrigger>
          <PeractPopoverContent side="right" align="end" className="w-72 max-h-[70dvh] overflow-y-auto p-2">
            <div className="px-2 pb-2">
              <h2 className="text-sm font-semibold peract-font-color-default">Escolha uma seção</h2>
              <p className="mt-0.5 text-xs peract-font-color-muted">Veja só o que precisa ou percorra o sistema completo.</p>
            </div>
            <PeractButtonPrimitive onClick={() => startTour(sections.flatMap(section => section.steps))} className="mb-1 w-full justify-start rounded-md px-3 py-2 text-left text-sm font-medium text-white" style={{ background: "#a67449" }} variant="plain" size="plain">
              Tour completo
            </PeractButtonPrimitive>
            <div className="flex flex-col gap-0.5">
              {sections.map(section => section.subsections?.length ? <div key={section.id} className="py-1">
                  <PeractButtonPrimitive onClick={() => startTour(section.steps)} className="w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-gray-100" variant="plain" size="plain">
                    <span className="flex w-full items-center justify-between gap-2 text-sm font-medium peract-font-color-default">
                      {section.title}<span className="shrink-0 text-[10px] font-normal peract-font-color-muted">Tour completo</span>
                    </span>
                    <span className="whitespace-normal text-xs font-normal peract-font-color-muted">{section.description}</span>
                  </PeractButtonPrimitive>
                  <div className="ml-3 border-l peract-border-color pl-2">
                    {section.subsections.map(subsection => <PeractButtonPrimitive key={subsection.id} onClick={() => startTour(subsection.steps)} className="w-full flex-col items-start gap-0.5 rounded-md px-3 py-1.5 text-left hover:bg-gray-100" variant="plain" size="plain">
                        <span className="text-xs font-medium peract-font-color-default">{subsection.title.replace(`${section.title} · `, "")}</span>
                        <span className="whitespace-normal text-[11px] font-normal peract-font-color-muted">{subsection.description}</span>
                      </PeractButtonPrimitive>)}
                  </div>
                </div> : <PeractButtonPrimitive key={section.id} onClick={() => startTour(section.steps)} className="w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-gray-100" variant="plain" size="plain">
                  <span className="text-sm font-medium peract-font-color-default">{section.title}</span>
                  <span className="whitespace-normal text-xs font-normal peract-font-color-muted">{section.description}</span>
                </PeractButtonPrimitive>)}
            </div>
          </PeractPopoverContent>
        </PeractPopover>
      </div>
      {selectedSteps && <Suspense fallback={null}>
          <SystemTourRunner steps={selectedSteps} onFinish={() => setSelectedSteps(null)} />
        </Suspense>}
    </>;
}
