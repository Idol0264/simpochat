/* =========================================================
   SIMPOCHAT — FULL APP.JS REPLACEMENT
   Section 1/5
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   STORAGE + APP CONSTANTS
   --------------------------------------------------------- */

const STORAGE_KEY = "simpochat-state-v3";
const LEGACY_STORAGE_KEY = "simpochat-state-v2";
const THEME_KEY = "simpochat-theme";

const MESSAGE_LIFETIME = 2 * 24 * 60 * 60 * 1000;

const CATEGORIES = [
  "Business",
  "Technology",
  "Creative",
  "Education",
  "Community",
  "Entertainment",
  "Investment",
  "Sports",
  "Opportunities",
  "Other"
];

/* ---------------------------------------------------------
   BASIC HELPERS
   --------------------------------------------------------- */

const $ = (selector) => document.querySelector(selector);

const screen = $("#screen");
const modalRoot = $("#modal-root");

let longPressTimer = null;
let longPressTriggered = false;

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function now() {
  return Date.now();
}

function randomHue() {
  return Math.floor(Math.random() * 360);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString([], {
    day: "numeric",
    month: "short"
  });
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

/* ---------------------------------------------------------
   DEFAULT GROUPS
   --------------------------------------------------------- */

function defaultGroups() {
  return [
    {
      id: "creators",
      name: "Creators Hub",
      icon: "C",
      hue: 265,
      category: ["Creative", "Community"],
      admin: true,
      unseen: 4,
      members: [
        {
          id: "maya",
          name: "Maya",
          avatar: "M",
          hue: 315
        },
        {
          id: "daniel",
          name: "Daniel",
          avatar: "D",
          hue: 205
        },
        {
          id: "amina",
          name: "Amina",
          avatar: "A",
          hue: 145
        },
        {
          id: "chris",
          name: "Chris",
          avatar: "C",
          hue: 42
        }
      ]
    },

    {
      id: "business",
      name: "Business Network",
      icon: "B",
      hue: 200,
      category: ["Business", "Opportunities"],
      admin: false,
      unseen: 0,
      members: [
        {
          id: "john",
          name: "John",
          avatar: "J",
          hue: 190
        },
        {
          id: "grace",
          name: "Grace",
          avatar: "G",
          hue: 320
        },
        {
          id: "paul",
          name: "Paul",
          avatar: "P",
          hue: 40
        }
      ]
    },

    {
      id: "tech",
      name: "Tech Builders",
      icon: "T",
      hue: 145,
      category: ["Technology", "Education"],
      admin: true,
      unseen: 12,
      members: [
        {
          id: "tolu",
          name: "Tolu",
          avatar: "T",
          hue: 145
        },
        {
          id: "sam",
          name: "Sam",
          avatar: "S",
          hue: 230
        },
        {
          id: "ruth",
          name: "Ruth",
          avatar: "R",
          hue: 285
        }
      ]
    },

    {
      id: "design",
      name: "Design Circle",
      icon: "D",
      hue: 320,
      category: ["Creative", "Community"],
      admin: false,
      unseen: 2,
      members: [
        {
          id: "linda",
          name: "Linda",
          avatar: "L",
          hue: 300
        },
        {
          id: "mark",
          name: "Mark",
          avatar: "M",
          hue: 170
        }
      ]
    },

    {
      id: "opportunity",
      name: "Opportunity Room",
      icon: "O",
      hue: 42,
      category: ["Opportunities", "Business"],
      admin: false,
      unseen: 0,
      members: [
        {
          id: "victor",
          name: "Victor",
          avatar: "V",
          hue: 45
        },
        {
          id: "emma",
          name: "Emma",
          avatar: "E",
          hue: 260
        }
      ]
    }
  ];
}

/* ---------------------------------------------------------
   DEFAULT APPLICATION STATE
   --------------------------------------------------------- */

function createDefaultState() {
  const timestamp = now();

  return {
    screen: "home",
    previousScreen: "home",

    theme:
      localStorage.getItem(THEME_KEY) || "system",

    selectedGroup: null,
    selectedMember: null,

    selectionMode: false,
    selectedItems: [],

    currentUser: {
      id: "me",
      name: "You",
      username: "simpochatter",
      email: "user@example.com",
      avatar: "Y",
      hue: 265
    },

    groups: defaultGroups(),

    /* Groups the user has starred */
    starred: ["creators"],

    /* Groups the user has archived */
    archived: [],

    messages: {
      creators: [
        {
          id: "m1",
          member: "maya",
          text: "Welcome everyone 👋",
          createdAt: timestamp - 45 * 60000,
          read: false
        },
        {
          id: "m2",
          member: "daniel",
          text: "Good to be here.",
          createdAt: timestamp - 40 * 60000,
          read: false
        },
        {
          id: "m3",
          member: "amina",
          text: "Let's build something great.",
          createdAt: timestamp - 35 * 60000,
          read: false
        }
      ],

      business: [
        {
          id: "m4",
          member: "john",
          text: "Welcome to the network.",
          createdAt: timestamp - 2 * 3600000,
          read: true
        }
      ],

      tech: [
        {
          id: "m5",
          member: "tolu",
          text: "New project discussion starts here.",
          createdAt: timestamp - 3 * 3600000,
          read: false
        },
        {
          id: "m6",
          member: "sam",
          text: "I have some ideas to share.",
          createdAt: timestamp - 2 * 3600000,
          read: false
        }
      ],

      design: [],
      opportunity: []
    },

    /* Video posts */
    posts: [
      {
        id: "post-1",
        author: "Maya",
        groupId: "creators",
        type: "video",
        createdAt: timestamp - 3600000,
        views: 128,
        reactions: 19,
        comments: 6
      },

      {
        id: "post-2",
        author: "Daniel",
        groupId: "business",
        type: "video",
        createdAt: timestamp - 5 * 3600000,
        views: 83,
        reactions: 11,
        comments: 4
      },

      {
        id: "post-3",
        author: "Tolu",
        groupId: "tech",
        type: "video",
        createdAt: timestamp - 9 * 3600000,
        views: 204,
        reactions: 31,
        comments: 8
      },

      {
        id: "post-4",
        author: "Linda",
        groupId: "design",
        type: "video",
        createdAt: timestamp - 15 * 3600000,
        views: 97,
        reactions: 14,
        comments: 5
      },

      {
        id: "post-5",
        author: "Victor",
        groupId: "opportunity",
        type: "video",
        createdAt: timestamp - 22 * 3600000,
        views: 56,
        reactions: 9,
        comments: 2
      }
    ],

    joinRequests: {},

    postFilter: "all",

    searchQuery: ""
  };
}

/* ---------------------------------------------------------
   LOAD SAVED STATE
   --------------------------------------------------------- */

function loadState() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw);
    const defaults = createDefaultState();

    const merged = {
      ...defaults,
      ...parsed
    };

    merged.groups = Array.isArray(parsed.groups)
      ? parsed.groups
      : defaults.groups;

    merged.starred = safeArray(parsed.starred);

    merged.archived = safeArray(parsed.archived);

    merged.selectedItems = safeArray(
      parsed.selectedItems
    );

    merged.messages =
      parsed.messages &&
      typeof parsed.messages === "object"
        ? parsed.messages
        : defaults.messages;

    merged.posts = Array.isArray(parsed.posts)
      ? parsed.posts
      : defaults.posts;

    merged.joinRequests =
      parsed.joinRequests &&
      typeof parsed.joinRequests === "object"
        ? parsed.joinRequests
        : {};

    merged.currentUser = {
      ...defaults.currentUser,
      ...(parsed.currentUser || {})
    };

    return merged;

  } catch (error) {
    console.warn(
      "SimpoChat state reset:",
      error
    );

    return createDefaultState();
  }
}

