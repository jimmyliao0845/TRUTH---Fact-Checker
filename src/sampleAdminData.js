/**
 * Sample Data for AdminPanel Testing
 * Provides mock data for all sections: Users, Tutorials, Reviews, Announcements, Pages
 * Each section has 10 sample items for consistent display
 */

// Helper to create timestamp
const createTimestamp = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000)
  };
};

/**
 * USERS - 10 Sample Users
 */
export const SAMPLE_USERS = [
  {
    id: "user1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "admin",
    status: "active",
    joinedDate: createTimestamp(120),
    lastActive: createTimestamp(0),
    avatar: "AJ",
    credibility: 98
  },
  {
    id: "user2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    role: "professional",
    status: "active",
    joinedDate: createTimestamp(90),
    lastActive: createTimestamp(1),
    avatar: "BS",
    credibility: 87
  },
  {
    id: "user3",
    name: "Carol Davis",
    email: "carol.davis@example.com",
    role: "user",
    status: "active",
    joinedDate: createTimestamp(60),
    lastActive: createTimestamp(2),
    avatar: "CD",
    credibility: 72
  },
  {
    id: "user4",
    name: "David Wilson",
    email: "david.wilson@example.com",
    role: "professional",
    status: "active",
    joinedDate: createTimestamp(45),
    lastActive: createTimestamp(3),
    avatar: "DW",
    credibility: 91
  },
  {
    id: "user5",
    name: "Emma Brown",
    email: "emma.brown@example.com",
    role: "user",
    status: "active",
    joinedDate: createTimestamp(30),
    lastActive: createTimestamp(0),
    avatar: "EB",
    credibility: 65
  },
  {
    id: "user6",
    name: "Frank Martinez",
    email: "frank.martinez@example.com",
    role: "user",
    status: "inactive",
    joinedDate: createTimestamp(200),
    lastActive: createTimestamp(45),
    avatar: "FM",
    credibility: 58
  },
  {
    id: "user7",
    name: "Grace Lee",
    email: "grace.lee@example.com",
    role: "professional",
    status: "active",
    joinedDate: createTimestamp(75),
    lastActive: createTimestamp(1),
    avatar: "GL",
    credibility: 89
  },
  {
    id: "user8",
    name: "Henry Taylor",
    email: "henry.taylor@example.com",
    role: "user",
    status: "active",
    joinedDate: createTimestamp(15),
    lastActive: createTimestamp(0),
    avatar: "HT",
    credibility: 70
  },
  {
    id: "user9",
    name: "Iris Anderson",
    email: "iris.anderson@example.com",
    role: "user",
    status: "banned",
    joinedDate: createTimestamp(180),
    lastActive: createTimestamp(120),
    avatar: "IA",
    credibility: 25
  },
  {
    id: "user10",
    name: "Jack Thompson",
    email: "jack.thompson@example.com",
    role: "professional",
    status: "active",
    joinedDate: createTimestamp(50),
    lastActive: createTimestamp(2),
    avatar: "JT",
    credibility: 86
  }
];

/**
 * TUTORIALS - 10 Sample Tutorials
 */
