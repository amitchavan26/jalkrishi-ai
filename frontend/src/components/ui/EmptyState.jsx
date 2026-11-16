import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  text,
  action,
  children,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl p-8 text-center max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4">
        <Icon />
      </div>
      <h2 className="text-lg font-semibold text-ink mb-2">{title}</h2>
      {text && <p className="text-sm text-muted mb-4">{text}</p>}
      {action ? (
        React.isValidElement(action) ? (
          action
        ) : (
          <Button>{action}</Button>
        )
      ) : null}
      {children}
    </div>
  );
}

export default EmptyState;
