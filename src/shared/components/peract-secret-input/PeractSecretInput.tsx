import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PeractInput } from "../peract-input";
import { PeractButton } from "../peract-button";
import type { PeractSecretInputProps } from "./PeractSecretInput.types";

export const PeractSecretInput = forwardRef<HTMLInputElement, PeractSecretInputProps>(function PeractSecretInput(props, ref) {
  const [visible, setVisible] = useState(false);
  return <PeractInput {...props} ref={ref} type={visible ? "text" : "password"} autoCapitalize="none" autoCorrect="off" spellCheck={false}
    rightAdornment={<PeractButton type="button" theme="secondary" size="icon" disabled={props.disabled} aria-label={`${visible ? "Ocultar" : "Mostrar"} ${props.label || "conteúdo"}`} aria-pressed={visible} action={() => setVisible(value => !value)}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</PeractButton>} />;
});