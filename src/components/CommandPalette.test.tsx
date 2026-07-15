import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { en } from "@/lib/i18n/en";
import { CommandPalette } from "./CommandPalette";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Small local wrapper so tests can drive `open` without re-implementing
// Navbar's open-state plumbing.
function CommandPaletteControlled({
  triggerRef,
  initialOpen,
}: {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  initialOpen: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  return <CommandPalette open={open} onOpenChange={setOpen} triggerRef={triggerRef} />;
}

function Harness({
  initialOpen = true,
  initialLocale = "tr" as const,
}: {
  initialOpen?: boolean;
  initialLocale?: "tr" | "en";
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <LanguageProvider initialLocale={initialLocale} initialDict={initialLocale === "en" ? en : undefined}>
      <button ref={triggerRef}>trigger</button>
      <CommandPaletteControlled triggerRef={triggerRef} initialOpen={initialOpen} />
    </LanguageProvider>
  );
}

describe("CommandPalette", () => {

  it("renders navigation and action items when open", () => {
    render(<Harness />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("CV indir")).toBeInTheDocument();
    expect(screen.getByText("E-postayı kopyala")).toBeInTheDocument();
  });

  it("filters items as the user types", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByPlaceholderText(/bir bölüm veya komut ara/i), "cv");

    expect(screen.getByText("CV indir")).toBeInTheDocument();
    expect(screen.queryByText("E-postayı kopyala")).not.toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByPlaceholderText(/bir bölüm veya komut ara/i), "zzzzz");

    expect(screen.getByText(/sonuç bulunamadı/i)).toBeInTheDocument();
  });

  it("copies the email and updates the label without closing", async () => {
    const user = userEvent.setup();
    // user-event installs its own clipboard stub during setup(), so ours
    // must be defined after that or it gets silently overwritten.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    render(<Harness />);

    await user.click(screen.getByText("E-postayı kopyala"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("mo.maksut@gmail.com");
    expect(await screen.findByText("E-posta kopyalandı")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows a failure label and keeps the dialog open when copying fails", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });
    render(<Harness />);

    await user.click(screen.getByText("E-postayı kopyala"));

    expect(await screen.findByText(/kopyalanamadı/i)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
