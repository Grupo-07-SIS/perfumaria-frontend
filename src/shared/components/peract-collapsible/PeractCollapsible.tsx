"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
function PeractCollapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}
function PeractCollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.PeractCollapsibleTrigger>) {
  return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}
function PeractCollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.PeractCollapsibleContent>) {
  return <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />;
}
export { PeractCollapsible, PeractCollapsibleTrigger, PeractCollapsibleContent };
