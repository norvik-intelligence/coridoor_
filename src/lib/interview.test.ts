import { describe, expect, it } from "vitest";
import { interviewQuestions, isQuestionVisible } from "@/lib/interview";

describe("adaptive interview", () => {
  it("shows the adjustments follow-up only after a positive answer", () => {
    const question = interviewQuestions.find(
      (entry) => entry.id === "adjustments_detail"
    )!;
    expect(isQuestionVisible(question, { adjustments_present: false })).toBe(false);
    expect(isQuestionVisible(question, { adjustments_present: true })).toBe(true);
  });

  it("shows customer contract details above the concentration threshold", () => {
    const question = interviewQuestions.find(
      (entry) => entry.id === "largest_customer_contract"
    )!;
    expect(isQuestionVisible(question, { largest_customer_share: 20 })).toBe(false);
    expect(isQuestionVisible(question, { largest_customer_share: 21 })).toBe(true);
  });
});
