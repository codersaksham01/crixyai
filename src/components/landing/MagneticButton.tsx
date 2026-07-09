import { useRef, type ReactNode, type CSSProperties } from "react";

export function Magnetic({
  children,
  className = "",
  style,
  as: Tag = "a",
  href,
  onClick,
  strength = 0.35,
  type,
  target,
  rel,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "a" | "button";
  href?: string;
  onClick?: () => void;
  strength?: number;
  type?: "button" | "submit";
  target?: string;
  rel?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  const commonProps = {
    ref: ref as never,
    className: "inline-block transition-transform duration-200 ease-out " + className,
    style,
    onMouseMove: onMove,
    onMouseLeave: reset,
    onClick,
    "aria-label": ariaLabel,
  };

  if (Tag === "button") {
    return <button type={type ?? "button"} {...commonProps}>{children}</button>;
  }
  return (
    <a
      href={href}
      target={target}
      rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
      {...commonProps}
    >
      {children}
    </a>
  );
}
