import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./MarketplaceStyles.css";

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
      button: "#e0e0e0",
      text: "#000000",
      accent: "#0066cc",
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
  },
};

export const ColorThemeManager = {
  getThemes: () => THEMES,

  getTheme: (themeName) => THEMES[themeName] || THEMES.black,

  applyTheme: (themeName) => {
    const theme = THEMES[themeName];
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty("--primary-color", theme.colors.primary);
    root.style.setProperty("--secondary-color", theme.colors.secondary);
    root.style.setProperty("--navbar-color", theme.colors.navbar);
    root.style.setProperty("--sidebar-color", theme.colors.sidebar);
    root.style.setProperty("--background-color", theme.colors.background);
    root.style.setProperty("--button-color", theme.colors.button);
    root.style.setProperty("--text-color", theme.colors.text);
    root.style.setProperty("--accent-color", theme.colors.accent);

    localStorage.setItem("selectedTheme", themeName);
  },

  loadSavedTheme: () => {
    const saved = localStorage.getItem("selectedTheme");
    if (saved && THEMES[saved]) {
      ColorThemeManager.applyTheme(saved);
      return saved;
    }
    ColorThemeManager.applyTheme("black");
    return "black";
  },

  isThemeUnlocked: (themeName, unlockedThemes) => {
    if (themeName === "black" || themeName === "white") return true;
    return unlockedThemes?.includes(themeName) || false;
  },
};

// ============= SHOP SERVICE =============

