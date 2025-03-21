import { useState, useEffect, useRef } from "react";

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  pixelSize?: number;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

export function PixelButton({
  onClick,
  children,
  className = "",
  pixelSize = 8, // Size of each pixel in pixels
  variant = "primary",
  disabled = false,
  fullWidth = false,
  type = "button",
}: PixelButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pixels, setPixels] = useState<boolean[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [filledPercentage, setFilledPercentage] = useState(0);

  // Calculate number of columns and rows based on button dimensions
  const cols = Math.ceil(dimensions.width / pixelSize);
  const rows = Math.ceil(dimensions.height / pixelSize);
  const totalPixels = cols * rows;

  // Update dimensions and pixel array when button size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (buttonRef.current) {
        const { offsetWidth, offsetHeight } = buttonRef.current;
        setDimensions({
          width: offsetWidth,
          height: offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Update pixel array when dimensions change
  useEffect(() => {
    if (totalPixels > 0) {
      setPixels(new Array(totalPixels).fill(false));
    }
  }, [totalPixels]);

  const variantClasses = {
    primary: {
      default: "text-brand dark:text-darkAccent",
      filled: "text-white",
      pixelBg: "bg-brand dark:bg-darkAccent",
    },
    secondary: {
      default: "text-neutral dark:text-darkText",
      filled: "text-white",
      pixelBg: "bg-neutral dark:bg-darkText",
    },
  };

  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    if (!disabled && totalPixels > 0) {
      const interval = setInterval(() => {
        setPixels((prev) => {
          if (isHovered) {
            // Fill animation
            const emptyPixels = prev
              .map((p, i) => (!p ? i : -1))
              .filter((i) => i !== -1);

            if (emptyPixels.length === 0) {
              clearInterval(interval);
              return prev;
            }

            const currentFillPercentage =
              (1 - emptyPixels.length / totalPixels) * 100;

            const fillRate = Math.min(
              0.5,
              0.05 + (currentFillPercentage / 100) * 0.45
            );

            const pixelsToFillCount = Math.max(
              1,
              Math.floor(emptyPixels.length * fillRate)
            );

            const newPixels = [...prev];

            for (let i = 0; i < pixelsToFillCount; i++) {
              const randomIndex = Math.floor(
                Math.random() * emptyPixels.length
              );
              const pixelIndex = emptyPixels[randomIndex];
              newPixels[pixelIndex] = true;
              emptyPixels.splice(randomIndex, 1);
            }

            const filledCount = newPixels.filter(Boolean).length;
            setFilledPercentage((filledCount / totalPixels) * 100);

            return newPixels;
          } else {
            // Empty animation
            const filledPixels = prev
              .map((p, i) => (p ? i : -1))
              .filter((i) => i !== -1);

            if (filledPixels.length === 0) {
              clearInterval(interval);
              return prev;
            }

            const currentEmptyPercentage =
              (1 - filledPixels.length / totalPixels) * 100;

            const emptyRate = Math.min(
              0.5,
              0.05 + (currentEmptyPercentage / 100) * 0.45
            );

            const pixelsToEmptyCount = Math.max(
              1,
              Math.floor(filledPixels.length * emptyRate)
            );

            const newPixels = [...prev];

            for (let i = 0; i < pixelsToEmptyCount; i++) {
              const randomIndex = Math.floor(
                Math.random() * filledPixels.length
              );
              const pixelIndex = filledPixels[randomIndex];
              newPixels[pixelIndex] = false;
              filledPixels.splice(randomIndex, 1);
            }

            const filledCount = newPixels.filter(Boolean).length;
            setFilledPercentage((filledCount / totalPixels) * 100);

            return newPixels;
          }
        });
      }, 20);

      setIntervalId(interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHovered, totalPixels, disabled]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`
        relative group outline-none overflow-hidden
        px-6 py-3 rounded-lg 
        bg-white dark:bg-darkCard
        ${fullWidth ? "w-full" : ""}
        transition-all duration-200
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-brand/20 dark:focus:ring-darkAccent/20"
        }
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative z-10 flex items-center justify-center">
        <span
          className={`
            mas-buttons font-medium text-lg transition-colors duration-200
            ${
              filledPercentage > 30
                ? variantClasses[variant].filled
                : variantClasses[variant].default
            }
          `}
        >
          {children}
        </span>
      </div>
      <div
        className="absolute inset-0 grid -z-10 rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${pixelSize}px)`,
        }}
      >
        {pixels.map((filled, i) => (
          <div
            key={i}
            className={`${
              filled ? variantClasses[variant].pixelBg : "bg-transparent"
            }`}
            style={{
              transition: "background-color 0.1s ease",
              width: `${pixelSize}px`,
              height: `${pixelSize}px`,
            }}
          />
        ))}
      </div>
    </button>
  );
}
