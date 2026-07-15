import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { Contact } from "./Contact";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

function renderContact() {
  return render(
    <LanguageProvider initialLocale="tr">
      <Contact />
    </LanguageProvider>
  );
}

describe("Contact", () => {
  it("renders a mailto link with the personal email", () => {
    renderContact();
    const link = screen.getByRole("link", { name: /mo\.maksut@gmail\.com/i });
    expect(link).toHaveAttribute("href", "mailto:mo.maksut@gmail.com");
  });

  it("copies the email to the clipboard and shows confirmation", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    renderContact();

    await user.click(screen.getByRole("button", { name: /kopyala/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("mo.maksut@gmail.com");
    expect(await screen.findByText("Kopyalandı")).toBeInTheDocument();
  });

  it("shows a fallback message when copying fails", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });
    renderContact();

    await user.click(screen.getByRole("button", { name: /kopyala/i }));

    expect(await screen.findByText(/kopyalanamadı/i)).toBeInTheDocument();
  });
});
