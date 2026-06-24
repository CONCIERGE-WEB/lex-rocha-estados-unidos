import { describe, expect, it } from "vitest";

import { emailsAdminPermitidos } from "@/lib/security/config";

describe("admin-guard", () => {
  it("reconhece lista de emails admin", () => {
    const emails = emailsAdminPermitidos(
      "contato.lexrocha@gmail.com,globemarket7@gmail.com"
    );
    expect(emails).toContain("contato.lexrocha@gmail.com");
    expect(emails).toContain("globemarket7@gmail.com");
  });
});
