import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApp } from "../../../core/store/AppContext";
import type { LoginFormData, LoginFormFacade } from "../models/login.models";
import { executeLogin, hasAuthenticatedSession } from "../services/login.service";

export function useLoginFacade(): LoginFormFacade {
  const { applyAuthSession } = useApp();
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

    try {
      const hasLoggedIn = await executeLogin({
        credentials,
      });

      if (!hasAuthenticatedSession(hasLoggedIn)) {
        setAuthError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      applyAuthSession(hasLoggedIn);
      setLoading(false);
    } catch {
      setAuthError("Não foi possível entrar agora. Verifique sua conexão e tente novamente.");
      setLoading(false);
    }
  });

  return {
    authError,
    control,
    errors,
    loading,
    onSubmit,
    showPass,
    togglePasswordVisibility: () => setShowPass((currentValue) => !currentValue),
  };
}