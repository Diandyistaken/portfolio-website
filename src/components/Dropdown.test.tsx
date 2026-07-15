import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropdown } from "./Dropdown";

function renderDropdown() {
  return render(
    <Dropdown trigger={({ toggle }) => <button onClick={toggle}>Open menu</button>}>
      {(close) => (
        <>
          <button role="menuitem" onClick={close}>
            First
          </button>
          <button role="menuitem" onClick={close}>
            Second
          </button>
          <button role="menuitem" onClick={close}>
            Third
          </button>
        </>
      )}
    </Dropdown>
  );
}

describe("Dropdown", () => {
  it("opens the menu when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDropdown();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.click(screen.getByText("Open menu"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderDropdown();

    await user.click(screen.getByText("Open menu"));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByText("Open menu")).toHaveFocus();
  });

  it("moves focus between items with ArrowDown/ArrowUp", async () => {
    const user = userEvent.setup();
    renderDropdown();

    await user.click(screen.getByText("Open menu"));
    const items = screen.getAllByRole("menuitem");
    expect(items[0]).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(items[1]).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(items[0]).toHaveFocus();
  });

  it("closes when an item is selected", async () => {
    const user = userEvent.setup();
    renderDropdown();

    await user.click(screen.getByText("Open menu"));
    await user.click(screen.getByText("Second"));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
