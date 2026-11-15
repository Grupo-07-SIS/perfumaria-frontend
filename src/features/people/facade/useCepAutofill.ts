import { useEffect, useRef, useState, type SetStateAction } from "react";
import type { CepLookupState, Endereco } from "../models/people.models";
import { fetchCepAddress, type CepAddress } from "../services/cep.service";

export function useCepAutofill(
  endereco: Endereco,
  onChange: (value: SetStateAction<Endereco>) => void,
  clearError: (key: string) => void,
): CepLookupState {
  const cep = endereco.cep.replace(/\D/g, "");
  const initialCep = useRef(cep).current;
  const latest = useRef({ endereco, onChange, clearError });
  latest.current = { endereco, onChange, clearError };
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState({ isLoading: false, message: "" });

  useEffect(() => {
    if (cep.length !== 8 || (cep === initialCep && retryCount === 0)) {
      setState({ isLoading: false, message: "" });
      return;
    }
    const controller = new AbortController();
    const original = { ...latest.current.endereco };
    setState({ isLoading: true, message: "" });
    fetchCepAddress(cep, controller.signal).then(address => {
      if (controller.signal.aborted) return;
      const fields = (Object.keys(address) as (keyof CepAddress)[])
        .filter(field => latest.current.endereco[field] === original[field]);
      latest.current.onChange(current => {
        if (current.cep.replace(/\D/g, "") !== cep) return current;
        const updated = { ...current };
        fields.forEach(field => {
          if (current[field] === original[field]) updated[field] = address[field];
        });
        return updated;
      });
      fields.forEach(field => latest.current.clearError(field));
      setState({ isLoading: false, message: "" });
    }).catch(error => {
      if (controller.signal.aborted) return;
      setState({
        isLoading: false,
        message: error instanceof Error && error.message === "CEP_NOT_FOUND"
          ? "CEP n\u00e3o encontrado. Preencha o endere\u00e7o manualmente."
          : "N\u00e3o foi poss\u00edvel consultar o CEP. Preencha o endere\u00e7o manualmente.",
      });
    });
    return () => controller.abort();
  }, [cep, initialCep, retryCount]);

  return { ...state, retry: () => setRetryCount(current => current + 1) };
}