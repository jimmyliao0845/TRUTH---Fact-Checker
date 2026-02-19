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
      const userList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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
        const created = new Date(u.created_at);
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
    }
  };

  // Fetch CMS content
  const fetchContent = async (type) => {
    try {
      const config = CONTENT_TYPES[type];
      const q = query(collection(db, config.collection), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (type === "tutorials") setTutorials(list);
      else if (type === "announcements") setAnnouncements(list);
      else if (type === "pages") setPages(list);
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      // Reviews collection might not exist yet
      console.log("No reviews found or collection doesn't exist");
      setReviews([]);
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

      if (editingItem) {
        await updateDoc(doc(db, config.collection, editingItem.id), data);
      } else {
        data.createdAt = serverTimestamp();
        data.views = 0;
        data.rating = 0;
        await addDoc(collection(db, config.collection), data);
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
  const renderDashboard = () => (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: "var(--text-color)" }}>
        <i className="fas fa-tachometer-alt me-2" style={{ color: "var(--accent-color)" }}></i>
        Dashboard Overview
      </h2>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card p-3 text-center" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
            <h6 style={{ color: "var(--text-color)" }}>Total Users</h6>
            <h3 className="fw-bold" style={{ color: "var(--accent-color)" }}>{users.length}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
            <h6 style={{ color: "var(--text-color)" }}>New This Month</h6>
            <h3 className="fw-bold" style={{ color: "var(--accent-color)" }}>{newUsersMonth}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
            <h6 style={{ color: "var(--text-color)" }}>Published Content</h6>
            <h3 className="fw-bold" style={{ color: "var(--accent-color)" }}>
              {[...tutorials, ...announcements, ...pages].filter(c => c.status === "published").length}
            </h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
            <h6 style={{ color: "var(--text-color)" }}>Total Reviews</h6>
            <h3 className="fw-bold" style={{ color: "var(--accent-color)" }}>{reviews.length}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card p-3" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
            <h6 className="mb-3 text-center" style={{ color: "var(--text-color)" }}>User Growth (Last 6 Months)</h6>
            <Line data={userGrowthData} options={{ maintainAspectRatio: true }} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
            <h6 className="mb-3 text-center" style={{ color: "var(--text-color)" }}>Review Statistics</h6>
            <Bar data={reviewData} options={{ maintainAspectRatio: true }} />
          </div>
        </div>
      </div>

      {/* Quick Stats Table */}
      <div className="card p-3" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
        <h6 className="mb-3" style={{ color: "var(--text-color)" }}>Content Summary</h6>
        <div className="row text-center">
          <div className="col-md-4">
            <div className="p-2">
              <i className="fas fa-book fa-2x mb-2" style={{ color: "var(--accent-color)" }}></i>
              <h5 style={{ color: "var(--text-color)" }}>{tutorials.length} Tutorials</h5>
              <small style={{ color: "var(--text-color)", opacity: 0.7 }}>
                {tutorials.filter(t => t.status === "published").length} published
              </small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-2">
              <i className="fas fa-bullhorn fa-2x mb-2" style={{ color: "var(--accent-color)" }}></i>
              <h5 style={{ color: "var(--text-color)" }}>{announcements.length} Announcements</h5>
              <small style={{ color: "var(--text-color)", opacity: 0.7 }}>
                {announcements.filter(a => a.featured).length} featured
              </small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-2">
              <i className="fas fa-file-alt fa-2x mb-2" style={{ color: "var(--accent-color)" }}></i>
              <h5 style={{ color: "var(--text-color)" }}>{pages.length} Pages</h5>
              <small style={{ color: "var(--text-color)", opacity: 0.7 }}>
                {pages.filter(p => p.status === "published").length} published
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
    const totalUsers = users.length;
    const generalUsers = users.filter(u => u.role === "user" || u.role === "general").length;
    const professionals = users.filter(u => u.role === "professional").length;
    const admins = users.filter(u => u.role === "admin" || u.role === "superadmin").length;

    return (
    <div>
      {/* Summary Section - 4 Cards in One Line */}
      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        marginBottom: "2rem", 
        justifyContent: "space-between",
        flexWrap: "wrap"
      }}>
        <div style={{ 
          flex: 1, 
          minWidth: "200px",
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: "var(--secondary-color)", 
          border: "2px solid var(--accent-color)"
        }}>
          <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem" }}>Total Users</h6>
          <h2 style={{ color: "var(--text-color)", marginBottom: "0" }}>{totalUsers}</h2>
        </div>
        <div style={{ 
          flex: 1, 
          minWidth: "200px",
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: "var(--secondary-color)", 
          border: "1px solid #6c757d"
        }}>
          <h6 style={{ color: "var(--text-color)", marginBottom: "0.5rem" }}>General Users</h6>
          <h2 style={{ color: "#6c757d", marginBottom: "0" }}>{generalUsers}</h2>
        </div>
        <div style={{ 
          flex: 1, 
          minWidth: "200px",
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: "var(--secondary-color)", 
          border: "1px solid var(--info-color)"
        }}>
          <h6 style={{ color: "var(--info-color)", marginBottom: "0.5rem" }}>Professionals</h6>
          <h2 style={{ color: "var(--info-color)", marginBottom: "0" }}>{professionals}</h2>
        </div>
        <div style={{ 
          flex: 1, 
          minWidth: "200px",
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: "var(--secondary-color)", 
          border: "1px solid #ffc107"
        }}>
          <h6 style={{ color: "#ffc107", marginBottom: "0.5rem" }}>Admins</h6>
          <h2 style={{ color: "#ffc107", marginBottom: "0" }}>{admins}</h2>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 className="fw-bold mb-0" style={{ color: "var(--text-color)" }}>
          <i className="fas fa-users me-2" style={{ color: "var(--accent-color)" }}></i>
          User Management
        </h2>
        <select
          className="form-select w-auto"
          value={userSortBy}
          onChange={(e) => setUserSortBy(e.target.value)}
          style={{ backgroundColor: "var(--secondary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
        >
          <option value="recent">Most Recent</option>
          <option value="name">By Name</option>
          <option value="role">By Role</option>
        </select>
      </div>

      <div className="table-responsive rounded" style={{ border: "2px solid var(--accent-color)", overflow: "hidden" }}>
        <table className="table mb-0" style={{ backgroundColor: "var(--secondary-color)" }}>
          <thead style={{ backgroundColor: "var(--accent-color)" }}>
            <tr>
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Name</th>
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Email</th>
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Role</th>
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Provider</th>
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Credentials</th>
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Created</th>
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => {
              const isCurrentUser = user.email === currentUser?.email;
              const disableButton = isCurrentUser || 
                user.role === "superadmin" || 
                (user.role === "admin" && currentUserRole !== "superadmin");
              const buttonLabel = user.role === "user" ? "Promote" : "Demote";
              const creds = checkUserCredentials(user);

              return (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--accent-color)" }}>
                  <td style={{ color: "var(--text-color)", padding: "12px" }}>{user.name || "N/A"}</td>
                  <td style={{ color: "var(--text-color)", padding: "12px" }}>{user.email}</td>
                  <td style={{ padding: "12px" }}>
                    <span 
                      className="badge"
                      style={{ 
                        backgroundColor: user.role === "admin" || user.role === "superadmin" 
                          ? "var(--accent-color)" 
                          : "var(--primary-color)",
                        color: user.role === "admin" || user.role === "superadmin"
                          ? "var(--primary-color)"
                          : "var(--text-color)",
                        border: user.role === "user" ? "1px solid var(--accent-color)" : "none"
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-color)", padding: "12px" }}>{user.provider || "Email"}</td>
                  <td style={{ padding: "12px" }}>
                    <div 
                      className="badge" 
                      style={{
                        backgroundColor: creds.verified ? "#28a745" : creds.status === "Already Professional" ? "var(--accent-color)" : "#ffc107",
                        color: creds.verified || creds.status === "Already Professional" ? "white" : "#000",
                        padding: "8px 10px",
                        cursor: "pointer",
                        display: "inline-block"
                      }}
                      title={creds.missing.length > 0 ? `Missing: ${creds.missing.join(", ")}` : creds.status}
                    >
                      <i className={`fas fa-${creds.verified ? "check-circle" : "info-circle"} me-1`}></i>
                      {creds.status}
                    </div>
                  </td>
                  <td style={{ color: "var(--text-color)", padding: "12px" }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: disableButton ? "transparent" : "var(--accent-color)",
                        color: disableButton ? "var(--text-color)" : "var(--primary-color)",
                        border: "1px solid var(--accent-color)",
                        opacity: disableButton ? 0.5 : 1,
                        cursor: disableButton ? "not-allowed" : "pointer"
                      }}
                      disabled={disableButton}
                      onClick={() => {
                        if (!disableButton) {
                          setSelectedUser(user);
                          setModalActionType(user.role === "user" ? "promote" : "demote");
                          setShowUserModal(true);
                        }
                      }}
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
    </div>
    );
  };

  // Render Content (Tutorials/Announcements/Pages)
  const renderContent = () => {
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
          <button
            className="btn"
            style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
            onClick={openCreateContent}
          >
            <i className="fas fa-plus me-2"></i>
            Create New
          </button>
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
              <table className="table mb-0" style={{ backgroundColor: "var(--secondary-color)" }}>
                <thead style={{ backgroundColor: "var(--accent-color)" }}>
                  <tr>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Title</th>
                    {activeTab === "tutorials" && <th style={{ color: "var(--primary-color)", padding: "12px" }}>Category</th>}
                    {activeTab === "tutorials" && <th style={{ color: "var(--primary-color)", padding: "12px" }}>Creator</th>}
                    {activeTab === "pages" && <th style={{ color: "var(--primary-color)", padding: "12px" }}>Slug</th>}
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Status</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Created</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {content.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--accent-color)" }}>
                      <td style={{ color: "var(--text-color)", padding: "12px" }}>
                        {item.title}
                        {item.featured && <span className="badge bg-warning ms-2">Featured</span>}
                      </td>
                      {activeTab === "tutorials" && <td style={{ color: "var(--text-color)", padding: "12px" }}>{item.category}</td>}
                      {activeTab === "tutorials" && (
                        <td style={{ color: "var(--text-color)", padding: "12px" }}>
                          <small>{item.creatorEmail || "N/A"}</small>
                        </td>
                      )}
                      {activeTab === "pages" && <td style={{ color: "var(--text-color)", padding: "12px" }}>/page/{item.slug}</td>}
                      <td style={{ padding: "12px" }}>
                        <span 
                          className={`badge ${item.status === "published" ? "bg-success" : "bg-secondary"}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleContentStatus(item)}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-color)", padding: "12px" }}>
                        {item.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button 
                          className="btn btn-sm me-2"
                          style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
                          onClick={() => openEditContent(item)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {activeTab === "tutorials" && (
                          <button 
                            className="btn btn-sm me-2"
                            style={{ backgroundColor: "var(--info-color)", color: "var(--white-color)" }}
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
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteContent(item)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Announcements (System Communications)
  const renderAnnouncements = () => {
    const totalAnnouncements = announcements.length;
    const publishedCount = announcements.filter(a => a.status === "published").length;
    const draftCount = announcements.filter(a => a.status === "draft").length;
    const featuredCount = announcements.filter(a => a.featured).length;

    return (
      <div style={{
        marginLeft: 0,
        padding: "2%",
        background: "var(--background-color)",
        minHeight: "100vh",
        width: "100%",
        color: "var(--text-color)",
        display: "block",
        textAlign: "left"
      }}>
        {/* Summary Section */}
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
            <h2 style={{ color: "var(--text-color)", marginBottom: "0" }}>{totalAnnouncements}</h2>
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
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="fw-bold mb-0" style={{ color: "var(--text-color)" }}>
            <i className="fas fa-bullhorn me-2" style={{ color: "var(--accent-color)" }}></i>
            System Announcements
          </h2>
          <button
            className="btn"
            style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
            onClick={openCreateContent}
          >
            <i className="fas fa-plus me-2"></i>
            New Announcement
          </button>
        </div>

        {/* Announcements Table */}
        <div className="rounded" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", overflow: "hidden" }}>
          {announcements.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-bullhorn fa-3x mb-3" style={{ color: "var(--accent-color)", opacity: 0.5 }}></i>
              <p style={{ color: "var(--text-color)" }}>No announcements yet. Create one to notify users!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0" style={{ backgroundColor: "var(--secondary-color)" }}>
                <thead style={{ backgroundColor: "var(--accent-color)" }}>
                  <tr>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Title</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Featured</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Status</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Created</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--accent-color)" }}>
                      <td style={{ color: "var(--text-color)", padding: "12px" }}>
                        <strong>{item.title}</strong>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: item.featured ? "#ffc107" : "#555",
                            color: item.featured ? "#000" : "#fff"
                          }}
                        >
                          {item.featured ? "Yes" : "No"}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: item.status === "published" ? "#28a745" : "#6c757d",
                            color: "white",
                            cursor: "pointer"
                          }}
                          onClick={() => toggleContentStatus(item)}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-color)", padding: "12px" }}>
                        {item.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button 
                          className="btn btn-sm me-2"
                          style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
                          onClick={() => openEditContent(item)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm me-2"
                          style={{ 
                            backgroundColor: item.featured ? "#dc3545" : "#ffc107", 
                            color: "#000",
                            border: "none"
                          }}
                          title={item.featured ? "Unfeatured" : "Feature"}
                        >
                          <i className={`fas fa-${item.featured ? "star" : "star"}`}></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteContent(item)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Reviews (Quality Control & Moderation)
  const renderReviews = () => {
    const totalReviews = reviews.length;
    const fiveStarCount = reviews.filter(r => r.rating === 5).length;
    const averageRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1) : 0;
    const pendingReviews = reviews.filter(r => !r.approved).length;

    return (
      <div style={{
        marginLeft: 0,
        padding: "2%",
        background: "var(--background-color)",
        minHeight: "100vh",
        width: "100%",
        color: "var(--text-color)",
        display: "block",
        textAlign: "left"
      }}>
        {/* Summary Section - 4 Cards */}
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
            <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem" }}>Total Reviews</h6>
            <h2 style={{ color: "var(--text-color)", marginBottom: "0" }}>{totalReviews}</h2>
          </div>
          <div style={{ 
            flex: 1, 
            minWidth: "180px",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "1px solid #ffc107"
          }}>
            <h6 style={{ color: "#ffc107", marginBottom: "0.5rem" }}>Avg Rating</h6>
            <h2 style={{ color: "#ffc107", marginBottom: "0" }}>{averageRating} ⭐</h2>
          </div>
          <div style={{ 
            flex: 1, 
            minWidth: "180px",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "1px solid #28a745"
          }}>
            <h6 style={{ color: "#28a745", marginBottom: "0.5rem" }}>5-Star Reviews</h6>
            <h2 style={{ color: "#28a745", marginBottom: "0" }}>{fiveStarCount}</h2>
          </div>
          <div style={{ 
            flex: 1, 
            minWidth: "180px",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "var(--secondary-color)", 
            border: "1px solid var(--info-color)"
          }}>
            <h6 style={{ color: "var(--info-color)", marginBottom: "0.5rem" }}>Pending Review</h6>
            <h2 style={{ color: "var(--info-color)", marginBottom: "0" }}>{pendingReviews}</h2>
          </div>
        </div>

        {/* Title */}
        <h2 className="fw-bold mb-4" style={{ color: "var(--text-color)" }}>
          <i className="fas fa-star me-2" style={{ color: "var(--accent-color)" }}></i>
          User Reviews & Feedback
        </h2>

        {/* Reviews Table */}
        <div className="rounded" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)", overflow: "hidden" }}>
          {reviews.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-star fa-3x mb-3" style={{ color: "var(--accent-color)", opacity: 0.5 }}></i>
              <p style={{ color: "var(--text-color)" }}>No reviews yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0" style={{ backgroundColor: "var(--secondary-color)" }}>
                <thead style={{ backgroundColor: "var(--accent-color)" }}>
                  <tr>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>User</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Content</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Rating</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Feedback</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Date</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Status</th>
                    <th style={{ color: "var(--primary-color)", padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} style={{ borderBottom: "1px solid var(--accent-color)" }}>
                      <td style={{ color: "var(--text-color)", padding: "12px" }}>
                        {review.userName || review.userEmail || "Anonymous"}
                      </td>
                      <td style={{ color: "var(--text-color)", padding: "12px" }}>
                        {review.contentTitle || "N/A"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <i 
                              key={i} 
                              className="fas fa-star"
                              style={{ color: i < review.rating ? "var(--accent-color)" : "#555" }}
                            ></i>
                          ))}
                        </div>
                      </td>
                      <td style={{ color: "var(--text-color)", padding: "12px", maxWidth: "250px" }}>
                        <small>{review.feedback?.slice(0, 50)}...</small>
                      </td>
                      <td style={{ color: "var(--text-color)", padding: "12px" }}>
                        {review.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: review.approved ? "#28a745" : "var(--neutral-color)",
                            color: "white",
                            padding: "6px 10px"
                          }}
                        >
                          {review.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button 
                          className="btn btn-sm me-2"
                          title="View Full Review"
                          style={{ backgroundColor: "var(--info-color)", color: "white", border: "none" }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-sm me-2"
                          title={review.approved ? "Unapprove" : "Approve"}
                          style={{ 
                            backgroundColor: review.approved ? "#dc3545" : "#28a745", 
                            color: "white",
                            border: "none"
                          }}
                        >
                          <i className={`fas fa-${review.approved ? "ban" : "check"}`}></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Content Editor Modal
  const renderContentModal = () => {
    if (!showContentModal) return null;
    const config = CONTENT_TYPES[activeTab];
    if (!config) return null;

    return (
      <div 
        className="modal show d-block" 
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={(e) => e.target === e.currentTarget && setShowContentModal(false)}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
            <div className="modal-header" style={{ borderBottom: "1px solid var(--accent-color)" }}>
              <h5 className="modal-title" style={{ color: "var(--text-color)" }}>
                {editingItem ? "Edit" : "Create"} {activeTab.slice(0, -1)}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowContentModal(false)}></button>
            </div>
            
            <div className="modal-body">
              {/* Title */}
              <div className="mb-3">
                <label className="form-label" style={{ color: "var(--text-color)" }}>Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                />
              </div>

              {/* Category (tutorials) */}
              {config.fields.includes("category") && config.categories.length > 0 && (
                <div className="mb-3">
                  <label className="form-label" style={{ color: "var(--text-color)" }}>Category</label>
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
                  <label className="form-label" style={{ color: "var(--text-color)" }}>URL Slug</label>
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
                  <label className="form-label" style={{ color: "var(--text-color)" }}>Excerpt</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="mb-3">
                <label className="form-label" style={{ color: "var(--text-color)" }}>Content</label>
                <div className="mb-2">
                  <div className="btn-group btn-group-sm">
                    {[
                      { icon: "bold", insert: (t, s, e) => `${t.slice(0, s)}**${t.slice(s, e)}**${t.slice(e)}` },
                      { icon: "italic", insert: (t, s, e) => `${t.slice(0, s)}*${t.slice(s, e)}*${t.slice(e)}` },
                      { icon: "heading", insert: (t) => `${t}\n## Heading\n` },
                      { icon: "list", insert: (t) => `${t}\n- List item\n` },
                      { icon: "link", insert: (t) => `${t}\n[Link](https://example.com)\n` },
                    ].map(({ icon, insert }) => (
                      <button 
                        key={icon}
                        type="button" 
                        className="btn"
                        style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
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
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write content... (Markdown supported)"
                  style={{ backgroundColor: "var(--primary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)", fontFamily: "monospace" }}
                />
              </div>

              {/* Thumbnail */}
              {config.fields.includes("thumbnail") && (
                <div className="mb-3">
                  <label className="form-label" style={{ color: "var(--text-color)" }}>Thumbnail URL</label>
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
                  <label className="form-label" style={{ color: "var(--text-color)" }}>Tags (comma-separated)</label>
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

              {/* Status */}
              <div className="mb-3">
                <label className="form-label" style={{ color: "var(--text-color)" }}>Status</label>
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

              {/* Featured */}
              {config.fields.includes("featured") && (
                <div className="form-check mb-3">
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
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: "1px solid var(--accent-color)" }}>
              <button 
                type="button" 
                className="btn"
                style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                onClick={() => setShowContentModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn"
                style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
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

    return (
      (() => {
        switch (activeTab) {
          case "dashboard": return renderDashboard();
          case "users": return renderUsers();
          case "tutorials": return renderContent();
          case "announcements": return renderAnnouncements();
          case "pages": return renderContent();
          case "reviews": return renderReviews();
          default: return renderDashboard();
        }
      })()
    );
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
        
        {renderMainContent()}
      </main>

      {renderContentModal()}
      {renderUserModal()}
      {renderMessageModal()}
    </div>
  );
}
