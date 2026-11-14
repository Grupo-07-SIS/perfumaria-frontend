import type { PeractInputProps } from "../peract-input/PeractInput.types";
export type PeractSecretInputProps = Omit<PeractInputProps, "type" | "rightAdornment">;