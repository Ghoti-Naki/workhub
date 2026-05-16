// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FilterBar } from "@/components/shared/FilterBar";

const baseFilters = [
  {
    key: "status",
    label: "Status",
    value: "all",
    onChange: vi.fn(),
    options: [
      { value: "all", label: "All" },
      { value: "active", label: "Active" },
      { value: "done", label: "Done" },
    ],
  },
];

describe("FilterBar", () => {
  it("renders filter options", () => {
    render(<FilterBar filters={baseFilters} resultCount={5} totalCount={5} />);

    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("calls onChange when a filter button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const filters = [{ ...baseFilters[0], onChange }];

    render(<FilterBar filters={filters} resultCount={5} totalCount={5} />);

    await user.click(screen.getByRole("button", { name: "Active" }));
    expect(onChange).toHaveBeenCalledWith("active");
  });

  it("shows result count when filtered", () => {
    render(<FilterBar filters={baseFilters} resultCount={3} totalCount={10} />);
    expect(screen.getByText("3 of 10")).toBeInTheDocument();
  });

  it("shows total count when not filtered", () => {
    render(<FilterBar filters={baseFilters} resultCount={5} totalCount={5} />);
    expect(screen.getByText("5 total")).toBeInTheDocument();
  });

  it("highlights the active filter option", () => {
    const filters = [{ ...baseFilters[0], value: "active" }];
    render(<FilterBar filters={filters} resultCount={2} totalCount={5} />);

    const activeBtn = screen.getByRole("button", { name: "Active" });
    // Active option should have the dark bg class
    expect(activeBtn.className).toContain("bg-slate-900");
  });
});
