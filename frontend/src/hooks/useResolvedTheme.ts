import {useColorScheme} from "react-native";

export function useResolvedTheme(themeMode?: "LIGHT" | "DARK" | "SYSTEM") {
    const system = useColorScheme() ?? "light";

    if (themeMode === "SYSTEM") return system;
    if (themeMode === "DARK") return "dark";
    return "light";
}