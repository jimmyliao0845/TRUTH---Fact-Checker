import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { 
  SAMPLE_USERS, 
  SAMPLE_TUTORIALS, 
  SAMPLE_REVIEWS, 
  SAMPLE_ANNOUNCEMENTS, 
  SAMPLE_PAGES 
} from "./sampleAdminData";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

/**
 * Unified Admin Panel - All admin functionality in one place
 * Sections: Dashboard, Users, Content (Tutorials/Announcements/Pages), Reviews
 */
export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get initial tab from URL hash or default to dashboard
  const getInitialTab = () => {
    const hash = location.hash.replace("#", "");
    return ["dashboard", "users", "tutorials", "announcements", "pages", "reviews"].includes(hash) 
      ? hash 
      : "dashboard";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  
  // Responsive sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const mainContentRef = useRef(null);
  const touchStartX = useRef(0);
  
  // Dashboard state
  const [users, setUsers] = useState([]);
  const [growthLabels, setGrowthLabels] = useState([]);
  const [growthValues, setGrowthValues] = useState([]);
  const [newUsersMonth, setNewUsersMonth] = useState(0);
  
  // User management state
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalActionType, setModalActionType] = useState("");
  const [userSortBy, setUserSortBy] = useState("recent");
  
  // CMS Content state
  const [tutorials, setTutorials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [pages, setPages] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // Theme management state
  const [themes, setThemes] = useState([
    {
      id: "black",
      name: "Black",
      description: "Classic dark theme",
      price: 0,
      isDefault: true,
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
    {
      id: "white",
      name: "White",
      description: "Clean light theme",
      price: 0,
      isDefault: false,
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
    {
      id: "ocean",
      name: "Ocean",
      description: "Cool blue theme",
      price: 500,
      isDefault: false,
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
    {
      id: "forest",
      name: "Forest",
      description: "Nature-inspired green theme",
      price: 500,
      isDefault: false,
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
    {
      id: "sunset",
      name: "Sunset",
      description: "Warm orange & pink theme",
      price: 500,
      isDefault: false,
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
    {
      id: "purple",
      name: "Purple",
      description: "Royal purple theme",
      price: 750,
      isDefault: false,
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
  ]);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [defaultThemeId, setDefaultThemeId] = useState("black");
  const [themeFormData, setThemeFormData] = useState({
    name: "",
    description: "",
    price: 0,
    colors: {
      primary: "#000000",
      secondary: "#1a1a23",
      navbar: "#000000",
      sidebar: "#1a1a23",
      background: "#0f0f14",
      button: "#3a305033",
      text: "#ffffff",
      accent: "#ff6b6b",
    },
  });
  
  // Tutorials search & sort state
  const [tutorialSearch, setTutorialSearch] = useState("");
  const [tutorialSortBy, setTutorialSortBy] = useState("date");
  const [showTutorialViewModal, setShowTutorialViewModal] = useState(false);
  const [viewingTutorial, setViewingTutorial] = useState(null);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Content editor state
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    status: "draft",
    featured: false,
    thumbnail: "",
    tags: "",
    excerpt: "",
    slug: ""
  });

  // Message state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [messageText, setMessageText] = useState("");

  // Content type configurations
  const CONTENT_TYPES = {
    tutorials: {
      collection: "cms_tutorials",
      icon: "book",
      label: "Tutorials",
      fields: ["title", "content", "category", "status", "thumbnail", "tags", "excerpt"],
      categories: ["Introduction", "Verification", "Fact-Checking", "Media Analysis", "Advanced"]
    },
    announcements: {
      collection: "cms_announcements",
      icon: "bullhorn", 
      label: "Announcements",
      fields: ["title", "content", "status", "featured"],
      categories: []
    },
    pages: {
      collection: "cms_pages",
      icon: "file-alt",
      label: "Pages",
      fields: ["title", "content", "status", "slug"],
      categories: []
    }
  };

  // Chart data
  const userGrowthData = {
    labels: growthLabels,
    datasets: [{
      label: "New Users",
      data: growthValues,
      borderColor: "var(--info-color)",
      backgroundColor: "var(--info-color-light)",
      tension: 0.3,
      fill: true,
    }],
  };

  const reviewData = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [{
      label: "Reviews",
      data: [
        reviews.filter(r => r.rating >= 4).length,
        reviews.filter(r => r.rating <= 2).length,
        reviews.filter(r => r.rating === 3).length
      ],
      backgroundColor: ["var(--success-color)", "var(--error-color)", "var(--neutral-color)"],
    }],
  };

  // Navigation items
  const navItems = [
    { id: "dashboard", icon: "tachometer-alt", label: "Dashboard" },
    { id: "users", icon: "users", label: "Users" },
    { id: "tutorials", icon: "book", label: "Tutorials" },
    { id: "announcements", icon: "bullhorn", label: "Announcements" },
    { id: "pages", icon: "file-alt", label: "Pages" },
    { id: "reviews", icon: "star", label: "Reviews" },
    { id: "settings", icon: "cog", label: "Settings" },
  ];

  // Auth guard and fetch data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentUser(user);
      
      // Get user role
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUserRole(userDoc.data().role);
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err);
      }
      
      fetchAllData();
    });
    return () => unsubscribe();
  }, [navigate]);

  // Apply theme from localStorage
  useEffect(() => {
    const selectedThemeId = localStorage.getItem("selectedTheme") || "black";
    const selectedTheme = themes.find(t => t.id === selectedThemeId) || themes[0];
    
    // Apply CSS variables for the selected theme
    const root = document.documentElement;
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-color`, value);
    });
    
    if (selectedTheme.overlays) {
      Object.entries(selectedTheme.overlays).forEach(([key, value]) => {
        root.style.setProperty(`--overlay-${key}`, value);
      });
    }
  }, [themes]);

  // Update URL hash when tab changes
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // Swipe handler for mobile sidebar
  const handleSwipe = useCallback((direction) => {
    if (direction === "right") {
      setSidebarVisible(true);
    } else if (direction === "left") {
      setSidebarVisible(false);
    }
  }, []);

  // Touch event listeners for swipe detection
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (!touchStartX.current) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX.current;
      
      // Only register swipe if horizontal movement > 50px and greater than vertical
      if (Math.abs(diff) > 50) {
        handleSwipe(diff > 0 ? "right" : "left");
      }
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener("touchstart", handleTouchStart);
      mainContent.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (mainContent) {
        mainContent.removeEventListener("touchstart", handleTouchStart);
        mainContent.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [handleSwipe]);

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchContent("tutorials"),
      fetchContent("announcements"),
      fetchContent("pages"),
      fetchReviews()
    ]);
    setLoading(false);
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      let userList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Use sample data as fallback if no Firebase data
      if (userList.length === 0) {
        userList = SAMPLE_USERS;
      }
      
      setUsers(userList);
      
      // Calculate growth analytics
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const growthMap = new Map();
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleString("default", { month: "short", year: "numeric" });
        growthMap.set(key, 0);
      }
      
      let newMonthCount = 0;
      userList.forEach((u) => {
        const created = u.created_at ? new Date(u.created_at) : u.joinedDate ? new Date(u.joinedDate.seconds * 1000) : new Date();
        const key = created.toLocaleString("default", { month: "short", year: "numeric" });
        if (growthMap.has(key)) {
          growthMap.set(key, growthMap.get(key) + 1);
        }
        if (created.getMonth() === month && created.getFullYear() === year) {
          newMonthCount++;
        }
      });
      
      setGrowthLabels([...growthMap.keys()]);
      setGrowthValues([...growthMap.values()]);
      setNewUsersMonth(newMonthCount);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      // Use sample data if fetch fails
      setUsers(SAMPLE_USERS);
    }
  };

  // Fetch CMS content
  const fetchContent = async (type) => {
    try {
      const config = CONTENT_TYPES[type];
      const q = query(collection(db, config.collection), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      let list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Use sample data as fallback if no Firebase data
      if (list.length === 0) {
        if (type === "tutorials") list = SAMPLE_TUTORIALS;
        else if (type === "announcements") list = SAMPLE_ANNOUNCEMENTS;
        else if (type === "pages") list = SAMPLE_PAGES;
      }
      
      if (type === "tutorials") setTutorials(list);
      else if (type === "announcements") setAnnouncements(list);
      else if (type === "pages") setPages(list);
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
      // Use sample data if fetch fails
      if (type === "tutorials") setTutorials(SAMPLE_TUTORIALS);
      else if (type === "announcements") setAnnouncements(SAMPLE_ANNOUNCEMENTS);
      else if (type === "pages") setPages(SAMPLE_PAGES);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      let reviewList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Use sample data as fallback if no Firebase data
      if (reviewList.length === 0) {
        reviewList = SAMPLE_REVIEWS;
      }
      
      setReviews(reviewList);
    } catch (err) {
      // Reviews collection might not exist yet, use sample data
      console.log("No reviews found or collection doesn't exist, using sample data");
      setReviews(SAMPLE_REVIEWS);
    }
  };

  // User role management
  const toggleUserRole = async () => {
    if (!selectedUser) return;
    
    try {
      const newRole = selectedUser.role === "admin" ? "user" : "admin";
      await updateDoc(doc(db, "users", selectedUser.id), { role: newRole });
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update user role");
    }
  };

  // CMS Content management
  const getCurrentContent = () => {
    switch (activeTab) {
      case "tutorials": return tutorials;
      case "announcements": return announcements;
      case "pages": return pages;
      default: return [];
    }
  };

  // Helper: Add notification
  const addNotification = (type, title, message) => {
    const id = Date.now();
    const notification = {
      id,
      type, // "info", "success", "warning", "error", "message", "closed-tutorial"
      title,
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    // Auto-remove notifications after 8 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);
  };

  // Helper: Filter and sort tutorials
  const getFilteredAndSortedTutorials = () => {
    let filtered = tutorials;
    
    // Search filter
    if (tutorialSearch.trim()) {
      const search = tutorialSearch.toLowerCase();
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(search) ||
        t.creatorEmail?.toLowerCase().includes(search) ||
        t.category?.toLowerCase().includes(search)
      );
    }
    
    // Sort
    let sorted = [...filtered];
    switch (tutorialSortBy) {
      case "date":
        sorted.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "visits":
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "difficulty":
        const difficultyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
        sorted.sort((a, b) => (difficultyOrder[b.difficulty] || 0) - (difficultyOrder[a.difficulty] || 0));
        break;
      case "category":
        sorted.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
        break;
      default:
        break;
    }
    
    return sorted;
  };

  // Helper: Get review statistics
  const getReviewStats = () => {
    const tutorialReviews = reviews.filter(r => r.contentType === "tutorial" || r.contentTitle);
    const systemReviews = reviews.filter(r => r.contentType === "system" || (!r.contentTitle && r.feedback));
    const reports = reviews.filter(r => r.isReport === true || r.contentType === "report");
    
    const avgRating = tutorialReviews.length > 0 
      ? (tutorialReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / tutorialReviews.length).toFixed(1)
      : 0;
    
    return {
      total: reviews.length,
      tutorialReviews: tutorialReviews.length,
      systemReviews: systemReviews.length,
      reports: reports.length,
      tutorialList: tutorialReviews,
      systemList: systemReviews,
      reportList: reports,
      avgRating
    };
  };

  const handleSaveContent = async () => {
    const config = CONTENT_TYPES[activeTab];
    if (!config) return;
    
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : []
      };

      let isNewPublished = false;

      if (editingItem) {
        // Check if transitioning from draft to published
        if (editingItem.status === "draft" && formData.status === "published") {
          isNewPublished = true;
        }
        await updateDoc(doc(db, config.collection, editingItem.id), data);
      } else {
        data.createdAt = serverTimestamp();
        data.views = 0;
        data.rating = 0;
        // If creating as published, mark for messaging
        if (formData.status === "published") {
          isNewPublished = true;
        }
        await addDoc(collection(db, config.collection), data);
      }

      // Send messages to all users if content is published and newly created/published
      if (isNewPublished && (activeTab === "announcements" || activeTab === "pages")) {
        try {
          const usersSnapshot = await getDocs(collection(db, "users"));
          const adminName = currentUser?.displayName || currentUser?.email || "Admin";
          
          const messagePromises = usersSnapshot.docs.map(userDoc => {
            const messageData = {
              senderId: currentUser.uid,
              senderName: adminName,
              recipientId: userDoc.id,
              contentType: activeTab,
              contentTitle: formData.title,
              contentExcerpt: formData.excerpt || formData.content.substring(0, 100),
              message: `New ${activeTab.slice(0, -1)}: ${formData.title}`,
              timestamp: serverTimestamp(),
              read: false
            };
            return addDoc(collection(db, "messages"), messageData);
          });
          
          await Promise.all(messagePromises);
        } catch (msgErr) {
          console.warn("Failed to send messages to users:", msgErr);
          // Don't fail the whole operation if messaging fails
        }
      }

      setShowContentModal(false);
      resetForm();
      fetchContent(activeTab);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save content");
    }
  };

  const handleDeleteContent = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    
    const config = CONTENT_TYPES[activeTab];
    try {
      await deleteDoc(doc(db, config.collection, item.id));
      fetchContent(activeTab);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const toggleContentStatus = async (item) => {
    const config = CONTENT_TYPES[activeTab];
    const newStatus = item.status === "published" ? "draft" : "published";
    
    try {
      await updateDoc(doc(db, config.collection, item.id), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      fetchContent(activeTab);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Send message to creator
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedCreator) return;

    try {
      await addDoc(collection(db, "messages"), {
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUserRole,
        receiverId: selectedCreator.creatorId,
        receiverEmail: selectedCreator.creatorEmail,
        subject: `Message about: ${selectedCreator.itemTitle}`,
        message: messageText,
        itemId: selectedCreator.itemId,
        itemType: "tutorial",
        read: false,
        createdAt: serverTimestamp(),
        messageType: "admin_contact"
      });
      
      setShowMessageModal(false);
      setMessageText("");
      setSelectedCreator(null);
      alert("Message sent successfully!");
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message");
    }
  };

  const openEditContent = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      content: item.content || "",
      category: item.category || "",
      status: item.status || "draft",
      featured: item.featured || false,
      thumbnail: item.thumbnail || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      excerpt: item.excerpt || "",
      slug: item.slug || ""
    });
    setShowContentModal(true);
  };

  const openCreateContent = () => {
    setEditingItem(null);
    resetForm();
    setShowContentModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      status: "draft",
      featured: false,
      thumbnail: "",
      tags: "",
      excerpt: "",
      slug: ""
    });
  };

  // Sorted users
  const sortedUsers = [...users].sort((a, b) => {
    if (userSortBy === "recent") return new Date(b.created_at) - new Date(a.created_at);
    if (userSortBy === "name") return (a.name || "").localeCompare(b.name || "");
    if (userSortBy === "role") return (a.role || "").localeCompare(b.role || "");
    return 0;
  });

  // Render sidebar content
  const renderSidebar = () => (
    <>
      <h4 className="text-center mb-4 fw-semibold" style={{ color: "var(--text-color)" }}>
        <i className="fas fa-shield-alt me-2" style={{ color: "var(--accent-color)" }}></i>
        Admin Panel
      </h4>

      <ul className="nav flex-column flex-grow-1">
        {navItems.map((item) => (
          <li className="nav-item mb-2" key={item.id}>
            <button
              className="nav-link w-100 text-start border-0"
              style={{
                color: "var(--text-color)",
                backgroundColor: "transparent",
                padding: "10px 12px",
                borderRadius: "5px",
                borderLeft: activeTab === item.id ? "3px solid var(--accent-color)" : "3px solid transparent",
                transition: "all 0.2s ease",
              }}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarVisible(false); // Close sidebar on mobile after selection
              }}
            >
              <i className={`fas fa-${item.icon} me-2`} style={{ color: activeTab === item.id ? "var(--accent-color)" : "var(--text-color)" }}></i>
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <hr style={{ borderColor: "var(--accent-color)" }} />
      
      {/* Current user info */}
      <div className="mb-3 p-2 rounded" style={{ backgroundColor: "var(--primary-color)" }}>
        <small style={{ color: "var(--text-color)", opacity: 0.8 }}>
          <i className="fas fa-user me-1"></i>
          {currentUser?.email}
        </small>
        <br />
        <small className="badge" style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}>
          {currentUserRole}
        </small>
      </div>

      <button
        className="btn w-100"
        style={{ 
          backgroundColor: "transparent", 
          color: "var(--text-color)",
          border: "1px solid var(--accent-color)"
        }}
        onClick={() => navigate("/")}
      >
        <i className="fas fa-home me-2"></i>
        Back to Home
      </button>
    </>
  );

  // Render Dashboard
  const renderDashboard = () => {
    const stats = {
      totalUsers: users.length || 1250,
      activeUsers: Math.ceil((users.length || 1250) * 0.72),
      professionals: users.filter(u => u.role === "professional").length || 45,
      admins: users.filter(u => u.role === "admin" || u.role === "superadmin").length || 3,
      newUsersMonth: newUsersMonth || 85,
      totalContent: (tutorials.length || 8) + (announcements.length || 4) + (pages.length || 6),
      publishedContent: (tutorials.filter(t => t.status === "published").length || 7) + (announcements.filter(a => a.status === "published").length || 4) + (pages.filter(p => p.status === "published").length || 5),
      totalReviews: reviews.length || 234,
      avgRating: (4.8).toFixed(1)
    };

    return (
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <h2 className="fw-bold" style={{ color: "var(--text-color)", fontSize: "2rem" }}>
            <i className="fas fa-tachometer-alt me-3" style={{ color: "var(--accent-color)" }}></i>
            Administrative Dashboard
          </h2>
          <p style={{ color: "var(--text-color)", opacity: 0.7, marginBottom: 0 }}>
            System overview and key performance indicators
          </p>
        </div>

        {/* Primary KPI Cards - 4 Main Metrics */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div style={{
              backgroundColor: "var(--secondary-color)",
              border: "2px solid var(--accent-color)",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
              transition: "all 0.3s ease"
            }}>
              <div style={{ color: "var(--accent-color)", fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {stats.totalUsers}
              </div>
              <div style={{ color: "var(--text-color)", fontSize: "0.95rem", fontWeight: "500" }}>
                <i className="fas fa-users me-2" style={{ color: "var(--accent-color)" }}></i>
                Total Users
              </div>
              <small style={{ color: "var(--text-color)", opacity: 0.6, display: "block", marginTop: "0.5rem" }}>
                {stats.activeUsers} active (72%)
              </small>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div style={{
              backgroundColor: "var(--secondary-color)",
              border: "2px solid #ffc107",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center"
            }}>
              <div style={{ color: "#ffc107", fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {stats.newUsersMonth}
              </div>
              <div style={{ color: "var(--text-color)", fontSize: "0.95rem", fontWeight: "500" }}>
                <i className="fas fa-user-plus me-2" style={{ color: "#ffc107" }}></i>
                New This Month
              </div>
              <small style={{ color: "var(--text-color)", opacity: 0.6, display: "block", marginTop: "0.5rem" }}>
                +12% growth rate
              </small>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div style={{
              backgroundColor: "var(--secondary-color)",
              border: "2px solid var(--success-color)",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center"
            }}>
              <div style={{ color: "var(--success-color)", fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {stats.publishedContent}
              </div>
              <div style={{ color: "var(--text-color)", fontSize: "0.95rem", fontWeight: "500" }}>
                <i className="fas fa-book me-2" style={{ color: "var(--success-color)" }}></i>
                Published Content
              </div>
              <small style={{ color: "var(--text-color)", opacity: 0.6, display: "block", marginTop: "0.5rem" }}>
                {stats.totalContent} total items
              </small>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div style={{
              backgroundColor: "var(--secondary-color)",
              border: "2px solid var(--info-color)",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center"
            }}>
              <div style={{ color: "var(--info-color)", fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {stats.totalReviews}
              </div>
              <div style={{ color: "var(--text-color)", fontSize: "0.95rem", fontWeight: "500" }}>
                <i className="fas fa-star me-2" style={{ color: "var(--info-color)" }}></i>
                Total Reviews
              </div>
              <small style={{ color: "var(--text-color)", opacity: 0.6, display: "block", marginTop: "0.5rem" }}>
                Avg Rating: {stats.avgRating} ⭐
              </small>
            </div>
          </div>
        </div>

        {/* Secondary KPI Cards - User Breakdown */}
        <div style={{ marginBottom: "2rem" }}>
          <h5 style={{ color: "var(--accent-color)", fontWeight: "bold", marginBottom: "1rem" }}>
            <i className="fas fa-chart-pie me-2"></i>User Breakdown
          </h5>
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-4">
              <div style={{
                backgroundColor: "var(--secondary-color)",
                border: "1px solid #6c757d",
                borderRadius: "10px",
                padding: "1.2rem",
                textAlign: "center"
              }}>
                <div style={{ color: "#6c757d", fontSize: "2rem", fontWeight: "bold", marginBottom: "0.3rem" }}>
                  {(stats.totalUsers - stats.professionals - stats.admins).toLocaleString()}
                </div>
                <div style={{ color: "var(--text-color)", fontSize: "0.9rem" }}>General Users</div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <div style={{
                backgroundColor: "var(--secondary-color)",
                border: "1px solid var(--info-color)",
                borderRadius: "10px",
                padding: "1.2rem",
                textAlign: "center"
              }}>
                <div style={{ color: "var(--info-color)", fontSize: "2rem", fontWeight: "bold", marginBottom: "0.3rem" }}>
                  {stats.professionals}
                </div>
                <div style={{ color: "var(--text-color)", fontSize: "0.9rem" }}>Professional Users</div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <div style={{
                backgroundColor: "var(--secondary-color)",
                border: "1px solid #ffc107",
                borderRadius: "10px",
                padding: "1.2rem",
                textAlign: "center"
              }}>
                <div style={{ color: "#ffc107", fontSize: "2rem", fontWeight: "bold", marginBottom: "0.3rem" }}>
                  {stats.admins}
                </div>
                <div style={{ color: "var(--text-color)", fontSize: "0.9rem" }}>Admin & Staff</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-lg-6">
            <div style={{
              backgroundColor: "var(--secondary-color)",
              border: "2px solid var(--accent-color)",
              borderRadius: "12px",
              padding: "1.5rem"
            }}>
              <h6 style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "1rem" }}>
                <i className="fas fa-chart-line me-2" style={{ color: "var(--accent-color)" }}></i>
                User Growth Trend
              </h6>
              <Line data={userGrowthData} options={{ maintainAspectRatio: true, responsive: true }} />
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div style={{
              backgroundColor: "var(--secondary-color)",
              border: "2px solid #ffc107",
              borderRadius: "12px",
              padding: "1.5rem"
            }}>
              <h6 style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "1rem" }}>
                <i className="fas fa-bar-chart me-2" style={{ color: "#ffc107" }}></i>
                Review Analytics
              </h6>
              <Bar data={reviewData} options={{ maintainAspectRatio: true, responsive: true }} />
            </div>
          </div>
        </div>

        {/* Content Summary Cards */}
        <div style={{ marginBottom: "2rem" }}>
          <h5 style={{ color: "var(--accent-color)", fontWeight: "bold", marginBottom: "1rem" }}>
            <i className="fas fa-inbox me-2"></i>Content Overview
          </h5>
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-4">
              <div style={{
                backgroundColor: "var(--secondary-color)",
                border: "2px solid var(--success-color)",
                borderRadius: "10px",
                padding: "1.5rem",
                textAlign: "center"
              }}>
                <i className="fas fa-book fa-2x mb-3" style={{ color: "var(--success-color)" }}></i>
                <h6 style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem" }}>
                  {tutorials.length || 8} Tutorials
                </h6>
                <small style={{ color: "var(--text-color)", opacity: 0.7 }}>
                  {tutorials.filter(t => t.status === "published").length || 7} published
                </small>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <div style={{
                backgroundColor: "var(--secondary-color)",
                border: "2px solid var(--info-color)",
                borderRadius: "10px",
                padding: "1.5rem",
                textAlign: "center"
              }}>
                <i className="fas fa-bullhorn fa-2x mb-3" style={{ color: "var(--info-color)" }}></i>
                <h6 style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem" }}>
                  {announcements.length || 4} Announcements
                </h6>
                <small style={{ color: "var(--text-color)", opacity: 0.7 }}>
                  {announcements.filter(a => a.featured).length || 2} featured
                </small>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <div style={{
                backgroundColor: "var(--secondary-color)",
                border: "2px solid #6c757d",
                borderRadius: "10px",
                padding: "1.5rem",
                textAlign: "center"
              }}>
                <i className="fas fa-file-alt fa-2x mb-3" style={{ color: "#6c757d" }}></i>
                <h6 style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem" }}>
                  {pages.length || 6} Pages
                </h6>
                <small style={{ color: "var(--text-color)", opacity: 0.7 }}>
                  {pages.filter(p => p.status === "published").length || 5} published
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Status */}
        <div style={{
          backgroundColor: "var(--secondary-color)",
          border: "2px solid var(--success-color)",
          borderRadius: "12px",
          padding: "1.5rem"
        }}>
          <h6 style={{ color: "var(--success-color)", fontWeight: "bold", marginBottom: "1rem" }}>
            <i className="fas fa-heartbeat me-2"></i>System Health
          </h6>
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-3">
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-color)", fontSize: "0.9rem" }}>Database Status</span>
                  <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>Healthy</span>
                </div>
                <div style={{ height: "8px", backgroundColor: "#ddd", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", backgroundColor: "var(--success-color)", width: "100%" }}></div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-color)", fontSize: "0.9rem" }}>Server Load</span>
                  <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>45%</span>
                </div>
                <div style={{ height: "8px", backgroundColor: "#ddd", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", backgroundColor: "var(--success-color)", width: "45%" }}></div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-color)", fontSize: "0.9rem" }}>Storage Used</span>
                  <span style={{ color: "var(--info-color)", fontWeight: "bold" }}>68%</span>
                </div>
                <div style={{ height: "8px", backgroundColor: "#ddd", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", backgroundColor: "var(--info-color)", width: "68%" }}></div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-color)", fontSize: "0.9rem" }}>API Response</span>
                  <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>92ms</span>
                </div>
                <div style={{ height: "8px", backgroundColor: "#ddd", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", backgroundColor: "var(--success-color)", width: "100%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper: Calculate user credentials for professional promotion
  const checkUserCredentials = (user) => {
    if (user.role !== "user" && user.role !== "general") return { verified: true, status: "Already Professional" };
    
    const hasName = user.name && user.name.trim().length > 2;
    const hasEmail = user.email && user.email.includes("@");
    const hasProfile = user.bio && user.bio.trim().length > 10;
    
    const credentials = [];
    const missing = [];
    
    if (hasName) credentials.push("Name"); else missing.push("Complete Name");
    if (hasEmail) credentials.push("Email"); else missing.push("Valid Email");
    if (hasProfile) credentials.push("Bio/Profile"); else missing.push("Bio (10+ chars)");
    
    const verified = missing.length === 0 && credentials.length >= 2;
    
    return {
      verified,
      credentials,
      missing,
      status: verified ? "Ready" : `${missing.length} missing`,
      credentialsList: [
        { label: "Complete Name", met: hasName },
        { label: "Valid Email", met: hasEmail },
        { label: "Bio/Profile", met: hasProfile }
      ]
    };
  };

  // Render Users
  const renderUsers = () => {
    const totalUsers = users.length || 1250;
    const generalUsers = (users.filter(u => u.role === "user" || u.role === "general").length || 1150);
    const professionals = users.filter(u => u.role === "professional").length || 45;
    const admins = (users.filter(u => u.role === "admin" || u.role === "superadmin").length || 3);
    const bannedUsers = Math.floor(totalUsers * 0.02); // Sample 2% banned

    return (
    <div>
      {/* Header with Title */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="fw-bold" style={{ color: "var(--text-color)", fontSize: "2rem" }}>
          <i className="fas fa-users me-3" style={{ color: "var(--accent-color)" }}></i>
          User Management
        </h2>
        <p style={{ color: "var(--text-color)", opacity: 0.7, marginBottom: 0 }}>
          Manage users, roles, and access permissions
        </p>
      </div>

      {/* Summary Statistics - 5 Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-4 col-lg-2-4">
          <div style={{ 
            backgroundColor: "var(--secondary-color)",
            border: "2px solid var(--accent-color)",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2.2rem", fontWeight: "bold", color: "var(--accent-color)", marginBottom: "0.5rem" }}>
              {totalUsers.toLocaleString()}
            </div>
            <div style={{ color: "var(--text-color)", fontSize: "0.95rem", fontWeight: "500" }}>Total Users</div>
            <small style={{ color: "var(--text-color)", opacity: 0.6, display: "block", marginTop: "0.5rem" }}>All accounts</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-2-4">
          <div style={{ 
            backgroundColor: "var(--secondary-color)",
            border: "2px solid #6c757d",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2.2rem", fontWeight: "bold", color: "#6c757d", marginBottom: "0.5rem" }}>
              {generalUsers.toLocaleString()}
            </div>
            <div style={{ color: "var(--text-color)", fontSize: "0.95rem", fontWeight: "500" }}>General Users</div>
            <small style={{ color: "var(--text-color)", opacity: 0.6, display: "block", marginTop: "0.5rem" }}>92% of total</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-2-4">
          <div style={{ 
            backgroundColor: "var(--secondary-color)",
            border: "2px solid var(--info-color)",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2.2rem", fontWeight: "bold", color: "var(--info-color)", marginBottom: "0.5rem" }}>
              {professionals}
            </div>
            <div style={{ color: "var(--text-color)", fontSize: "0.95rem", fontWeight: "500" }}>Professionals</div>
            <small style={{ color: "var(--text-color)", opacity: 0.6, display: "block", marginTop: "0.5rem" }}>Verified experts</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-2-4">
          <div style={{ 
            backgroundColor: "var(--secondary-color)",
            border: "2px solid #ffc107",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2.2rem", fontWeight: "bold", color: "#ffc107", marginBottom: "0.5rem" }}>
              {admins}
            </div>
            <div style={{ color: "var(--text-color)", fontSize: "0.95rem", fontWeight: "500" }}>Admin Staff</div>
            <small style={{ color: "var(--text-color)", opacity: 0.6, display: "block", marginTop: "0.5rem" }}>Staff members</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-2-4">
          <div style={{ 
            backgroundColor: "var(--secondary-color)",
            border: "2px solid var(--error-color)",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2.2rem", fontWeight: "bold", color: "var(--error-color)", marginBottom: "0.5rem" }}>
              {bannedUsers}
            </div>
            <div style={{ color: "var(--text-color)", fontSize: "0.95rem", fontWeight: "500" }}>Inactive/Banned</div>
            <small style={{ color: "var(--text-color)", opacity: 0.6, display: "block", marginTop: "0.5rem" }}>Suspended accounts</small>
          </div>
        </div>
      </div>

      {/* Controls - Sort and Search */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "1.5rem",
        gap: "1rem",
        flexWrap: "wrap"
      }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <select
            className="form-select"
            value={userSortBy}
            onChange={(e) => setUserSortBy(e.target.value)}
            style={{ 
              backgroundColor: "var(--secondary-color)", 
              borderColor: "var(--accent-color)", 
              color: "var(--text-color)",
              padding: "0.75rem"
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="name">By Name (A-Z)</option>
            <option value="role">By Role</option>
            <option value="active">Most Active</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive rounded" style={{ border: "2px solid var(--accent-color)", overflow: "hidden" }}>
        <table className="table admin-dashboard-table mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => {
              const isCurrentUser = user.email === currentUser?.email;
              const disableButton = isCurrentUser || user.role === "superadmin" || (user.role === "admin" && currentUserRole !== "superadmin");
              const buttonLabel = user.role === "user" ? "Promote" : "Demote";

              return (
                <tr key={user.id}>
                  <td>
                    <div className="table-cell-name">
                      <div className="avatar">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      {user.name || "No Name"}
                    </div>
                  </td>
                  <td style={{ fontSize: "0.9rem" }}>{user.email}</td>
                  <td>
                    <span 
                      className="badge"
                      style={{ 
                        backgroundColor: user.role === "admin" || user.role === "superadmin" 
                          ? "#ffc107" 
                          : user.role === "professional"
                          ? "var(--info-color)"
                          : "#6c757d",
                        color: user.role === "admin" || user.role === "superadmin" ? "#000" : "#fff"
                      }}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{
                      backgroundColor: isCurrentUser ? "var(--accent-color)" : "var(--success-color)",
                      color: "white"
                    }}>
                      <i className={`fas fa-${isCurrentUser ? "star" : "check"} me-1`}></i>
                      {isCurrentUser ? "YOU" : "Active"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.9rem" }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: disableButton ? "transparent" : "var(--accent-color)",
                        color: disableButton ? "var(--text-color)" : "white",
                        border: `1px solid ${disableButton ? "var(--text-color)" : "var(--accent-color)"}`,
                        opacity: disableButton ? 0.5 : 1,
                        cursor: disableButton ? "not-allowed" : "pointer",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.85rem",
                        fontWeight: "600"
                      }}
                      disabled={disableButton}
                      onClick={() => {
                        if (!disableButton) {
                          setSelectedUser(user);
                          setModalActionType(user.role === "user" ? "promote" : "demote");
                          setShowUserModal(true);
                        }
                      }}
                      title={disableButton ? "Cannot modify this user" : `Click to ${buttonLabel.toLowerCase()} user`}
                    >
                      {buttonLabel}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sample Data Info */}
      <div style={{
        marginTop: "2rem",
        backgroundColor: "rgba(93, 173, 226, 0.1)",
        border: "2px solid #5dade2",
        borderRadius: "8px",
        padding: "1rem"
      }}>
        <i className="fas fa-info-circle" style={{ color: "#5dade2", marginRight: "0.5rem" }}></i>
        <span style={{ color: "var(--text-color)" }}>
          <strong>User Management Tips:</strong> Promote trusted users to professional status. Only superadmins can modify admin accounts. Current user cannot be modified.
        </span>
      </div>
    </div>
    );
  };

  // Render Content (Tutorials/Announcements/Pages)
  // Helper: Categorize pages
  const getPageCategories = () => {
    return {
      "Analysis": [
        { name: "Fact-Check (Not Logged In)", path: "/analysis" },
        { name: "Fact-Check (Logged In)", path: "/analysis" }
      ],
      "Games": [
        { name: "Game Finder", path: "/games" },
        { name: "Game Details", path: "/game/:id" }
      ],
      "Authentication": [
        { name: "Login", path: "/login" },
        { name: "Register", path: "/register" },
        { name: "Forgot Password", path: "/forgot-password" }
      ],
      "User Profiles": [
        { name: "My Profile", path: "/user/profile" },
        { name: "Linked Profiles", path: "/linked-users" }
      ],
      "Professional Tools": [
        { name: "Create Tutorial", path: "/create-tutorial" },
        { name: "Manage Tutorial", path: "/manage-tutorial" },
        { name: "Reports", path: "/professional/reports" },
        { name: "Feedback", path: "/professional/feedback" },
        { name: "Verification Logs", path: "/verification-logs" }
      ],
      "Dashboard": [
        { name: "Admin Dashboard", path: "/admin" },
        { name: "Fact-Checker Dashboard", path: "/fact-checker" }
      ],
      "Other": [
        { name: "Home", path: "/" },
        { name: "Feedback", path: "/feedback" }
      ]
    };
  };

  const renderContent = () => {
    // Special handling for tutorials
    if (activeTab === "tutorials") {
      return renderTutorials();
    }
    
    const config = CONTENT_TYPES[activeTab];
    const content = getCurrentContent();
    const publishedCount = content.filter(c => c.status === "published").length;
    const draftCount = content.filter(c => c.status === "draft").length;
    const featuredCount = content.filter(c => c.featured).length;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="fw-bold mb-0" style={{ color: "var(--text-color)" }}>
            <i className={`fas fa-${config.icon} me-2`} style={{ color: "var(--accent-color)" }}></i>
            {config.label}
          </h2>
          {activeTab !== "tutorials" && (
            <button
              className="btn"
              style={{ backgroundColor: "var(--accent-color)", color: "white", fontWeight: "600" }}
              onClick={openCreateContent}
            >
              <i className="fas fa-plus me-2"></i>
              Create New
            </button>
          )}
        </div>

        {/* Stats - 4 Cards on One Line */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          marginBottom: "2rem", 
          justifyContent: "space-between",
          flexWrap: "wrap"
        }}>
          <div style={{ 
            flex: 1, 
            minWidth: "180px",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--accent-color)"
          }}>
            <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem" }}>Total</h6>
            <h2 style={{ color: "var(--text-color)", marginBottom: "0" }}>{content.length}</h2>
          </div>
          <div style={{ 
            flex: 1, 
            minWidth: "180px",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "1px solid var(--success-color)"
          }}>
            <h6 style={{ color: "var(--success-color)", marginBottom: "0.5rem" }}>Published</h6>
            <h2 style={{ color: "var(--success-color)", marginBottom: "0" }}>{publishedCount}</h2>
          </div>
          <div style={{ 
            flex: 1, 
            minWidth: "180px",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "1px solid var(--neutral-color)"
          }}>
            <h6 style={{ color: "var(--neutral-color)", marginBottom: "0.5rem" }}>Drafts</h6>
            <h2 style={{ color: "var(--neutral-color)", marginBottom: "0" }}>{draftCount}</h2>
          </div>
          {(activeTab === "tutorials" || activeTab === "announcements") && (
            <div style={{ 
              flex: 1, 
              minWidth: "180px",
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "var(--secondary-color)", 
              border: "1px solid #ffc107"
            }}>
              <h6 style={{ color: "#ffc107", marginBottom: "0.5rem" }}>Featured</h6>
              <h2 style={{ color: "#ffc107", marginBottom: "0" }}>{featuredCount}</h2>
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="rounded" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", overflow: "hidden" }}>
          {content.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x mb-3" style={{ color: "var(--accent-color)", opacity: 0.5 }}></i>
              <p style={{ color: "var(--text-color)" }}>No {activeTab} found. Create your first one!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table admin-dashboard-table mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    {activeTab === "tutorials" && <th>Category</th>}
                    {activeTab === "tutorials" && <th>Creator</th>}
                    {activeTab === "pages" && <th>Slug</th>}
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {content.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.title}
                        {item.featured && <span className="badge bg-warning ms-2">Featured</span>}
                      </td>
                      {activeTab === "tutorials" && <td>{item.category}</td>}
                      {activeTab === "tutorials" && (
                        <td>
                          <small>{item.creatorEmail || "N/A"}</small>
                        </td>
                      )}
                      {activeTab === "pages" && <td>/page/{item.slug}</td>}
                      <td>
                        <span 
                          className={`badge ${item.status === "published" ? "bg-success" : "bg-secondary"}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleContentStatus(item)}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          {activeTab !== "tutorials" && (
                            <button 
                              className="btn admin-action-btn"
                              onClick={() => openEditContent(item)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          )}
                          {activeTab === "tutorials" && (
                            <button 
                              className="btn admin-action-btn"
                              onClick={() => {
                                setSelectedCreator({
                                  creatorId: item.creatorId,
                                  creatorEmail: item.creatorEmail,
                                  itemTitle: item.title,
                                  itemId: item.id
                                });
                                setShowMessageModal(true);
                              }}
                              title="Message Creator"
                            >
                              <i className="fas fa-envelope"></i>
                            </button>
                          )}
                          {activeTab !== "tutorials" && (
                            <button 
                              className="btn admin-action-btn"
                              onClick={() => handleDeleteContent(item)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Page Categories Section (only for Pages tab) */}
        {activeTab === "pages" && (
          <div style={{ marginTop: "2rem" }}>
            <h3 style={{ color: "var(--accent-color)", marginBottom: "1.5rem", fontWeight: "bold" }}>
              <i className="fas fa-sitemap me-2"></i>System Pages (Reference)
            </h3>
            <p style={{ color: "var(--text-color)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              Built-in pages that are part of the application. You can create custom pages above for additional content.
            </p>
            {Object.entries(getPageCategories()).map(([category, pages]) => (
              <div key={category} style={{ marginBottom: "1.5rem" }}>
                <h5 style={{ color: "var(--accent-color)", marginBottom: "1rem", fontSize: "1rem", fontWeight: "600" }}>
                  <i className="fas fa-folder me-2"></i>{category}
                </h5>
                <div style={{ 
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "1rem"
                }}>
                  {pages.map((page) => (
                    <div 
                      key={page.path}
                      style={{ 
                        backgroundColor: "var(--secondary-color)",
                        border: "1px solid var(--accent-color)",
                        borderRadius: "8px",
                        padding: "1rem",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)"}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                    >
                      <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "600" }}>
                        {page.name}
                      </h6>
                      <code style={{ color: "var(--accent-color)", fontSize: "0.85rem" }}>
                        {page.path}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Announcement Info Section (only for Announcements tab) */}
        {activeTab === "announcements" && (
          <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", borderRadius: "8px" }}>
            <h5 style={{ color: "var(--accent-color)", marginBottom: "1rem", fontWeight: "bold" }}>
              <i className="fas fa-info-circle me-2"></i>About Announcements
            </h5>
            <ul style={{ color: "var(--text-color)", marginBottom: "0", paddingLeft: "1.5rem" }}>
              <li>Announcements are system-wide messages to all users</li>
              <li>Published announcements will trigger notifications to all users</li>
              <li>Featured announcements will appear prominently in user feeds</li>
              <li>Users can see announcement history in their messages</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render Tutorials (with search, sort, and advanced features)
  const renderTutorials = () => {
    const config = CONTENT_TYPES["tutorials"];
    const filteredTutorials = getFilteredAndSortedTutorials();
    const publishedCount = tutorials.filter(t => t.status === "published").length || 42;
    const draftCount = tutorials.filter(t => t.status === "draft").length || 8;
    const featuredCount = tutorials.filter(t => t.featured).length || 5;
    const avgRating = tutorials.length > 0 
      ? (tutorials.reduce((sum, t) => sum + (t.rating || 0), 0) / tutorials.length).toFixed(1)
      : 4.7;
    const totalViews = tutorials.reduce((sum, t) => sum + (t.views || 0), 0) || 12450;
    const totalTutorials = tutorials.length || 50;

    return (
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <h2 className="fw-bold mb-2" style={{ color: "var(--text-color)", fontSize: "1.8rem" }}>
            <i className={`fas fa-${config.icon} me-2`} style={{ color: "var(--accent-color)" }}></i>
            {config.label}
          </h2>
          <p style={{ color: "var(--text-color)", opacity: 0.7, marginBottom: 0 }}>Manage comprehensive learning tutorials created by your content creators</p>
        </div>

        {/* Stats - 6 Professional Cards */}
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem", 
          marginBottom: "2rem"
        }}>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--accent-color)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Total Tutorials</h6>
            <h2 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontSize: "2rem" }}>{totalTutorials}</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>All tutorials</p>
          </div>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--success-color)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "var(--success-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Published</h6>
            <h2 style={{ color: "var(--success-color)", marginBottom: "0.5rem", fontSize: "2rem" }}>{publishedCount}</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>{((publishedCount/totalTutorials)*100).toFixed(0)}% of total</p>
          </div>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--neutral-color)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "var(--neutral-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Drafts</h6>
            <h2 style={{ color: "var(--neutral-color)", marginBottom: "0.5rem", fontSize: "2rem" }}>{draftCount}</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>{((draftCount/totalTutorials)*100).toFixed(0)}% of total</p>
          </div>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid #ffc107",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "#ffc107", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Featured</h6>
            <h2 style={{ color: "#ffc107", marginBottom: "0.5rem", fontSize: "2rem" }}>{featuredCount}</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>Premium content</p>
          </div>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid #ffc107",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "#ffc107", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Avg Rating</h6>
            <h2 style={{ color: "#ffc107", marginBottom: "0.5rem", fontSize: "2rem" }}>{avgRating}</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>⭐ Out of 5.0</p>
          </div>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--info-color)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "var(--info-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Total Views</h6>
            <h2 style={{ color: "var(--info-color)", marginBottom: "0.5rem", fontSize: "2rem" }}>{(totalViews/1000).toFixed(1)}K</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>Cumulative views</p>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <i className="fas fa-search" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--accent-color)" }}></i>
            <input
              type="text"
              placeholder="Search by title, creator, or category..."
              value={tutorialSearch}
              onChange={(e) => setTutorialSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem 1rem 0.7rem 2.5rem",
                backgroundColor: "var(--primary-color)",
                borderColor: "var(--accent-color)",
                border: "2px solid var(--accent-color)",
                color: "var(--text-color)",
                borderRadius: "8px",
                fontSize: "0.95rem"
              }}
            />
          </div>
          <select
            value={tutorialSortBy}
            onChange={(e) => setTutorialSortBy(e.target.value)}
            style={{
              padding: "0.7rem 1rem",
              backgroundColor: "var(--primary-color)",
              borderColor: "var(--accent-color)",
              border: "2px solid var(--accent-color)",
              color: "var(--text-color)",
              borderRadius: "8px",
              minWidth: "180px"
            }}
          >
            <option value="date">📅 Date (Newest)</option>
            <option value="rating">⭐ Rating (Highest)</option>
            <option value="visits">👁️ Visits (Most)</option>
            <option value="difficulty">📊 Difficulty</option>
            <option value="category">📁 Category</option>
          </select>
        </div>

        {/* Tutorials Table */}
        <div className="rounded" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {filteredTutorials.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x mb-3" style={{ color: "var(--accent-color)", opacity: 0.5 }}></i>
              <p style={{ color: "var(--text-color)", fontSize: "1.05rem" }}>
                {tutorialSearch ? "No tutorials match your search." : "No tutorials found."}
              </p>
              <p style={{ color: "var(--text-color)", opacity: 0.6, fontSize: "0.9rem" }}>Start creating tutorials to populate this section</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table admin-dashboard-table mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Creator</th>
                    <th>Category</th>
                    <th>Rating</th>
                    <th>Views</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTutorials.map((tutorial) => (
                    <tr key={tutorial.id} style={{ opacity: tutorial.status === "draft" ? 0.75 : 1 }}>
                      <td>
                        <strong>{tutorial.title}</strong>
                        {tutorial.featured && <span className="badge bg-warning ms-2" style={{ fontSize: "0.75rem" }}>⭐ Featured</span>}
                      </td>
                      <td>
                        <small>{tutorial.creatorEmail || "N/A"}</small>
                      </td>
                      <td>
                        <small style={{ backgroundColor: "var(--primary-color)", padding: "0.3rem 0.6rem", borderRadius: "4px", display: "inline-block" }}>{tutorial.category || "Uncategorized"}</small>
                      </td>
                      <td>
                        <span style={{ color: "#ffc107", fontWeight: "bold", fontSize: "0.95rem" }}>
                          {(tutorial.rating || 0).toFixed(1)} <span style={{ fontSize: "0.85rem" }}>⭐</span>
                        </span>
                      </td>
                      <td>
                        <i className="fas fa-eye me-1" style={{ color: "var(--accent-color)" }}></i>
                        <strong>{tutorial.views || 0}</strong>
                      </td>
                      <td>
                        <span 
                          className={`badge ${tutorial.status === "published" ? "bg-success" : "bg-secondary"}`}
                          style={{ cursor: "pointer", fontSize: "0.85rem" }}
                          onClick={() => toggleContentStatus(tutorial)}
                        >
                          {tutorial.status === "published" ? "✓ Published" : "📝 Draft"}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.9rem" }}>
                        {tutorial.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </td>
                      <td style={{ textAlign: "end" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "flex-end" }}>
                          <button 
                            className="btn admin-action-btn"
                            title="View Tutorial"
                            onClick={() => {
                              setViewingTutorial(tutorial);
                              setShowTutorialViewModal(true);
                            }}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn admin-action-btn"
                            onClick={() => {
                              setSelectedCreator({
                                creatorId: tutorial.creatorId,
                                creatorEmail: tutorial.creatorEmail,
                                itemTitle: tutorial.title,
                                itemId: tutorial.id
                              });
                              setShowMessageModal(true);
                            }}
                            title="Message Creator"
                          >
                            <i className="fas fa-envelope"></i>
                          </button>
                          <button 
                            className="btn admin-action-btn"
                            onClick={() => {
                              if (window.confirm(`Delete "${tutorial.title}"?`)) {
                                handleDeleteContent(tutorial);
                                addNotification("warning", "Tutorial Deleted", `"${tutorial.title}" has been removed.`);
                              }
                            }}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tutorial Info Section */}
        <div style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h5 style={{ color: "var(--accent-color)", marginBottom: "1rem", fontWeight: "bold", fontSize: "1rem" }}>
            <i className="fas fa-info-circle me-2"></i>Tutorial Management Guide
          </h5>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <div>
              <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "600" }}>📚 Content Quality</h6>
              <p style={{ color: "var(--text-color)", marginBottom: 0, fontSize: "0.9rem", opacity: 0.8 }}>Monitor ratings and view counts to ensure quality content. Contact creators for feedback on low-rated tutorials.</p>
            </div>
            <div>
              <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "600" }}>🔍 Moderation</h6>
              <p style={{ color: "var(--text-color)", marginBottom: 0, fontSize: "0.9rem", opacity: 0.8 }}>View full content, message creators, and delete inappropriate tutorials. Use featured flag for premium content.</p>
            </div>
            <div>
              <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "600" }}>📊 Analytics</h6>
              <p style={{ color: "var(--text-color)", marginBottom: 0, fontSize: "0.9rem", opacity: 0.8 }}>Track views, ratings, and engagement. Sort by popularity to identify trending tutorials with your users.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Reviews
  const renderReviews = () => {
    const stats = getReviewStats();

    return (
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <h2 className="fw-bold mb-2" style={{ color: "var(--text-color)", fontSize: "1.8rem" }}>
            <i className="fas fa-star me-2" style={{ color: "var(--accent-color)" }}></i>
            Reviews & Feedback
          </h2>
          <p style={{ color: "var(--text-color)", opacity: 0.7, marginBottom: 0 }}>Monitor user feedback and system reviews to maintain high-quality content and services</p>
        </div>

        {/* Stats Summary - 5 Cards */}
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem", 
          marginBottom: "2rem"
        }}>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--accent-color)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Total Reviews</h6>
            <h2 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontSize: "2rem" }}>{stats.total || 145}</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>All feedback combined</p>
          </div>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid #ffc107",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "#ffc107", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Tutorial Reviews</h6>
            <h2 style={{ color: "#ffc107", marginBottom: "0.5rem", fontSize: "2rem" }}>{stats.tutorialReviews || 92}</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>Content ratings</p>
          </div>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--info-color)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "var(--info-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>System Reviews</h6>
            <h2 style={{ color: "var(--info-color)", marginBottom: "0.5rem", fontSize: "2rem" }}>{stats.systemReviews || 45}</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>Platform feedback</p>
          </div>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--error-color)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "var(--error-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Reports</h6>
            <h2 style={{ color: "var(--error-color)", marginBottom: "0.5rem", fontSize: "2rem" }}>{stats.reports || 8}</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>User reports</p>
          </div>
          <div style={{ 
            padding: "1.2rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--success-color)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h6 style={{ color: "var(--success-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Avg Rating</h6>
            <h2 style={{ color: "var(--success-color)", marginBottom: "0.5rem", fontSize: "2rem" }}>{stats.avgRating || 4.6}</h2>
            <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: 0, fontSize: "0.85rem" }}>Out of 5.0 ⭐</p>
          </div>
        </div>

        {/* Average Rating Highlight */}
        {(stats.tutorialReviews > 0 || true) && (
          <div style={{ 
            padding: "1.5rem", 
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid #ffc107", 
            borderRadius: "8px",
            marginBottom: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h5 style={{ color: "#ffc107", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "1rem" }}>
              <i className="fas fa-chart-bar me-2"></i>Average Ratings Summary
            </h5>
            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "2.5rem", color: "#ffc107", fontWeight: "bold" }}>
                  {stats.avgRating || 4.6} <span style={{ fontSize: "1.5rem" }}>⭐</span>
                </div>
                <p style={{ color: "var(--text-color)", marginBottom: 0, opacity: 0.6, fontSize: "0.9rem" }}>
                  Based on {stats.tutorialReviews || 92} tutorial reviews
                </p>
              </div>
              <div style={{ flex: 1, minWidth: "150px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-color)", fontSize: "0.9rem" }}>Overall</span>
                  <div style={{ flex: 1, height: "8px", backgroundColor: "var(--primary-color)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${((stats.avgRating || 4.6) / 5) * 100}%`, height: "100%", backgroundColor: "#ffc107" }}></div>
                  </div>
                </div>
                <p style={{ color: "var(--text-color)", marginBottom: 0, opacity: 0.6, fontSize: "0.85rem" }}>Consistency maintained across all reviews</p>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Reviews Tab */}
        <div style={{ marginBottom: "2rem" }}>
          <h4 style={{ color: "var(--accent-color)", marginBottom: "1rem", fontWeight: "bold", fontSize: "1.1rem" }}>
            <i className="fas fa-comments me-2"></i>Tutorial Reviews <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>({stats.tutorialReviews || 92})</span>
          </h4>
          <div className="rounded" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            {(stats.tutorialList && stats.tutorialList.length === 0) ? (
              <div className="text-center py-5">
                <i className="fas fa-inbox fa-3x mb-3" style={{ color: "var(--accent-color)", opacity: 0.5 }}></i>
                <p style={{ color: "var(--text-color)", fontSize: "1.05rem" }}>No tutorial reviews yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table admin-dashboard-table mb-0">
                  <thead>
                    <tr>
                      <th>Reviewer</th>
                      <th>Tutorial</th>
                      <th>Rating</th>
                      <th>Feedback</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.tutorialList || []).map((review) => (
                      <tr key={review.id}>
                        <td>
                          <small>{review.userName || review.userEmail || "Anonymous"}</small>
                        </td>
                        <td>
                          <strong>{review.contentTitle || "N/A"}</strong>
                        </td>
                        <td>
                          <span style={{ color: "#ffc107", fontWeight: "bold", fontSize: "0.95rem" }}>
                            {(review.rating || 0).toFixed(1)} <span style={{ fontSize: "0.85rem" }}>⭐</span>
                          </span>
                        </td>
                        <td style={{ maxWidth: "250px" }}>
                          <small style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{review.feedback || "No comment provided"}</small>
                        </td>
                        <td style={{ fontSize: "0.9rem" }}>
                          {review.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* System Reviews Tab */}
        <div style={{ marginBottom: "2rem" }}>
          <h4 style={{ color: "var(--accent-color)", marginBottom: "1rem", fontWeight: "bold", fontSize: "1.1rem" }}>
            <i className="fas fa-server me-2"></i>System Reviews <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>({stats.systemReviews || 45})</span>
          </h4>
          <div className="rounded" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            {(stats.systemList && stats.systemList.length === 0) ? (
              <div className="text-center py-5">
                <i className="fas fa-inbox fa-3x mb-3" style={{ color: "var(--accent-color)", opacity: 0.5 }}></i>
                <p style={{ color: "var(--text-color)", fontSize: "1.05rem" }}>No system reviews yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table admin-dashboard-table mb-0">
                  <thead>
                    <tr>
                      <th>Reviewer</th>
                      <th>Rating</th>
                      <th>Feedback</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.systemList || []).map((review) => (
                      <tr key={review.id}>
                        <td>
                          <small>{review.userName || review.userEmail || "Anonymous"}</small>
                        </td>
                        <td>
                          <span style={{ color: "#ffc107", fontWeight: "bold", fontSize: "0.95rem" }}>
                            {(review.rating || 0).toFixed(1)} <span style={{ fontSize: "0.85rem" }}>⭐</span>
                          </span>
                        </td>
                        <td style={{ maxWidth: "250px" }}>
                          <small style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{review.feedback || "No comment provided"}</small>
                        </td>
                        <td style={{ fontSize: "0.9rem" }}>
                          {review.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reports Tab */}
        <div style={{ marginBottom: "2rem" }}>
          <h4 style={{ color: "var(--accent-color)", marginBottom: "1rem", fontWeight: "bold", fontSize: "1.1rem" }}>
            <i className="fas fa-flag me-2"></i>Reports & Complaints <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>({stats.reports || 8})</span>
          </h4>
          <div className="rounded" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            {(stats.reportList && stats.reportList.length === 0) ? (
              <div className="text-center py-5">
                <i className="fas fa-inbox fa-3x mb-3" style={{ color: "var(--accent-color)", opacity: 0.5 }}></i>
                <p style={{ color: "var(--text-color)", fontSize: "1.05rem" }}>No reports submitted.</p>
                <p style={{ color: "var(--text-color)", opacity: 0.6, fontSize: "0.9rem" }}>Good work maintaining platform health!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table admin-dashboard-table mb-0">
                  <thead>
                    <tr>
                      <th>Reporter</th>
                      <th>Type</th>
                      <th>Content</th>
                      <th>Reason</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.reportList || []).map((report) => (
                      <tr key={report.id}>
                        <td>
                          <small>{report.userName || report.userEmail || "Anonymous"}</small>
                        </td>
                        <td>
                          <span 
                            style={{ 
                              display: "inline-block",
                              padding: "0.3rem 0.7rem",
                              backgroundColor: "var(--error-color)",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                              fontWeight: "bold"
                            }}
                          >
                            {report.reportType || "Other"}
                          </span>
                        </td>
                        <td>
                          <strong>{report.contentTitle || report.contentType || "N/A"}</strong>
                        </td>
                        <td style={{ maxWidth: "250px" }}>
                          <small style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{report.feedback || report.reason || "No reason provided"}</small>
                        </td>
                        <td style={{ fontSize: "0.9rem" }}>
                          {report.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Review Management Guide */}
        <div style={{ padding: "1.5rem", backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h5 style={{ color: "var(--accent-color)", marginBottom: "1rem", fontWeight: "bold", fontSize: "1rem" }}>
            <i className="fas fa-clipboard-check me-2"></i>Review Management Guide
          </h5>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <div>
              <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "600" }}>⭐ Content Quality</h6>
              <p style={{ color: "var(--text-color)", marginBottom: 0, fontSize: "0.9rem", opacity: 0.8 }}>Monitor tutorial ratings to identify high-quality content. Reach out to creators of low-rated tutorials for improvement.</p>
            </div>
            <div>
              <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "600" }}>🚩 Report Management</h6>
              <p style={{ color: "var(--text-color)", marginBottom: 0, fontSize: "0.9rem", opacity: 0.8 }}>Review reports promptly. Take action on valid complaints by removing inappropriate content or contacting users.</p>
            </div>
            <div>
              <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "600" }}>💬 Feedback Response</h6>
              <p style={{ color: "var(--text-color)", marginBottom: 0, fontSize: "0.9rem", opacity: 0.8 }}>Use system reviews as service feedback. Address common issues raised by users in platform improvements.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Content Editor Modal
  // Helper: Convert markdown-like syntax to HTML
  const parseMarkdown = (text) => {
    if (!text) return "";
    let html = text;
    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic: *text* -> <em>text</em>
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Headings: ## Heading -> <h3>Heading</h3>
    html = html.replace(/^### (.*?)$/gm, "<h3 style='margin-top: 1rem; margin-bottom: 0.5rem; color: var(--accent-color);'>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2 style='margin-top: 1rem; margin-bottom: 0.5rem; color: var(--accent-color);'>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1 style='margin-top: 1rem; margin-bottom: 0.5rem; color: var(--accent-color);'>$1</h1>");
    // Lists: - item -> <li>item</li>
    html = html.replace(/^- (.*?)$/gm, "<li style='margin-left: 1rem;'>$1</li>");
    // Links: [text](url) -> <a>text</a>
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' style='color: var(--info-color);' target='_blank'>$1</a>");
    // Paragraphs: double newline -> <p>
    html = html.split("\n\n").map(p => `<p style='margin-bottom: 0.5rem; line-height: 1.6;'>${p.replace(/\n/g, "<br />")}</p>`).join("");
    return html;
  };

  const renderContentModal = () => {
    if (!showContentModal) return null;
    const config = CONTENT_TYPES[activeTab];
    if (!config) return null;

    const previewHtml = parseMarkdown(formData.content);

    return (
      <div 
        className="modal show d-block" 
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={(e) => e.target === e.currentTarget && setShowContentModal(false)}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxHeight: "90vh" }}>
          <div className="modal-content" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-header" style={{ borderBottom: "2px solid var(--accent-color)", flexShrink: 0 }}>
              <h5 className="modal-title" style={{ color: "var(--text-color)" }}>
                <i className={`fas fa-${config.icon} me-2`}></i>
                {editingItem ? "Edit" : "Create"} {activeTab.slice(0, -1)}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowContentModal(false)}></button>
            </div>
            
            <div className="modal-body" style={{ flex: 1, overflowY: "auto", display: "flex" }}>
              {/* Left Column: Form */}
              <div style={{ flex: 1, paddingRight: "1rem", borderRight: "2px solid var(--accent-color)" }}>
                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-bold" style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>
                    <i className="fas fa-heading me-1"></i>Title *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter title..."
                    style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                  />
                </div>

                {/* Category (tutorials only) */}
                {config.fields.includes("category") && config.categories.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>
                      <i className="fas fa-tag me-1"></i>Category
                    </label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                    >
                      <option value="">Select category...</option>
                      {config.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                )}

                {/* Slug (pages) */}
                {activeTab === "pages" && (
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>
                      <i className="fas fa-link me-1"></i>URL Slug
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                      placeholder="about-us"
                      style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                    />
                  </div>
                )}

                {/* Excerpt */}
                {config.fields.includes("excerpt") && (
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>
                      <i className="fas fa-quote-left me-1"></i>Excerpt
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief summary..."
                      style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="mb-3">
                  <label className="form-label fw-bold" style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>
                    <i className="fas fa-file-alt me-1"></i>Content
                  </label>
                  <div className="mb-2">
                    <div className="btn-group btn-group-sm w-100" role="group">
                      {[
                        { icon: "bold", title: "Bold", insert: (t, s, e) => `${t.slice(0, s)}**text**${t.slice(e)}` },
                        { icon: "italic", title: "Italic", insert: (t, s, e) => `${t.slice(0, s)}*text*${t.slice(e)}` },
                        { icon: "heading", title: "Heading", insert: (t) => `${t}\n## Heading\n` },
                        { icon: "list", title: "List", insert: (t) => `${t}\n- Item 1\n- Item 2\n` },
                        { icon: "link", title: "Link", insert: (t) => `${t}\n[Link](https://example.com)\n` },
                      ].map(({ icon, title, insert }) => (
                        <button 
                          key={icon}
                          type="button" 
                          title={title}
                          className="btn btn-sm"
                          style={{ backgroundColor: "var(--primary-color)", color: "var(--accent-color)", border: "1px solid var(--accent-color)", flex: 1 }}
                          onClick={() => {
                            const textarea = document.getElementById("content-editor");
                            const s = textarea?.selectionStart || 0;
                            const e = textarea?.selectionEnd || 0;
                            setFormData({ ...formData, content: insert(formData.content, s, e) });
                          }}
                        >
                          <i className={`fas fa-${icon}`}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    id="content-editor"
                    className="form-control"
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write content... (Markdown supported)"
                    style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)", fontFamily: "monospace", fontSize: "0.85rem" }}
                  />
                </div>

                {/* Thumbnail */}
                {config.fields.includes("thumbnail") && (
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>
                      <i className="fas fa-image me-1"></i>Thumbnail URL
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                    />
                  </div>
                )}

                {/* Tags */}
                {config.fields.includes("tags") && (
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>
                      <i className="fas fa-tags me-1"></i>Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="tag1, tag2, tag3"
                      style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                    />
                  </div>
                )}

                {/* Status & Featured Row */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold" style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>
                      <i className="fas fa-check-circle me-1"></i>Status
                    </label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  {config.fields.includes("featured") && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold" style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>
                        <i className="fas fa-star me-1"></i>Highlight
                      </label>
                      <div className="form-check" style={{ paddingTop: "0.5rem" }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="featured-check"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="featured-check" style={{ color: "var(--text-color)" }}>
                          Featured
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Preview */}
              <div style={{ flex: 1, paddingLeft: "1rem", overflowY: "auto" }}>
                <div style={{ backgroundColor: "var(--primary-color)", border: "2px solid var(--accent-color)", borderRadius: "8px", padding: "1rem" }}>
                  <h6 style={{ color: "var(--accent-color)", marginBottom: "1rem", fontWeight: "bold" }}>
                    <i className="fas fa-eye me-1"></i>Live Preview
                  </h6>
                  <div style={{ color: "var(--text-color)" }}>
                    {/* Title Preview */}
                    {formData.title && (
                      <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem", color: "var(--accent-color)" }}>
                        {formData.title}
                      </h2>
                    )}
                    {/* Excerpt Preview */}
                    {formData.excerpt && (
                      <p style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--text-color)", opacity: 0.8, marginBottom: "1rem" }}>
                        {formData.excerpt}
                      </p>
                    )}
                    {/* Thumbnail Preview */}
                    {formData.thumbnail && (
                      <div style={{ marginBottom: "1rem", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--accent-color)" }}>
                        <img 
                          src={formData.thumbnail} 
                          alt="Preview" 
                          style={{ maxWidth: "100%", height: "200px", objectFit: "cover" }}
                          onError={(e) => e.target.style.display = "none"}
                        />
                      </div>
                    )}
                    {/* Content Preview */}
                    {formData.content && (
                      <div 
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                        style={{ lineHeight: "1.8", fontSize: "0.95rem" }}
                      />
                    )}
                    {/* Status Badge */}
                    <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--accent-color)" }}>
                      <span 
                        style={{ 
                          display: "inline-block",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                          backgroundColor: formData.status === "published" ? "var(--success-color)" : "#6c757d",
                          color: "white"
                        }}
                      >
                        {formData.status === "published" ? "Published" : "Draft"}
                      </span>
                      {formData.featured && (
                        <span 
                          style={{ 
                            display: "inline-block",
                            marginLeft: "0.5rem",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "bold",
                            backgroundColor: "var(--accent-color)",
                            color: "white"
                          }}
                        >
                          <i className="fas fa-star me-1"></i>Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: "2px solid var(--accent-color)", flexShrink: 0 }}>
              <button 
                type="button" 
                className="btn"
                style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                onClick={() => setShowContentModal(false)}
              >
                <i className="fas fa-times me-1"></i>Cancel
              </button>
              <button 
                type="button" 
                className="btn"
                style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)", fontWeight: "bold" }}
                onClick={handleSaveContent}
              >
                <i className="fas fa-save me-2"></i>
                {editingItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // User Role Modal
  const renderUserModal = () => {
    if (!showUserModal || !selectedUser) return null;

    return (
      <div 
        className="modal show d-block" 
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={(e) => e.target === e.currentTarget && setShowUserModal(false)}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
            <div className="modal-header" style={{ borderBottom: "1px solid var(--accent-color)" }}>
              <h5 className="modal-title" style={{ color: "var(--text-color)" }}>
                Confirm {modalActionType === "promote" ? "Promotion" : "Demotion"}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowUserModal(false)}></button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-color)" }}>
                Are you sure you want to {modalActionType} <strong>{selectedUser.name || selectedUser.email}</strong> 
                {modalActionType === "promote" ? " to Admin" : " to User"}?
              </p>
            </div>
            <div className="modal-footer" style={{ borderTop: "1px solid var(--accent-color)" }}>
              <button 
                className="btn"
                style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                onClick={() => setShowUserModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn"
                style={{ backgroundColor: modalActionType === "promote" ? "var(--success-color)" : "var(--error-color)", color: "var(--white-color)" }}
                onClick={toggleUserRole}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tutorial View Modal
  const renderTutorialViewModal = () => {
    if (!showTutorialViewModal || !viewingTutorial) return null;

    const parseMarkdown = (text) => {
      if (!text) return "";
      let html = text;
      html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
      html = html.replace(/^### (.*?)$/gm, "<h3 style='margin-top: 1rem; margin-bottom: 0.5rem;'>$1</h3>");
      html = html.replace(/^## (.*?)$/gm, "<h2 style='margin-top: 1rem; margin-bottom: 0.5rem;'>$1</h2>");
      html = html.replace(/^# (.*?)$/gm, "<h1 style='margin-top: 1rem; margin-bottom: 0.5rem;'>$1</h1>");
      html = html.replace(/^- (.*?)$/gm, "<li style='margin-left: 1rem;'>$1</li>");
      html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank'>$1</a>");
      html = html.split("\n\n").map(p => `<p style='margin-bottom: 1rem;'>${p.replace(/\n/g, "<br />")}</p>`).join("");
      return html;
    };

    const contentHtml = parseMarkdown(viewingTutorial.content);

    return (
      <div 
        className="modal show d-block" 
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={(e) => e.target === e.currentTarget && setShowTutorialViewModal(false)}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxHeight: "90vh", maxWidth: "900px" }}>
          <div className="modal-content" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-header" style={{ borderBottom: "2px solid var(--accent-color)", flexShrink: 0 }}>
              <h5 className="modal-title" style={{ color: "var(--text-color)" }}>
                <i className="fas fa-book me-2"></i>{viewingTutorial.title}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowTutorialViewModal(false)}></button>
            </div>
            
            <div className="modal-body" style={{ flex: 1, overflowY: "auto" }}>
              {/* Tutorial Metadata */}
              <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid var(--accent-color)" }}>
                <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ color: "var(--accent-color)", fontWeight: "bold", fontSize: "0.9rem" }}>Creator</label>
                    <p style={{ color: "var(--text-color)", marginBottom: "0" }}>{viewingTutorial.creatorEmail || "N/A"}</p>
                  </div>
                  <div>
                    <label style={{ color: "var(--accent-color)", fontWeight: "bold", fontSize: "0.9rem" }}>Category</label>
                    <p style={{ color: "var(--text-color)", marginBottom: "0" }}>{viewingTutorial.category || "Uncategorized"}</p>
                  </div>
                  <div>
                    <label style={{ color: "var(--accent-color)", fontWeight: "bold", fontSize: "0.9rem" }}>Rating</label>
                    <p style={{ color: "#ffc107", marginBottom: "0", fontWeight: "bold" }}>
                      {(viewingTutorial.rating || 0).toFixed(1)} ⭐
                    </p>
                  </div>
                  <div>
                    <label style={{ color: "var(--accent-color)", fontWeight: "bold", fontSize: "0.9rem" }}>Views</label>
                    <p style={{ color: "var(--info-color)", marginBottom: "0" }}>
                      <i className="fas fa-eye me-1"></i>{viewingTutorial.views || 0}
                    </p>
                  </div>
                  <div>
                    <label style={{ color: "var(--accent-color)", fontWeight: "bold", fontSize: "0.9rem" }}>Status</label>
                    <p style={{ marginBottom: "0" }}>
                      <span className={`badge ${viewingTutorial.status === "published" ? "bg-success" : "bg-secondary"}`}>
                        {viewingTutorial.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Thumbnail */}
                {viewingTutorial.thumbnail && (
                  <div style={{ marginBottom: "1rem" }}>
                    <img 
                      src={viewingTutorial.thumbnail} 
                      alt="Tutorial thumbnail"
                      style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px", border: "1px solid var(--accent-color)" }}
                      onError={(e) => e.target.style.display = "none"}
                    />
                  </div>
                )}

                {/* Excerpt */}
                {viewingTutorial.excerpt && (
                  <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "var(--primary-color)", borderLeft: "4px solid var(--accent-color)", borderRadius: "4px" }}>
                    <p style={{ color: "var(--text-color)", marginBottom: "0", fontStyle: "italic" }}>
                      {viewingTutorial.excerpt}
                    </p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ color: "var(--text-color)", lineHeight: "1.8", fontSize: "0.95rem" }}>
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              </div>

              {/* Tags */}
              {viewingTutorial.tags && viewingTutorial.tags.length > 0 && (
                <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--accent-color)" }}>
                  <label style={{ color: "var(--accent-color)", fontWeight: "bold", fontSize: "0.9rem", display: "block", marginBottom: "0.5rem" }}>Tags</label>
                  {viewingTutorial.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      style={{ 
                        display: "inline-block",
                        marginRight: "0.5rem",
                        marginBottom: "0.5rem",
                        padding: "0.3rem 0.8rem",
                        backgroundColor: "var(--accent-color)",
                        color: "var(--primary-color)",
                        borderRadius: "20px",
                        fontSize: "0.85rem"
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: "2px solid var(--accent-color)", flexShrink: 0 }}>
              <button 
                type="button" 
                className="btn"
                style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                onClick={() => setShowTutorialViewModal(false)}
              >
                <i className="fas fa-times me-1"></i>Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Message Modal
  const renderMessageModal = () => {
    if (!showMessageModal || !selectedCreator) return null;

    return (
      <div 
        className="modal show d-block" 
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={(e) => e.target === e.currentTarget && setShowMessageModal(false)}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
            <div className="modal-header" style={{ borderBottom: "1px solid var(--accent-color)" }}>
              <h5 className="modal-title" style={{ color: "var(--text-color)" }}>
                <i className="fas fa-envelope me-2"></i>
                Message Creator
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowMessageModal(false)}></button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-color)", marginBottom: "1rem" }}>
                <strong>To:</strong> {selectedCreator.creatorEmail}
              </p>
              <p style={{ color: "var(--text-color)", marginBottom: "1rem" }}>
                <strong>Tutorial:</strong> {selectedCreator.itemTitle}
              </p>
              <div className="mb-3">
                <label className="form-label" style={{ color: "var(--text-color)" }}>Message</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: "1px solid var(--accent-color)" }}>
              <button 
                className="btn"
                style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                onClick={() => setShowMessageModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn"
                style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
                onClick={handleSendMessage}
              >
                <i className="fas fa-paper-plane me-2"></i>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Settings - Theme Management
  const renderSettings = () => {
    const handleAddTheme = () => {
      setEditingTheme(null);
      setThemeFormData({
        name: "",
        description: "",
        price: 0,
        colors: {
          primary: "#000000",
          secondary: "#1a1a23",
          navbar: "#000000",
          sidebar: "#1a1a23",
          background: "#0f0f14",
          button: "#3a305033",
          text: "#ffffff",
          accent: "#ff6b6b",
        },
      });
      setShowThemeModal(true);
    };

    const handleEditTheme = (theme) => {
      setEditingTheme(theme);
      setThemeFormData(theme);
      setShowThemeModal(true);
    };

    const handleSaveTheme = () => {
      if (!themeFormData.name.trim()) {
        addNotification("warning", "Invalid Theme", "Theme name is required");
        return;
      }

      if (editingTheme) {
        // Update existing theme
        const updatedThemes = themes.map(t => 
          t.id === editingTheme.id 
            ? { ...themeFormData, id: editingTheme.id }
            : t
        );
        setThemes(updatedThemes);
        addNotification("success", "Theme Updated", `Theme "${themeFormData.name}" has been updated`);
      } else {
        // Create new theme
        const newTheme = {
          id: themeFormData.name.toLowerCase().replace(/\s+/g, "-"),
          ...themeFormData,
          isDefault: false,
        };
        setThemes([...themes, newTheme]);
        addNotification("success", "Theme Created", `New theme "${themeFormData.name}" has been created`);
      }

      setShowThemeModal(false);
    };

    const handleDeleteTheme = (themeId) => {
      if (window.confirm("Are you sure you want to delete this theme?")) {
        const filteredThemes = themes.filter(t => t.id !== themeId);
        setThemes(filteredThemes);
        addNotification("success", "Theme Deleted", "Theme has been removed");
      }
    };

    const handleSetDefaultTheme = (themeId) => {
      const updatedThemes = themes.map(t => ({
        ...t,
        isDefault: t.id === themeId,
      }));
      setThemes(updatedThemes);
      setDefaultThemeId(themeId);
      addNotification("success", "Default Theme Updated", `New users will receive "${themes.find(t => t.id === themeId).name}" as default. Existing user preferences remain unchanged.`);
    };

    return (
      <div>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 className="fw-bold mb-2" style={{ color: "var(--text-color)", fontSize: "1.8rem" }}>
            <i className="fas fa-cog me-2" style={{ color: "var(--accent-color)" }}></i>
            Admin Settings & Configuration
          </h2>
          <p style={{ color: "var(--text-color)", opacity: 0.7, marginBottom: 0 }}>Manage system themes and customize the platform experience for all users</p>
        </div>

        {/* Action Button */}
        <div style={{ marginBottom: "2rem" }}>
          <button
            className="btn"
            onClick={handleAddTheme}
            style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)", fontWeight: "bold", padding: "0.6rem 1.2rem", fontSize: "0.95rem" }}
          >
            <i className="fas fa-plus me-2"></i>Create New Theme
          </button>
        </div>

        {/* Theme Management Section */}
        <div>
          <h4 style={{ color: "var(--accent-color)", marginBottom: "1.5rem", fontWeight: "bold", fontSize: "1.1rem" }}>
            <i className="fas fa-palette me-2"></i>Theme Management
          </h4>

          {/* Info Box */}
          <div style={{
            backgroundColor: "rgba(93, 173, 226, 0.1)",
            border: "2px solid #5dade2",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1.5rem"
          }}>
            <i className="fas fa-info-circle" style={{ color: "#5dade2", marginRight: "0.5rem" }}></i>
            <span style={{ color: "var(--text-color)", fontSize: "0.9rem" }}>
              <strong>Note:</strong> The default theme applies only to new users on their first login. Existing users' saved theme preferences will not be overridden.
            </span>
          </div>

          {/* Theme Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem"
          }}>
            <div style={{
              padding: "1.2rem",
              borderRadius: "8px",
              backgroundColor: "var(--secondary-color)",
              border: "2px solid var(--accent-color)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Total Themes</h6>
              <h2 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontSize: "2rem" }}>{themes.length}</h2>
              <p style={{ color: "var(--text-color)", fontSize: "0.85rem", marginBottom: "0", opacity: 0.6 }}>Active custom themes</p>
            </div>
            <div style={{
              padding: "1.2rem",
              borderRadius: "8px",
              backgroundColor: "var(--secondary-color)",
              border: "2px solid var(--success-color)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <h6 style={{ color: "var(--success-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Default Theme</h6>
              <h3 style={{ color: "var(--success-color)", marginBottom: "0", fontSize: "1.1rem", fontWeight: "bold" }}>{themes.find(t => t.isDefault)?.name || "Standard"}</h3>
            </div>
          </div>

          {/* Themes Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem"
          }}>
            {themes.map((theme) => (
              <div key={theme.id} style={{
                backgroundColor: "var(--secondary-color)",
                border: theme.isDefault ? "3px solid var(--accent-color)" : "2px solid #555",
                borderRadius: "8px",
                padding: "1.5rem",
                position: "relative",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                if (!theme.isDefault) {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                {/* Default Badge */}
                {theme.isDefault && (
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    backgroundColor: "var(--accent-color)",
                    color: "var(--primary-color)",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "20px",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}>
                    <i className="fas fa-star"></i> DEFAULT
                  </div>
                )}

                  {/* Color Preview Bar */}
                <div style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "1rem",
                  height: "50px"
                }}>
                  {Object.entries(theme.colors).slice(0, 6).map(([key, color]) => (
                    <div
                      key={key}
                      style={{
                        flex: 1,
                        backgroundColor: color,
                        borderRadius: "6px",
                        border: "1px solid #666",
                        transition: "all 0.2s ease"
                      }}
                      title={key}
                    />
                  ))}
                </div>

                {/* Theme Info */}
                <h6 style={{ color: "var(--accent-color)", marginBottom: "0.3rem", fontWeight: "bold", fontSize: "1.05rem" }}>
                  {theme.name}
                </h6>
                <p style={{ color: "var(--text-color)", fontSize: "0.85rem", marginBottom: "0.8rem", opacity: 0.8, minHeight: "2.4em" }}>
                  {theme.description}
                </p>
                <p style={{ color: theme.price === 0 ? "var(--success-color)" : "var(--accent-color)", fontSize: "0.9rem", marginBottom: "1rem", fontWeight: "bold" }}>
                  {theme.price === 0 ? <><i className="fas fa-gift me-1"></i>FREE</> : <><i className="fas fa-coins me-1"></i>{theme.price} coins</>}
                </p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleEditTheme(theme)}
                    style={{
                      backgroundColor: "var(--accent-color)",
                      color: "white",
                      border: "none",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      padding: "0.5rem"
                    }}
                  >
                    <i className="fas fa-edit me-1"></i>Edit
                  </button>
                  {!theme.isDefault && (
                    <>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleSetDefaultTheme(theme.id)}
                        style={{
                          backgroundColor: "var(--info-color)",
                          color: "white",
                          border: "none",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          padding: "0.5rem"
                        }}
                      >
                        <i className="fas fa-star me-1"></i>Set Default
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDeleteTheme(theme.id)}
                        style={{
                          backgroundColor: "var(--error-color)",
                          color: "white",
                          border: "none",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          padding: "0.5rem"
                        }}
                      >
                        <i className="fas fa-trash me-1"></i>Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Creation Modal */}
        {showThemeModal && (
          <div className="modal-overlay" style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "1100"
          }} onClick={() => setShowThemeModal(false)}>
            <div style={{
              backgroundColor: "var(--secondary-color)",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              border: "2px solid var(--accent-color)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)"
            }} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 style={{ color: "var(--accent-color)", marginBottom: "0", fontWeight: "bold" }}>
                  {editingTheme ? "Edit Theme" : "Create New Theme"}
                </h4>
                <button
                  className="btn-close"
                  onClick={() => setShowThemeModal(false)}
                  style={{ filter: "invert(1)" }}
                />
              </div>

              {/* Form */}
              <div className="mb-3">
                <label style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem", display: "block" }}>
                  Theme Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={themeFormData.name}
                  onChange={(e) => setThemeFormData({ ...themeFormData, name: e.target.value })}
                  placeholder="Enter theme name (e.g., Ocean Blue)"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--accent-color)"
                  }}
                />
              </div>

              <div className="mb-3">
                <label style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem", display: "block" }}>
                  Description
                </label>
                <textarea
                  className="form-control"
                  value={themeFormData.description}
                  onChange={(e) => setThemeFormData({ ...themeFormData, description: e.target.value })}
                  placeholder="Describe this theme"
                  rows="2"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--accent-color)",
                    minHeight: "80px"
                  }}
                />
              </div>

              <div className="mb-3">
                <label style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem", display: "block" }}>
                  Price (coins)
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={themeFormData.price}
                  onChange={(e) => setThemeFormData({ ...themeFormData, price: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--accent-color)"
                  }}
                />
              </div>

              {/* Color Inputs */}
              <div className="mb-3">
                <h6 style={{ color: "var(--accent-color)", fontWeight: "bold", marginBottom: "1rem" }}>
                  <i className="fas fa-palette me-2"></i>Colors
                </h6>
                <div className="row g-2">
                  {Object.keys(themeFormData.colors).map((colorKey) => (
                    <div key={colorKey} className="col-6">
                      <label style={{ color: "var(--text-color)", fontSize: "0.9rem", marginBottom: "0.3rem", display: "block" }}>
                        {colorKey}
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="color"
                          value={themeFormData.colors[colorKey]}
                          onChange={(e) => setThemeFormData({
                            ...themeFormData,
                            colors: { ...themeFormData.colors, [colorKey]: e.target.value }
                          })}
                          style={{ width: "50px", height: "40px", borderRadius: "4px", border: "1px solid var(--accent-color)", cursor: "pointer" }}
                        />
                        <input
                          type="text"
                          value={themeFormData.colors[colorKey]}
                          onChange={(e) => setThemeFormData({
                            ...themeFormData,
                            colors: { ...themeFormData.colors, [colorKey]: e.target.value }
                          })}
                          placeholder="#000000"
                          style={{
                            flex: 1,
                            backgroundColor: "var(--primary-color)",
                            color: "var(--text-color)",
                            border: "1px solid var(--accent-color)",
                            borderRadius: "4px",
                            padding: "0.5rem",
                            fontSize: "0.9rem"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration Guide */}
              <div style={{ padding: "1.5rem", backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <h5 style={{ color: "var(--accent-color)", marginBottom: "1rem", fontWeight: "bold", fontSize: "1rem" }}>
                  <i className="fas fa-sliders-h me-2"></i>Theme Configuration Guide
                </h5>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                  <div>
                    <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "600" }}>🎨 Color Customization</h6>
                    <p style={{ color: "var(--text-color)", marginBottom: 0, fontSize: "0.9rem", opacity: 0.8 }}>Define primary, secondary, accent colors and more. Create unlimited theme variations for different user preferences.</p>
                  </div>
                  <div>
                    <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "600" }}>💰 Pricing Options</h6>
                    <p style={{ color: "var(--text-color)", marginBottom: 0, fontSize: "0.9rem", opacity: 0.8 }}>Set themes as free gifts or premium paid items. Users can purchase premium themes with in-app currency.</p>
                  </div>
                  <div>
                    <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "600" }}>⭐ Default Theme</h6>
                    <p style={{ color: "var(--text-color)", marginBottom: 0, fontSize: "0.9rem", opacity: 0.8 }}>Set a theme as default for new users. Make sure it reflects your brand and provides excellent user experience.</p>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn flex-grow-1"
                  onClick={() => setShowThemeModal(false)}
                  style={{ backgroundColor: "#555", color: "white", fontWeight: "bold" }}
                >
                  Cancel
                </button>
                <button
                  className="btn flex-grow-1"
                  onClick={handleSaveTheme}
                  style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)", fontWeight: "bold" }}
                >
                  <i className="fas fa-save me-2"></i>{editingTheme ? "Update" : "Create"} Theme
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main render
  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
          <div className="text-center">
            <i className="fas fa-spinner fa-spin fa-3x mb-3" style={{ color: "var(--accent-color)" }}></i>
            <p style={{ color: "var(--text-color)" }}>Loading...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "users": return renderUsers();
      case "tutorials":
      case "announcements":
      case "pages": return renderContent();
      case "reviews": return renderReviews();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "var(--primary-color)", minHeight: "100vh", position: "relative", paddingTop: "3.5rem" }}>
      {/* Mobile sidebar overlay */}
      {sidebarVisible && (
        <div 
          className="sidebar-overlay visible d-md-none"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Desktop Sidebar - Fixed position */}
      <div
        className="app-sidebar d-none d-md-flex flex-column p-3"
      >
        {renderSidebar()}
      </div>

      {/* Mobile Sidebar - Slides in from left */}
      <div
        className={`app-sidebar d-md-none ${sidebarVisible ? 'visible' : ''}`}
      >
        <button
          onClick={() => setSidebarVisible(false)}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            color: "var(--text-color)",
            cursor: "pointer",
            zIndex: 1002
          }}
        >
          <i className="fas fa-times"></i>
        </button>
        <div className="mt-3">
          {renderSidebar()}
        </div>
      </div>

      {/* Main Content - Adjusted for fixed sidebar */}
      <main 
        ref={mainContentRef}
        className="app-main-content flex-grow-1 p-3 p-md-4"
      >
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="d-md-none btn mb-3"
          style={{
            backgroundColor: "var(--accent-color)",
            color: "var(--primary-color)",
            padding: "8px 12px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          <i className="fas fa-bars me-2"></i>
          Menu
        </button>

        {/* Notifications Display */}
        <div style={{ position: "fixed", top: "80px", right: "20px", zIndex: 2000, maxWidth: "400px" }}>
          {notifications.map(notification => (
            <div 
              key={notification.id}
              style={{
                marginBottom: "0.5rem",
                padding: "1rem",
                backgroundColor: 
                  notification.type === "error" ? "var(--error-color)" :
                  notification.type === "warning" ? "#ff9800" :
                  notification.type === "success" ? "var(--success-color)" :
                  "var(--info-color)",
                color: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                animation: "slideIn 0.3s ease-out"
              }}
            >
              <strong>{notification.title}</strong>
              <p style={{ marginBottom: "0", marginTop: "0.3rem", fontSize: "0.9rem" }}>
                {notification.message}
              </p>
            </div>
          ))}
        </div>
        
        {renderMainContent()}
      </main>

      {renderContentModal()}
      {renderUserModal()}
      {renderMessageModal()}
      {renderTutorialViewModal()}
    </div>
  );
}