import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../app/components/figma/ImageWithFallback", () => ({
  ImageWithFallback: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

import { LoginHeroPanel } from "./LoginHeroPanel";

describe("LoginHeroPanel", () => {
  it("renders the visual identity and headline", () => {
    render(<LoginHeroPanel />);

    expect(screen.getByText("Canal Perfumado")).toBeInTheDocument();
    expect(screen.getByText("DECANTS")).toBeInTheDocument();
    expect(screen.getByText(/Gestão com a/)).toBeInTheDocument();
    expect(screen.getByAltText("Canal Perfumado Decants")).toBeInTheDocument();
  });
});