/* ---------------------------------------------------------
   GLOBAL STATE
   --------------------------------------------------------- */

let state = loadState();

/* ---------------------------------------------------------
   SAVE STATE
   --------------------------------------------------------- */

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

    localStorage.setItem(
      THEME_KEY,
      state.theme
    );

  } catch (error) {
    console.warn(
      "Could not save SimpoChat state:",
      error
    );
  }
}

/* ---------------------------------------------------------
   THEME
   --------------------------------------------------------- */

function applyTheme() {
  document.documentElement.dataset.theme =
    state.theme || "system";
}

/* ---------------------------------------------------------
   GROUP HELPERS
   --------------------------------------------------------- */

function getGroup(id) {
  return state.groups.find(
    group => group.id === id
  );
}

function getMember(group, id) {
  return group?.members?.find(
    member => member.id === id
  );
}

function isStarred(id) {
  return safeArray(state.starred).includes(id);
}

function isArchived(id) {
  return safeArray(state.archived).includes(id);
}

/* ---------------------------------------------------------
   ⭐ STAR FUNCTIONS
   --------------------------------------------------------- */

function addStar(id) {
  if (
    getGroup(id) &&
    !isStarred(id)
  ) {
    state.starred.push(id);
  }
}

function removeStar(id) {
  state.starred =
    safeArray(state.starred).filter(
      groupId => groupId !== id
    );
}

