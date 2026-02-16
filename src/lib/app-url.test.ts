import { describe, expect, it, vi } from "vitest";
import { normalizeTrustedBaseUrl } from "./app-url";

describe("normalizeTrustedBaseUrl", () => {
  it("keeps only safe http/https URL and strips query/hash", () => {
    expect(normalizeTrustedBaseUrl("https://example.com/path/?q=1#frag")).toBe(
      "https://example.com/path",
    );
  });

  it("returns null for unsupported protocol", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(normalizeTrustedBaseUrl("javascript:alert(1)")).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("returns null for URL with credentials", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(normalizeTrustedBaseUrl("https://user:pass@example.com/app")).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("returns null for invalid URL", () => {
    expect(normalizeTrustedBaseUrl("notaurl")).toBeNull();
  });
});
