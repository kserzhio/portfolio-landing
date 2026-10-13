"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { scopes } from "@/content/team";
import { links } from "@/content/site";
import s from "./team.module.css";

type Field = "name" | "email";
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactAddress = links.email.replace(/^mailto:/, "");

function validate(data: FormData): Errors {
  const errors: Errors = {};
  if (!String(data.get("name") ?? "").trim()) errors.name = "Enter your name.";
  const email = String(data.get("email") ?? "").trim();
  if (!email) errors.email = "Enter your work email.";
  else if (!EMAIL.test(email)) errors.email = "Enter an email address like jane@company.com.";
  return errors;
}

/**
 * "Book a free consultation". No backend: on a valid submit it opens the
 * visitor's mail app with the request filled in. Errors follow the pattern
 * the audits recommend — an error summary that takes focus, linked to each
 * field, plus aria-invalid and a described-by message on the field itself.
 */
export function ConsultForm() {
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  // Bumped on every failed submit so the summary takes focus again.
  const [attempt, setAttempt] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (attempt) summaryRef.current?.focus();
  }, [attempt]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = validate(data);
    setErrors(next);
    if (Object.keys(next).length) {
      setSent(false);
      setAttempt((n) => n + 1);
      return;
    }
    const company = String(data.get("company") ?? "").trim();
    const subject = `Free consultation${company ? ` — ${company}` : ""}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Work email: ${data.get("email")}`,
      company && `Company: ${company}`,
      `What should we audit: ${data.get("scope")}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`${links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_self");
    setSent(true);
  };

  const fieldProps = (name: Field) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined,
    onChange: () => errors[name] && setErrors((cur) => ({ ...cur, [name]: undefined })),
  });
  const errorList = (Object.keys(errors) as Field[]).filter((k) => errors[k]);

  return (
    <form className={s.form} noValidate onSubmit={onSubmit} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className={s.formTitle}>
        Book a free consultation
      </h3>

      {errorList.length > 0 && (
        <div ref={summaryRef} className={s.errorSummary} tabIndex={-1} role="alert" aria-labelledby={`${id}-sum`}>
          <p id={`${id}-sum`}>
            {errorList.length === 1 ? "There is 1 problem" : `There are ${errorList.length} problems`} with the form
          </p>
          <ul>
            {errorList.map((k) => (
              <li key={k}>
                <a
                  href={`#${id}-${k}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`${id}-${k}`)?.focus();
                  }}
                >
                  {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={s.field}>
        <label htmlFor={`${id}-name`}>Name</label>
        {errors.name && (
          <p id={`${id}-name-err`} className={s.fieldError}>
            <span aria-hidden="true">✕ </span>
            {errors.name}
          </p>
        )}
        <input {...fieldProps("name")} type="text" autoComplete="name" required />
      </div>

      <div className={s.field}>
        <label htmlFor={`${id}-email`}>Work email</label>
        {errors.email && (
          <p id={`${id}-email-err`} className={s.fieldError}>
            <span aria-hidden="true">✕ </span>
            {errors.email}
          </p>
        )}
        <input {...fieldProps("email")} type="email" autoComplete="email" inputMode="email" required />
      </div>

      <div className={s.field}>
        <label htmlFor={`${id}-company`}>
          Company <span className={s.optional}>(optional)</span>
        </label>
        <input id={`${id}-company`} name="company" type="text" autoComplete="organization" />
      </div>

      <fieldset className={s.scope}>
        <legend>What should we audit?</legend>
        <div className={s.scopeChips}>
          {scopes.map((t, i) => (
            <label key={t} className={s.scopeChip}>
              <input type="radio" name="scope" value={t} defaultChecked={i === 0} />
              <span>
                <span className={s.scopeTick} aria-hidden="true">
                  ✓
                </span>
                {t}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" className={`${s.btn} ${s.btnInk} ${s.btnBlock} ${s.btnLg}`}>
        Book a free consultation <span aria-hidden="true">→</span>
      </button>
      <p className={s.formNote} role="status">
        {sent ? (
          <>
            Your email app should open with the request ready to send. If it doesn&rsquo;t, write to{" "}
            <a href={links.email}>{contactAddress}</a>.
          </>
        ) : (
          "We reply within one business day. No obligation."
        )}
      </p>
    </form>
  );
}
