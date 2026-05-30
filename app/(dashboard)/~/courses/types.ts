export interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "article" | "quiz" | "exercise"
  completed: boolean
}

export interface Module {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description: string
  category: "Core CS" | "Web Development" | "Interview Prep" | "System Design"
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  instructor: {
    name: string
    role: string
    avatar: string
  }
  modules: Module[]
}

export const INITIAL_COURSES: Course[] = [
  {
    id: "algo-ds-masterclass",
    title: "Algorithms & Data Structures Masterclass",
    description: "Master complex algorithms and data structures to ace your technical interviews. Covers trees, graphs, dynamic programming, and system design basics.",
    category: "Core CS",
    level: "Advanced",
    duration: "24h 15m",
    instructor: {
      name: "Dr. Evelyn Vance",
      role: "Ex-Google Staff Engineer",
      avatar: "EV"
    },
    modules: [
      {
        id: "m1",
        title: "Complexity Analysis & Arrays",
        description: "Understand Big-O notation, space-time complexity, and basic memory allocations.",
        lessons: [
          { id: "l1", title: "Introduction to Big-O Notation", duration: "15 min", type: "video", completed: true },
          { id: "l2", title: "Space vs Time Complexity Tradeoffs", duration: "25 min", type: "article", completed: true },
          { id: "l3", title: "Two-Pointer Technique & Sliding Window", duration: "45 min", type: "exercise", completed: false },
          { id: "l4", title: "Module Quiz: Array Foundations", duration: "20 min", type: "quiz", completed: false }
        ]
      },
      {
        id: "m2",
        title: "Linked Lists, Stacks & Queues",
        description: "Learn pointer manipulation, linear structures, and their applications.",
        lessons: [
          { id: "l5", title: "Singly and Doubly Linked List Operations", duration: "30 min", type: "video", completed: false },
          { id: "l6", title: "Design a Min Stack in O(1) Time", duration: "40 min", type: "exercise", completed: false },
          { id: "l7", title: "Queue Implementations using Stacks", duration: "35 min", type: "exercise", completed: false }
        ]
      },
      {
        id: "m3",
        title: "Trees, BSTs & Tries",
        description: "Master hierarchical data structures and search trees.",
        lessons: [
          { id: "l8", title: "Binary Tree Traversals (Inorder, Preorder, Postorder)", duration: "35 min", type: "video", completed: false },
          { id: "l9", title: "Binary Search Tree Validation and Insertion", duration: "40 min", type: "exercise", completed: false },
          { id: "l10", title: "Trie (Prefix Tree) Implementation", duration: "50 min", type: "exercise", completed: false }
        ]
      },
      {
        id: "m4",
        title: "Graph Algorithms & Traversals",
        description: "Navigate complex node structures and find shortest paths.",
        lessons: [
          { id: "l11", title: "BFS and DFS Implementations", duration: "45 min", type: "video", completed: false },
          { id: "l12", title: "Cycle Detection in Directed/Undirected Graphs", duration: "40 min", type: "exercise", completed: false },
          { id: "l13", title: "Dijkstra's Shortest Path Algorithm", duration: "60 min", type: "exercise", completed: false }
        ]
      }
    ]
  },
  {
    id: "nextjs-supabase-dev",
    title: "Full-Stack Development with Next.js & Supabase",
    description: "Build modern, scalable web applications using Next.js App Router, Tailwind CSS, and Supabase for database and authentication.",
    category: "Web Development",
    level: "Intermediate",
    duration: "18h 30m",
    instructor: {
      name: "Marcus Chen",
      role: "Lead Frontend Architect",
      avatar: "MC"
    },
    modules: [
      {
        id: "n-m1",
        title: "Next.js App Router Foundations",
        description: "Understand layouts, nested routing, and Server vs Client Components.",
        lessons: [
          { id: "n-l1", title: "Understanding React Server Components", duration: "20 min", type: "video", completed: true },
          { id: "n-l2", title: "File-Based Routing & Dynamic Routes", duration: "18 min", type: "video", completed: true },
          { id: "n-l3", title: "Shared Layouts and Error Handling", duration: "15 min", type: "article", completed: true },
          { id: "n-l4", title: "RSC Data Fetching Patterns", duration: "30 min", type: "exercise", completed: false }
        ]
      },
      {
        id: "n-m2",
        title: "Database Schema & Supabase Setup",
        description: "Set up your database, migrations, and Row Level Security (RLS).",
        lessons: [
          { id: "n-l5", title: "Setting up your Supabase Project", duration: "12 min", type: "video", completed: true },
          { id: "n-l6", title: "Designing Schema with PostgreSQL", duration: "25 min", type: "article", completed: false },
          { id: "n-l7", title: "Writing Row Level Security Rules", duration: "35 min", type: "exercise", completed: false }
        ]
      },
      {
        id: "n-m3",
        title: "Authentication & Route Protection",
        description: "Secure your pages with SSR Auth and Supabase Guard Middleware.",
        lessons: [
          { id: "n-l8", title: "Email and OAuth Setup in Supabase", duration: "22 min", type: "video", completed: false },
          { id: "n-l9", title: "Middleware Authentication Guards", duration: "20 min", type: "article", completed: false },
          { id: "n-l10", title: "Creating Login/Signup Pages in Next.js", duration: "45 min", type: "exercise", completed: false }
        ]
      }
    ]
  },
  {
    id: "behavioral-interviews-soft-skills",
    title: "Behavioral Interviewing & Soft Skills for Tech",
    description: "Learn how to structure your answers using the STAR method, answer tricky behavioral questions, and showcase leadership.",
    category: "Interview Prep",
    level: "Beginner",
    duration: "6h 45m",
    instructor: {
      name: "Sarah Jenkins",
      role: "HR Director at Tech Corp",
      avatar: "SJ"
    },
    modules: [
      {
        id: "b-m1",
        title: "Understanding Behavioral Interviews",
        description: "Why tech companies test behaviors and how rubrics evaluate candidates.",
        lessons: [
          { id: "b-l1", title: "What Interviewers Look For", duration: "15 min", type: "video", completed: true },
          { id: "b-l2", title: "Decoding the Leadership Principles", duration: "20 min", type: "article", completed: true },
          { id: "b-l3", title: "Quiz: Core Professional Competencies", duration: "15 min", type: "quiz", completed: true }
        ]
      },
      {
        id: "b-m2",
        title: "The STAR Method Demystified",
        description: "Situation, Task, Action, and Result formatting for maximum impact.",
        lessons: [
          { id: "b-l4", title: "Structuring with STAR", duration: "22 min", type: "video", completed: true },
          { id: "b-l5", title: "Deep Dive into Actions and Quantifiable Results", duration: "18 min", type: "article", completed: true },
          { id: "b-l6", title: "Mock Walkthrough: Technical Failure Story", duration: "30 min", type: "video", completed: true }
        ]
      },
      {
        id: "b-m3",
        title: "Crafting Your Stories",
        description: "Write and polish stories about conflict, collaboration, and learning.",
        lessons: [
          { id: "b-l7", title: "Conflict Resolution with Teammates", duration: "25 min", type: "exercise", completed: true },
          { id: "b-l8", title: "Showcasing Ownership and Leadership", duration: "30 min", type: "exercise", completed: false }
        ]
      }
    ]
  },
  {
    id: "system-design-scale",
    title: "System Design at Scale",
    description: "Learn how to design highly scalable, fault-tolerant distributed systems. Covers caching, load balancing, sharding, and real-world system architecture.",
    category: "System Design",
    level: "Advanced",
    duration: "14h 20m",
    instructor: {
      name: "Alex Mercer",
      role: "Principal Infrastructure Architect",
      avatar: "AM"
    },
    modules: [
      {
        id: "s-m1",
        title: "Foundations of Distributed Systems",
        description: "Scale from single servers to global networks.",
        lessons: [
          { id: "s-l1", title: "Vertical vs Horizontal Scaling", duration: "20 min", type: "video", completed: false },
          { id: "s-l2", title: "Load Balancers (Nginx, HAProxy, Round Robin)", duration: "30 min", type: "video", completed: false },
          { id: "s-l3", title: "CAP Theorem and PACELC Explained", duration: "25 min", type: "article", completed: false }
        ]
      },
      {
        id: "s-m2",
        title: "Storage Systems & Caching",
        description: "Designing efficient read and write paths.",
        lessons: [
          { id: "s-l4", title: "Relational vs NoSQL Database Selection", duration: "35 min", type: "video", completed: false },
          { id: "s-l5", title: "Database Sharding and Replication", duration: "45 min", type: "article", completed: false },
          { id: "s-l6", title: "Caching Strategies: Write-Through vs Cache-Aside", duration: "30 min", type: "exercise", completed: false }
        ]
      }
    ]
  }
]
