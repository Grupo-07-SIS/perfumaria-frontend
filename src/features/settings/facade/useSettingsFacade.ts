import { settingsSections } from "../config/settings.presentation";
import { validateEmailChange, validatePasswordChange } from "../services/settings.service";
import { useForm } from "react-hook-form";
import type { SetStateAction } from "react";
import type { SettingsFormValues, Section } from "../models/settings.models";
import { useSettingsRepository } from "../repository/settings.repository";
import { useState } from "react";
export function useSettingsFacade() {
  const {
    stockThresholds,
    setStockThresholds
  } = useSettingsRepository();
  const [activeSection, setActiveSection] = useState<Section>("estoque");
  const [saved, setSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
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
  const showSuccess = (msg: string) => {
    setSavedMsg(msg);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const handleSaveEstoque = () => {
    const critico = parseInt(criticoLimit);
    if (!isNaN(critico) && critico >= 1) {
      setStockThresholds({
        critico
      });
    }
    showSuccess("Configurações de estoque salvas com sucesso!");
  };
  const handleSaveSenha = () => {
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
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmSenha("");
    showSuccess("Senha alterada com sucesso!");
  };
  const handleSaveEmail = () => {
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
    setNovoEmail("");
    setConfirmEmail("");
    setSenhaConfEmail("");
    showSuccess("E-mail de acesso alterado com sucesso!");
  };
  const sections = settingsSections;
  return {
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
