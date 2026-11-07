import React, { ReactNode, useState, useEffect, useRef } from "react"; // Added useRef here
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "destructive";
}

interface ToastProps {
  toast: Toast;
  duration?: number;
}

const useToast = (toast: Toast, duration = 4000) => {
  const [isVisible, setIsVisible] = useState(false);
  const [autoDismiss, setAutoDismiss] = useState(true);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration]);

  return { isVisible, setIsVisible, autoDismiss, setAutoDismiss };
};

export function Toast({ toast, duration = 4000 }: ToastProps) {
  const { isVisible, setIsVisible } = useToast(toast, duration);

  // Moved inside the component and updated to use the direct import
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 flex flex-col gap-2 z-50"
    >
      {isVisible && (
        <div
          className={cn(
            "rounded-md bg-neutral-900 dark:bg-neutral-100 px-4 py-3 text-sm shadow-lg border border-neutral-700/50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        >
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-neutral-300 dark:text-neutral-700"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-200 dark:text-neutral-800">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-neutral-500/80 dark:text-neutral-400/{80} text-xs/{1.5}">
                  {toast.description}
                </p>
              )}
            </div>
            {toast.action && <span>{toast.action}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