export const SAMPLE_TUTORIALS = [
  {
    id: "game-1",
    title: "Spot the Deepfake Face",
    description: "Learn to identify AI-generated faces and deepfake videos using visual analysis techniques.",
    category: "image",
    difficulty: "beginner",
    duration: "15 mins",
    thumbnail: "🎬",
    maker: "alice.johnson@example.com",
    creatorEmail: "alice.johnson@example.com",
    creatorId: "user1",
    status: "published",
    featured: true,
    rating: 4.8,
    views: 2340,
    players: 542,
    excerpt: "Identify AI-generated faces and deepfake videos",
    questions: [
      {
        text: "Which face is AI-generated in this image?",
        image: "https://via.placeholder.com/400x300?text=Face+Analysis",
        imageUrl: "https://via.placeholder.com/400x300?text=Face+Analysis",
        contentType: "image",
        options: ["Left face", "Right face", "Both are AI", "Neither is AI"],
        correct: 0,
        explanation: "The left face shows pixel artifacts typical of AI generation algorithms."
      },
      {
        text: "What is a common indicator of deepfake videos?",
        contentType: "text",
        options: ["Natural blinking", "Unnatural eye movements", "Consistent lighting", "Clear audio"],
        correct: 1,
        explanation: "Deepfakes often have irregular blinking patterns and unnatural eye movements."
      },
      {
        text: "This video shows which type of manipulation?",
        image: "https://via.placeholder.com/400x300?text=Video+Frame",
        imageUrl: "https://via.placeholder.com/400x300?text=Video+Frame",
        contentType: "image",
        options: ["Face swap", "Expression synthesis", "Voice changing", "Background replacement"],
        correct: 0,
        explanation: "The facial features and expressions show characteristics of face swap technology."
      }
    ],
    createdAt: createTimestamp(30),
    tags: ["Deepfake", "Image Analysis", "Facial Recognition"]
  },
  {
    id: "game-2",
    title: "Misinformation Detection Challenge",
    description: "Test your ability to identify misleading headlines, false claims, and manipulated statistics.",
    category: "text",
    difficulty: "intermediate",
    duration: "20 mins",
    thumbnail: "📰",
    maker: "bob.smith@example.com",
    creatorEmail: "bob.smith@example.com",
    creatorId: "user2",
    status: "published",
    featured: true,
    rating: 4.6,
    views: 1890,
    players: 423,
    excerpt: "Identify misleading headlines and false claims",
    questions: [
      {
        text: "Is this headline accurate? 'New Study Shows Coffee Extends Life by 50 Years'",
        contentType: "text",
        options: ["Yes, accurate", "No, misleading", "Partially true", "Unverifiable"],
        correct: 1,
        explanation: "This is misleading. No credible study claims such a dramatic effect."
      },
      {
        text: "Which claim needs fact-checking?",
        contentType: "text",
        options: ["The Earth orbits the Sun", "Vaccines cause autism", "COVID-19 is real", "Water boils at 100°C"],
        correct: 1,
        explanation: "The vaccines-autism claim has been thoroughly debunked by scientific research."
      },
      {
        text: "Identify the statistical manipulation in this data.",
        contentType: "text",
        options: ["Shows real percentages", "Starts Y-axis at non-zero", "Uses proper scaling", "Peer reviewed"],
        correct: 1,
        explanation: "Starting a chart's Y-axis at non-zero can exaggerate differences and mislead viewers."
      }
    ],
    createdAt: createTimestamp(25),
    tags: ["Fact-Checking", "Misinformation", "Critical Thinking"]
  },
  {
    id: "game-3",
    title: "Media Forensics: Audio Analysis",
    description: "Master techniques to detect voice manipulation, audio splicing, and synthetic speech.",
    category: "audio",
    difficulty: "advanced",
    duration: "25 mins",
    thumbnail: "🎙️",
    maker: "carol.davis@example.com",
    creatorEmail: "carol.davis@example.com",
    creatorId: "user3",
    status: "published",
    featured: false,
    rating: 4.9,
    views: 1650,
    players: 187,
    excerpt: "Detect voice manipulation and synthetic speech",
    questions: [
      {
        text: "This audio clip contains which type of manipulation?",
        contentType: "audio",
        options: ["Voice cloning", "Audio splicing", "Natural speech", "Pitch shifting only"],
        correct: 0,
        explanation: "The artifacts suggest advanced voice cloning technology was used."
      },
      {
        text: "What frequency range indicates synthetic speech?",
        contentType: "text",
        options: ["100-500 Hz", "500-2000 Hz", "Unusual harmonic patterns", "All ranges are natural"],
        correct: 2,
        explanation: "Synthetic speech often shows unusual or missing harmonic patterns."
      },
      {
        text: "Identify the genuine segment in this composite audio.",
        contentType: "audio",
        options: ["First 5 seconds", "Middle section", "Last 10 seconds", "Cannot determine"],
        correct: 1,
        explanation: "The middle section shows consistent human voice characteristics."
      }
    ],
    createdAt: createTimestamp(20),
    tags: ["Audio Analysis", "Voice Cloning", "Digital Forensics"]
  },
  {
    id: "game-4",
    title: "Video Manipulation Detection",
    description: "Learn to spot edited footage, context manipulation, and out-of-order video sequences.",
    category: "video",
    difficulty: "intermediate",
    duration: "18 mins",
    thumbnail: "🎬",
    maker: "david.wilson@example.com",
    creatorEmail: "david.wilson@example.com",
    creatorId: "user4",
    status: "published",
    featured: true,
    rating: 4.7,
    views: 2100,
    players: 612,
    excerpt: "Spot edited footage and context manipulation",
    questions: [
      {
        text: "What editing technique is evident in this video segment?",
        contentType: "video",
        options: ["Speed manipulation", "Frame deletion", "Color grading", "Volume adjustment"],
        correct: 1,
        explanation: "Several frames appear to be deleted, causing unnatural motion jumps."
      },
      {
        text: "Is this video sequence showing accurate chronological context?",
        contentType: "video",
        options: ["Yes, accurate order", "No, scenes are reordered", "Cannot determine", "Partially accurate"],
        correct: 1,
        explanation: "The scenes are presented out of chronological order to change context."
      },
      {
        text: "Identify the green screen artifacts in this clip.",
        contentType: "video",
        options: ["Edge fringing", "Color bleeding", "Both visible", "No artifacts present"],
        correct: 2,
        explanation: "Both edge fringing and color bleeding are visible, indicating poor green screen work."
      }
    ],
    createdAt: createTimestamp(35),
    tags: ["Video Analysis", "Editing Detection", "Context Verification"]
  },
  {
    id: "game-5",
    title: "Mixed Media Investigation",
    description: "Combine multiple forensic techniques to investigate complex misinformation with image, text, and data.",
    category: "mixed",
    difficulty: "advanced",
    duration: "30 mins",
    thumbnail: "🎯",
    maker: "grace.lee@example.com",
    creatorEmail: "grace.lee@example.com",
    creatorId: "user7",
    status: "published",
    featured: false,
    rating: 4.3,
    views: 1420,
    players: 298,
    excerpt: "Complex investigation combining multiple forensic techniques",
    questions: [
      {
        text: "Based on the image, headline, and metadata, what is manipulated?",
        contentType: "text",
        image: "https://via.placeholder.com/400x300?text=Composite+Media",
        imageUrl: "https://via.placeholder.com/400x300?text=Composite+Media",
        options: ["Image only", "Text only", "Both image and text", "Only metadata"],
        correct: 2,
        explanation: "Both the image (deepfaked) and the headline (misleading) show manipulation."
      },
      {
        text: "What is the primary misinformation technique here?",
        contentType: "text",
        options: ["Out of context", "Fabricated", "Misleading statistics", "All of above"],
        correct: 3,
        explanation: "This complex case involves all three misinformation techniques combined."
      },
      {
        text: "Which verification source would be most helpful?",
        contentType: "text",
        options: ["Reverse image search", "Fact-checking website", "Source verification", "All equally important"],
        correct: 3,
        explanation: "A comprehensive investigation requires multiple verification methods."
      }
    ],
    createdAt: createTimestamp(40),
    tags: ["Complex Investigation", "Forensics", "Multi-media"]
  },
  {
    id: "game-6",
    title: "Social Media Verification",
    description: "Verify claims, check sources, and identify manipulated content on social platforms.",
    category: "text",
    difficulty: "beginner",
    duration: "12 mins",
    thumbnail: "📱",
    maker: "jack.thompson@example.com",
    creatorEmail: "jack.thompson@example.com",
    creatorId: "user10",
    status: "published",
    featured: false,
    rating: 4.4,
    views: 890,
    players: 156,
    excerpt: "Verify social media claims and identify manipulation",
    questions: [
      {
        text: "Is this Twitter claim credible?",
        contentType: "text",
        options: ["Yes, verified source", "No, unverified account", "Need more context", "Partially true"],
        correct: 1,
        explanation: "The account lacks verification badge and has minimal engagement history."
      },
      {
        text: "What red flag indicates potential misinformation?",
        contentType: "text",
        options: ["Emotional language", "No sources cited", "Urgent tone", "All of above"],
        correct: 3,
        explanation: "All these elements are common indicators of misinformation on social media."
      },
      {
        text: "How would you verify this viral claim?",
        contentType: "text",
        options: ["Check official sources", "Reverse image search", "Cross-reference multiple outlets", "All methods"],
        correct: 3,
        explanation: "Comprehensive verification requires checking multiple sources and tools."
      }
    ],
    createdAt: createTimestamp(15),
    tags: ["Social Media", "Verification", "Rumor Debunking"]
  },
  {
    id: "game-7",
    title: "Advanced Deepfake Detection",
    description: "Master advanced techniques to detect state-of-the-art deepfakes and facial reenactments.",
    category: "image",
    difficulty: "advanced",
    duration: "28 mins",
    thumbnail: "🖼️",
    maker: "alice.johnson@example.com",
    creatorEmail: "alice.johnson@example.com",
    creatorId: "user1",
    status: "draft",
    featured: false,
    rating: 0,
    views: 234,
    players: 0,
    excerpt: "Advanced deepfake detection techniques",
    questions: [
      {
        text: "Identify the deepfake method used in this image.",
        image: "https://via.placeholder.com/400x300?text=Advanced+Deepfake",
        imageUrl: "https://via.placeholder.com/400x300?text=Advanced+Deepfake",
        contentType: "image",
        options: ["StyleGAN", "First-Order Motion", "Face2Face", "All possible"],
        correct: 3,
        explanation: "This shows characteristics consistent with StyleGAN generation."
      },
      {
        text: "What eye reflection artifact is visible?",
        contentType: "text",
        options: ["Unusual specular highlights", "Missing catchlight", "Distorted iris", "All present"],
        correct: 0,
        explanation: "The eye reflection shows unnatural highlights indicating AI generation."
      },
      {
        text: "Analyze the facial structure anomalies.",
        contentType: "text",
        options: ["Asymmetrical features", "Skin texture inconsistencies", "Jaw line artifacts", "All visible"],
        correct: 3,
        explanation: "Multiple structural anomalies are present indicating advanced deepfake."
      }
    ],
    createdAt: createTimestamp(10),
    tags: ["Deepfake", "Advanced Analysis", "AI Detection"]
  },
  {
    id: "game-8",
    title: "Fact-Checking Data & Statistics",
    description: "Learn to identify statistical manipulation, cherry-picking, and misleading data visualization.",
    category: "text",
    difficulty: "intermediate",
    duration: "22 mins",
    thumbnail: "📊",
    maker: "bob.smith@example.com",
    creatorEmail: "bob.smith@example.com",
    creatorId: "user2",
    status: "published",
    featured: true,
    rating: 4.5,
    views: 1780,
    players: 389,
    excerpt: "Identify statistical manipulation and misleading data",
    questions: [
      {
        text: "What is wrong with this statistics presentation?",
        contentType: "text",
        options: ["Incomplete dataset", "Wrong scale used", "Biased sample", "All issues present"],
        correct: 3,
        explanation: "The data shows multiple manipulation techniques simultaneously."
      },
      {
        text: "Identify the cherry-picked timeframe in this claim.",
        contentType: "text",
        options: ["1-year window", "5-year window", "Selected high points only", "Full data shown"],
        correct: 2,
        explanation: "Only the highest data points were selected to support a false narrative."
      },
      {
        text: "What context is missing from this stat?",
        contentType: "text",
        options: ["Sample size", "Time period", "Comparison baseline", "All crucial"],
        correct: 3,
        explanation: "All these elements are essential for accurate statistical interpretation."
      }
    ],
    createdAt: createTimestamp(50),
    tags: ["Data Analysis", "Statistics", "Fact-Checking"]
  },
  {
    id: "game-9",
    title: "Image Manipulation Basics",
    description: "Learn fundamental techniques to spot photoshopped images and edited pictures.",
    category: "image",
    difficulty: "beginner",
    duration: "14 mins",
    thumbnail: "📸",
    maker: "carol.davis@example.com",
    creatorEmail: "carol.davis@example.com",
    creatorId: "user3",
    status: "published",
    featured: false,
    rating: 4.7,
    views: 2567,
    players: 478,
    excerpt: "Spot photoshopped and edited images",
    questions: [
      {
        text: "Which part of this image appears edited?",
        image: "https://via.placeholder.com/400x300?text=Edited+Image",
        imageUrl: "https://via.placeholder.com/400x300?text=Edited+Image",
        contentType: "image",
        options: ["Background", "Subject edges", "Lighting shadows", "Text overlay"],
        correct: 1,
        explanation: "The background subject edges show poor blending typical of basic editing."
      },
      {
        text: "What is a telltale sign of image manipulation?",
        contentType: "text",
        options: ["Inconsistent shadows", "Wrong perspective", "Unnatural colors", "All indicators"],
        correct: 3,
        explanation: "Professional verification checks multiple consistency indicators."
      },
      {
        text: "How would you verify this image authenticity?",
        contentType: "text",
        options: ["Reverse search", "Metadata check", "Forensic tools", "All methods"],
        correct: 3,
        explanation: "Comprehensive image verification uses all available tools."
      }
    ],
    createdAt: createTimestamp(55),
    tags: ["Image Forensics", "Photoshop", "Verification"]
  },
  {
    id: "game-10",
    title: "Claims Verification Framework",
    description: "Master systematic claim-checking using multiple verification methods and reliable sources.",
    category: "text",
    difficulty: "advanced",
    duration: "26 mins",
    thumbnail: "✓",
    maker: "grace.lee@example.com",
    creatorEmail: "grace.lee@example.com",
    creatorId: "user7",
    status: "published",
    featured: true,
    rating: 4.2,
    views: 1420,
    players: 267,
    excerpt: "Systematic framework for claim verification",
    questions: [
      {
        text: "What is the first step in verifying a viral claim?",
        contentType: "text",
        options: ["Find supporting evidence", "Check claim authenticity", "Identify source", "All equally"],
        correct: 1,
        explanation: "Always verify the claim is authentic before spending time on evidence."
      },
      {
        text: "Which sources are most reliable for fact-checking?",
        contentType: "text",
        options: ["News websites", "Academic sources", "Primary documents", "All have value"],
        correct: 3,
        explanation: "Different sources provide different types of valuable verification."
      },
      {
        text: "How to handle conflicting information sources?",
        contentType: "text",
        options: ["Choose most popular", "Check original sources", "Verify credentials", "All necessary"],
        correct: 3,
        explanation: "Resolving conflicts requires checking origins and expertise."
      }
    ],
    createdAt: createTimestamp(45),
    tags: ["Verification", "Fact-Checking", "Critical Thinking"]
  }
];

