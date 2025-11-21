// useTailwindTheme.ts (require a context/provider for dark mode state)
import { useTheme } from '@mui/material/styles';
import { getTailwindTheme } from "@/lib/tailwind-theme";

export function useMyTheme() {
  const muiTheme = useTheme();
  return getTailwindTheme(muiTheme.palette.mode === "dark" ? "dark" : "light");
}
