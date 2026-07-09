import { motion, useScroll, useSpring } from "framer-motion";

/** Thin top-of-page scroll progress indicator. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.35,
  });
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 top-0 z-[150] h-[2px] origin-left bg-[rgb(var(--ink))]"
      style={{ scaleX }}
    />
  );
}
