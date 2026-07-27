import { describe, expect, it } from "vitest";
import { calculateProgress, sanitizeFilename } from "@/lib/utils";
import { buildStoragePath } from "@/lib/upload";

describe("document safety", () => {
  it("sanitizes names without losing the extension", () => {
    expect(sanitizeFilename("../../Käufer Analyse (final).PDF")).toBe(
      "Kaufer-Analyse-final.pdf"
    );
  });

  it("builds a tenant-scoped storage path", () => {
    expect(
      buildStoragePath({
        organisationId: "org-1",
        engagementId: "eng-1",
        category: "financial",
        documentId: "doc-1",
        filename: "BWA 2026.pdf"
      })
    ).toBe("org-1/eng-1/financial/doc-1/BWA-2026.pdf");
  });
});

describe("interview progress", () => {
  it("counts only required answered fields", () => {
    expect(calculateProgress({ a: "done", b: "", c: ["x"] }, ["a", "b", "c"])).toBe(67);
  });
});
