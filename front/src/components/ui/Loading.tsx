import { motion } from "framer-motion";

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function Loading({ text = "Loading...", size = "md" }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-secondary/20 dark:border-darkCard/20 rounded-full" />
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-brand dark:border-t-darkAccent rounded-full" />
      </motion.div>
      <motion.p
        className="text-f-tertiary dark:text-darkMuted text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {text}
      </motion.p>
    </div>
  );
}
