import React, { useId } from "react";

export function Input({ label, error, hint, id, className = "", ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const ariaDescribedBy =
    [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-glass ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

export default Input;

export function Select({
  label,
  error,
  hint,
  options,
  id,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = error ? `${selectId}-error` : undefined;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const ariaDescribedBy =
    [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`input-glass ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : props.children}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
