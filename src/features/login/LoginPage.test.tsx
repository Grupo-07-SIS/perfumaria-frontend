import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { useLoginFacadeMock } = vi.hoisted(() => ({
  useLoginFacadeMock: vi.fn(),
}));

vi.mock("./facade/useLoginFacade", () => ({
  useLoginFacade: useLoginFacadeMock,
}));

vi.mock("./components/LoginHeroPanel", () => ({
  LoginHeroPanel: () => <div>Hero Panel</div>,
}));

vi.mock("./components/LoginFormPanel", () => ({
  LoginFormPanel: ({ accounts }: { accounts: { email: string }[] }) => <div>Form Panel {accounts.length}</div>,
}));

import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("composes the hero, form panel and feature facade", () => {
    useLoginFacadeMock.mockReturnValue({});

    render(<LoginPage />);

    expect(useLoginFacadeMock).toHaveBeenCalled();
    expect(screen.getByText("Hero Panel")).toBeInTheDocument();
    expect(screen.getByText(/Form Panel/)).toBeInTheDocument();
  });
});