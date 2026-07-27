"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import {
  interviewQuestions,
  interviewSections,
  isQuestionVisible
} from "@/lib/interview";
import { calculateProgress, cn } from "@/lib/utils";
import { submitInterview } from "@/lib/actions/dealroom";
import type { InterviewQuestion } from "@/lib/types";

function QuestionField({
  question,
  value,
  disabled,
  onChange
}: {
  question: InterviewQuestion;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
}) {
  const id = `question-${question.id}`;
  if (question.kind === "boolean") {
    return (
      <div className="binary-field" role="group" aria-labelledby={`${id}-label`}>
        {[
          ["Ja", true],
          ["Nein", false]
        ].map(([label, option]) => (
          <button
            className={value === option ? "selected" : ""}
            disabled={disabled}
            key={String(label)}
            onClick={() => onChange(option)}
            type="button"
          >
            {value === option && <Check size={15} aria-hidden="true" />}
            {String(label)}
          </button>
        ))}
      </div>
    );
  }

  if (question.kind === "single") {
    return (
      <div className="option-field">
        {question.options?.map((option) => (
          <label key={option}>
            <input
              checked={value === option}
              disabled={disabled}
              name={question.id}
              onChange={() => onChange(option)}
              type="radio"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.kind === "multiple") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="option-field">
        {question.options?.map((option) => (
          <label key={option}>
            <input
              checked={selected.includes(option)}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...selected, option]
                    : selected.filter((entry) => entry !== option)
                )
              }
              type="checkbox"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.kind === "textarea") {
    return (
      <textarea
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        value={typeof value === "string" ? value : ""}
      />
    );
  }

  const isNumber = ["number", "percent", "currency"].includes(question.kind);
  return (
    <div className="input-with-unit">
      <input
        disabled={disabled}
        id={id}
        inputMode={isNumber ? "decimal" : undefined}
        onChange={(event) =>
          onChange(isNumber ? (event.target.value === "" ? "" : Number(event.target.value)) : event.target.value)
        }
        type={question.kind === "date" ? "date" : isNumber ? "number" : "text"}
        value={typeof value === "string" || typeof value === "number" ? value : ""}
      />
      {question.kind === "percent" && <span>%</span>}
      {question.kind === "currency" && <span>EUR</span>}
    </div>
  );
}

export function InterviewForm({
  responseId,
  initialAnswers,
  initialSection = 0,
  locked = false
}: {
  responseId: string;
  initialAnswers: Record<string, unknown>;
  initialSection?: number;
  locked?: boolean;
}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [sectionIndex, setSectionIndex] = useState(initialSection);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const visibleQuestions = useMemo(
    () => interviewQuestions.filter((question) => isQuestionVisible(question, answers)),
    [answers]
  );
  const requiredIds = visibleQuestions
    .filter((question) => question.required)
    .map((question) => question.id);
  const progress = calculateProgress(answers, requiredIds);
  const currentSection = interviewSections[sectionIndex] ?? interviewSections[0]!;
  const sectionQuestions = visibleQuestions.filter(
    (question) => question.section === currentSection.id
  );

  useEffect(() => {
    if (!dirtyRef.current || locked) return;
    const timeout = window.setTimeout(async () => {
      setSaveState("saving");
      try {
        const response = await fetch("/api/interview/autosave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responseId, answers, progress })
        });
        if (!response.ok) throw new Error("save failed");
        const data = (await response.json()) as { savedAt: string };
        dirtyRef.current = false;
        setLastSavedAt(data.savedAt);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 850);
    return () => window.clearTimeout(timeout);
  }, [answers, locked, progress, responseId]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const changeAnswer = (id: string, value: unknown) => {
    dirtyRef.current = true;
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  return (
    <div className="interview-app">
      <aside className="interview-sidebar">
        <div>
          <p className="micro-label">Fortschritt</p>
          <strong>{progress}%</strong>
          <div className="progress-line"><i style={{ width: `${progress}%` }} /></div>
        </div>
        <nav aria-label="Interviewabschnitte">
          {interviewSections.map((section, index) => (
            <button
              className={cn(index === sectionIndex && "active")}
              key={section.id}
              onClick={() => setSectionIndex(index)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {section.title}
            </button>
          ))}
        </nav>
      </aside>
      <div className="interview-content">
        <div className="interview-content-head">
          <div>
            <p className="micro-label">Abschnitt {String(sectionIndex + 1).padStart(2, "0")}</p>
            <h2>{currentSection.title}</h2>
          </div>
          <div className={`save-state save-state-${saveState}`}>
            <Save size={14} aria-hidden="true" />
            {locked
              ? "Eingereicht"
              : saveState === "saving"
                ? "Speichert …"
                : saveState === "error"
                  ? "Speichern fehlgeschlagen"
                  : lastSavedAt
                    ? `Gespeichert ${new Date(lastSavedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
                    : "Autosave aktiv"}
          </div>
        </div>
        <div className="interview-question-list">
          {sectionQuestions.map((question, index) => (
            <div className="interview-question" key={question.id}>
              <div className="question-number">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <label id={`question-${question.id}-label`} htmlFor={`question-${question.id}`}>
                  {question.label}
                  {question.required && <span aria-label="Pflichtfeld">*</span>}
                </label>
                {question.description && <p>{question.description}</p>}
                <QuestionField
                  disabled={locked}
                  onChange={(value) => changeAnswer(question.id, value)}
                  question={question}
                  value={answers[question.id]}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="interview-controls">
          <button
            className="button button-ghost"
            disabled={sectionIndex === 0}
            onClick={() => setSectionIndex((current) => Math.max(0, current - 1))}
            type="button"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Zurück
          </button>
          {sectionIndex < interviewSections.length - 1 ? (
            <button
              className="button button-dark"
              onClick={() =>
                setSectionIndex((current) => Math.min(interviewSections.length - 1, current + 1))
              }
              type="button"
            >
              Nächster Abschnitt <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <form action={submitInterview}>
              <input name="responseId" type="hidden" value={responseId} />
              <button className="button button-dark" disabled={locked || progress < 100} type="submit">
                Interview verbindlich einreichen
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
