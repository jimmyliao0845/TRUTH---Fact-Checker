import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import {
  FaBars,
  FaUser,
  FaHistory,
  FaTrophy,
  FaCommentDots,
  FaCog,
  FaArrowLeft,
  FaSearch,
  FaBookmark,
  FaThumbsUp,
  FaShare,
  FaTachometerAlt,
  FaPlusCircle,
  FaEdit,
  FaChartBar,
  FaUsers,
  FaClipboardList,
  FaUserCog,
  FaRegBookmark,
  FaLandmark,
  FaStar,
  FaBook,
  FaBell,
} from "react-icons/fa";

// ===== UTILITY FUNCTIONS =====
const load = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
    return defaultValue;
  }
};

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
};

export default function UserProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const mainContentRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  // Determine if professional or general user based on localStorage
  const isProfessional = localStorage.getItem("userType") === "professional";

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setCurrentUser(user);
        fetchUserMessages(user);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Swipe gesture handler for mobile sidebar
  const handleSwipe = useCallback((direction) => {
    if (direction === "right") {
      setSidebarVisible(true);
    } else if (direction === "left") {
      setSidebarVisible(false);
    }
  }, []);

  // Set up touch listeners for swipe on mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Only register as horizontal swipe if movement is more horizontal than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const direction = diffX > 0 ? 'left' : 'right';
        handleSwipe(direction);
      }
    };

    const element = mainContentRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, false);
      element.addEventListener('touchend', handleTouchEnd, false);
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleSwipe]);

  // ========== GENERAL USER DATA ==========
  const [generalProfile] = useState({
    userId: "user-100",
    displayName: "John Analyzer",
    email: "john@example.com",
    joinDate: "2025-01-15",
    totalSubmissions: 24,
    gamesPlayed: 12,
    accuracyScore: 85,
    badges: ["First Submission", "Game Master", "Active Contributor"],
    bio: "Passionate about identifying AI content and media literacy",
    avatarUrl: "",
  });

  const [generalSubmissions] = useState([
    {
      id: 1,
      type: "text",
      title: "News Article Analysis",
      date: "2025-02-01",
      result: "Human-made",
      confidence: 95,
    },
    {
      id: 2,
      type: "image",
      title: "Portrait Image",
      date: "2025-01-28",
      result: "AI-generated",
      confidence: 87,
    },
    {
      id: 3,
      type: "document",
      title: "Research Paper",
      date: "2025-01-25",
      result: "Human-made",
      confidence: 92,
    },
  ]);

  const [generalGameStats] = useState([
    {
      gameId: 1,
      gameName: "Real vs Fake Images",
      score: 95,
      accuracy: 90,
      date: "2025-01-30",
    },
    {
      gameId: 2,
      gameName: "Truth or Misinformation",
      score: 87,
      accuracy: 82,
      date: "2025-01-28",
    },
    {
      gameId: 3,
      gameName: "Media Forensics 101",
      score: 92,
      accuracy: 88,
      date: "2025-01-25",
    },
  ]);

  const [generalConversations] = useState([
    {
      id: 1,
      name: "Dr. Jane Analyst (Professional)",
      lastMessage: "Thanks for your feedback!",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      name: "System Admin",
      lastMessage: "Your account has been verified",
      timestamp: "1 day ago",
    },
  ]);

  // ========== MESSAGING STATE ==========
  const [messages, setMessages] = useState([]);
  const [systemMessages, setSystemMessages] = useState([]);
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  // ========== THEME & SHOP STATE ==========
  const [coinBalance, setCoinBalance] = useState(1000); // Default coin balance
  const [purchasedThemes, setPurchasedThemes] = useState([
    { id: "black", name: "Black" }, // Default theme
    { id: "white", name: "White" }   // Another free theme
  ]);
  
  // ========== PASSES STATE ==========
  const [purchasedPasses, setPurchasedPasses] = useState([
    // Can have multiple text entry passes
    // Professional pass is single upgrade
  ]);
  const [textEntryPassCount, setTextEntryPassCount] = useState(0); // Number of text entry passes purchased
  const [hasProfessionalPass, setHasProfessionalPass] = useState(false); // User's professional status via pass
  const [showCredentialForm, setShowCredentialForm] = useState(false); // For professional pass credential submission
  const [credentialData, setCredentialData] = useState({
    fullName: "",
    professionalTitle: "",
    organization: "",
    credentials: "",
    verificationDocument: "",
  });
  const [allThemes, setAllThemes] = useState([
    {
      id: "black",
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
    {
      id: "white",
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
    },
    {
      id: "ocean",
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
    {
      id: "forest",
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
    {
      id: "sunset",
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
    {
      id: "purple",
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
  ]);
  const [selectedTheme, setSelectedTheme] = useState("black");

  // ========== PROFESSIONAL USER DATA ==========
  const [profProfile] = useState(() =>
    load("pro_profile_v4", {
      pro_id: "prof-100",
      displayName: "Dr. Jane Analyst",
      caption: "Fact-checker • Media Forensics • Educator",
      avatarUrl: "",
    })
  );

  const [posts, setPosts] = useState(() =>
    load("posts_v4", [
      {
        id: "post-1",
        author: "Dr. Jane Analyst",
        time: "2 hrs ago",
        content: "New techniques for media forensics are available!",
        liked: false,
        bookmarked: true,
      },
      {
        id: "post-2",
        author: "Dr. Jane Analyst",
        time: "1 day ago",
        content: "Check out my latest fact-check tutorial.",
        liked: false,
        bookmarked: false,
      },
    ])
  );

  const [reviews, setReviews] = useState(() =>
    load("reviews_v4", [
      {
        id: "rev-1",
        reviewer: "John Doe",
        tutorial: "Media Forensics 101",
        time: "3 days ago",
        comment: "Very insightful tutorial!",
        bookmarked: false,
      },
      {
        id: "rev-2",
        reviewer: "Alice Smith",
        tutorial: "Fact-Checking Basics",
        time: "1 week ago",
        comment: "Helped me a lot with verification.",
        bookmarked: true,
      },
    ])
  );

  const [bookmarks, setBookmarks] = useState(() =>
    load("bookmarks_v3", [
      {
        type: "post",
        id: "post-101",
        author: "Dr. Jane Analyst",
        time: "Jan 24, 2026",
        content: "Understanding the basics of media forensics and fact-checking.",
      },
      {
        type: "review",
        id: "review-201",
        reviewer: "John Doe",
        tutorial: "Fact-Checking Tutorial 1",
        time: "Jan 22, 2026",
        comment: "This tutorial was very informative and practical!",
      },
    ])
  );

  const [conversations, setConversations] = useState(() =>
    load("messages_v4", [{ id: "admin", name: "System Admin", messages: [] }])
  );
  const [activeConversationId, setActiveConversationId] = useState("admin");
  const [newMessage, setNewMessage] = useState("");
  const [addContactInput, setAddContactInput] = useState("");

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // ========== PROFESSIONAL USER FUNCTIONS ==========
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const updated = conversations.map((c) =>
      c.id === activeConversationId
        ? { ...c, messages: [...c.messages, { sender: "You", text: newMessage }] }
        : c
    );
    setConversations(updated);
    save("messages_v4", updated);
    setNewMessage("");
  };

  const toggleBookmark = (type, id) => {
    if (type === "post") {
      const updated = posts.map((p) =>
        p.id === id ? { ...p, bookmarked: !p.bookmarked } : p
      );
      setPosts(updated);
      save("posts_v4", updated);

      const postItem = posts.find((p) => p.id === id);
      if (postItem?.bookmarked) {
        setBookmarks(bookmarks.filter((b) => b.id !== id));
      } else {
        setBookmarks([...bookmarks, { ...postItem, type: "post" }]);
      }
      save("bookmarks_v3", bookmarks);
    } else if (type === "review") {
      const updated = reviews.map((r) =>
        r.id === id ? { ...r, bookmarked: !r.bookmarked } : r
      );
      setReviews(updated);
      save("reviews_v4", updated);

      const revItem = reviews.find((r) => r.id === id);
      if (revItem?.bookmarked) {
        setBookmarks(bookmarks.filter((b) => b.id !== id));
      } else {
        setBookmarks([...bookmarks, { ...revItem, type: "review" }]);
      }
      save("bookmarks_v3", bookmarks);
    }
  };

  const removeBookmark = (id) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
    save("bookmarks_v3", bookmarks);

    setPosts(posts.map((p) => (p.id === id ? { ...p, bookmarked: false } : p)));
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, bookmarked: false } : r))
    );
    save("posts_v4", posts);
    save("reviews_v4", reviews);
  };

  // ========== FILTERING ==========
  const filteredSubmissions = generalSubmissions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const items = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === "posts") return posts.filter((p) => p.content.toLowerCase().includes(q));
    if (activeTab === "reviews") return reviews.filter((r) => r.comment.toLowerCase().includes(q));
    if (activeTab === "bookmarks") return bookmarks.filter((b) => (b.content || b.comment).toLowerCase().includes(q));
    return [];
  }, [activeTab, posts, reviews, bookmarks, searchQuery]);

  // ========== MESSAGING FUNCTIONS ==========
  const fetchUserMessages = async (user) => {
    if (!user) return;
    try {
      setLoadingMessages(true);
      // Fetch received messages
      const q = query(collection(db, "messages"), where("receiverEmail", "==", user.email), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);

      // System messages are those with messageType = "system"
      const systemMsgs = msgs.filter(m => m.messageType === "system");
      setSystemMessages(systemMsgs);

      // Fetch available users (excluding current user)
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs
        .map(doc => ({ id: doc.id, email: doc.data().email, name: doc.data().name || doc.data().email }))
        .filter(u => u.email !== user.email); // Exclude current user
      setAvailableUsers(usersList);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!recipientEmail.trim() || !messageBody.trim() || !currentUser) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        receiverEmail: recipientEmail,
        subject: messageSubject || "No Subject",
        message: messageBody,
        read: false,
        createdAt: serverTimestamp(),
        messageType: "user_message"
      });

      alert("Message sent successfully!");
      setShowMessageComposer(false);
      setRecipientEmail("");
      setMessageSubject("");
      setMessageBody("");
      
      // Refresh messages
      if (currentUser) {
        fetchUserMessages(currentUser);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message");
    }
  };

  // ========== RENDER ==========
  return (
    <div className="d-flex" style={{ 
      backgroundColor: "var(--primary-color)", 
      paddingTop: "56px",
      minHeight: "100vh",
      color: "var(--text-color)"
    }}>
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarVisible ? 'visible' : ''}`}
        onClick={() => setSidebarVisible(false)}
      />

      {/* ========== UNIFIED SIDEBAR ========== */}
      <div className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${sidebarVisible ? 'visible' : ''}`}
        style={isProfessional ? {} : {
          background: "linear-gradient(135deg, var(--secondary-color) 0%, var(--info-color-light) 100%)",
        }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button
            className="app-sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>
        </div>

        {/* Title Section */}
        {!collapsed && !isProfessional && (
          <div className="mb-4 text-center" style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--accent-color)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            opacity: 0.8
          }}>
            My Dashboard
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="d-flex flex-column gap-1">
          {isProfessional ? (
            // Professional User Tabs
            <>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase" }}>
                {!collapsed && "Workspace"}
              </div>
              {[
                { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt, action: () => navigate("/factcheckerdashboard") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={tab.action}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Content"}
              </div>
              {[
                { id: "posts", label: "Posts", icon: FaClipboardList },
                { id: "messages", label: "Messages", icon: FaCommentDots },
                { id: "reviews", label: "Reviews", icon: FaThumbsUp },
                { id: "bookmarks", label: "Bookmarks", icon: FaBookmark },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Management"}
              </div>
              {[
                { id: "verification-logs", label: "Verification Logs", icon: FaClipboardList },
                { id: "tutorials", label: "Manage Tutorials", icon: FaBook },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Settings"}
              </div>
              {[
                { id: "settings", label: "Settings", icon: FaCog },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}
            </>
          ) : (
            // General User Tabs
            <>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase" }}>
                {!collapsed && "Profile"}
              </div>
              {[
                { id: "profile", label: "My Profile", icon: FaUser },
                { id: "achievements", label: "Achievements", icon: FaStar },
                { id: "settings", label: "Settings", icon: FaCog },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Activity"}
              </div>
              {[
                { id: "submissions", label: "Submissions", icon: FaHistory },
                { id: "games", label: "Game Stats", icon: FaTrophy },
                { id: "bookmarks", label: "Bookmarks", icon: FaBookmark },
                { id: "leaderboard", label: "Leaderboard", icon: FaLandmark },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Shop"}
              </div>
              {[
                { id: "themes", label: "Themes", icon: FaUser },
                { id: "passes", label: "Passes", icon: FaTrophy },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Social"}
              </div>
              {[
                { id: "messages", label: "Messages", icon: FaCommentDots },
                { id: "community", label: "Community", icon: FaUsers },
                { id: "notifications", label: "Notifications", icon: FaBell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Learning"}
              </div>
              {[
                { id: "tutorials", label: "Tutorials", icon: FaBook },
                { id: "learning-path", label: "Learning Path", icon: FaChartBar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Back Button */}
        <div style={{ borderTop: "1px solid var(--accent-color)", marginTop: "1rem", paddingTop: "1rem" }}>
          <button
            className="app-sidebar-item"
            onClick={() => navigate(isProfessional ? "/analysis" : "/analysis-logged")}
          >
            <FaArrowLeft size={20} />
            <span className="app-sidebar-label">{isProfessional ? "Go Back" : "Back to Analysis"}</span>
          </button>
        </div>

        {!collapsed && (
          <div className="mt-auto small" style={{ opacity: 0.7, color: "var(--text-color)", fontSize: "11px", marginTop: "1rem" }}>
            {isProfessional ? "Professional workspace" : "Learner Portal"}
          </div>
        )}
      </div>

      {/* ========== UNIFIED MAIN CONTENT ========== */}
      <div ref={mainContentRef} className={`app-main-content ${collapsed ? 'with-collapsed-sidebar' : ''}`}>
        <nav 
          className="navbar shadow-sm px-4"
          style={{
            backgroundColor: "var(--primary-color)",
            borderBottom: `1px solid var(--accent-color)`
          }}
        >
          <h5 className="mb-0" style={{ color: "var(--text-color)" }}>
            {isProfessional ? (
              <>
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "profile" && "My Profile"}
                {activeTab === "posts" && "Posts"}
                {activeTab === "messages" && "Messages"}
                {activeTab === "reviews" && "Reviews"}
                {activeTab === "bookmarks" && "Bookmarks"}
                {activeTab === "verification-logs" && "Verification Logs"}
                {activeTab === "tutorials" && "Manage Tutorials"}
                {activeTab === "settings" && "Settings"}
              </>
            ) : (
              <>
                {activeTab === "profile" && "My Profile"}
                {activeTab === "submissions" && "My Submissions"}
                {activeTab === "games" && "Game Statistics"}
                {activeTab === "messages" && "Messages"}
                {activeTab === "settings" && "Settings"}
                {activeTab === "achievements" && "My Achievements"}
                {activeTab === "bookmarks" && "My Bookmarks"}
                {activeTab === "leaderboard" && "Global Leaderboard"}
                {activeTab === "community" && "Community"}
                {activeTab === "notifications" && "Notifications"}
                {activeTab === "tutorials" && "Learning Tutorials"}
                {activeTab === "learning-path" && "Your Learning Path"}
                {activeTab === "themes" && "Theme Shop"}
                {activeTab === "passes" && "Passes Shop"}
              </>
            )}
          </h5>
          {activeTab !== "messages" && (
            <div style={{ width: 360 }}>
              <div className="input-group">
                <span 
                  className="input-group-text"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                >
                  <FaSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                />
              </div>
            </div>
          )}
        </nav>

        <div className="container-fluid p-4">
          {/* PROFESSIONAL PROFILE HEADER */}
          {isProfessional && activeTab === "profile" && (
            <div 
              className="card shadow-sm mb-4 p-4"
              style={{
                backgroundColor: "var(--secondary-color)",
                borderColor: "var(--accent-color)",
                border: "2px solid var(--accent-color)"
              }}
            >
              <div className="d-flex align-items-center gap-4">
                <img
                  src={profProfile.avatarUrl || "https://via.placeholder.com/120"}
                  alt="avatar"
                  className="rounded-circle"
                  width={120}
                  height={120}
                  style={{ border: `2px solid var(--accent-color)` }}
                />
                <div>
                  <h4 className="mb-1" style={{ color: "var(--text-color)" }}>{profProfile.displayName}</h4>
                  <div style={{ color: "rgba(255,255,255,0.7)" }}>{profProfile.caption}</div>
                </div>
              </div>
            </div>
          )}

          {/* GENERAL USER PROFILE HEADER */}
          {!isProfessional && activeTab === "profile" && (
            <div className="row mb-4">
              <div className="col-md-4">
                <div 
                  className="card shadow-sm"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    border: `2px solid var(--accent-color)`,
                    color: "var(--text-color)"
                  }}
                >
                  <div className="card-body text-center">
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        backgroundColor: "var(--accent-color)",
                        borderRadius: "50%",
                        margin: "0 auto 1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary-color)",
                        fontSize: "48px",
                      }}
                    >
                      <FaUser />
                    </div>
                    <h5 style={{ color: "var(--text-color)" }}>{generalProfile.displayName}</h5>
                    <p style={{ color: "var(--text-color)", opacity: 0.7 }} className="small">{generalProfile.email}</p>
                    <p style={{ color: "var(--text-color)", opacity: 0.7 }} className="small">Joined {generalProfile.joinDate}</p>
                    <hr style={{ borderColor: "var(--accent-color)", opacity: 0.3 }} />
                    <p className="mb-1" style={{ color: "var(--text-color)" }}>
                      <strong>{generalProfile.totalSubmissions}</strong> Submissions
                    </p>
                    <p className="mb-1" style={{ color: "var(--text-color)" }}>
                      <strong>{generalProfile.gamesPlayed}</strong> Games Played
                    </p>
                    <p style={{ color: "var(--text-color)" }}>
                      <strong>{generalProfile.accuracyScore}%</strong> Accuracy
                    </p>
                    <button 
                      className="btn btn-sm w-100"
                      style={{
                        backgroundColor: "var(--accent-color)",
                        color: "var(--primary-color)",
                        border: `1px solid var(--accent-color)`
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--accent-color)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--accent-color)";
                        e.currentTarget.style.color = "var(--primary-color)";
                      }}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-md-8">
                <div 
                  className="card shadow-sm mb-3"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    border: `2px solid var(--accent-color)`,
                    color: "var(--text-color)"
                  }}
                >
                  <div 
                    className="card-header"
                    style={{
                      backgroundColor: "var(--accent-color)",
                      color: "var(--primary-color)"
                    }}
                  >
                    <h6 className="mb-0">About Me</h6>
                  </div>
                  <div className="card-body">
                    <p>{generalProfile.bio}</p>
                    <button 
                      className="btn btn-sm"
                      style={{
                        backgroundColor: "transparent",
                        border: `1px solid var(--accent-color)`,
                        color: "var(--accent-color)"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--accent-color)";
                        e.currentTarget.style.color = "var(--primary-color)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--accent-color)";
                      }}
                    >
                      Edit Bio
                    </button>
                  </div>
                </div>

                <div 
                  className="card shadow-sm"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    border: `2px solid var(--accent-color)`,
                    color: "var(--text-color)"
                  }}
                >
                  <div 
                    className="card-header"
                    style={{
                      backgroundColor: "var(--accent-color)",
                      color: "var(--primary-color)"
                    }}
                  >
                    <h6 className="mb-0">Badges & Achievements</h6>
                  </div>
                  <div className="card-body">
                    <div className="d-flex gap-2 flex-wrap">
                      {generalProfile.badges.map((badge, idx) => (
                        <span 
                          key={idx} 
                          className="badge"
                          style={{
                            backgroundColor: "var(--accent-color)",
                            color: "var(--primary-color)"
                          }}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT - PROFESSIONAL POSTS/REVIEWS/BOOKMARKS */}
          {isProfessional && (activeTab === "posts" || activeTab === "reviews" || activeTab === "bookmarks") && (
            <div className="row">
              {items.map((item) => (
                <div key={item.id} className="col-md-6 mb-3">
                  <div
                    className="card shadow-sm"
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      border: `2px solid var(--accent-color)`,
                      color: "var(--text-color)"
                    }}
                  >
                    <div className="card-body">
                      <h6 className="card-title" style={{ color: "var(--text-color)" }}>
                        {item.author || item.reviewer}
                      </h6>
                      <small style={{ opacity: 0.7 }}>{item.time}</small>
                      <p className="card-text mt-2">{item.content || item.comment}</p>
                      {activeTab !== "bookmarks" && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm"
                            onClick={() => toggleBookmark(activeTab === "posts" ? "post" : "review", item.id)}
                            style={{
                              backgroundColor: item.bookmarked ? "var(--accent-color)" : "transparent",
                              color: item.bookmarked ? "var(--primary-color)" : "var(--text-color)",
                              border: `1px solid var(--accent-color)`,
                            }}
                          >
                            <FaRegBookmark size={16} /> Bookmark
                          </button>
                        </div>
                      )}
                      {activeTab === "bookmarks" && (
                        <button
                          className="btn btn-sm"
                          onClick={() => removeBookmark(item.id)}
                          style={{
                            backgroundColor: "transparent",
                            color: "var(--accent-color)",
                            border: `1px solid var(--accent-color)`,
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROFESSIONAL MESSAGES TAB */}
          {isProfessional && activeTab === "messages" && (
            <div className="row" style={{ minHeight: 450 }}>
              <div className="col-md-4" style={{ borderRight: `1px solid var(--accent-color)` }}>
                <input
                  className="form-control mb-2"
                  placeholder="Add Account ID or Name"
                  value={addContactInput}
                  onChange={(e) => setAddContactInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && addContactInput.trim()) {
                      const updated = [
                        ...conversations,
                        { id: addContactInput.toLowerCase(), name: addContactInput, messages: [] },
                      ];
                      setConversations(updated);
                      save("messages_v4", updated);
                      setAddContactInput("");
                    }
                  }}
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                />
                <ul className="list-group">
                  {conversations.map((c) => (
                    <li
                      key={c.id}
                      className="list-group-item"
                      onClick={() => setActiveConversationId(c.id)}
                      style={{ 
                        cursor: "pointer",
                        backgroundColor: c.id === activeConversationId ? "var(--accent-color)" : "var(--secondary-color)",
                        color: c.id === activeConversationId ? "var(--primary-color)" : "var(--text-color)",
                        border: `1px solid var(--accent-color)`,
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => {
                        if (c.id !== activeConversationId) {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (c.id !== activeConversationId) {
                          e.currentTarget.style.backgroundColor = "var(--secondary-color)";
                        }
                      }}
                    >
                      {c.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-md-8 d-flex flex-column">
                <div 
                  className="flex-grow-1 rounded p-3 mb-2 overflow-auto"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    border: `2px solid var(--accent-color)`
                  }}
                >
                  {activeConversation?.messages.map((m, i) => (
                    <div key={i} className="mb-2" style={{ color: "var(--text-color)" }}>
                      <strong>{m.sender}:</strong> {m.text}
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  />
                  <button 
                    className="btn"
                    onClick={sendMessage}
                    style={{
                      backgroundColor: "var(--accent-color)",
                      color: "var(--primary-color)",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      borderRadius: "6px"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--primary-color)";
                      e.currentTarget.style.color = "var(--accent-color)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--accent-color)";
                      e.currentTarget.style.color = "var(--primary-color)";
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PROFESSIONAL VERIFICATION LOGS TAB */}
          {isProfessional && activeTab === "verification-logs" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Verification Logs</h6>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-color)" }}>View your verification history and logs here.</p>
              </div>
            </div>
          )}

          {/* PROFESSIONAL SETTINGS TAB */}
          {isProfessional && activeTab === "settings" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Settings</h6>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-color)" }}>Professional settings coming soon...</p>
              </div>
            </div>
          )}

          {/* GENERAL USER SUBMISSIONS TAB */}
          {!isProfessional && activeTab === "submissions" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Submission History ({filteredSubmissions.length})</h6>
              </div>
              <div className="card-body">
                {filteredSubmissions.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover" style={{ color: "var(--text-color)" }}>
                      <thead style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Result</th>
                          <th>Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((sub) => (
                          <tr key={sub.id} style={{ borderColor: "var(--accent-color)" }}>
                            <td>{sub.title}</td>
                            <td><span className="badge" style={{backgroundColor: "var(--accent-color)", color: "var(--primary-color)"}}>{sub.type}</span></td>
                            <td>{sub.date}</td>
                            <td>
                              <span className="badge" style={{backgroundColor: sub.result === "AI-generated" ? "var(--warning-color)" : "var(--accent-color)", color: sub.result === "AI-generated" ? "var(--primary-color)" : "var(--primary-color)"}}>
                                {sub.result}
                              </span>
                            </td>
                            <td>{sub.confidence}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: "var(--text-color)" }}>No submissions found</p>
                )}
              </div>
            </div>
          )}

          {/* GENERAL USER GAMES TAB */}
          {!isProfessional && activeTab === "games" && (
            <div className="row">
              {generalGameStats.map((game) => (
                <div key={game.gameId} className="col-md-4 mb-3">
                  <div className="card shadow-sm" style={{backgroundColor: "var(--secondary-color)", border: `2px solid var(--accent-color)`, color: "var(--text-color)"}}>
                    <div className="card-body">
                      <h6 className="card-title" style={{ color: "var(--text-color)" }}>{game.gameName}</h6>
                      <p className="mb-1" style={{ color: "var(--text-color)" }}><strong>Score:</strong> {game.score}</p>
                      <p className="mb-1" style={{ color: "var(--text-color)" }}><strong>Accuracy:</strong> {game.accuracy}%</p>
                      <p style={{ color: "var(--text-color)", opacity: 0.7 }} className="small">Played on {game.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SHARED MESSAGES TAB - Both Users */}
          {activeTab === "messages" && !isProfessional && (
            <div>
              {/* Compose Button */}
              <button
                className="btn mb-3"
                onClick={() => setShowMessageComposer(true)}
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)",
                  fontWeight: "600"
                }}
              >
                <i className="fas fa-plus me-2"></i>
                New Message
              </button>

              {/* System Messages Section */}
              {systemMessages.length > 0 && (
                <div className="mb-4">
                  <h5 style={{ color: "var(--accent-color)" }}>
                    <i className="fas fa-bell me-2"></i>
                    System Notifications
                  </h5>
                  {systemMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className="alert" 
                      style={{
                        backgroundColor: "var(--secondary-color)",
                        border: `2px solid var(--accent-color)`,
                        color: "var(--text-color)",
                        borderRadius: "8px"
                      }}
                    >
                      <h6 style={{ color: "var(--accent-color)" }}>
                        <i className="fas fa-star me-2"></i>
                        {msg.subject}
                      </h6>
                      <p style={{ marginBottom: "0.5rem" }}>{msg.message}</p>
                      <small style={{ opacity: 0.7 }}>
                        {msg.createdAt?.toDate?.()?.toLocaleString() || new Date().toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}

              {/* Inbox Section */}
              <div>
                <h5 style={{ color: "var(--accent-color)" }}>
                  <i className="fas fa-inbox me-2"></i>
                  Inbox ({messages.filter(m => m.messageType !== "system").length})
                </h5>
                {loadingMessages ? (
                  <p style={{ color: "var(--text-color)" }}>Loading messages...</p>
                ) : messages.filter(m => m.messageType !== "system").length === 0 ? (
                  <p style={{ color: "var(--text-color)", opacity: 0.7 }}>No messages yet</p>
                ) : (
                  messages.filter(m => m.messageType !== "system").map((msg) => (
                    <div 
                      key={msg.id} 
                      className="card shadow-sm mb-3"
                      style={{
                        backgroundColor: "var(--secondary-color)",
                        border: `2px solid var(--accent-color)`,
                        color: "var(--text-color)"
                      }}
                    >
                      <div className="card-header" style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}>
                        <h6 className="mb-0">
                          <strong>From:</strong> {msg.senderEmail}
                        </h6>
                      </div>
                      <div className="card-body">
                        <h6 style={{ color: "var(--text-color)" }}>{msg.subject}</h6>
                        <p style={{ color: "var(--text-color)", marginBottom: "0.5rem" }}>{msg.message}</p>
                        <small style={{ opacity: 0.7 }}>
                          {msg.createdAt?.toDate?.()?.toLocaleString() || new Date().toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Message Composer Modal */}
          {showMessageComposer && activeTab === "messages" && !isProfessional && (
            <div 
              className="modal show d-block" 
              style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
              onClick={() => setShowMessageComposer(false)}
            >
              <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
                  <div className="modal-header" style={{ borderBottom: "1px solid var(--accent-color)" }}>
                    <h5 className="modal-title" style={{ color: "var(--text-color)" }}>
                      <i className="fas fa-envelope me-2"></i>
                      Compose Message
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowMessageComposer(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label" style={{ color: "var(--text-color)" }}>Recipient *</label>
                      <select
                        className="form-select"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                      >
                        <option value="">Select a user...</option>
                        {availableUsers.map((user) => (
                          <option key={user.id} value={user.email}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                      {availableUsers.length === 0 && (
                        <small style={{ color: "var(--info-color)" }}>Loading users...</small>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label" style={{ color: "var(--text-color)" }}>Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        value={messageSubject}
                        onChange={(e) => setMessageSubject(e.target.value)}
                        placeholder="Message subject"
                        style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" style={{ color: "var(--text-color)" }}>Message *</label>
                      <textarea
                        className="form-control"
                        rows={5}
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        placeholder="Type your message..."
                        style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                      />
                    </div>
                  </div>
                  <div className="modal-footer" style={{ borderTop: "1px solid var(--accent-color)" }}>
                    <button 
                      className="btn"
                      style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                      onClick={() => setShowMessageComposer(false)}
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
          )}

          {/* GENERAL USER ACHIEVEMENTS TAB */}
          {!isProfessional && activeTab === "achievements" && (
            <div className="row">
              {generalProfile.badges.map((badge, idx) => (
                <div key={idx} className="col-md-4 mb-3">
                  <div className="card shadow-sm text-center" style={{backgroundColor: "var(--secondary-color)", border: `2px solid var(--accent-color)`, color: "var(--text-color)"}}>
                    <div className="card-body">
                      <div style={{fontSize: "48px", color: "var(--accent-color)", marginBottom: "1rem"}}><FaStar /></div>
                      <h6 style={{ color: "var(--text-color)" }}>{badge}</h6>
                      <p style={{ color: "var(--text-color)", opacity: 0.7, margin: 0 }} className="small">Achievement Unlocked</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SHARED BOOKMARKS TAB */}
          {activeTab === "bookmarks" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">{isProfessional ? "Bookmarks" : "Your Bookmarks"}</h6>
              </div>
              <div className="card-body">
                {isProfessional ? (
                  bookmarks.length > 0 ? (
                    <div className="row">
                      {bookmarks.map((item) => (
                        <div key={item.id} className="col-md-6 mb-3">
                          <div className="card shadow-sm" style={{backgroundColor: "var(--primary-color)", border: `1px solid var(--accent-color)`, color: "var(--text-color)"}}>
                            <div className="card-body">
                              <h6>{item.author || item.reviewer}</h6>
                              <small style={{ opacity: 0.7 }}>{item.time}</small>
                              <p className="card-text mt-2">{item.content || item.comment}</p>
                              <button className="btn btn-sm" onClick={() => removeBookmark(item.id)} style={{backgroundColor: "transparent", color: "var(--accent-color)", border: `1px solid var(--accent-color)`}}>Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-color)" }}>No bookmarks yet.</p>
                  )
                ) : (
                  <p style={{ color: "var(--text-color)" }}>You haven't bookmarked any content yet. Start bookmarking your favorite submissions and tutorials!</p>
                )}
              </div>
            </div>
          )}

          {/* GENERAL USER LEADERBOARD TAB */}
          {!isProfessional && activeTab === "leaderboard" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Global Leaderboard</h6>
              </div>
              <div className="card-body">
                <table className="table" style={{ color: "var(--text-color)" }}>
                  <thead style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>Score</th>
                      <th>Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Alex Chen</td>
                      <td>2450</td>
                      <td>94%</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Sarah Smith</td>
                      <td>2380</td>
                      <td>91%</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td style={{ fontWeight: "bold" }}>You (John Analyzer)</td>
                      <td style={{ fontWeight: "bold" }}>2100</td>
                      <td style={{ fontWeight: "bold" }}>85%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GENERAL USER COMMUNITY TAB */}
          {!isProfessional && activeTab === "community" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Community</h6>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-color)" }}>Connect with other learners in the community. Discuss findings, share insights, and collaborate on fact-checking tasks.</p>
                <button className="btn" style={{backgroundColor: "var(--accent-color)", color: "var(--primary-color)"}}>Join Community</button>
              </div>
            </div>
          )}

          {/* GENERAL USER NOTIFICATIONS TAB */}
          {!isProfessional && activeTab === "notifications" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Notifications</h6>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-color)" }}>You're all caught up! No new notifications at this time.</p>
              </div>
            </div>
          )}

          {/* SHARED TUTORIALS TAB */}
          {activeTab === "tutorials" && (
            <div className="row">
              {[
                { id: 1, title: "Getting Started with TRUTH", category: "Introduction", difficulty: "Beginner" },
                { id: 2, title: "Fact-Checking Basics", category: "Verification", difficulty: "Beginner" },
                { id: 3, title: "Advanced Media Forensics", category: "Expert", difficulty: "Advanced" },
              ].map((tut) => (
                <div key={tut.id} className="col-md-4 mb-3">
                  <div className="card shadow-sm" style={{backgroundColor: "var(--secondary-color)", border: `2px solid var(--accent-color)`, color: "var(--text-color)"}}>
                    <div className="card-header" style={{backgroundColor: "var(--accent-color)", color: "var(--primary-color)"}}>
                      <h6 className="mb-0">{tut.title}</h6>
                    </div>
                    <div className="card-body">
                      <p style={{ color: "var(--text-color)", marginBottom: "8px" }} className="small"><strong>Category:</strong> {tut.category}</p>
                      <p style={{ color: "var(--text-color)", marginBottom: "12px" }} className="small"><strong>Level:</strong> {tut.difficulty}</p>
                      <button className="btn btn-sm" style={{backgroundColor: "var(--accent-color)", color: "var(--primary-color)", width: "100%"}}>Start Learning</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GENERAL USER LEARNING PATH TAB */}
          {!isProfessional && activeTab === "learning-path" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Your Learning Path</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 style={{ color: "var(--text-color)" }}>Foundation Phase</h6>
                  <div style={{ height: "8px", backgroundColor: "var(--primary-color)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{height: "100%", width: "75%", backgroundColor: "var(--accent-color)"}} />
                  </div>
                  <small style={{ color: "var(--text-color)", opacity: 0.7 }}>75% Complete - 3 of 4 courses done</small>
                </div>
                <div>
                  <h6 style={{ color: "var(--text-color)" }}>Advanced Phase</h6>
                  <div style={{ height: "8px", backgroundColor: "var(--primary-color)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{height: "100%", width: "30%", backgroundColor: "var(--accent-color)"}} />
                  </div>
                  <small style={{ color: "var(--text-color)", opacity: 0.7 }}>30% Complete - 1 of 3 courses done</small>
                </div>
              </div>
            </div>
          )}

          {/* SHARED SETTINGS TAB */}
          {activeTab === "settings" && !isProfessional && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Settings</h6>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-color)" }}>Settings management coming soon...</p>
              </div>
            </div>
          )}

          {/* THEME SHOP TAB */}
          {activeTab === "themes" && !isProfessional && (
            <div>
              {/* Info Box */}
              <div style={{
                backgroundColor: "rgba(255, 107, 107, 0.1)",
                border: "2px solid #ff6b6b",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "2rem"
              }}>
                <i className="fas fa-lock" style={{ color: "#ff6b6b", marginRight: "0.5rem" }}></i>
                <span style={{ color: "var(--text-color)" }}>
                  Your theme preference is saved and will persist across sessions. You can change themes anytime.
                </span>
              </div>

              {/* Header with Stats */}
              <div className="row mb-4">
                <div className="col-12 col-md-6">
                  <div
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      border: "2px solid var(--accent-color)",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      marginBottom: "1rem"
                    }}
                  >
                    <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem", fontWeight: "bold" }}>
                      <i className="fas fa-coins me-2"></i>Coin Balance
                    </h6>
                    <h2 style={{ color: "var(--text-color)", marginBottom: "0" }}>{coinBalance} coins</h2>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      border: "2px solid var(--accent-color)",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      marginBottom: "1rem"
                    }}
                  >
                    <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem", fontWeight: "bold" }}>
                      <i className="fas fa-palette me-2"></i>Themes Owned
                    </h6>
                    <h2 style={{ color: "var(--text-color)", marginBottom: "0" }}>{purchasedThemes.length}</h2>
                  </div>
                </div>
              </div>

              {/* Themes Grid */}
              <h4 style={{ color: "var(--accent-color)", marginBottom: "1.5rem", fontWeight: "bold" }}>
                <i className="fas fa-shopping-bag me-2"></i>Available Themes
              </h4>
              <div className="row g-3">
                {allThemes.map((theme) => {
                  const isOwned = purchasedThemes.some(t => t.id === theme.id);
                  const canAfford = coinBalance >= theme.price || theme.price === 0;

                  const handlePurchaseTheme = () => {
                    if (isOwned) {
                      // Apply theme
                      setSelectedTheme(theme.id);
                      localStorage.setItem("selectedTheme", theme.id);
                      // Apply CSS variables immediately
                      const root = document.documentElement;
                      Object.entries(theme.colors).forEach(([key, value]) => {
                        root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-color`, value);
                      });
                      alert(`Theme "${theme.name}" applied!`);
                    } else if (coinBalance >= theme.price) {
                      setCoinBalance(coinBalance - theme.price);
                      setPurchasedThemes([...purchasedThemes, { id: theme.id, name: theme.name }]);
                      setSelectedTheme(theme.id);
                      localStorage.setItem("selectedTheme", theme.id);
                      // Apply CSS variables immediately
                      const root = document.documentElement;
                      Object.entries(theme.colors).forEach(([key, value]) => {
                        root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-color`, value);
                      });
                      alert(`Theme "${theme.name}" purchased and applied! You now have ${coinBalance - theme.price} coins.`);
                    } else {
                      alert(`Not enough coins! You need ${theme.price - coinBalance} more coins.`);
                    }
                  };

                  return (
                    <div key={theme.id} className="col-12 col-sm-6 col-lg-4">
                      <div
                        style={{
                          backgroundColor: "var(--secondary-color)",
                          border: selectedTheme === theme.id ? "3px solid var(--accent-color)" : "2px solid #555",
                          borderRadius: "8px",
                          padding: "1rem",
                          position: "relative",
                          transition: "all 0.3s ease",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        {/* Badge */}
                        {isOwned && (
                          <div style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: "var(--accent-color)",
                            color: "var(--primary-color)",
                            padding: "0.3rem 0.7rem",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "bold"
                          }}>
                            ✓ OWNED
                          </div>
                        )}

                        {/* Color Preview */}
                        <div style={{
                          display: "flex",
                          gap: "6px",
                          marginBottom: "1rem",
                          height: "50px"
                        }}>
                          {Object.entries(theme.colors).slice(0, 8).map(([key, color]) => (
                            <div
                              key={key}
                              style={{
                                flex: 1,
                                backgroundColor: color,
                                borderRadius: "4px",
                                border: "1px solid #555",
                                cursor: "pointer",
                                transition: "transform 0.2s"
                              }}
                              title={key}
                              onMouseOver={(e) => e.target.style.transform = "scaleY(1.1)"}
                              onMouseOut={(e) => e.target.style.transform = "scaleY(1)"}
                            />
                          ))}
                        </div>

                        {/* Theme Info */}
                        <h6 style={{ color: "var(--accent-color)", marginBottom: "0.3rem", fontWeight: "bold" }}>
                          {theme.name}
                        </h6>
                        <p style={{ color: "var(--text-color)", fontSize: "0.9rem", marginBottom: "1rem", opacity: 0.8, flex: 1 }}>
                          {theme.description}
                        </p>

                        {/* Price */}
                        <p style={{ color: "var(--accent-color)", fontSize: "1rem", marginBottom: "1rem", fontWeight: "bold" }}>
                          {theme.price === 0 ? "FREE" : `${theme.price} coins`}
                        </p>

                        {/* Purchase/Apply Button */}
                        <button
                          onClick={handlePurchaseTheme}
                          style={{
                            backgroundColor: isOwned ? "var(--accent-color)" : (canAfford ? "var(--accent-color)" : "#666"),
                            color: isOwned || canAfford ? "var(--primary-color)" : "gray",
                            border: "none",
                            padding: "0.7rem",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            cursor: isOwned || canAfford ? "pointer" : "not-allowed",
                            transition: "all 0.3s",
                            width: "100%"
                          }}
                          disabled={!isOwned && !canAfford}
                          onMouseOver={(e) => {
                            if (isOwned || canAfford) {
                              e.target.style.opacity = "0.8";
                            }
                          }}
                          onMouseOut={(e) => {
                            e.target.style.opacity = "1";
                          }}
                        >
                          <i className={`fas ${isOwned ? "fa-check" : "fa-shopping-cart"} me-2`}></i>
                          {isOwned ? "Apply Theme" : (canAfford ? "Buy Theme" : "Not Enough Coins")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASSES SHOP TAB */}
          {activeTab === "passes" && !isProfessional && (
            <div>
              {/* Header with Stats */}
              <div className="row mb-4">
                <div className="col-12 col-md-6">
                  <div
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      border: "2px solid var(--accent-color)",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      marginBottom: "1rem"
                    }}
                  >
                    <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem", fontWeight: "bold" }}>
                      <i className="fas fa-coins me-2"></i>Coin Balance
                    </h6>
                    <h2 style={{ color: "var(--text-color)", marginBottom: "0" }}>{coinBalance} coins</h2>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      border: "2px solid var(--accent-color)",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      marginBottom: "1rem"
                    }}
                  >
                    <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem", fontWeight: "bold" }}>
                      <i className="fas fa-file-contract me-2"></i>Text Entry Passes
                    </h6>
                    <h2 style={{ color: "var(--text-color)", marginBottom: "0" }}>{textEntryPassCount}</h2>
                  </div>
                </div>
              </div>

              {/* Passes Grid */}
              <h4 style={{ color: "var(--accent-color)", marginBottom: "1.5rem", fontWeight: "bold" }}>
                <i className="fas fa-ticket-alt me-2"></i>Available Passes
              </h4>
              <div className="row g-3">
                {/* Text Entry Pass */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      border: "2px solid #5dade2",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "1rem"
                    }}>
                      <i className="fas fa-edit fa-2x" style={{ color: "#5dade2", marginRight: "1rem" }}></i>
                      <div>
                        <h6 style={{ color: "var(--accent-color)", marginBottom: "0.3rem", fontWeight: "bold" }}>
                          Text Entry Pass
                        </h6>
                        <small style={{ color: "var(--text-color)", opacity: 0.8 }}>Stackable</small>
                      </div>
                    </div>

                    <p style={{ color: "var(--text-color)", fontSize: "0.95rem", marginBottom: "1rem", flex: 1 }}>
                      Unlock 5 additional text verifications per day. You can stack multiple passes to increase your daily limit further.
                    </p>

                    <div style={{ marginBottom: "1rem" }}>
                      <p style={{ color: "var(--text-color)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                        <strong>Current Usage:</strong> You have used X/5 text verifications today
                      </p>
                      <div style={{ height: "8px", backgroundColor: "var(--primary-color)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{height: "100%", width: "40%", backgroundColor: "#5dade2"}} />
                      </div>
                    </div>

                    <p style={{ color: "var(--accent-color)", fontSize: "1rem", marginBottom: "1rem", fontWeight: "bold" }}>
                      300 coins
                    </p>

                    <button
                      onClick={() => {
                        if (coinBalance >= 300) {
                          setCoinBalance(coinBalance - 300);
                          setTextEntryPassCount(textEntryPassCount + 1);
                          setPurchasedPasses([...purchasedPasses, { id: `text-entry-${Date.now()}`, type: "text-entry", purchaseDate: new Date().toLocaleDateString() }]);
                          alert(`Text Entry Pass purchased! You now have ${textEntryPassCount + 1} pass(es). Your daily text verification limit has been increased.`);
                        } else {
                          alert(`Not enough coins! You need ${300 - coinBalance} more coins.`);
                        }
                      }}
                      style={{
                        backgroundColor: coinBalance >= 300 ? "var(--accent-color)" : "#666",
                        color: coinBalance >= 300 ? "var(--primary-color)" : "gray",
                        border: "none",
                        padding: "0.8rem",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: coinBalance >= 300 ? "pointer" : "not-allowed",
                        transition: "all 0.3s",
                        width: "100%"
                      }}
                      disabled={coinBalance < 300}
                      onMouseOver={(e) => {
                        if (coinBalance >= 300) {
                          e.target.style.opacity = "0.8";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.opacity = "1";
                      }}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>Buy Pass
                    </button>
                  </div>
                </div>

                {/* Professional Pass */}
                <div className="col-12 col-sm-6 col-lg-4">
                  <div
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      border: "2px solid #ffd93d",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative"
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                      backgroundColor: "#ffd93d",
                      color: "#000",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "bold"
                    }}>
                      PREMIUM
                    </div>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "1rem"
                    }}>
                      <i className="fas fa-crown fa-2x" style={{ color: "#ffd93d", marginRight: "1rem" }}></i>
                      <div>
                        <h6 style={{ color: "var(--accent-color)", marginBottom: "0.3rem", fontWeight: "bold" }}>
                          Professional Pass
                        </h6>
                        <small style={{ color: "var(--text-color)", opacity: 0.8 }}>One-time upgrade</small>
                      </div>
                    </div>

                    <p style={{ color: "var(--text-color)", fontSize: "0.95rem", marginBottom: "1rem", flex: 1 }}>
                      Upgrade your account to Professional status. Submit credentials for verification by admins to unlock professional tools and features.
                    </p>

                    <div style={{
                      backgroundColor: "rgba(255, 217, 61, 0.1)",
                      border: "1px solid #ffd93d",
                      borderRadius: "4px",
                      padding: "0.8rem",
                      marginBottom: "1rem"
                    }}>
                      <p style={{ color: "var(--text-color)", fontSize: "0.85rem", marginBottom: "0" }}>
                        <strong>What you'll get:</strong>
                      </p>
                      <ul style={{ color: "var(--text-color)", fontSize: "0.85rem", marginBottom: "0", paddingLeft: "1.2rem" }}>
                        <li>Professional role on your account</li>
                        <li>Access to professional dashboard</li>
                        <li>Ability to create and publish tutorials</li>
                        <li>Professional analytics and insights</li>
                      </ul>
                    </div>

                    <p style={{ color: "var(--accent-color)", fontSize: "1rem", marginBottom: "1rem", fontWeight: "bold" }}>
                      1500 coins
                    </p>

                    <button
                      onClick={() => {
                        if (coinBalance >= 1500) {
                          setCoinBalance(coinBalance - 1500);
                          setHasProfessionalPass(true);
                          setShowCredentialForm(true);
                          setPurchasedPasses([...purchasedPasses, { id: "professional", type: "professional", purchaseDate: new Date().toLocaleDateString() }]);
                        } else {
                          alert(`Not enough coins! You need ${1500 - coinBalance} more coins.`);
                        }
                      }}
                      style={{
                        backgroundColor: coinBalance >= 1500 ? "#ffd93d" : "#666",
                        color: coinBalance >= 1500 ? "#000" : "gray",
                        border: "none",
                        padding: "0.8rem",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: coinBalance >= 1500 ? "pointer" : "not-allowed",
                        transition: "all 0.3s",
                        width: "100%"
                      }}
                      disabled={coinBalance < 1500}
                      onMouseOver={(e) => {
                        if (coinBalance >= 1500) {
                          e.target.style.opacity = "0.8";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.opacity = "1";
                      }}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFESSIONAL CREDENTIAL FORM - MODAL */}
          {showCredentialForm && (
            <div style={{
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
            }} onClick={() => setShowCredentialForm(false)}>
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
                    <i className="fas fa-crown me-2"></i>Professional Credentials
                  </h4>
                  <button
                    className="btn-close"
                    onClick={() => setShowCredentialForm(false)}
                    style={{ filter: "invert(1)" }}
                  />
                </div>

                <p style={{ color: "var(--text-color)", marginBottom: "1.5rem" }}>
                  Please provide your professional credentials for admin verification. Your information will be reviewed before your professional status is activated.
                </p>

                {/* Form Fields */}
                <div className="mb-3">
                  <label style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem", display: "block" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={credentialData.fullName}
                    onChange={(e) => setCredentialData({ ...credentialData, fullName: e.target.value })}
                    placeholder="Your full name"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "var(--text-color)",
                      border: "1px solid var(--accent-color)"
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem", display: "block" }}>
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={credentialData.professionalTitle}
                    onChange={(e) => setCredentialData({ ...credentialData, professionalTitle: e.target.value })}
                    placeholder="e.g., Journalist, Fact-Checker, Media Analyst"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "var(--text-color)",
                      border: "1px solid var(--accent-color)"
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem", display: "block" }}>
                    Organization *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={credentialData.organization}
                    onChange={(e) => setCredentialData({ ...credentialData, organization: e.target.value })}
                    placeholder="Your organization or company"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "var(--text-color)",
                      border: "1px solid var(--accent-color)"
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem", display: "block" }}>
                    Credentials & Experience
                  </label>
                  <textarea
                    className="form-control"
                    value={credentialData.credentials}
                    onChange={(e) => setCredentialData({ ...credentialData, credentials: e.target.value })}
                    placeholder="Describe your professional background, expertise, and relevant experience..."
                    rows="4"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "var(--text-color)",
                      border: "1px solid var(--accent-color)",
                      minHeight: "120px"
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: "0.5rem", display: "block" }}>
                    Verification Document *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={credentialData.verificationDocument}
                    onChange={(e) => setCredentialData({ ...credentialData, verificationDocument: e.target.value })}
                    placeholder="Upload document link or reference (e.g., LinkedIn profile, professional ID, certificate)"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "var(--text-color)",
                      border: "1px solid var(--accent-color)"
                    }}
                  />
                </div>

                {/* Modal Footer */}
                <div className="d-flex gap-2 mt-4">
                  <button
                    className="btn flex-grow-1"
                    onClick={() => setShowCredentialForm(false)}
                    style={{ backgroundColor: "#555", color: "white", fontWeight: "bold" }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn flex-grow-1"
                    onClick={() => {
                      if (!credentialData.fullName.trim() || !credentialData.professionalTitle.trim() || !credentialData.organization.trim() || !credentialData.verificationDocument.trim()) {
                        alert("Please fill in all required fields");
                        return;
                      }
                      alert("Professional credentials submitted! Admins will review your application. You'll be notified when your account is verified.");
                      setShowCredentialForm(false);
                      // Here you would send credential data to Firestore for admin review
                    }}
                    style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)", fontWeight: "bold" }}
                  >
                    <i className="fas fa-check me-2"></i>Submit Credentials
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