function toggleStar(id) {
  if (!getGroup(id)) {
    return;
  }

  if (isStarred(id)) {
    removeStar(id);
  } else {
    addStar(id);
  }

  saveState();
}

/* ---------------------------------------------------------
   ARCHIVE FUNCTIONS
   --------------------------------------------------------- */

function archiveGroup(id) {
  if (
    getGroup(id) &&
    !isArchived(id)
  ) {
    state.archived.push(id);
  }
}

function unarchiveGroup(id) {
  state.archived =
    safeArray(state.archived).filter(
      groupId => groupId !== id
    );
}

/* ---------------------------------------------------------
   GROUP VISIBILITY
   --------------------------------------------------------- */

function visibleGroups() {

  if (state.screen === "archived") {
    return state.groups.filter(
      group => isArchived(group.id)
    );
  }

  if (state.screen === "starred") {
    return state.groups.filter(
      group =>
        isStarred(group.id) &&
        !isArchived(group.id)
    );
  }

  return state.groups.filter(
    group => !isArchived(group.id)
  );
}

/* ---------------------------------------------------------
   REMOVE EXPIRED DATA
   Everything disappears after 2 days.
   --------------------------------------------------------- */

function cleanupExpired(save = true) {

  const cutoff =
    now() - MESSAGE_LIFETIME;

  let changed = false;

  Object.keys(state.messages || {})
    .forEach(groupId => {

      const before =
        safeArray(
          state.messages[groupId]
        ).length;

      state.messages[groupId] =
        safeArray(
          state.messages[groupId]
        ).filter(
          message =>
            Number(message.createdAt) >
            cutoff
        );

      if (
        before !==
        state.messages[groupId].length
      ) {
        changed = true;
      }
    });

  const beforePosts =
    state.posts.length;

  state.posts =
    safeArray(state.posts)
      .filter(
        post =>
          Number(post.createdAt) >
          cutoff
      );

  if (
    beforePosts !==
    state.posts.length
  ) {
    changed = true;
  }

  if (changed && save) {
    saveState();
  }
}

/* ---------------------------------------------------------
   HEADER
   --------------------------------------------------------- */

function setHeader(
  title = "SimpoChat",
  subtitle = ""
) {
  const brand =
    document.querySelector(
      ".brand-name"
    );

  const subtitleElement =
    $("#screenSubtitle");

  if (brand) {
    brand.textContent = title;
  }

  if (subtitleElement) {
    subtitleElement.textContent =
      subtitle;
  }
}

/* ---------------------------------------------------------
   SCREEN NAVIGATION
   --------------------------------------------------------- */

function setScreen(name) {

  state.previousScreen =
    state.screen;

  state.screen = name;

  state.selectionMode = false;
  state.selectedItems = [];

  modalRoot.innerHTML = "";

  saveState();

  render();
}

function goBack() {

  if (
    state.screen === "group-chat" ||
    state.screen === "group-profile"
  ) {
    state.screen = "home";
  } else {

    state.screen =
      state.previousScreen &&
      state.previousScreen !==
        state.screen
        ? state.previousScreen
        : "home";
  }

  state.selectionMode = false;
  state.selectedItems = [];

  saveState();

  render();
}