/**
 * REVIEWS - 10 Sample Reviews
 * 6 Tutorial Reviews, 2 System Reviews, 2 Reports
 */
export const SAMPLE_REVIEWS = [
  // Tutorial Reviews (6)
  {
    id: "review1",
    contentType: "tutorial",
    contentTitle: "Introduction to React Hooks",
    contentId: "tut1",
    userName: "Emma Brown",
    userEmail: "emma.brown@example.com",
    rating: 5,
    feedback: "Excellent tutorial! Very clear and easy to follow. Helped me understand hooks perfectly.",
    createdAt: createTimestamp(5),
    isReport: false
  },
  {
    id: "review2",
    contentType: "tutorial",
    contentTitle: "Advanced Python Data Science",
    contentId: "tut2",
    userName: "Henry Taylor",
    userEmail: "henry.taylor@example.com",
    rating: 4,
    feedback: "Great content but could use more real-world examples. Overall very informative.",
    createdAt: createTimestamp(8),
    isReport: false
  },
  {
    id: "review3",
    contentType: "tutorial",
    contentTitle: "Mobile App Design Principles",
    contentId: "tut3",
    userName: "Alice Johnson",
    userEmail: "alice.johnson@example.com",
    rating: 5,
    feedback: "Outstanding design principles explained with great visuals. Highly recommended!",
    createdAt: createTimestamp(3),
    isReport: false
  },
  {
    id: "review4",
    contentType: "tutorial",
    contentTitle: "Cloud Computing with AWS",
    contentId: "tut4",
    userName: "Bob Smith",
    userEmail: "bob.smith@example.com",
    rating: 4,
    feedback: "Good comprehensive guide. Wish there were more hands-on labs included.",
    createdAt: createTimestamp(12),
    isReport: false
  },
  {
    id: "review5",
    contentType: "tutorial",
    contentTitle: "Machine Learning Fundamentals",
    contentId: "tut5",
    userName: "Carol Davis",
    userEmail: "carol.davis@example.com",
    rating: 5,
    feedback: "Best ML tutorial I've found. Clear explanations and excellent code examples!",
    createdAt: createTimestamp(2),
    isReport: false
  },
  {
    id: "review6",
    contentType: "tutorial",
    contentTitle: "TypeScript Best Practices",
    contentId: "tut9",
    userName: "David Wilson",
    userEmail: "david.wilson@example.com",
    rating: 4,
    feedback: "Very helpful. A few sections were complex but overall great overview.",
    createdAt: createTimestamp(7),
    isReport: false
  },
  // System Reviews (2)
  {
    id: "review7",
    contentType: "system",
    contentTitle: null,
    userName: "Grace Lee",
    userEmail: "grace.lee@example.com",
    rating: 5,
    feedback: "The platform is very intuitive and responsive. Great experience overall!",
    createdAt: createTimestamp(4),
    isReport: false
  },
  {
    id: "review8",
    contentType: "system",
    contentTitle: null,
    userName: "Jack Thompson",
    userEmail: "jack.thompson@example.com",
    rating: 4,
    feedback: "Good platform but would like to see better search functionality.",
    createdAt: createTimestamp(10),
    isReport: false
  },
  // Reports (2)
  {
    id: "review9",
    contentType: "report",
    contentTitle: "Mobile App Design Principles",
    contentId: "tut3",
    reportType: "Inappropriate Content",
    userName: "Anonymous User",
    userEmail: "user@example.com",
    rating: 0,
    feedback: "This content contains incorrect information that could mislead users.",
    createdAt: createTimestamp(6),
    isReport: true
  },
  {
    id: "review10",
    contentType: "report",
    contentTitle: "Unknown Tutorial",
    contentId: "unknown",
    reportType: "Spam",
    userName: "Security System",
    userEmail: "admin@truth.com",
    rating: 0,
    feedback: "Detected suspicious user activity and promotional spam.",
    createdAt: createTimestamp(9),
    isReport: true
  }
];

