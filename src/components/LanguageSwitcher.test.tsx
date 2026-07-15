import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

function renderSwitcher() {
  return render(
    <LanguageProvider initialLocale="tr">
      <LanguageSwitcher />
    </LanguageProvider>
  );
}

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    window.localStorage.clear();
  });

  it("shows the current locale on the trigger", () => {
    renderSwitcher();
    expect(screen.getByRole("button", { name: /dili değiştir/i })).toHaveTextContent("TR");
  });

  it("opens the menu and lists all locales", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByRole("button", { name: /dili değiştir/i }));

    expect(screen.getByRole("menuitem", { name: /Türkçe/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Deutsch/i })).toBeInTheDocument();
  });

  it("navigates to the matching locale path when a language is picked", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByRole("button", { name: /dili değiştir/i }));
    await user.click(screen.getByRole("menuitem", { name: /English/i }));

    expect(push).toHaveBeenCalledWith("/en");
    expect(window.localStorage.getItem("lang")).toBe("en");
  });

  it("closes the menu after a selection", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByRole("button", { name: /dili değiştir/i }));
    await user.click(screen.getByRole("menuitem", { name: /Deutsch/i }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
