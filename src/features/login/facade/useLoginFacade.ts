import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApp } from "../../../app/context/AppContext";
import type { DemoAccount, LoginFormData, LoginFormFacade } from "../models/login.models";
import { executeLogin, hasAuthenticatedSession } from "../services/login.service";

export function useLoginFacade(): LoginFormFacade {
  const { applyAuthSession, funcionarios } = useApp();
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (credentials) => {
    setLoading(true);
    setAuthError("");

    const hasLoggedIn = await executeLogin({
      credentials,
      users: funcionarios,
    });

    if (!hasAuthenticatedSession(hasLoggedIn)) {
      setAuthError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    applyAuthSession(hasLoggedIn);
    setLoading(false);
  });

  const handleSelectAccount = (account: DemoAccount) => {
    setAuthError("");
    setValue("email", account.email);
    setValue("password", account.senha);
  };

  return {
    authError,
    control,
    errors,
    handleSelectAccount,
    loading,
    onSubmit,
    setValue,
    showPass,
    togglePasswordVisibility: () => setShowPass((currentValue) => !currentValue),
  };
}