/**
 * ANNOUNCEMENTS - 10 Sample Announcements
 */
export const SAMPLE_ANNOUNCEMENTS = [
  {
    id: "ann1",
    title: "New Feature: Advanced Search",
    content: "We've launched an advanced search feature with filters and sorting capabilities.",
    status: "published",
    featured: true,
    excerpt: "Search your content more effectively",
    createdAt: createTimestamp(2),
    updatedAt: createTimestamp(2),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "ann2",
    title: "Maintenance Notice",
    content: "Platform maintenance scheduled for next Sunday from 2:00 AM to 4:00 AM UTC.",
    status: "published",
    featured: false,
    excerpt: "Scheduled maintenance notification",
    createdAt: createTimestamp(5),
    updatedAt: createTimestamp(5),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "ann3",
    title: "Security Update Available",
    content: "Important security patches have been released. Please update your apps.",
    status: "published",
    featured: true,
    excerpt: "Update required for protection",
    createdAt: createTimestamp(1),
    updatedAt: createTimestamp(1),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "ann4",
    title: "Welcome to the Community",
    content: "If you're new to our platform, check out our getting started guide.",
    status: "published",
    featured: false,
    excerpt: "Getting started guide",
    createdAt: createTimestamp(10),
    updatedAt: createTimestamp(10),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "ann5",
    title: "Monthly Challenge: Build an App",
    content: "Join our monthly challenge to build amazing applications and win prizes!",
    status: "published",
    featured: true,
    excerpt: "Challenge announcement",
    createdAt: createTimestamp(3),
    updatedAt: createTimestamp(3),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "ann6",
    title: "New Premium Features",
    content: "Premium members now have access to exclusive tutorials and resources.",
    status: "published",
    featured: false,
    excerpt: "Premium tier upgrade",
    createdAt: createTimestamp(8),
    updatedAt: createTimestamp(8),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "ann7",
    title: "Community Guidelines Update",
    content: "We've updated our community guidelines to better protect all users.",
    status: "draft",
    featured: false,
    excerpt: "Guidelines update",
    createdAt: createTimestamp(0),
    updatedAt: createTimestamp(0),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "ann8",
    title: "Partner Spotlight: Amazing DevTools",
    content: "Check out our featured partner offering amazing development tools.",
    status: "published",
    featured: false,
    excerpt: "Partner announcement",
    createdAt: createTimestamp(7),
    updatedAt: createTimestamp(7),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "ann9",
    title: "Feedback Survey",
    content: "Help us improve! Take our quick 5-minute survey about your experience.",
    status: "published",
    featured: false,
    excerpt: "Your feedback matters",
    createdAt: createTimestamp(4),
    updatedAt: createTimestamp(4),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "ann10",
    title: "Upcoming Conference",
    content: "Join us for our annual tech conference with industry experts and workshops.",
    status: "published",
    featured: true,
    excerpt: "Conference details",
    createdAt: createTimestamp(15),
    updatedAt: createTimestamp(15),
    creatorEmail: "alice.johnson@example.com"
  }
];

