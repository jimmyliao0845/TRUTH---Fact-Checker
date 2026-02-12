import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles.css";

// ============= COLOR THEME MANAGER =============

const THEMES = {
  black: {
    name: "Black",
    description: "Classic dark theme",
    price: 0,
    colors: {
      primary: "#09090d",
      secondary: "#1a1a23",
      navbar: "#09090d",
      sidebar: "#1a1a23",
      background: "#0f0f14",
      button: "#3a305033",
      text: "#ffffff",
      accent: "#ff6b6b",
    },
    overlays: {
      color: "rgba(255, 255, 255, 0.05)",
      border: "rgba(255, 255, 255, 0.1)",
      borderLight: "rgba(255, 255, 255, 0.3)",
    },
    tabs: {
      bg: "rgba(255, 255, 255, 0.1)",
      bgHover: "rgba(255, 255, 255, 0.2)",
      bgActive: "rgba(255, 107, 107, 0.3)",
    },
  },
  white: {
    name: "White",
    description: "Clean light theme",
    price: 0,
    colors: {
      primary: "#ffffff",
      secondary: "#f5f5f5",
      navbar: "#ffffff",
      sidebar: "#f5f5f5",
      background: "#fafafa",
      button: "#e8e8e8",
      text: "#000000",
      accent: "#0066cc",
    },
    overlays: {
      color: "rgba(0, 0, 0, 0.05)",
      border: "rgba(0, 0, 0, 0.1)",
      borderLight: "rgba(0, 0, 0, 0.3)",
    },
    tabs: {
      bg: "rgba(0, 0, 0, 0.1)",
      bgHover: "rgba(0, 0, 0, 0.2)",
      bgActive: "rgba(13, 110, 253, 0.3)",
    },
  },
  ocean: {
    name: "Ocean",
    description: "Cool blue theme",
    price: 500,
    colors: {
      primary: "#0a4a6e",
      secondary: "#0d6a94",
      navbar: "#0a4a6e",
      sidebar: "#0d6a94",
      background: "#1a5276",
      button: "#2874a6",
      text: "#ffffff",
      accent: "#5dade2",
    },
    overlays: {
      color: "rgba(255, 255, 255, 0.12)",
      border: "rgba(255, 255, 255, 0.2)",
      borderLight: "rgba(255, 255, 255, 0.35)",
    },
    tabs: {
      bg: "rgba(255, 255, 255, 0.1)",
      bgHover: "rgba(255, 255, 255, 0.2)",
      bgActive: "rgba(93, 173, 226, 0.3)",
    },
  },
  forest: {
    name: "Forest",
    description: "Nature-inspired green theme",
    price: 500,
    colors: {
      primary: "#1b4620",
      secondary: "#2d5a3d",
      navbar: "#1b4620",
      sidebar: "#2d5a3d",
      background: "#3a6b52",
      button: "#4a8a6f",
      text: "#ffffff",
      accent: "#52d96b",
    },
    overlays: {
      color: "rgba(255, 255, 255, 0.12)",
      border: "rgba(255, 255, 255, 0.2)",
      borderLight: "rgba(255, 255, 255, 0.35)",
    },
    tabs: {
      bg: "rgba(255, 255, 255, 0.1)",
      bgHover: "rgba(255, 255, 255, 0.2)",
      bgActive: "rgba(82, 217, 107, 0.3)",
    },
  },
  sunset: {
    name: "Sunset",
    description: "Warm orange & pink theme",
    price: 500,
    colors: {
      primary: "#8b4513",
      secondary: "#c7522a",
      navbar: "#8b4513",
      sidebar: "#c7522a",
      background: "#ff8c42",
      button: "#ff6b6b",
      text: "#ffffff",
      accent: "#ffd93d",
    },
    overlays: {
      color: "rgba(255, 255, 255, 0.12)",
      border: "rgba(255, 255, 255, 0.2)",
      borderLight: "rgba(255, 255, 255, 0.35)",
    },
    tabs: {
      bg: "rgba(255, 255, 255, 0.1)",
      bgHover: "rgba(255, 255, 255, 0.2)",
      bgActive: "rgba(255, 217, 61, 0.3)",
    },
  },
  purple: {
    name: "Purple",
    description: "Royal purple theme",
    price: 750,
    colors: {
      primary: "#4a148c",
      secondary: "#6a1b9a",
      navbar: "#4a148c",
      sidebar: "#6a1b9a",
      background: "#7b1fa2",
      button: "#9c27b0",
      text: "#ffffff",
      accent: "#ce93d8",
    },
    overlays: {
      color: "rgba(255, 255, 255, 0.12)",
      border: "rgba(255, 255, 255, 0.2)",
      borderLight: "rgba(255, 255, 255, 0.35)",
    },
    tabs: {
      bg: "rgba(255, 255, 255, 0.1)",
      bgHover: "rgba(255, 255, 255, 0.2)",
      bgActive: "rgba(206, 147, 216, 0.3)",
    },
  },
  neon: {
    name: "Neon",
    description: "Cyberpunk neon theme",
    price: 1000,
    colors: {
      primary: "#0a0e27",
      secondary: "#0f1840",
      navbar: "#0a0e27",
      sidebar: "#0f1840",
      background: "#1a2454",
      button: "#00ff00",
      text: "#00ff00",
      accent: "#ff00ff",
    },
    overlays: {
      color: "rgba(0, 255, 0, 0.12)",
      border: "rgba(0, 255, 0, 0.25)",
      borderLight: "rgba(0, 255, 0, 0.4)",
    },
    tabs: {
      bg: "rgba(0, 255, 0, 0.1)",
      bgHover: "rgba(0, 255, 0, 0.2)",
      bgActive: "rgba(255, 0, 255, 0.3)",
    },
  },
  custom: {
    name: "Custom",
    description: "Create your own theme",
    price: 0,
    isCustom: true,
    colors: {
      primary: "#09090d",
      secondary: "#1a1a23",
      navbar: "#09090d",
      sidebar: "#1a1a23",
      background: "#0f0f14",
      button: "#3a305033",
      text: "#ffffff",
      accent: "#ff6b6b",
    },
    overlays: {
      color: "rgba(255, 255, 255, 0.05)",
      border: "rgba(255, 255, 255, 0.1)",
      borderLight: "rgba(255, 255, 255, 0.3)",
    },
    tabs: {
      bg: "rgba(255, 255, 255, 0.1)",
      bgHover: "rgba(255, 255, 255, 0.2)",
      bgActive: "rgba(255, 107, 107, 0.3)",
    },
  },
};

