import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PeractButtonPrimitive } from "./peract-button";
import { PeractInputControl } from "./peract-input";
import { PeractNativeSelect } from "./peract-select";
import { PeractTextarea } from "./peract-textarea";

describe("Peract native controls", () => {
  it("forwards button refs and submits only when requested", async () => {
    const user = userEvent.setup();
    const submit = vi.fn(event => event.preventDefault());
    const ref = createRef<HTMLButtonElement>();
    render(<form onSubmit={submit}>
      <PeractButtonPrimitive ref={ref}>Cancelar</PeractButtonPrimitive>
      <PeractButtonPrimitive type="submit">Salvar</PeractButtonPrimitive>
    </form>);
    expect(ref.current).toBe(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(screen.getByText("Cancelar"));
    expect(submit).not.toHaveBeenCalled();
    await user.click(screen.getByText("Salvar"));
    expect(submit).toHaveBeenCalledOnce();
  });

  it("composes a link without introducing a button", () => {
    render(<PeractButtonPrimitive asChild><a href="/clientes">Clientes</a></PeractButtonPrimitive>);
    expect(screen.getByRole("link", { name: "Clientes" })).toHaveAttribute("href", "/clientes");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("forwards input refs and native changes", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const change = vi.fn();
    render(<PeractInputControl aria-label="Quantidade" type="number" min={0} ref={ref} onChange={change} />);
    await user.type(screen.getByRole("spinbutton"), "12");
    expect(ref.current).toBe(screen.getByRole("spinbutton"));
    expect(ref.current).toHaveValue(12);
    expect(change).toHaveBeenCalled();
  });

  it("preserves native selection, children and disabled state", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLSelectElement>();
    render(<PeractNativeSelect aria-label="Pagamento" ref={ref} defaultValue="">
      <option value="">Selecionar</option><option value="pix">Pix</option>
      <option value="card" disabled>Cartao</option>
    </PeractNativeSelect>);
    await user.selectOptions(screen.getByRole("combobox"), "pix");
    expect(ref.current).toHaveValue("pix");
    expect(screen.getByRole("option", { name: "Cartao" })).toBeDisabled();
  });

  it("forwards textarea refs and exposes validation", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLTextAreaElement>();
    render(<PeractTextarea aria-label="Observacoes" ref={ref} required aria-invalid />);
    await user.type(screen.getByRole("textbox"), "Entrega");
    expect(ref.current).toHaveValue("Entrega");
    expect(ref.current).toBeRequired();
    expect(ref.current).toHaveAttribute("aria-invalid", "true");
  });
});