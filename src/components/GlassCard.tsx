import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard = ({ children, className, hover = true, ...props }: GlassCardProps) => (
  <motion.div
    whileHover={hover ? { y: -4 } : undefined}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={cn("glass-card", className)}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0_0%_100%/0.1)] to-transparent pointer-events-none rounded-[24px]" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

export default GlassCard;
