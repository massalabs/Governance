import { Toast } from "@massalabs/react-ui-kit";
import { useUIStore } from "../store/useUIStore";

export function ThemeAwareToast() {
  const { theme } = useUIStore();

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <Toast />
    </div>
  );
}