export const ColorThemeManager = {
  getThemes: () => THEMES,

  getTheme: (themeName) => THEMES[themeName] || THEMES.black,

  applyTheme: (themeName) => {
    let theme = THEMES[themeName];
    if (!theme) return;

    const root = document.documentElement;
    
    // If custom theme, load saved custom colors
    if (themeName === "custom") {
      const savedCustomColors = localStorage.getItem("customColors");
      if (savedCustomColors) {
        const customColors = JSON.parse(savedCustomColors);
        // Apply custom colors directly
        Object.entries(customColors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}-color`, value);
        });
      } else {
        // Fallback to black theme defaults for custom
        theme = THEMES.black;
        root.style.setProperty("--primary-color", theme.colors.primary);
        root.style.setProperty("--secondary-color", theme.colors.secondary);
        root.style.setProperty("--navbar-color", theme.colors.navbar);
        root.style.setProperty("--sidebar-color", theme.colors.sidebar);
        root.style.setProperty("--background-color", theme.colors.background);
        root.style.setProperty("--button-color", theme.colors.button);
        root.style.setProperty("--text-color", theme.colors.text);
        root.style.setProperty("--accent-color", theme.colors.accent);
        if (theme.overlays) {
          root.style.setProperty("--overlay-color", theme.overlays.color);
          root.style.setProperty("--overlay-border", theme.overlays.border);
          root.style.setProperty("--overlay-border-light", theme.overlays.borderLight);
        }
        if (theme.tabs) {
          root.style.setProperty("--tab-bg", theme.tabs.bg);
          root.style.setProperty("--tab-bg-hover", theme.tabs.bgHover);
          root.style.setProperty("--tab-bg-active", theme.tabs.bgActive);
        }
      }
    } else {
      // Apply standard theme colors
      root.style.setProperty("--primary-color", theme.colors.primary);
      root.style.setProperty("--secondary-color", theme.colors.secondary);
      root.style.setProperty("--navbar-color", theme.colors.navbar);
      root.style.setProperty("--sidebar-color", theme.colors.sidebar);
      root.style.setProperty("--background-color", theme.colors.background);
      root.style.setProperty("--button-color", theme.colors.button);
      root.style.setProperty("--text-color", theme.colors.text);
      root.style.setProperty("--accent-color", theme.colors.accent);
      
      // Apply overlay colors if defined in theme
      if (theme.overlays) {
        root.style.setProperty("--overlay-color", theme.overlays.color);
        root.style.setProperty("--overlay-border", theme.overlays.border);
        root.style.setProperty("--overlay-border-light", theme.overlays.borderLight);
      }
      
      // Apply tab colors if defined in theme
      if (theme.tabs) {
        root.style.setProperty("--tab-bg", theme.tabs.bg);
        root.style.setProperty("--tab-bg-hover", theme.tabs.bgHover);
        root.style.setProperty("--tab-bg-active", theme.tabs.bgActive);
      }
    }

    localStorage.setItem("selectedTheme", themeName);
  },

  resetToDefault: () => {
    // Reset to white theme (light mode default)
    const whiteTheme = THEMES.white;
    const root = document.documentElement;
    
    root.style.setProperty("--primary-color", whiteTheme.colors.primary);
    root.style.setProperty("--secondary-color", whiteTheme.colors.secondary);
    root.style.setProperty("--navbar-color", whiteTheme.colors.navbar);
    root.style.setProperty("--sidebar-color", whiteTheme.colors.sidebar);
    root.style.setProperty("--background-color", whiteTheme.colors.background);
    root.style.setProperty("--button-color", whiteTheme.colors.button);
    root.style.setProperty("--text-color", whiteTheme.colors.text);
    root.style.setProperty("--accent-color", whiteTheme.colors.accent);
    
    // Apply overlay colors for white theme
    if (whiteTheme.overlays) {
      root.style.setProperty("--overlay-color", whiteTheme.overlays.color);
      root.style.setProperty("--overlay-border", whiteTheme.overlays.border);
      root.style.setProperty("--overlay-border-light", whiteTheme.overlays.borderLight);
    }
    
    // Apply tab colors for white theme
    if (whiteTheme.tabs) {
      root.style.setProperty("--tab-bg", whiteTheme.tabs.bg);
      root.style.setProperty("--tab-bg-hover", whiteTheme.tabs.bgHover);
      root.style.setProperty("--tab-bg-active", whiteTheme.tabs.bgActive);
    }
    
    localStorage.removeItem("selectedTheme");
    localStorage.removeItem("customColors");
  },

  loadSavedTheme: () => {
    const saved = localStorage.getItem("selectedTheme");
    if (saved && THEMES[saved]) {
      ColorThemeManager.applyTheme(saved);
      return saved;
    }
    // Default to original light mode design (not Black theme)
    ColorThemeManager.resetToDefault();
    return "default";
  },

  isThemeUnlocked: (themeName, unlockedThemes) => {
    // Free themes: black, white, custom
    if (themeName === "black" || themeName === "white" || themeName === "custom") {
      return true;
    }
    // Check if other themes are in the unlocked list
    if (unlockedThemes && Array.isArray(unlockedThemes)) {
      return unlockedThemes.includes(`color_${themeName}`);
    }
    return false;
  },
};

// ============= HELPER FUNCTION =============
// Get default colors from Black theme (default theme)
const getDefaultColorValue = (colorKey) => {
  // Try to get from THEMES.black.colors first
  if (THEMES.black.colors[colorKey]) {
    return THEMES.black.colors[colorKey];
  }
  
  // For new colors not in THEMES, derive sensible defaults
  const defaultColorMap = {
    // Light variants - slightly lighter than base colors
    "primary-light": "#2a2a35",
    "secondary-light": "#2a2a35",
    "text-light": "#b0b0b0",
    "background-light": "#1a1a23",
    
    // Status colors
    "success": "#52d96b",
    "error": "#ff6b6b",
    "warning": "#ffd93d",
    "info": "#5dade2",
    "success-light": "rgba(82, 217, 107, 0.2)",
    "error-light": "rgba(255, 107, 107, 0.2)",
    "warning-light": "rgba(255, 217, 61, 0.2)",
    "info-light": "rgba(93, 173, 226, 0.2)",
    
    // Tab colors
    "tab-bg": "rgba(255, 255, 255, 0.1)",
    "tab-bg-hover": "rgba(255, 255, 255, 0.2)",
    "tab-bg-active": "rgba(255, 107, 107, 0.3)",
    
    // Border and overlay
    "border-color-dark": "rgba(255, 255, 255, 0.1)",
    "overlay-color": "rgba(255, 255, 255, 0.05)",
    "overlay-border": "rgba(255, 255, 255, 0.1)",
    
    // Utility colors
    "hint-text-color": "#808080",
    "light-bg-color": "#1a1a23",
    "currency-color": "#ffd93d",
  };
  
  return defaultColorMap[colorKey] || "#09090d";
};

// Custom Color Definitions - with lock status, descriptions, and pricing
const CUSTOM_COLOR_DEFINITIONS = {
  // Core Colors (Free)
  primary: {
    label: "Primary Color",
    description: "Used for main component backgrounds and primary buttons",
    locked: false,
    price: 0,
    id: "custom_color_primary"
  },
  secondary: {
    label: "Secondary Color",
    description: "Used for secondary UI elements and hover states",
    locked: false,
    price: 0,
    id: "custom_color_secondary"
  },
  text: {
    label: "Text Color",
    description: "Main text color for all content and headings",
    locked: false,
    price: 0,
    id: "custom_color_text"
  },
  background: {
    label: "Background Color",
    description: "Main background for entire page and containers",
    locked: false,
    price: 0,
    id: "custom_color_background"
  },

  // Navigation & Layout (Locked - 300pts each)
  navbar: {
    label: "Navbar Color",
    description: "Top navigation bar styling",
    locked: true,
    price: 300,
    id: "custom_color_navbar"
  },
  sidebar: {
    label: "Sidebar Color",
    description: "Left sidebar and navigation panel styling",
    locked: true,
    price: 300,
    id: "custom_color_sidebar"
  },

  // Interactive Elements (Locked - 250pts each)
  button: {
    label: "Button Color",
    description: "Interactive buttons and form elements",
    locked: true,
    price: 250,
    id: "custom_color_button"
  },
  accent: {
    label: "Accent Color",
    description: "Highlights, active states, and accent elements",
    locked: true,
    price: 400,
    id: "custom_color_accent"
  },

  // Light Variants (Locked - 200pts each)
  "primary-light": {
    label: "Primary Light",
    description: "Light variant of primary color for hover and subtle backgrounds",
    locked: true,
    price: 200,
    id: "custom_color_primary_light"
  },
  "secondary-light": {
    label: "Secondary Light",
    description: "Light variant of secondary color",
    locked: true,
    price: 200,
    id: "custom_color_secondary_light"
  },
  "text-light": {
    label: "Text Light",
    description: "Light text color for disabled or secondary text",
    locked: true,
    price: 200,
    id: "custom_color_text_light"
  },
  "background-light": {
    label: "Background Light",
    description: "Light variant background for secondary containers",
    locked: true,
    price: 200,
    id: "custom_color_background_light"
  },

  // Status Colors (Locked - 150pts each)
  success: {
    label: "Success Color",
    description: "Green color for success states, confirmations, and alerts",
    locked: true,
    price: 150,
    id: "custom_color_success"
  },
  error: {
    label: "Error Color",
    description: "Red color for error states and warnings",
    locked: true,
    price: 150,
    id: "custom_color_error"
  },
  warning: {
    label: "Warning Color",
    description: "Yellow color for warning states and notifications",
    locked: true,
    price: 150,
    id: "custom_color_warning"
  },
  info: {
    label: "Info Color",
    description: "Blue color for informational messages and hints",
    locked: true,
    price: 150,
    id: "custom_color_info"
  },

  // Status Light Variants (Locked - 100pts each)
  "success-light": {
    label: "Success Light",
    description: "Light variant of success color for backgrounds",
    locked: true,
    price: 100,
    id: "custom_color_success_light"
  },
  "error-light": {
    label: "Error Light",
    description: "Light variant of error color for backgrounds",
    locked: true,
    price: 100,
    id: "custom_color_error_light"
  },
  "warning-light": {
    label: "Warning Light",
    description: "Light variant of warning color for backgrounds",
    locked: true,
    price: 100,
    id: "custom_color_warning_light"
  },
  "info-light": {
    label: "Info Light",
    description: "Light variant of info color for backgrounds",
    locked: true,
    price: 100,
    id: "custom_color_info_light"
  },

  // Tab Colors (Locked - 200pts each)
  "tab-bg": {
    label: "Tab Background",
    description: "Inactive tab background color",
    locked: true,
    price: 200,
    id: "custom_color_tab_bg"
  },
  "tab-bg-hover": {
    label: "Tab Hover",
    description: "Tab background on hover state",
    locked: true,
    price: 200,
    id: "custom_color_tab_bg_hover"
  },
  "tab-bg-active": {
    label: "Tab Active",
    description: "Active tab background color",
    locked: true,
    price: 200,
    id: "custom_color_tab_bg_active"
  },

  // Borders & Overlays (Locked - 150pts each)
  "border-color-dark": {
    label: "Border Color",
    description: "Color for borders, dividers, and outlines",
    locked: true,
    price: 150,
    id: "custom_color_border_dark"
  },
  "overlay-color": {
    label: "Overlay Background",
    description: "Base color for overlays and semi-transparent backgrounds",
    locked: true,
    price: 150,
    id: "custom_color_overlay"
  },
  "overlay-border": {
    label: "Overlay Border",
    description: "Border color for overlays and modal elements",
    locked: true,
    price: 150,
    id: "custom_color_overlay_border"
  },

  // Utility Colors (Locked - 100pts each)
  "hint-text-color": {
    label: "Hint Text Color",
    description: "Subtle text color for hints and placeholder text",
    locked: true,
    price: 100,
    id: "custom_color_hint_text"
  },
  "light-bg-color": {
    label: "Light Background",
    description: "Very light background for subtle backgrounds",
    locked: true,
    price: 100,
    id: "custom_color_light_bg"
  },
  "currency-color": {
    label: "Currency Color",
    description: "Color for displaying currency and points",
    locked: true,
    price: 100,
    id: "custom_color_currency"
  },
};

// Helper function to check if a custom color is unlocked by the user
const isCustomColorUnlocked = (colorKey, unlockedItems) => {
  const colorDef = CUSTOM_COLOR_DEFINITIONS[colorKey];
  if (!colorDef || !colorDef.locked) {
    return true; // Free colors are always unlocked
  }
  // Check if user has purchased this color
  return unlockedItems && Array.isArray(unlockedItems) && unlockedItems.includes(colorDef.id);
};

// Generate color shop items from THEMES definitions - single source of truth
const generateColorShopItems = () => {
  return Object.entries(THEMES)
    .filter(([key]) => key !== "black" && key !== "white") // Free themes not in shop
    .map(([key, theme]) => ({
      id: `color_${key}`,
      name: `${theme.name} Theme`,
      description: theme.description,
      price: theme.price,
      type: "color",
      icon: key,
      color: theme.colors.primary, // Reference primary color from theme definition
    }));
};

const SHOP_ITEMS = {
  colors: {
    category: "Color Themes",
    items: generateColorShopItems(),
  },
  passes: {
    category: "Entry Passes",
    items: [
      {
        id: "pass_single",
        name: "Single Analysis Pass",
        description: "Get access to 1 analysis",
        price: 500,
        type: "pass",
        icon: "ticket",
        duration: "1 Analysis",
      },
      {
        id: "pass_pro",
        name: "Pro Pass",
        description: "Unlock unlimited analysis + Professional account access",
        price: 4000,
        type: "pass",
        icon: "star",
        duration: "Unlimited + Professional",
      },
    ],
  },
};

const ShopService = {
  getUserData: (userId) => {
    const userData = localStorage.getItem(`user_${userId}`);
    return userData
      ? JSON.parse(userData)
      : {
          points: 0,
          unlockedItems: [],
          purchaseHistory: [],
        };
  },

  saveUserData: (userId, data) => {
    localStorage.setItem(`user_${userId}`, JSON.stringify(data));
  },

  purchaseItem: (userId, itemId, price) => {
    const userData = ShopService.getUserData(userId);

    if (userData.points < price) {
      return { success: false, message: "Insufficient points" };
    }

    if (userData.unlockedItems.includes(itemId)) {
      return { success: false, message: "Item already unlocked" };
    }

    userData.points -= price;
    userData.unlockedItems.push(itemId);
    userData.purchaseHistory.push({
      itemId,
      purchaseDate: new Date().toISOString(),
      price,
    });

    ShopService.saveUserData(userId, userData);

    return {
      success: true,
      message: "Purchase successful!",
      newPoints: userData.points,
    };
  },

  addPoints: (userId, amount) => {
    const userData = ShopService.getUserData(userId);
    userData.points += amount;
    ShopService.saveUserData(userId, userData);
    return userData.points;
  },

  isItemUnlocked: (userId, itemId) => {
    const userData = ShopService.getUserData(userId);
    return userData.unlockedItems.includes(itemId);
  },
};

// ============= MAIN MARKETPLACE COMPONENT =============

export default function Marketplace() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("themes");
  const [currentTheme, setCurrentTheme] = useState("black");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTheme, setPendingTheme] = useState(null);
  const [customColors, setCustomColors] = useState({});
  const [showThemePurchaseConfirmation, setShowThemePurchaseConfirmation] = useState(false);
  const [pendingPurchaseTheme, setPendingPurchaseTheme] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const data = ShopService.getUserData(currentUser.uid);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    const saved = ColorThemeManager.loadSavedTheme();
    setCurrentTheme(saved);

    return () => unsubscribe();
  }, []);

  // Load saved custom colors on component mount
  useEffect(() => {
    const savedColors = localStorage.getItem("customColors");
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      setCustomColors(colors);
      // Apply saved custom colors to document
      Object.entries(colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}-color`, value);
      });
    }
  }, []);

  const handleThemeChange = (themeName) => {
    if (ColorThemeManager.isThemeUnlocked(themeName, userData?.unlockedItems)) {
      // Show confirmation for all theme changes
      setPendingTheme(themeName);
      setShowConfirmation(true);
    } else {
      // Theme is locked - show message
      const theme = THEMES[themeName];
      setPurchaseMessage(`${theme.name} is locked. Purchase it from the shop to unlock!`);
      setMessageType("error");
      setTimeout(() => {
        setPurchaseMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const handleConfirmThemeChange = () => {
    if (pendingTheme) {
      ColorThemeManager.applyTheme(pendingTheme);
      setCurrentTheme(pendingTheme);
      setShowConfirmation(false);
      setPendingTheme(null);
    }
  };

  const handleCancelThemeChange = () => {
    setShowConfirmation(false);
    setPendingTheme(null);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCustomColorChange = (colorKey, value) => {
    const root = document.documentElement;
    root.style.setProperty(`--${colorKey}-color`, value);
    setCustomColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const handleSaveCustomColors = () => {
    localStorage.setItem("customColors", JSON.stringify(customColors));
    // Apply custom theme and save as selected theme
    ColorThemeManager.applyTheme("custom");
    setCurrentTheme("custom");
    setPurchaseMessage("Custom theme saved and applied successfully!");
    setMessageType("success");
    setTimeout(() => {
      setPurchaseMessage("");
      setMessageType("");
    }, 3000);
  };

  const handlePurchase = (itemId, price) => {
    if (!user) {
      setPurchaseMessage("Please log in to make purchases");
      setMessageType("error");
      return;
    }

    const result = ShopService.purchaseItem(user.uid, itemId, price);

    if (result.success) {
      const updatedData = ShopService.getUserData(user.uid);
      setUserData(updatedData);
      
      // Check if this is a color theme purchase
      if (itemId.startsWith("color_")) {
        const themeName = itemId.replace("color_", "");
        setPendingPurchaseTheme(themeName);
        setShowThemePurchaseConfirmation(true);
      } else {
        // For non-theme purchases, show regular success message
        setPurchaseMessage(result.message);
        setMessageType("success");
        setTimeout(() => {
          setPurchaseMessage("");
          setMessageType("");
        }, 3000);
      }
    } else {
      setPurchaseMessage(result.message);
      setMessageType("error");
      setTimeout(() => {
        setPurchaseMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const handleConfirmPurchaseAndApplyTheme = () => {
    if (pendingPurchaseTheme) {
      ColorThemeManager.applyTheme(pendingPurchaseTheme);
      setCurrentTheme(pendingPurchaseTheme);
      setPurchaseMessage(`${THEMES[pendingPurchaseTheme].name} theme purchased and applied successfully!`);
      setMessageType("success");
      setShowThemePurchaseConfirmation(false);
      setPendingPurchaseTheme(null);
      setTimeout(() => {
        setPurchaseMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const handleConfirmPurchaseNoTheme = () => {
    setPurchaseMessage(`${THEMES[pendingPurchaseTheme].name} theme purchased successfully! You can apply it anytime.`);
    setMessageType("success");
    setShowThemePurchaseConfirmation(false);
    setPendingPurchaseTheme(null);
    setTimeout(() => {
      setPurchaseMessage("");
      setMessageType("");
    }, 3000);
  };

  const handleAddPointsDemo = () => {
    if (!user) {
      setPurchaseMessage("Please log in first");
      setMessageType("error");
      return;
    }
    const newPoints = ShopService.addPoints(user.uid, 500);
    const updatedData = ShopService.getUserData(user.uid);
    setUserData(updatedData);
    setPurchaseMessage(`+500 points added! Total: ${newPoints}`);
    setMessageType("success");

    setTimeout(() => {
      setPurchaseMessage("");
      setMessageType("");
    }, 3000);
  };

  if (!user) {
    return (
      <div className="marketplace-container pt-5">
        <div className="container text-center py-5">
          <h2>Please log in to access marketplace</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-container pt-5">
      <div className="container-lg p-4">
        {/* Header */}
        <div className="marketplace-header mb-5 rounded p-4">
          <div className="row align-items-center">
            <div className="col-md-6">
              <button
                className="btn btn-outline-light btn-sm mb-3"
                onClick={handleGoBack}
              >
                <i className="bi bi-arrow-left me-2"></i>Back
              </button>
              <h2 className="mb-1">
                <i className="bi bi-sliders me-3"></i>Color Manager & Marketplace
              </h2>
              <p className="text-muted mb-0">Customize themes and purchase items</p>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <div className="d-flex justify-content-md-end justify-content-start align-items-center gap-3 flex-wrap">
                <div className="points-display">
                  <h5 className="mb-0">
                    <i className="bi bi-coin me-2 currency-icon"></i>
                    {userData?.points || 0}
                  </h5>
                  <small className="text-muted">Points</small>
                </div>
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleAddPointsDemo}
                >
                  <i className="bi bi-plus-circle me-1"></i>Add 500 Pts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {purchaseMessage && (
          <div
            className={`alert alert-${
              messageType === "success" ? "success" : "danger"
            } alert-dismissible fade show mb-4`}
            role="alert"
          >
            <i
              className={`bi bi-${
                messageType === "success" ? "check-circle" : "exclamation-circle"
              } me-2`}
            ></i>
            {purchaseMessage}
          </div>
        )}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "themes" ? "active" : ""}`}
              onClick={() => setActiveTab("themes")}
              role="tab"
            >
              <i className="bi bi-palette me-2"></i>Themes
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "shop" ? "active" : ""}`}
              onClick={() => setActiveTab("shop")}
              role="tab"
            >
              <i className="bi bi-shop me-2"></i>Shop
            </button>
          </li>
        </ul>

        {/* Themes Tab */}
        {activeTab === "themes" && (
          <div className="themes-section">
            <h4 className="mb-4">Choose Your Theme</h4>
            <div className="row g-3 mb-5">
              {Object.entries(THEMES)
                .filter(([key]) => {
                  // Only show unlocked themes
                  return ColorThemeManager.isThemeUnlocked(
                    key,
                    userData?.unlockedItems
                  );
                })
                .map(([key, theme]) => {
                const isUnlocked = ColorThemeManager.isThemeUnlocked(
                  key,
                  userData?.unlockedItems
                );
                const isSelected = currentTheme === key;

                return (
                  <div key={key} className="col-6 col-md-4 col-lg-3">
                    <div
                      className={`theme-card p-3 rounded cursor-pointer h-100 transition ${
                        isSelected ? "theme-card-item selected" : "theme-card-item unselected"
                      } ${
                        isUnlocked ? "unlocked" : "locked"
                      }`}
                      style={{
                        backgroundColor: theme.colors.primary,
                      }}
                      onClick={() => handleThemeChange(key)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="m-0" style={{ color: theme.colors.text }}>
                          {theme.name}
                        </h6>
                        {!isUnlocked && (
                          <span
                            className="badge bg-warning text-dark theme-badge-price"
                          >
                            {theme.price} pts
                          </span>
                        )}
                      </div>

                      <p
                        className="small m-0"
                        style={{ color: theme.colors.text, opacity: 0.8 }}
                      >
                        {theme.description}
                      </p>

                      <div className="d-flex gap-1 mt-3">
                        {Object.values(theme.colors)
                          .slice(0, 4)
                          .map((color, idx) => (
                            <div
                              key={idx}
                              style={{
                                width: "20px",
                                height: "20px",
                                backgroundColor: color,
                                borderRadius: "4px",
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                              }}
                            />
                          ))}
                      </div>

                      {isSelected && (
                        <div
                          className="mt-2 text-center fw-bold"
                          style={{ color: theme.colors.accent }}
                        >
                          <i className="bi bi-check-circle"></i> Active
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Colors Section - Show when Custom theme is selected */}
            {currentTheme === "custom" && (
              <div 
                className="custom-theme-editor mt-5 p-4 rounded"
                style={{
                  backgroundColor: THEMES.custom.overlays.color,
                  borderColor: THEMES.custom.overlays.border,
                }}
              >
                <h5 className="mb-4" style={{ color: THEMES.custom.colors.text }}>
                  <i className="bi bi-palette2 me-2"></i>Customize Your Theme Colors
                </h5>

                {/* Core Colors Section */}
                <div className="color-section mb-4">
                  <h6 style={{ color: THEMES.custom.colors.text, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: `1px solid ${THEMES.custom.overlays.border}` }}>
                    <i className="bi bi-star me-2"></i>Core Colors
                  </h6>
                  <div className="row g-3">
                    {Object.entries(CUSTOM_COLOR_DEFINITIONS)
                      .filter(([key]) => ["primary", "secondary", "text", "background"].includes(key))
                      .map(([key, colorDef]) => {
                        const isUnlocked = isCustomColorUnlocked(key, userData?.unlockedItems);
                        
                        return (
                          <div key={key} className="col-12 col-md-6">
                            <div className="custom-color-group">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <label className="form-label custom-color-label" style={{ color: THEMES.custom.colors.text }}>
                                    {colorDef.label}
                                    {colorDef.locked && !isUnlocked && (
                                      <i className="bi bi-lock-fill ms-2" style={{ color: "#ff6b6b", fontSize: "0.8rem" }}></i>
                                    )}
                                  </label>
                                  <small style={{ color: THEMES.custom.colors.text, opacity: 0.7, display: "block" }}>
                                    {colorDef.description}
                                  </small>
                                </div>
                              </div>

                              {isUnlocked ? (
                                <div className="color-input-wrapper d-flex gap-2 align-items-center">
                                  <input
                                    type="color"
                                    className="form-control form-control-color"
                                    defaultValue={customColors[key] || getDefaultColorValue(key)}
                                    onChange={(e) => handleCustomColorChange(key, e.target.value)}
                                    title={`Choose ${colorDef.label.toLowerCase()}`}
                                  />
                                  <span className="color-value" style={{ color: THEMES.custom.colors.text }}>
                                    {customColors[key] || getDefaultColorValue(key)}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-sm w-100"
                                  style={{
                                    backgroundColor: THEMES.custom.colors.accent,
                                    color: THEMES.custom.colors.primary,
                                    border: "none",
                                    fontWeight: "600"
                                  }}
                                  onClick={() => handlePurchase(colorDef.id, colorDef.price)}
                                >
                                  <i className="bi bi-lock me-1"></i>Unlock ({colorDef.price} pts)
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Navigation & Layout Section */}
                <div className="color-section mb-4">
                  <h6 style={{ color: THEMES.custom.colors.text, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: `1px solid ${THEMES.custom.overlays.border}` }}>
                    <i className="bi bi-layout-sidebar me-2"></i>Navigation & Layout
                  </h6>
                  <div className="row g-3">
                    {Object.entries(CUSTOM_COLOR_DEFINITIONS)
                      .filter(([key]) => ["navbar", "sidebar"].includes(key))
                      .map(([key, colorDef]) => {
                        const isUnlocked = isCustomColorUnlocked(key, userData?.unlockedItems);
                        
                        return (
                          <div key={key} className="col-12 col-md-6">
                            <div className="custom-color-group">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <label className="form-label custom-color-label" style={{ color: THEMES.custom.colors.text }}>
                                    {colorDef.label}
                                    {colorDef.locked && !isUnlocked && (
                                      <i className="bi bi-lock-fill ms-2" style={{ color: "#ff6b6b", fontSize: "0.8rem" }}></i>
                                    )}
                                  </label>
                                  <small style={{ color: THEMES.custom.colors.text, opacity: 0.7, display: "block" }}>
                                    {colorDef.description}
                                  </small>
                                </div>
                              </div>

                              {isUnlocked ? (
                                <div className="color-input-wrapper d-flex gap-2 align-items-center">
                                  <input
                                    type="color"
                                    className="form-control form-control-color"
                                    defaultValue={customColors[key] || getDefaultColorValue(key)}
                                    onChange={(e) => handleCustomColorChange(key, e.target.value)}
                                    title={`Choose ${colorDef.label.toLowerCase()}`}
                                  />
                                  <span className="color-value" style={{ color: THEMES.custom.colors.text }}>
                                    {customColors[key] || getDefaultColorValue(key)}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-sm w-100"
                                  style={{
                                    backgroundColor: THEMES.custom.colors.accent,
                                    color: THEMES.custom.colors.primary,
                                    border: "none",
                                    fontWeight: "600"
                                  }}
                                  onClick={() => handlePurchase(colorDef.id, colorDef.price)}
                                >
                                  <i className="bi bi-lock me-1"></i>Unlock ({colorDef.price} pts)
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Interactive Elements Section */}
                <div className="color-section mb-4">
                  <h6 style={{ color: THEMES.custom.colors.text, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: `1px solid ${THEMES.custom.overlays.border}` }}>
                    <i className="bi bi-cursor-fill me-2"></i>Interactive Elements
                  </h6>
                  <div className="row g-3">
                    {Object.entries(CUSTOM_COLOR_DEFINITIONS)
                      .filter(([key]) => ["button", "accent"].includes(key))
                      .map(([key, colorDef]) => {
                        const isUnlocked = isCustomColorUnlocked(key, userData?.unlockedItems);
                        
                        return (
                          <div key={key} className="col-12 col-md-6">
                            <div className="custom-color-group">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <label className="form-label custom-color-label" style={{ color: THEMES.custom.colors.text }}>
                                    {colorDef.label}
                                    {colorDef.locked && !isUnlocked && (
                                      <i className="bi bi-lock-fill ms-2" style={{ color: "#ff6b6b", fontSize: "0.8rem" }}></i>
                                    )}
                                  </label>
                                  <small style={{ color: THEMES.custom.colors.text, opacity: 0.7, display: "block" }}>
                                    {colorDef.description}
                                  </small>
                                </div>
                              </div>

                              {isUnlocked ? (
                                <div className="color-input-wrapper d-flex gap-2 align-items-center">
                                  <input
                                    type="color"
                                    className="form-control form-control-color"
                                    defaultValue={customColors[key] || getDefaultColorValue(key)}
                                    onChange={(e) => handleCustomColorChange(key, e.target.value)}
                                    title={`Choose ${colorDef.label.toLowerCase()}`}
                                  />
                                  <span className="color-value" style={{ color: THEMES.custom.colors.text }}>
                                    {customColors[key] || getDefaultColorValue(key)}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-sm w-100"
                                  style={{
                                    backgroundColor: THEMES.custom.colors.accent,
                                    color: THEMES.custom.colors.primary,
                                    border: "none",
                                    fontWeight: "600"
                                  }}
                                  onClick={() => handlePurchase(colorDef.id, colorDef.price)}
                                >
                                  <i className="bi bi-lock me-1"></i>Unlock ({colorDef.price} pts)
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Advanced Colors Section */}
                <div className="color-section mb-4">
                  <h6 style={{ color: THEMES.custom.colors.text, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: `1px solid ${THEMES.custom.overlays.border}` }}>
                    <i className="bi bi-gear me-2"></i>Advanced Colors (Light Variants, Status, Tabs & More)
                  </h6>
                  <div className="row g-3">
                    {Object.entries(CUSTOM_COLOR_DEFINITIONS)
                      .filter(([key]) => !["primary", "secondary", "text", "background", "navbar", "sidebar", "button", "accent"].includes(key))
                      .map(([key, colorDef]) => {
                        const isUnlocked = isCustomColorUnlocked(key, userData?.unlockedItems);
                        
                        return (
                          <div key={key} className="col-12 col-md-6">
                            <div className="custom-color-group">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <label className="form-label custom-color-label" style={{ color: THEMES.custom.colors.text }}>
                                    {colorDef.label}
                                    {colorDef.locked && !isUnlocked && (
                                      <i className="bi bi-lock-fill ms-2" style={{ color: "#ff6b6b", fontSize: "0.8rem" }}></i>
                                    )}
                                  </label>
                                  <small style={{ color: THEMES.custom.colors.text, opacity: 0.7, display: "block" }}>
                                    {colorDef.description}
                                  </small>
                                </div>
                              </div>

                              {isUnlocked ? (
                                <div className="color-input-wrapper d-flex gap-2 align-items-center">
                                  <input
                                    type="color"
                                    className="form-control form-control-color"
                                    defaultValue={customColors[key] || getDefaultColorValue(key)}
                                    onChange={(e) => handleCustomColorChange(key, e.target.value)}
                                    title={`Choose ${colorDef.label.toLowerCase()}`}
                                  />
                                  <span className="color-value" style={{ color: THEMES.custom.colors.text }}>
                                    {customColors[key] || getDefaultColorValue(key)}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-sm w-100"
                                  style={{
                                    backgroundColor: THEMES.custom.colors.accent,
                                    color: THEMES.custom.colors.primary,
                                    border: "none",
                                    fontWeight: "600"
                                  }}
                                  onClick={() => handlePurchase(colorDef.id, colorDef.price)}
                                >
                                  <i className="bi bi-lock me-1"></i>Unlock ({colorDef.price} pts)
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="mt-4 d-flex gap-2">
                  <button
                    className="btn theme-btn-primary"
                    onClick={handleSaveCustomColors}
                  >
                    <i className="bi bi-check-circle me-1"></i>Save Custom Theme
                  </button>
                  <button
                    className="btn theme-btn-secondary"
                    onClick={() => setCurrentTheme("black")}
                  >
                    <i className="bi bi-x-circle me-1"></i>Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === "shop" && (
          <div className="shop-section">
            <div className="row g-3 mb-5">
              <div className="col-12">
                <h4 className="mb-4">
                  <i className="bi bi-palette me-2"></i>Color Themes
                </h4>
              </div>
              {SHOP_ITEMS.colors.items
                .filter((item) => !ShopService.isItemUnlocked(user.uid, item.id))
                .map((item) => (
                <div key={item.id} className="col-12 col-sm-6 col-lg-4">
                  <ShopItemCard
                    item={item}
                    isUnlocked={ShopService.isItemUnlocked(user.uid, item.id)}
                    onPurchase={handlePurchase}
                    userPoints={userData?.points || 0}
                  />
                </div>
              ))}
            </div>

            <div className="row g-3">
              <div className="col-12">
                <h4 className="mb-4">
                  <i className="bi bi-ticket-perforated me-2"></i>Entry Passes
                </h4>
              </div>
              {SHOP_ITEMS.passes.items.map((item) => (
                <div key={item.id} className="col-12 col-sm-6 col-lg-4">
                  <ShopItemCard
                    item={item}
                    isUnlocked={ShopService.isItemUnlocked(user.uid, item.id)}
                    onPurchase={handlePurchase}
                    userPoints={userData?.points || 0}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Theme Confirmation Modal */}
      {showConfirmation && (
        <div className="theme-confirmation-overlay">
          <div className="theme-confirmation-dialog">
            <div className="confirmation-header">
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Confirm Theme Change
              </h5>
              <button
                className="btn-close"
                onClick={handleCancelThemeChange}
                aria-label="Close"
              ></button>
            </div>
            <div className="confirmation-body">
              <p>
                You're about to apply the <strong>{THEMES[pendingTheme]?.name}</strong> theme to your entire application.
              </p>
              <p className="mb-0">
                This will change the colors of your navbar, sidebar, background, buttons, and all other interface elements.
              </p>
            </div>
            <div className="confirmation-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCancelThemeChange}
              >
                <i className="bi bi-x-circle me-1"></i>Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmThemeChange}
              >
                <i className="bi bi-check-circle me-1"></i>Apply Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Purchase Confirmation Modal */}
      {showThemePurchaseConfirmation && pendingPurchaseTheme && (
        <div className="theme-confirmation-overlay">
          <div className="theme-confirmation-dialog">
            <div className="confirmation-header">
              <h5 className="mb-0">
                <i className="bi bi-gift me-2"></i>
                Theme Purchased!
              </h5>
              <button
                className="btn-close"
                onClick={handleConfirmPurchaseNoTheme}
                aria-label="Close"
              ></button>
            </div>
            <div className="confirmation-body">
              <p>
                <strong>{THEMES[pendingPurchaseTheme]?.name}</strong> theme has been unlocked!
              </p>
              <p className="mb-0">
                Would you like to apply this theme now?
              </p>
            </div>
            <div className="confirmation-footer">
              <button
                className="btn btn-secondary"
                onClick={handleConfirmPurchaseNoTheme}
              >
                <i className="bi bi-clock me-1"></i>Apply Later
              </button>
              <button
                className="btn btn-success"
                onClick={handleConfirmPurchaseAndApplyTheme}
              >
                <i className="bi bi-check-circle me-1"></i>Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============= SHOP ITEM CARD COMPONENT =============

function ShopItemCard({ item, isUnlocked, onPurchase, userPoints }) {
  const [isHovered, setIsHovered] = useState(false);
  const canAfford = userPoints >= item.price;

  return (
    <div
      className="shop-item-card h-100 rounded overflow-hidden transition"
    >
      {/* Header */}
      <div
        className="shop-item-header"
        style={{
          backgroundColor: item.color || getDefaultColorValue('button'),
        }}
      >
        {item.type === "color" ? (
          <div
            className="color-swatch-preview"
            style={{
              backgroundColor: item.color,
            }}
          />
        ) : (
          <h2 className="mb-0">{getPassIcon(item.icon)}</h2>
        )}

        {isUnlocked && (
          <div
            className="shop-unlocked-badge"
          >
            <i className="bi bi-check-lg text-white"></i>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h6 className="mb-1">{item.name}</h6>
        <p className="text-muted small mb-2">{item.description}</p>

        {item.duration && (
          <p className="text-info small mb-3">
            <i className="bi bi-calendar me-1"></i>
            {item.duration}
          </p>
        )}

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center gap-2">
          <div className="price-badge">
            <h6 className="mb-0">
              <i className="bi bi-coin me-1 currency-icon"></i>
              {item.price}
            </h6>
          </div>

          {isUnlocked ? (
            <button className="btn btn-success btn-sm w-100 ms-2" disabled>
              <i className="bi bi-check-circle me-1"></i>Owned
            </button>
          ) : (
            <button
              className={`btn btn-sm w-100 ms-2 ${
                canAfford ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => onPurchase(item.id, item.price)}
              disabled={!canAfford}
            >
              <i className="bi bi-bag-plus me-1"></i>
              {canAfford ? "Buy" : "Not Enough"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getPassIcon(iconName) {
  const icons = {
    star: "⭐",
    ticket: "🎫",
  };
  return icons[iconName] || "🎫";
}

export { ShopService };
