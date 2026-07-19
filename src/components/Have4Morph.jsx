import { motion } from "framer-motion";

export default function Have4Morph() {
  return (
    <div
      style={{
        fontFamily: "Bauhaus93, sans-serif",
        fontSize: "36px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span>HAVE</span>
      <span style={{ color: "#ff1a1a" }}>4</span>

      <motion.span
        style={{ color: "#ff1a1a", display: "inline-block" }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ?
      </motion.span>
    </div>
  );
}