/**
 * PAGES - 10 Sample Pages
 */
export const SAMPLE_PAGES = [
  {
    id: "page1",
    title: "About Us",
    slug: "about-us",
    content: "Learn about our mission, vision, and the team behind this platform.",
    status: "published",
    excerpt: "Our story and mission",
    category: "Company",
    createdAt: createTimestamp(100),
    updatedAt: createTimestamp(100),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "page2",
    title: "Privacy Policy",
    slug: "privacy-policy",
    content: "Our comprehensive privacy policy explaining how we handle user data.",
    status: "published",
    excerpt: "Privacy information",
    category: "Legal",
    createdAt: createTimestamp(200),
    updatedAt: createTimestamp(10),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "page3",
    title: "Terms of Service",
    slug: "terms-of-service",
    content: "Terms and conditions for using our platform and services.",
    status: "published",
    excerpt: "Terms and conditions",
    category: "Legal",
    createdAt: createTimestamp(200),
    updatedAt: createTimestamp(15),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "page4",
    title: "Contact Us",
    slug: "contact-us",
    content: "Get in touch with our support team through various channels.",
    status: "published",
    excerpt: "Contact information",
    category: "Support",
    createdAt: createTimestamp(180),
    updatedAt: createTimestamp(180),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "page5",
    title: "Getting Started",
    slug: "getting-started",
    content: "A beginner's guide to getting started with our platform.",
    status: "published",
    excerpt: "Beginner guide",
    category: "Help",
    createdAt: createTimestamp(90),
    updatedAt: createTimestamp(20),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "page6",
    title: "FAQ",
    slug: "faq",
    content: "Frequently asked questions and answers about our services.",
    status: "published",
    excerpt: "Common questions",
    category: "Help",
    createdAt: createTimestamp(120),
    updatedAt: createTimestamp(5),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "page7",
    title: "Pricing",
    slug: "pricing",
    content: "Detailed pricing information for all our plans and features.",
    status: "published",
    excerpt: "Our pricing plans",
    category: "Business",
    createdAt: createTimestamp(150),
    updatedAt: createTimestamp(30),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "page8",
    title: "Blog",
    slug: "blog",
    content: "Latest articles and updates from our team.",
    status: "published",
    excerpt: "Latest updates",
    category: "News",
    createdAt: createTimestamp(60),
    updatedAt: createTimestamp(2),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "page9",
    title: "Resources",
    slug: "resources",
    content: "Helpful resources including guides, templates, and tools.",
    status: "draft",
    excerpt: "Resource library",
    category: "Help",
    createdAt: createTimestamp(45),
    updatedAt: createTimestamp(3),
    creatorEmail: "alice.johnson@example.com"
  },
  {
    id: "page10",
    title: "Community Guidelines",
    slug: "community-guidelines",
    content: "Guidelines for respectful and productive community interaction.",
    status: "published",
    excerpt: "Community rules",
    category: "Community",
    createdAt: createTimestamp(100),
    updatedAt: createTimestamp(8),
    creatorEmail: "alice.johnson@example.com"
  }
];

