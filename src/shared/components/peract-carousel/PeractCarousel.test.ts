import { describe, expect, it } from "vitest";
import * as peract from "./index";
import * as legacy from "../ui/carousel";

describe("Peract carousel compatibility", () => {
  it("preserves Carousel", () => {
    expect(peract.PeractCarousel).toBeDefined();
    expect(peract.PeractCarousel).toBe(legacy.Carousel);
  });
  it("preserves CarouselContent", () => {
    expect(peract.PeractCarouselContent).toBeDefined();
    expect(peract.PeractCarouselContent).toBe(legacy.CarouselContent);
  });
  it("preserves CarouselItem", () => {
    expect(peract.PeractCarouselItem).toBeDefined();
    expect(peract.PeractCarouselItem).toBe(legacy.CarouselItem);
  });
  it("preserves CarouselPrevious", () => {
    expect(peract.PeractCarouselPrevious).toBeDefined();
    expect(peract.PeractCarouselPrevious).toBe(legacy.CarouselPrevious);
  });
  it("preserves CarouselNext", () => {
    expect(peract.PeractCarouselNext).toBeDefined();
    expect(peract.PeractCarouselNext).toBe(legacy.CarouselNext);
  });
});
