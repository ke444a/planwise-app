import React, { createContext, useContext, useEffect, PropsWithChildren } from "react";
import tw, { useAppColorScheme, useDeviceContext, RnColorScheme } from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ColorScheme = "light" | "dark" | "device";
type ThemeContextType = {
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setSpecificTheme: (_theme: ColorScheme) => void;
  memoBuster: string;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = (props: PropsWithChildren) => {
    // Get initial theme from storage
    const getInitialTheme = async (): Promise<ColorScheme> => {
        try {
            const storedTheme = await AsyncStorage.getItem("colorScheme");
            return (storedTheme as ColorScheme) || "light";
        } catch (_error) {
            return "light";
        }
    };

    // Initialize device context
    useDeviceContext(tw, {
        observeDeviceColorSchemeChanges: false,
        initialColorScheme: "light" // Will be updated after AsyncStorage check
    });
  
    const [colorScheme, toggleColorScheme, setColorScheme] = useAppColorScheme(tw);
  
    // Load theme from storage on mount
    useEffect(() => {
        getInitialTheme().then(theme => {
            setColorScheme(theme as RnColorScheme);
        });
    }, []);
  
    // Update storage when theme changes
    useEffect(() => {
        if (colorScheme) {
            // Make sure we're storing a string, not an object
            AsyncStorage.setItem("colorScheme", String(colorScheme));
        }
    }, [colorScheme]);
  
    const toggleTheme = () => {
        toggleColorScheme();
    };
  
    const setSpecificTheme = (theme: ColorScheme) => {
        setColorScheme(theme as RnColorScheme);
    };
  
    return (
        <ThemeContext.Provider
            value={{ 
                colorScheme: colorScheme as ColorScheme, 
                toggleTheme, 
                setSpecificTheme,
                memoBuster: tw.memoBuster
            }}
            {...props}
        />
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}; 