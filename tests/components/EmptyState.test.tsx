// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { EmptyState } from "@/components/shared/EmptyState";
import { Inbox } from "lucide-react";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No items yet"
        description="Add your first item to get started."
      />,
    );

    expect(screen.getByText("No items yet")).toBeInTheDocument();
    expect(screen.getByText("Add your first item to get started.")).toBeInTheDocument();
  });

  it("renders action button when action prop is provided", () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        icon={Inbox}
        title="Empty"
        description="Nothing here."
        action={{ label: "Create New", onClick: handleClick }}
      />,
    );

    expect(screen.getByRole("button", { name: "Create New" })).toBeInTheDocument();
  });

  it("calls action.onClick when button is clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <EmptyState
        icon={Inbox}
        title="Empty"
        description="Nothing here."
        action={{ label: "Create New", onClick: handleClick }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create New" }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("renders no button when action prop is omitted", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Empty"
        description="Nothing here."
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
