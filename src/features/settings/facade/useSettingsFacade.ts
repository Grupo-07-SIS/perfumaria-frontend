import { settingsSections } from "../config/settings.presentation";
import { accountSettingsError, changeAccountEmail, changeAccountPassword, validateEmailChange, validatePasswordChange } from "../services/settings.service";
import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { SettingsFormValues, Section } from "../models/settings.models";
import { useApp } from "../../../core/store/AppContext";
import { fetchStockLimit, hasOrganization, isValidStockLimit, saveStockLimit, stockSettingsError } from "../services/stock-settings.service";
import { useEffect, useRef, useState } from "react";
export function useSettingsFacade() {
  const {
    currentUser,
    applyAuthSession,
    stockThresholds,
    setStockThresholds
  } = useApp();
  const organizationId = currentUser?.idOrganizacao;
  const [isStockLoading, setIsStockLoading] = useState(true);
  const [isStockSaving, setIsStockSaving] = useState(false);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [stockError, setStockError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const savingRef = useRef(false);
  const requestVersion = useRef(0);
  const [activeSection, setActiveSection] = useState<Section>("estoque");
  const [saved, setSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (successTimer.current !== null) clearTimeout(successTimer.current);
  }, []);
  const [showSenha, setShowSenha] = useState(false);
  const [errosSenha, setErrosSenha] = useState<Record<string, string>>({});
  const form = useForm<SettingsFormValues>({
    defaultValues: {
      criticoLimit: String(stockThresholds.critico),
      senhaAtual: "",
      novaSenha: "",
      confirmSenha: "",
      novoEmail: "",
      confirmEmail: "",
      senhaConfEmail: ""
    }
  });
  const {
    criticoLimit,
    senhaAtual,
    novaSenha,
    confirmSenha,
    novoEmail,
    confirmEmail,
    senhaConfEmail
  } = form.watch();
  const setCriticoLimit = (value: SetStateAction<SettingsFormValues["criticoLimit"]>) => form.setValue("criticoLimit", typeof value === "function" ? value(form.getValues("criticoLimit")) : value, {
    shouldDirty: true
  });
  const { setValue } = form;
  useEffect(() => {
    const version = ++requestVersion.current;
    setStockLoaded(false);
    setStockError("");
    setSaved(false);
    setIsStockSaving(false);
    savingRef.current = false;
    setValue("criticoLimit", "");
    if (!hasOrganization(organizationId)) {
      setIsStockLoading(false);
      setStockError("Organização não identificada. Entre novamente.");
      return;
    }
    setIsStockLoading(true);
    void fetchStockLimit(organizationId)
      .then((limit) => {
        if (requestVersion.current !== version) return;
        setValue("criticoLimit", limit === null ? "" : String(limit));
        if (limit !== null) setStockThresholds({ critico: limit });
        setStockLoaded(true);
      })
      .catch((error: unknown) => {
        if (requestVersion.current === version) setStockError(stockSettingsError(error, "Não foi possível carregar o limite de estoque."));
      })
      .finally(() => {
        if (requestVersion.current === version) setIsStockLoading(false);
      });
    return () => { requestVersion.current += 1; };
  }, [organizationId, loadAttempt, setValue, setStockThresholds]);
  const setSenhaAtual = (value: SetStateAction<SettingsFormValues["senhaAtual"]>) => form.setValue("senhaAtual", typeof value === "function" ? value(form.getValues("senhaAtual")) : value, {
    shouldDirty: true
  });
  const setNovaSenha = (value: SetStateAction<SettingsFormValues["novaSenha"]>) => form.setValue("novaSenha", typeof value === "function" ? value(form.getValues("novaSenha")) : value, {
    shouldDirty: true
  });
  const setConfirmSenha = (value: SetStateAction<SettingsFormValues["confirmSenha"]>) => form.setValue("confirmSenha", typeof value === "function" ? value(form.getValues("confirmSenha")) : value, {
    shouldDirty: true
  });
  const setNovoEmail = (value: SetStateAction<SettingsFormValues["novoEmail"]>) => form.setValue("novoEmail", typeof value === "function" ? value(form.getValues("novoEmail")) : value, {
    shouldDirty: true
  });
  const setConfirmEmail = (value: SetStateAction<SettingsFormValues["confirmEmail"]>) => form.setValue("confirmEmail", typeof value === "function" ? value(form.getValues("confirmEmail")) : value, {
    shouldDirty: true
  });
  const setSenhaConfEmail = (value: SetStateAction<SettingsFormValues["senhaConfEmail"]>) => form.setValue("senhaConfEmail", typeof value === "function" ? value(form.getValues("senhaConfEmail")) : value, {
    shouldDirty: true
  });
  const [errosEmail, setErrosEmail] = useState<Record<string, string>>({});
  const [accountError, setAccountError] = useState("");
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const showSuccess = (msg: string) => {
    if (successTimer.current !== null) clearTimeout(successTimer.current);
    setSavedMsg(msg);
    setSaved(true);
    successTimer.current = setTimeout(() => {
      successTimer.current = null;
      setSaved(false);
    }, 3000);
  };
  const handleSaveEstoque = async () => {
    if (!stockLoaded || savingRef.current || !hasOrganization(organizationId)) return;
    setSaved(false);
    setStockError("");
    if (!isValidStockLimit(Number(criticoLimit))) {
      setStockError("Informe um limite inteiro entre 1 e 2147483647.");
      return;
    }
    const version = requestVersion.current;
    savingRef.current = true;
    setIsStockSaving(true);
    try {
      const critico = await saveStockLimit(organizationId, criticoLimit);
      if (requestVersion.current !== version) return;
      setStockThresholds({ critico });
      setValue("criticoLimit", String(critico));
      showSuccess("Configurações de estoque salvas com sucesso!");
    } catch (error) {
      if (requestVersion.current === version) setStockError(stockSettingsError(error, "Não foi possível salvar o limite de estoque."));
    } finally {
      if (requestVersion.current === version) {
        savingRef.current = false;
        setIsStockSaving(false);
      }
    }
  };
  const handleSaveSenha = async () => {
    setSaved(false);
    setAccountError("");
    if (isAccountSaving) return;
    const e = validatePasswordChange({
      senhaAtual,
      novaSenha,
      confirmSenha
    });
    if (Object.keys(e).length > 0) {
      setErrosSenha(e);
      return;
    }
    setErrosSenha({});
    setIsAccountSaving(true);
    try {
      const session = await changeAccountPassword(senhaAtual, novaSenha);
      applyAuthSession(session);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmSenha("");
      showSuccess("Senha alterada com sucesso.");
    } catch (error) {
      setAccountError(accountSettingsError(error, "Não foi possível alterar a senha. Tente novamente."));
    } finally {
      setIsAccountSaving(false);
    }
  };
  const handleSaveEmail = async () => {
    setSaved(false);
    setAccountError("");
    if (isAccountSaving) return;
    const e = validateEmailChange({
      novoEmail,
      confirmEmail,
      senhaConfEmail
    });
    if (Object.keys(e).length > 0) {
      setErrosEmail(e);
      return;
    }
    setErrosEmail({});
    setIsAccountSaving(true);
    try {
      const normalizedEmail = novoEmail.trim().toLowerCase();
      const session = await changeAccountEmail(senhaConfEmail, normalizedEmail);
      applyAuthSession(session);
      setNovoEmail("");
      setConfirmEmail("");
      setSenhaConfEmail("");
      showSuccess("E-mail de acesso alterado com sucesso.");
    } catch (error) {
      setAccountError(accountSettingsError(error, "Não foi possível alterar o e-mail. Tente novamente."));
    } finally {
      setIsAccountSaving(false);
    }
  };
  const sections = settingsSections;
  return {
    accountError,
    currentUser,
    isAccountSaving,
    stockError,
    isStockLoading,
    isStockSaving,
    stockDisabled: !stockLoaded || isStockLoading || isStockSaving,
    canRetryStock: hasOrganization(organizationId) && !stockLoaded && !isStockLoading,
    retryStock: () => setLoadAttempt((attempt) => attempt + 1),
    stockThresholds,
    setStockThresholds,
    activeSection,
    setActiveSection,
    saved,
    setSaved,
    savedMsg,
    setSavedMsg,
    criticoLimit,
    setCriticoLimit,
    senhaAtual,
    setSenhaAtual,
    novaSenha,
    setNovaSenha,
    confirmSenha,
    setConfirmSenha,
    showSenha,
    setShowSenha,
    errosSenha,
    setErrosSenha,
    novoEmail,
    setNovoEmail,
    confirmEmail,
    setConfirmEmail,
    senhaConfEmail,
    setSenhaConfEmail,
    errosEmail,
    setErrosEmail,
    showSuccess,
    handleSaveEstoque,
    handleSaveSenha,
    handleSaveEmail,
    sections
  };
}
