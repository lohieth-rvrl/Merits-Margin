import { useReveal } from "../hooks/useReveal";

export default function Reveal({ children, as: Tag = "div", className = "", ...rest }) {
  const { ref, isVisible } = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${isVisible ? "is-visible" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
