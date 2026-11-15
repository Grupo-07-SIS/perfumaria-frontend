import { useState } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_ENDERECO } from "../config/people.config";
import type { Endereco } from "../models/people.models";
import { fetchCepAddress, type CepAddress } from "../services/cep.service";
import { useCepAutofill } from "./useCepAutofill";

vi.mock("../services/cep.service", () => ({ fetchCepAddress: vi.fn() }));
const address = { logradouro: "Rua dos Testes", bairro: "Centro", cidade: "Sao Paulo", uf: "SP" };

function renderLookup(initial: Endereco = { ...EMPTY_ENDERECO }) {
  const clearError = vi.fn();
  const hook = renderHook(() => {
    const [endereco, setEndereco] = useState(initial);
    const lookup = useCepAutofill(endereco, setEndereco, clearError);
    return { endereco, setEndereco, lookup };
  });
  return { ...hook, clearError };
}

describe("useCepAutofill", () => {
  beforeEach(() => {
    vi.mocked(fetchCepAddress).mockReset();
    vi.mocked(fetchCepAddress).mockResolvedValue(address);
  });

  it("waits for eight digits, fills the address and preserves number and complement", async () => {
    const { result, clearError } = renderLookup({ ...EMPTY_ENDERECO, numero: "100", complemento: "Apto 2" });
    act(() => result.current.setEndereco(current => ({ ...current, cep: "01001" })));
    expect(fetchCepAddress).not.toHaveBeenCalled();
    act(() => result.current.setEndereco(current => ({ ...current, cep: "01001-000" })));
    await waitFor(() => expect(result.current.endereco.cidade).toBe("Sao Paulo"));
    expect(result.current.endereco).toMatchObject({ ...address, cep: "01001-000", numero: "100", complemento: "Apto 2" });
    expect(clearError).toHaveBeenCalledWith("logradouro");
    expect(result.current.lookup.isLoading).toBe(false);
  });

  it("does not overwrite an existing address when opening edit", () => {
    const { result } = renderLookup({ ...EMPTY_ENDERECO, ...address, cep: "01001-000", logradouro: "Endereco salvo" });
    expect(fetchCepAddress).not.toHaveBeenCalled();
    expect(result.current.endereco.logradouro).toBe("Endereco salvo");
  });

  it("preserves fields changed manually while the lookup is pending", async () => {
    let completeLookup!: (value: CepAddress) => void;
    vi.mocked(fetchCepAddress).mockImplementationOnce(() => new Promise(resolve => { completeLookup = resolve; }));
    const { result } = renderLookup();
    act(() => result.current.setEndereco(current => ({ ...current, cep: "01001-000" })));
    expect(result.current.lookup.isLoading).toBe(true);
    act(() => result.current.setEndereco(current => ({ ...current, logradouro: "Rua manual", numero: "50", complemento: "Casa" })));
    await act(async () => completeLookup(address));
    expect(result.current.endereco).toMatchObject({ logradouro: "Rua manual", bairro: "Centro", numero: "50", complemento: "Casa" });
    expect(fetchCepAddress).toHaveBeenCalledOnce();
  });

  it("ignores an old response when the CEP changes", async () => {
    let completeOldLookup!: (value: CepAddress) => void;
    vi.mocked(fetchCepAddress).mockImplementationOnce(() => new Promise(resolve => { completeOldLookup = resolve; }));
    const { result } = renderLookup();
    act(() => result.current.setEndereco(current => ({ ...current, cep: "01001-000" })));
    const oldSignal = vi.mocked(fetchCepAddress).mock.calls[0][1];
    act(() => result.current.setEndereco(current => ({ ...current, cep: "22070-010" })));
    await waitFor(() => expect(result.current.endereco.cidade).toBe("Sao Paulo"));
    await act(async () => completeOldLookup({ ...address, cidade: "Cidade antiga" }));
    expect(oldSignal?.aborted).toBe(true);
    expect(result.current.endereco.cep).toBe("22070-010");
    expect(result.current.endereco.cidade).toBe("Sao Paulo");
  });

  it("keeps manual entry available after not found and supports retry", async () => {
    vi.mocked(fetchCepAddress).mockRejectedValueOnce(new Error("CEP_NOT_FOUND"));
    const { result } = renderLookup();
    act(() => result.current.setEndereco(current => ({ ...current, cep: "01001-000" })));
    await waitFor(() => expect(result.current.lookup.message).toContain("CEP n\u00e3o encontrado"));
    act(() => result.current.setEndereco(current => ({ ...current, numero: "30" })));
    act(() => result.current.lookup.retry());
    await waitFor(() => expect(result.current.endereco.cidade).toBe("Sao Paulo"));
    expect(result.current.lookup.message).toBe("");
    expect(result.current.endereco.numero).toBe("30");
    expect(fetchCepAddress).toHaveBeenCalledTimes(2);
  });

  it("reports network failure without clearing manually entered data", async () => {
    vi.mocked(fetchCepAddress).mockRejectedValueOnce(new Error("Network Error"));
    const { result } = renderLookup({ ...EMPTY_ENDERECO, logradouro: "Rua manual" });
    act(() => result.current.setEndereco(current => ({ ...current, cep: "01001-000" })));
    await waitFor(() => expect(result.current.lookup.message).toContain("Preencha o endere\u00e7o manualmente"));
    expect(result.current.endereco.logradouro).toBe("Rua manual");
    expect(result.current.lookup.isLoading).toBe(false);
  });

  it("aborts the request when the form unmounts", () => {
    vi.mocked(fetchCepAddress).mockImplementationOnce(() => new Promise(() => {}));
    const { result, unmount } = renderLookup();
    act(() => result.current.setEndereco(current => ({ ...current, cep: "01001-000" })));
    const signal = vi.mocked(fetchCepAddress).mock.calls[0][1];
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});