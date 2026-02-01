// ProfessionalProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; // placeholder only
import { auth } from "./firebase"; // placeholder only

import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaBars,
  FaTachometerAlt,
  FaPlusCircle,
  FaEdit,
  FaChartBar,
  FaUsers,
  FaCommentDots,
  FaClipboardList,
  FaUserCog,
  FaSearch,
  FaRegBookmark,
  FaBookmark,
  FaThumbsUp,
  FaShare,
  FaArrowLeft,
} from "react-icons/fa";

import "./FactCheckerDashboard.css";

export default function ProfessionalProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // ---------------- AUTH GUARD ----------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsub();
  }, [navigate]);

  // ---------------- UTIL ----------------
  const load = (key, fallback) => {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    if (v) return v;
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  };

  const save = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // ---------------- PROFILE ----------------
  const [profile] = useState(() =>
    load("pro_profile_v4", {
      pro_id: "prof-100",
      displayName: "Dr. Jane Analyst",
      caption: "Fact-checker • Media Forensics • Educator",
      avatarUrl: "",
    })
  );

  // ---------------- CONTENT ----------------
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
    // Sample bookmarked post
    {
      type: "post",
      id: "post-101",
      author: "Dr. Jane Analyst",
      time: "Jan 24, 2026",
      content: "Understanding the basics of media forensics and fact-checking.",
    },
    // Sample bookmarked review
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


  // ---------------- TABS ----------------
  const [activeTab, setActiveTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState("");

  // ---------------- MESSAGING ----------------
  const [conversations, setConversations] = useState(() =>
    load("messages_v4", [{ id: "admin", name: "System Admin", messages: [] }])
  );
  const [activeConversationId, setActiveConversationId] = useState("admin");
  const [newMessage, setNewMessage] = useState("");
  const [addContactInput, setAddContactInput] = useState("");

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

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

  // ---------------- BOOKMARK ----------------
  const toggleBookmark = (type, id) => {
    if (type === "post") {
      const updated = posts.map((p) =>
        p.id === id ? { ...p, bookmarked: !p.bookmarked } : p
      );
      setPosts(updated);
      save("posts_v4", updated);

      const postItem = posts.find((p) => p.id === id);
      if (postItem.bookmarked) {
        setBookmarks(bookmarks.filter((b) => b.id !== id));
      } else {
        setBookmarks([...bookmarks, { ...postItem, type: "post" }]);
      }
      save("bookmarks_v4", bookmarks);
    } else if (type === "review") {
      const updated = reviews.map((r) =>
        r.id === id ? { ...r, bookmarked: !r.bookmarked } : r
      );
      setReviews(updated);
      save("reviews_v4", updated);

      const revItem = reviews.find((r) => r.id === id);
      if (revItem.bookmarked) {
        setBookmarks(bookmarks.filter((b) => b.id !== id));
      } else {
        setBookmarks([...bookmarks, { ...revItem, type: "review" }]);
      }
      save("bookmarks_v4", bookmarks);
    }
  };

  const removeBookmark = (id) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
    save("bookmarks_v4", bookmarks);

    setPosts(posts.map((p) => (p.id === id ? { ...p, bookmarked: false } : p)));
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, bookmarked: false } : r))
    );
    save("posts_v4", posts);
    save("reviews_v4", reviews);
  };

  // ---------------- FILTERING ----------------
  const items = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === "posts") return posts.filter((p) => p.content.toLowerCase().includes(q));
    if (activeTab === "reviews") return reviews.filter((r) => r.comment.toLowerCase().includes(q));
    if (activeTab === "bookmarks") return bookmarks.filter((b) => (b.content || b.comment).toLowerCase().includes(q));
    return [];
  }, [activeTab, posts, reviews, bookmarks, searchQuery]);

  // ---------------- UI ----------------
  return (
    <div className="d-flex" style={{ paddingTop: 56 }}>
      {/* SIDEBAR */}
      <div
        className="d-flex flex-column p-3 border-end"
        style={{
          width: collapsed ? "80px" : "250px",
          backgroundColor: "#d9d9d9",
          transition: "width 0.3s ease",
          height: "calc(100vh - 56px)",
          position: "fixed",
          top: "56px",
          left: 0,
          overflowY: "auto",
          zIndex: 900
        }}
      >
        <button className="btn btn-outline-dark btn-sm mb-3" 
        onClick={() => setCollapsed(!collapsed)} style={{ border: "none" }}>
          <FaBars />
        </button>

        <ul className="nav flex-column">
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/factcheckerdashboard")}>
              <FaTachometerAlt className="me-2" />
              {!collapsed && "Dashboard"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/create-tutorial")}>
              <FaPlusCircle className="me-2" />
              {!collapsed && "Create Tutorial"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/manage-tutorial")}>
              <FaEdit className="me-2" />
              {!collapsed && "Manage Tutorial"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/reports")}>
              <FaChartBar className="me-2" />
              {!collapsed && "Organized Reports"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/linked-users")}>
              <FaUsers className="me-2" />
              {!collapsed && "Linked Users"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/user-feedback")}>
              <FaCommentDots className="me-2" />
              {!collapsed && "User Feedback"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/verification-logs")}>
              <FaClipboardList className="me-2" />
              {!collapsed && "Verification Logs"}
            </button>
          </li>

          <li>
            <button 
              className={`btn sidebar-btn text-start ${location.pathname === "/professional/profile" ? "active" : ""}`}
              onClick={() => location.pathname !== "/professional/profile" && navigate("/professional/profile")}
              disabled={location.pathname === "/professional/profile"}
            >
              <FaUserCog className="me-2" />
              {!collapsed && "Profile"}
            </button>
          </li>

          {/* Go Back to Analysis Page */}
          <li className="mt-4 border-top pt-2">
            <button
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/analysis")}
            >
              <FaArrowLeft className="me-2" />
              {!collapsed && "Go Back to Analysis Page"}
            </button>
          </li>
        </ul>

        {!collapsed && <div className="mt-auto small text-muted">Verified professionals workspace</div>}
      </div>

      {/* MAIN */}
      <div className="flex-grow-1" style={{ marginLeft: collapsed ? 80 : 250 }}>
        {/* TOP BAR */}
        <nav className="navbar bg-white shadow-sm px-4">
          {activeTab !== "messages" && (
            <div style={{ width: 360 }}>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
        </nav>

        <div className="container-fluid p-4">
          {/* PROFILE HEADER */}
          <div className="card shadow-sm mb-4 p-4">
            <div className="d-flex align-items-center gap-4">
              <img
                src={profile.avatarUrl || "https://via.placeholder.com/120"}
                alt="avatar"
                className="rounded-circle"
                width={120}
                height={120}
              />
              <div>
                <h4 className="mb-1">{profile.displayName}</h4>
                <div className="text-muted">{profile.caption}</div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <ul className="nav nav-pills mb-4">
            {["posts", "messages", "reviews", "bookmarks"].map((t) => (
              <li key={t} className="nav-item">
                <button className={`nav-link ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              </li>
            ))}
          </ul>

          {/* CONTENT */}
          {activeTab === "messages" ? (
            <div className="row" style={{ minHeight: 450 }}>
              <div className="col-md-4 border-end">
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
                />
                <ul className="list-group">
                  {conversations.map((c) => (
                    <li
                      key={c.id}
                      className={`list-group-item ${c.id === activeConversationId ? "active" : ""}`}
                      onClick={() => setActiveConversationId(c.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {c.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-md-8 d-flex flex-column">
                <div className="flex-grow-1 border rounded p-3 mb-2 bg-light overflow-auto">
                  {activeConversation?.messages.map((m, i) => (
                    <div key={i} className="mb-2">
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
                  />
                  <button className="btn btn-primary" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {items.length === 0 ? (
                <div className="text-muted text-center py-5">No content available.</div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="col-md-6 mb-3">
                    <div className="card shadow-sm p-3">
                      <div className="d-flex justify-content-between mb-2">
                        <strong>{item.author || item.reviewer}</strong>
                        <button
                          className="btn btn-link p-0"
                          onClick={() =>
                            item.type === "post"
                              ? toggleBookmark("post", item.id)
                              : item.type === "review"
                              ? toggleBookmark("review", item.id)
                              : null
                          }
                        >
                          {item.bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                        </button>
                      </div>
                      <div className="mb-2">{item.content || item.comment}</div>
                      <small className="text-muted">{item.time || item.tutorial}</small>
                      {(item.type === "post" || activeTab === "posts") && (
                        <div className="d-flex gap-3 mt-2">
                          <button className="btn btn-sm btn-outline-primary">
                            <FaThumbsUp /> Like
                          </button>
                          <button className="btn btn-sm btn-outline-secondary">
                            <FaCommentDots /> Comment
                          </button>
                          <button className="btn btn-sm btn-outline-success">
                            <FaShare /> Share
                          </button>
                        </div>
                      )}
                      {activeTab === "bookmarks" && (
                        <div className="mt-2 text-end">
                          <button className="btn btn-sm btn-danger" onClick={() => removeBookmark(item.id)}>
                            Remove Bookmark
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sidebar-btn {
          background: none;
          border: none;
          color: #000;
          padding: 10px 12px;
          border-radius: 5px;
          width: 100%;
          text-align: left;
          font-weight: 500;
        }
        .sidebar-btn:hover {
          background-color: #000;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
