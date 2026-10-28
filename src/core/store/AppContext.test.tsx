import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { restoreMock, subscribeMock, unsubscribeMock, logoutMock } = vi.hoisted(() => ({
  restoreMock: vi.fn(),
  subscribeMock: vi.fn(),
  unsubscribeMock: vi.fn(),
  logoutMock: vi.fn(),
}));

vi.mock("../auth/session.service", () => ({
  sessionService: { restore: restoreMock, subscribeToClear: subscribeMock },
}));
vi.mock("../services/auth.service", () => ({ authService: { logout: logoutMock } }));
vi.mock("../logging/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn() } }));

import { AppProvider, useApp } from "./AppContext";

function SessionView() {
  const { categories, currentUser, isLoggedIn, logout } = useApp();
  return <>
    <p>{isLoggedIn ? "authenticated" : "signed-out"}</p>
    <p>{currentUser?.nome ?? "no-user"}</p>
    <p>{categories.map(category => category.nome).join(", ")}</p>
    <button onClick={() => void logout()}>Logout</button>
  </>;
}

describe("AppProvider session lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    restoreMock.mockReturnValue({ accessToken: "token", user: { id: "1", nome: "Admin", cargo: "Administrador" } });
    subscribeMock.mockReturnValue(unsubscribeMock);
    logoutMock.mockResolvedValue(undefined);
  });

  it("clears the user and authentication state when the HTTP layer clears the session", () => {
    const view = render(<AppProvider><SessionView /></AppProvider>);
    expect(screen.getByText("authenticated")).toBeInTheDocument();

    act(() => subscribeMock.mock.calls[0][0]());

    expect(screen.getByText("signed-out")).toBeInTheDocument();
    expect(screen.getByText("no-user")).toBeInTheDocument();
    expect(restoreMock).toHaveBeenCalledOnce();
    view.unmount();
    expect(unsubscribeMock).toHaveBeenCalledOnce();
  });

  it("leaves the application signed out even when server logout fails", async () => {
    logoutMock.mockRejectedValueOnce(new Error("Network Error"));
    const user = userEvent.setup();
    render(<AppProvider><SessionView /></AppProvider>);
    await user.click(screen.getByRole("button", { name: "Logout" }));
    await waitFor(() => expect(screen.getByText("signed-out")).toBeInTheDocument());
    expect(screen.getByText("no-user")).toBeInTheDocument();
  });

  it("initializes the selected mock categories", () => {
    render(<AppProvider><SessionView /></AppProvider>);

    expect(screen.getByText("Amadeirados, Ambarados, Cítricos, Florais")).toBeInTheDocument();
  });
});