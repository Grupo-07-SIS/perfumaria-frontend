"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, useFormState, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "../ui/utils";
import { PeractLabel as Label } from "../peract-label";
const PeractForm = FormProvider;
type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName;
};
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);
const PeractFormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return <FormFieldContext.Provider value={{
    name: props.name
  }}>
      <Controller {...props} />
    </FormFieldContext.Provider>;
};
const usePeractFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const {
    getFieldState
  } = useFormContext();
  const formState = useFormState({
    name: fieldContext.name
  });
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const {
    id
  } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
type FormItemContextValue = {
  id: string;
};
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);
function PeractFormItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const id = React.useId();
  return <FormItemContext.Provider value={{
    id
  }}>
      <div data-slot="form-item" className={cn("peract-sans-font grid gap-2", className)} {...props} />
    </FormItemContext.Provider>;
}
function PeractFormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const {
    error,
    formItemId
  } = usePeractFormField();
  return <Label data-slot="form-label" data-error={!!error} className={cn("peract-sans-font data-[error=true]:text-destructive", className)} htmlFor={formItemId} {...props} />;
}
function PeractFormControl({
  ...props
}: React.ComponentProps<typeof Slot>) {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId
  } = usePeractFormField();
  return <Slot data-slot="form-control" id={formItemId} aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props} />;
}
function PeractFormDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const {
    formDescriptionId
  } = usePeractFormField();
  return <p data-slot="form-description" id={formDescriptionId} className={cn("peract-sans-font peract-font-color-muted text-sm", className)} {...props} />;
}
function PeractFormMessage({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const {
    error,
    formMessageId
  } = usePeractFormField();
  const body = error ? String(error?.message ?? "") : props.children;
  if (!body) {
    return null;
  }
  return <p data-slot="form-message" id={formMessageId} className={cn("peract-sans-font peract-font-color-alert text-sm", className)} {...props}>
      {body}
    </p>;
}
export { usePeractFormField, PeractForm, PeractFormItem, PeractFormLabel, PeractFormControl, PeractFormDescription, PeractFormMessage, PeractFormField };
