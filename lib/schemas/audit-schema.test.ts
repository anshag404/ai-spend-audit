import { describe, it, expect } from "vitest";
import { auditFormSchema } from "./audit-schema";

describe("Audit Form Schema", () => {
  it("validates a correct form", () => {
    const validData = {
      teamName: "Acme Corp",
      teamSize: 10,
      tools: [
        {
          toolId: "chatgpt",
          planId: "plus",
          billingCycle: "monthly",
          seats: 5,
          monthlySpend: 100,
          useCase: "data-analysis",
        },
      ],
    };
    const result = auditFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails if team name is missing", () => {
    const invalidData = {
      teamName: "",
      teamSize: 10,
      tools: [],
    };
    const result = auditFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("fails if tools list is empty", () => {
    const invalidData = {
      teamName: "Acme",
      teamSize: 10,
      tools: [],
    };
    const result = auditFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("enforces minimum seats", () => {
    const invalidData = {
      teamName: "Acme",
      teamSize: 10,
      tools: [
        {
          toolId: "chatgpt",
          planId: "plus",
          billingCycle: "monthly",
          seats: 0,
          monthlySpend: 100,
          useCase: "general-chat",
        },
      ],
    };
    const result = auditFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