/**
 * Combined export with counters for quick access
 */
export const SAMPLE_DATA_SUMMARY = {
  totalUsers: SAMPLE_USERS.length,
  totalTutorials: SAMPLE_TUTORIALS.length,
  totalReviews: SAMPLE_REVIEWS.length,
  totalAnnouncements: SAMPLE_ANNOUNCEMENTS.length,
  totalPages: SAMPLE_PAGES.length,
  
  usersByRole: {
    admin: SAMPLE_USERS.filter(u => u.role === "admin").length,
    professional: SAMPLE_USERS.filter(u => u.role === "professional").length,
    general: SAMPLE_USERS.filter(u => u.role === "user").length,
    inactive: SAMPLE_USERS.filter(u => u.status === "inactive" || u.status === "banned").length
  },
  
  tutorialsByStatus: {
    published: SAMPLE_TUTORIALS.filter(t => t.status === "published").length,
    draft: SAMPLE_TUTORIALS.filter(t => t.status === "draft").length,
    featured: SAMPLE_TUTORIALS.filter(t => t.featured).length
  },
  
  reviewsByType: {
    tutorial: SAMPLE_REVIEWS.filter(r => r.contentType === "tutorial").length,
    system: SAMPLE_REVIEWS.filter(r => r.contentType === "system").length,
    reports: SAMPLE_REVIEWS.filter(r => r.isReport === true).length
  },
  
  contentByStatus: {
    announcements_published: SAMPLE_ANNOUNCEMENTS.filter(a => a.status === "published").length,
    pages_published: SAMPLE_PAGES.filter(p => p.status === "published").length
  }
};
