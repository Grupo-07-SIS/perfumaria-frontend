import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PeractModal, PeractModalTitle } from "./index";
import { PeractButtonPrimitive } from "../peract-button";
import { PeractModalAction } from "../peract-modal-action";
import { PeractInputControl } from "../peract-input";

describe("PeractModal", () => {
  it("composes action confirmation and prevents duplicate submission", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    const cancel = vi.fn();
    render(<PeractModalAction title="Remover" btnPrimaryAction={confirm} buttonSecondaryAction={cancel} submitting>
      <p>Confirmar remocao?</p>
    </PeractModalAction>);
    expect(screen.getByRole("dialog", { name: "Remover" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(cancel).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  it("exposes its title and requests dismissal on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PeractModal onClose={onClose}><PeractModalTitle>Editar</PeractModalTitle><PeractButtonPrimitive>Salvar</PeractButtonPrimitive></PeractModal>);
    expect(screen.getByRole("dialog", { name: "Editar" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps focus within the dialog", async () => {
    const user = userEvent.setup();
    render(<><PeractButtonPrimitive>Fora</PeractButtonPrimitive><PeractModal onClose={vi.fn()}>
      <PeractModalTitle>Confirmar</PeractModalTitle>
      <PeractButtonPrimitive>Cancelar</PeractButtonPrimitive><PeractButtonPrimitive>Salvar</PeractButtonPrimitive>
    </PeractModal></>);
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
  });

  it("does not display closed content", () => {
    render(<PeractModal open={false} onClose={vi.fn()}><PeractModalTitle>Editar</PeractModalTitle></PeractModal>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("returns focus to the opening action after dismissal", async () => {
    function ModalFlow() {
      const [open, setOpen] = useState(false);
      return <>
        <PeractButtonPrimitive onClick={() => setOpen(true)}>Novo produto</PeractButtonPrimitive>
        {open && <PeractModal onClose={() => setOpen(false)}>
          <PeractModalTitle>Novo produto</PeractModalTitle>
          <PeractInputControl autoFocus aria-label="Nome" />
          <PeractButtonPrimitive onClick={() => setOpen(false)}>Cancelar</PeractButtonPrimitive>
        </PeractModal>}
      </>;
    }

    const user = userEvent.setup();
    render(<ModalFlow />);
    const openingAction = screen.getByRole("button", { name: "Novo produto" });
    await user.click(openingAction);
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(openingAction).toHaveFocus());
  });
});