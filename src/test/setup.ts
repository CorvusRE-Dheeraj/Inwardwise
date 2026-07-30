import "@testing-library/jest-dom/vitest";
import { webcrypto } from "node:crypto";

// jsdom ships no WebCrypto subtle implementation; the Avatar PIN gate needs it.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}