const SHOP_ITEMS = {
  colors: {
    category: "Color Themes",
    items: [
      {
        id: "color_ocean",
        name: "Ocean Theme",
        description: "Cool blue theme with calm colors",
        price: 500,
        type: "color",
        icon: "ocean",
        color: "#0a4a6e",
      },
      {
        id: "color_forest",
        name: "Forest Theme",
        description: "Nature-inspired green theme",
        price: 500,
        type: "color",
        icon: "forest",
        color: "#1b4620",
      },
      {
        id: "color_sunset",
        name: "Sunset Theme",
        description: "Warm orange & pink theme",
        price: 500,
        type: "color",
        icon: "sunset",
        color: "#8b4513",
      },
      {
        id: "color_purple",
        name: "Purple Theme",
        description: "Royal purple theme",
        price: 750,
        type: "color",
        icon: "purple",
        color: "#4a148c",
      },
      {
        id: "color_neon",
        name: "Neon Theme",
        description: "Cyberpunk neon theme",
        price: 1000,
        type: "color",
        icon: "neon",
        color: "#0a0e27",
      },
    ],
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
      // Show confirmation for black and white themes
      if (themeName === "black" || themeName === "white") {
        setPendingTheme(themeName);
        setShowConfirmation(true);
      } else {
        // Apply other themes directly
        ColorThemeManager.applyTheme(themeName);
        setCurrentTheme(themeName);
      }
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
    setPurchaseMessage("Custom colors saved successfully!");
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
      setPurchaseMessage(result.message);
      setMessageType("success");
      const updatedData = ShopService.getUserData(user.uid);
      setUserData(updatedData);
    } else {
      setPurchaseMessage(result.message);
      setMessageType("error");
    }

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
        <div
          className="marketplace-header mb-5 rounded p-4"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "2px solid rgba(255, 255, 255, 0.1)",
          }}
        >
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
                    <i className="bi bi-coin me-2" style={{ color: "#ffd93d" }}></i>
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
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "custom" ? "active" : ""}`}
              onClick={() => setActiveTab("custom")}
              role="tab"
            >
              <i className="bi bi-palette2 me-2"></i>Custom Colors
            </button>
          </li>
        </ul>

        {/* Themes Tab */}
        {activeTab === "themes" && (
          <div className="themes-section">
            <h4 className="mb-4">Choose Your Theme</h4>
            <div className="row g-3">
              {Object.entries(THEMES).map(([key, theme]) => {
                const isUnlocked = ColorThemeManager.isThemeUnlocked(
                  key,
                  userData?.unlockedItems
                );
                const isSelected = currentTheme === key;

                return (
                  <div key={key} className="col-6 col-md-4 col-lg-3">
                    <div
                      className={`theme-card p-3 rounded cursor-pointer h-100 transition ${
                        isSelected ? "selected" : ""
                      }`}
                      style={{
                        backgroundColor: theme.colors.primary,
                        cursor: isUnlocked ? "pointer" : "not-allowed",
                        opacity: isUnlocked ? 1 : 0.5,
                        border: isSelected
                          ? "3px solid #00bfff"
                          : "2px solid rgba(255,255,255,0.1)",
                        transform: isSelected ? "scale(1.05)" : "scale(1)",
                      }}
                      onClick={() => handleThemeChange(key)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="m-0" style={{ color: theme.colors.text }}>
                          {theme.name}
                        </h6>
                        {!isUnlocked && (
                          <span
                            className="badge bg-warning text-dark"
                            style={{ fontSize: "0.7rem" }}
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
                                border: "1px solid rgba(255,255,255,0.2)",
                              }}
                            />
                          ))}
                      </div>

                      {isSelected && (
                        <div
                          className="mt-2 text-center text-success fw-bold"
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
              {SHOP_ITEMS.colors.items.map((item) => (
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

        {/* Custom Colors Tab */}
        {activeTab === "custom" && (
          <div className="custom-colors-section">
            <h4 className="mb-4">
              <i className="bi bi-palette2 me-2"></i>Customize Your Theme Colors
            </h4>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="custom-color-group">
                  <label className="form-label">Primary Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      defaultValue={customColors.primary || "#09090d"}
                      onChange={(e) => handleCustomColorChange("primary", e.target.value)}
                      title="Choose primary color"
                    />
                    <span className="color-value ms-2">{customColors.primary || "#09090d"}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="custom-color-group">
                  <label className="form-label">Secondary Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      defaultValue={customColors.secondary || "#1a1a23"}
                      onChange={(e) => handleCustomColorChange("secondary", e.target.value)}
                      title="Choose secondary color"
                    />
                    <span className="color-value ms-2">{customColors.secondary || "#1a1a23"}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="custom-color-group">
                  <label className="form-label">Navbar Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      defaultValue={customColors.navbar || "#09090d"}
                      onChange={(e) => handleCustomColorChange("navbar", e.target.value)}
                      title="Choose navbar color"
                    />
                    <span className="color-value ms-2">{customColors.navbar || "#09090d"}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="custom-color-group">
                  <label className="form-label">Sidebar Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      defaultValue={customColors.sidebar || "#1a1a23"}
                      onChange={(e) => handleCustomColorChange("sidebar", e.target.value)}
                      title="Choose sidebar color"
                    />
                    <span className="color-value ms-2">{customColors.sidebar || "#1a1a23"}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="custom-color-group">
                  <label className="form-label">Background Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      defaultValue={customColors.background || "#0f0f14"}
                      onChange={(e) => handleCustomColorChange("background", e.target.value)}
                      title="Choose background color"
                    />
                    <span className="color-value ms-2">{customColors.background || "#0f0f14"}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="custom-color-group">
                  <label className="form-label">Button Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      defaultValue={customColors.button || "#007bff"}
                      onChange={(e) => handleCustomColorChange("button", e.target.value)}
                      title="Choose button color"
                    />
                    <span className="color-value ms-2">{customColors.button || "#007bff"}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="custom-color-group">
                  <label className="form-label">Text Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      defaultValue={customColors.text || "#ffffff"}
                      onChange={(e) => handleCustomColorChange("text", e.target.value)}
                      title="Choose text color"
                    />
                    <span className="color-value ms-2">{customColors.text || "#ffffff"}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="custom-color-group">
                  <label className="form-label">Accent Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      defaultValue={customColors.accent || "#ff6b6b"}
                      onChange={(e) => handleCustomColorChange("accent", e.target.value)}
                      title="Choose accent color"
                    />
                    <span className="color-value ms-2">{customColors.accent || "#ff6b6b"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={handleSaveCustomColors}
              >
                <i className="bi bi-check-circle me-1"></i>Save Custom Colors
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab("themes")}
              >
                <i className="bi bi-x-circle me-1"></i>Cancel
              </button>
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
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "2px solid rgba(255, 255, 255, 0.1)",
        cursor: "pointer",
        transform: isHovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 10px 30px rgba(0, 0, 0, 0.3)"
          : "0 5px 15px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div
        style={{
          height: "100px",
          backgroundColor: item.color || "#3a305033",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {item.type === "color" ? (
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: item.color,
              borderRadius: "10px",
              border: "3px solid rgba(255, 255, 255, 0.3)",
            }}
          />
        ) : (
          <h2 className="mb-0">{getPassIcon(item.icon)}</h2>
        )}

        {isUnlocked && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "#28a745",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
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
              <i className="bi bi-coin me-1" style={{ color: "#ffd93d" }}></i>
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
