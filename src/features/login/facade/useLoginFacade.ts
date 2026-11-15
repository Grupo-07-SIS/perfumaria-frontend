import { useState } from "react";
import { actionToast } from "../../../shared/services/action-toast";
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
        actionToast.error("Não foi possível entrar.", "E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      applyAuthSession(hasLoggedIn);
      actionToast.success("Login realizado com sucesso!", "Bem-vindo à Perfumaria.");
      setLoading(false);
    } catch {
      setAuthError("Não foi possível entrar agora. Verifique sua conexão e tente novamente.");
      actionToast.error("Não foi possível entrar.");
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