import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const USER_ID = "11111111-1111-1111-1111-111111111111";

type Profile = {
  user_id: string;
  pin_hash: string | null;
  pin_salt: string | null;
  voice_enabled: boolean;
  phone_number: string | null;
  scheduled_call_at: string | null;
};

let profileRow: Profile | null = null;
const updateSpy = vi.fn();

vi.mock("@/integrations/supabase/client", () => {
  const table = () => {
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    Object.assign(builder, {
      select: chain,
      eq: chain,
      insert: chain,
      delete: chain,
      update: (values: Record<string, unknown>) => {
        updateSpy(values);
        Object.assign(profileRow!, values);
        return { eq: async () => ({ error: null }) };
      },
      maybeSingle: async () => ({ data: profileRow, error: null }),
      then: (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null }),
    });
    return builder;
  };
  return {
    supabase: {
      auth: { getUser: async () => ({ data: { user: { id: USER_ID } } }) },
      from: () => table(),
    },
  };
});

// Imported after the mock so the vault picks up the fake client.
const { hashPin, randomSalt } = await import("@/lib/avatar-crypto");
const { useAvatarVault } = await import("@/lib/avatar-vault");
const { PinKeypad } = await import("@/components/avatar/PinKeypad");

/** Mirrors the PIN gate of the /avatar dashboard route. */
function AvatarGate() {
  const vault = useAvatarVault();
  if (vault.status === "unlocked") return <div>InwardWise Self Portrait</div>;
  if (vault.status === "loading") return <div>Loading…</div>;
  return (
    <PinKeypad
      mode={vault.status === "needs-setup" ? "setup" : "enter"}
      busy={vault.busy}
      error={vault.error}
      onSubmit={(pin) =>
        vault.status === "needs-setup" ? vault.setupPin(pin) : vault.unlock(pin)
      }
    />
  );
}

/** The prompt is split across styled brand spans, so match on the label's full text. */
function findPinPrompt() {
  return screen.findByText(
    (_, el) => el?.textContent?.replace(/\s+/g, " ").trim() === "Enter your InwardWise Self PIN",
  );
}

async function enterPin(pin: string) {
  const user = userEvent.setup();
  for (const digit of pin) {
    await user.click(screen.getByRole("button", { name: digit }));
  }
}

describe("InwardWise Self PIN gate", () => {
  beforeEach(() => {
    sessionStorage.clear();
    updateSpy.mockClear();
    profileRow = null;
  });

  it("unlocks the dashboard with the correct PIN", async () => {
    const salt = randomSalt();
    profileRow = {
      user_id: USER_ID,
      pin_hash: await hashPin("1234", salt),
      pin_salt: salt,
      voice_enabled: false,
      phone_number: null,
      scheduled_call_at: null,
    };

    render(<AvatarGate />);
    await findPinPrompt();

    await enterPin("1234");

    expect(await screen.findByText("InwardWise Self Portrait", {}, { timeout: 10_000 })).toBeInTheDocument();
  }, 20_000);

  it("blocks the dashboard when the PIN is incorrect", async () => {
    const salt = randomSalt();
    profileRow = {
      user_id: USER_ID,
      pin_hash: await hashPin("1234", salt),
      pin_salt: salt,
      voice_enabled: false,
      phone_number: null,
      scheduled_call_at: null,
    };

    render(<AvatarGate />);
    await findPinPrompt();

    await enterPin("9999");

    expect(
      await screen.findByText("That PIN is not correct.", {}, { timeout: 10_000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText("InwardWise Self Portrait")).not.toBeInTheDocument();
    expect(sessionStorage.getItem("avatar-pin:session")).toBeNull();
  }, 20_000);

  it("sets a PIN on first use and unlocks", async () => {
    profileRow = {
      user_id: USER_ID,
      pin_hash: null,
      pin_salt: null,
      voice_enabled: false,
      phone_number: null,
      scheduled_call_at: null,
    };

    render(<AvatarGate />);
    await screen.findByText("Choose a 4-digit PIN");

    await enterPin("4321");
    await screen.findByText("Confirm your PIN");
    await enterPin("4321");

    await waitFor(() => expect(updateSpy).toHaveBeenCalled(), { timeout: 10_000 });
    expect(await screen.findByText("InwardWise Self Portrait", {}, { timeout: 10_000 })).toBeInTheDocument();
  }, 30_000);
});
