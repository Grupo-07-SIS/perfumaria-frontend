import { createContext, useContext, useId } from "react";
import type { PeractFieldProps } from "./PeractField.types";

const FieldContext = createContext<string | undefined>(undefined);

export function usePeractFieldId() {
  return useContext(FieldContext);
}

export function PeractField({ children, ...props }: PeractFieldProps) {
  const controlId = useId();
  return <FieldContext.Provider value={controlId}><div {...props}>{children}</div></FieldContext.Provider>;
}