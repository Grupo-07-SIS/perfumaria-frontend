import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PeractPagination } from "./PeractPagination";

function PaginationHarness({ initialPage = 1, totalPages = 7 }: { initialPage?: number; totalPages?: number }) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  return <PeractPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />;
}

function pageNumbers() {
  return screen.getAllByRole("button", { name: /^\d+$/ }).map(button => button.textContent);
}

describe("PeractPagination", () => {
  it.each([
    { currentPage: 1, totalPages: 2, expected: ["1", "2"] },
    { currentPage: 1, totalPages: 4, expected: ["1", "2", "3", "4"] },
    { currentPage: 1, totalPages: 7, expected: ["1", "2", "3", "4"] },
    { currentPage: 4, totalPages: 7, expected: ["3", "4", "5", "6"] },
    { currentPage: 7, totalPages: 7, expected: ["4", "5", "6", "7"] },
    { currentPage: 500, totalPages: 1000000, expected: ["499", "500", "501", "502"] },
  ])("shows a bounded window at $currentPage of $totalPages", ({ currentPage, totalPages, expected }) => {
    render(<PeractPagination currentPage={currentPage} totalPages={totalPages} onPageChange={vi.fn()} />);
    expect(pageNumbers()).toEqual(expected);
    expect(screen.getByRole("button", { name: String(currentPage), exact: true })).toHaveAttribute("aria-current", "page");
  });

  it("moves the window in both directions while keeping at most four numbers", async () => {
    const user = userEvent.setup();
    render(<PaginationHarness />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();

    for (let currentPage = 2; currentPage <= 7; currentPage += 1) {
      await user.click(screen.getByRole("button", { name: "Próxima" }));
      expect(pageNumbers()).toHaveLength(4);
      expect(screen.getByRole("button", { name: String(currentPage), exact: true })).toHaveAttribute("aria-current", "page");
    }
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
    expect(pageNumbers()).toEqual(["4", "5", "6", "7"]);

    for (let currentPage = 6; currentPage >= 1; currentPage -= 1) {
      await user.click(screen.getByRole("button", { name: "Anterior" }));
      expect(pageNumbers()).toHaveLength(4);
      expect(screen.getByRole("button", { name: String(currentPage), exact: true })).toHaveAttribute("aria-current", "page");
    }
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(pageNumbers()).toEqual(["1", "2", "3", "4"]);
  });

  it("supports selecting a visible page directly", async () => {
    const user = userEvent.setup();
    render(<PaginationHarness />);
    await user.click(screen.getByRole("button", { name: "4", exact: true }));
    expect(pageNumbers()).toEqual(["3", "4", "5", "6"]);
    expect(screen.getByRole("button", { name: "4", exact: true })).toHaveAttribute("aria-current", "page");
  });

  it.each([0, 1])("hides pagination for %s pages", totalPages => {
    render(<PaginationHarness totalPages={totalPages} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("preserves the callback and smooth scrolling to the selection target", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const scrollIntoView = vi.fn();
    render(<>
      <div id="pagination-results" />
      <PeractPagination currentPage={1} totalPages={7} onPageChange={onPageChange} targetSelection="pagination-results" />
    </>);
    Object.defineProperty(document.getElementById("pagination-results"), "scrollIntoView", { value: scrollIntoView });
    await user.click(screen.getByRole("button", { name: "Próxima" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });
});