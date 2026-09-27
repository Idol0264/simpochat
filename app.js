/* =========================================================
   SIMPOCHAT
   Phase 2 — Functional Group Chat Foundation
   ---------------------------------------------------------
   Local prototype foundation.

   This version provides:
   - Persistent local state
   - Group creation
   - Group discovery / join requests
   - Messaging
   - 2-day message expiry
   - Starred / archived groups
   - Selection mode
   - Group profiles
   - Read all
   - Theme persistence
   - Posts foundation
   - Admin call controls foundation

   Backend / Supabase comes in a later phase.
   ========================================================= */

"use strict";

/* =========================================================
   CONSTANTS
   ========================================================= */

const STORAGE_KEY = "simpochat-state-v2";
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

/* =========================================================
   HELPERS
   ========================================================= */

const $ = selector => document.querySelector(selector);

const screen = $("#screen");
const modalRoot = $("#modal-root");

let longPressTimer = null;
let longPressTriggered = false;

function uid(prefix = "id") {
  return (
    prefix +
    "-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

function now() {
  return Date.now();
}

function formatTime(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDate(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short"
  });
}

function randomHue() {
  return Math.floor(Math.random() * 360);
}

/* =========================================================
   DEFAULT DATA
   ========================================================= */

function createDefaultState() {
  const creators = {
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
  };

  const business = {
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
  };

  const tech = {
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
  };

  const design = {
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
  };

  const opportunity = {
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
  };

  const timestamp = Date.now();

  return {
    screen: "home",
    previousScreen: "home",

    theme:
      localStorage.getItem(THEME_KEY) ||
      "system",

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

    groups: [
      creators,
      business,
      tech,
      design,
      opportunity
    ],

    starred: ["creators"],

    archived: [],

    messages: {
      creators: [
        {
          id: "m1",
          member: "maya",
          text: "Welcome everyone 👋",
          createdAt: timestamp - 45 * 60 * 1000,
          read: false
        },
        {
          id: "m2",
          member: "daniel",
          text: "Good to be here.",
          createdAt: timestamp - 40 * 60 * 1000,
          read: false
        },
        {
          id: "m3",
          member: "amina",
          text: "Let's build something great.",
          createdAt: timestamp - 35 * 60 * 1000,
          read: false
        }
      ],

      business: [
        {
          id: "m4",
          member: "john",
          text: "Welcome to the network.",
          createdAt: timestamp - 2 * 60 * 60 * 1000,
          read: true
        }
      ],

      tech: [
        {
          id: "m5",
          member: "tolu",
          text: "New project discussion starts here.",
          createdAt: timestamp - 3 * 60 * 60 * 1000,
          read: false
        },
        {
          id: "m6",
          member: "sam",
          text: "I have some ideas to share.",
          createdAt: timestamp - 2 * 60 * 60 * 1000,
          read: false
        }
      ],

      design: [],

      opportunity: []
    },

    posts: [
      {
        id: "post-1",
        author: "Maya",
        groupId: "creators",
        type: "video",
        createdAt: timestamp - 60 * 60 * 1000,
        views: 128,
        reactions: 19,
        comments: 6
      },
      {
        id: "post-2",
        author: "Daniel",
        groupId: "business",
        type: "video",
        createdAt: timestamp - 5 * 60 * 60 * 1000,
        views: 83,
        reactions: 11,
        comments: 4
      },
      {
        id: "post-3",
        author: "Tolu",
        groupId: "tech",
        type: "video",
        createdAt: timestamp - 9 * 60 * 60 * 1000,
        views: 204,
        reactions: 31,
        comments: 8
      },
      {
        id: "post-4",
        author: "Linda",
        groupId: "design",
        type: "video",
        createdAt: timestamp - 15 * 60 * 60 * 1000,
        views: 97,
        reactions: 14,
        comments: 5
      },
      {
        id: "post-5",
        author: "Victor",
        groupId: "opportunity",
        type: "video",
        createdAt: timestamp - 22 * 60 * 60 * 1000,
        views: 56,
        reactions: 9,
        comments: 2
      }
    ],

    joinRequests: {},

    postFilter: "all"
  };
}

/* =========================================================
   STATE
   ========================================================= */

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return createDefaultState();
    }

    const parsed = JSON.parse(saved);

    const defaults = createDefaultState();

    return {
      ...defaults,
      ...parsed,
      selectedItems: Array.isArray(parsed.selectedItems)
        ? parsed.selectedItems
        : [],
      starred: Array.isArray(parsed.starred)
        ? parsed.starred
        : [],
      archived: Array.isArray(parsed.archived)
        ? parsed.archived
        : [],
      groups: Array.isArray(parsed.groups)
        ? parsed.groups
        : defaults.groups,
      messages:
        parsed.messages &&
        typeof parsed.messages === "object"
          ? parsed.messages
          : defaults.messages,
      posts: Array.isArray(parsed.posts)
        ? parsed.posts
        : defaults.posts,
      joinRequests:
        parsed.joinRequests &&
        typeof parsed.joinRequests === "object"
          ? parsed.joinRequests
          : {}
    };
  } catch (error) {
    console.warn(
      "SimpoChat state could not be loaded.",
      error
    );

    return createDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        selectedItems: [...state.selectedItems]
      })
    );
  } catch (error) {
    console.warn(
      "SimpoChat state could not be saved.",
      error
    );
  }
}

/* =========================================================
   EXPIRATION
   ========================================================= */

function removeExpiredMessages() {
  const cutoff = now() - MESSAGE_LIFETIME;

  Object.keys(state.messages).forEach(groupId => {
    state.messages[groupId] =
      (state.messages[groupId] || []).filter(
        message =>
          Number(message.createdAt || 0) > cutoff
      );
  });

  state.posts = state.posts.filter(
    post =>
      Number(post.createdAt || 0) > cutoff
  );

  saveState();
}

/* =========================================================
   THEME
   ========================================================= */

function applyTheme() {
  document.documentElement.dataset.theme =
    state.theme;

  localStorage.setItem(
    THEME_KEY,
    state.theme
  );
}

/* =========================================================
   GROUP HELPERS
   ========================================================= */

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
  return state.starred.includes(id);
}

function isArchived(id) {
  return state.archived.includes(id);
}

function addStar(id) {
  if (!isStarred(id)) {
    state.starred.push(id);
  }
}

function removeStar(id) {
  state.starred =
    state.starred.filter(
      groupId => groupId !== id
    );
}

function archiveGroup(id) {
  if (!isArchived(id)) {
    state.archived.push(id);
  }
}

function unarchiveGroup(id) {
  state.archived =
    state.archived.filter(
      groupId => groupId !== id
    );
}

function visibleGroups() {
  if (state.screen === "archived") {
    return state.groups.filter(group =>
      isArchived(group.id)
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

/* =========================================================
   NAVIGATION
   ========================================================= */

function setScreen(screenName) {
  state.previousScreen = state.screen;
  state.screen = screenName;

  state.selectionMode = false;
  state.selectedItems = [];

  modalRoot.innerHTML = "";

  saveState();
  render();
}

function goBack() {
  const previous =
    state.previousScreen || "home";

  if (
    state.screen === "group-profile" ||
    state.screen === "group-chat"
  ) {
    state.screen = "home";
  } else if (previous === state.screen) {
    state.screen = "home";
  } else {
    state.screen = previous;
  }

  state.selectionMode = false;
  state.selectedItems = [];

  saveState();
  render();
}

/* =========================================================
   HEADER
   ========================================================= */

function setHeader(
  title = "SimpoChat",
  subtitle = ""
) {
  const subtitleElement =
    $("#screenSubtitle");

  const brand =
    document.querySelector(
      ".brand-name"
    );

  if (brand) {
    brand.textContent = title;
  }

  if (subtitleElement) {
    subtitleElement.textContent =
      subtitle;
  }
}

/* =========================================================
   MAIN RENDERER
   ========================================================= */

function render() {
  removeExpiredMessages();
  applyTheme();

  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.screen ===
          state.screen
      );
    });

  if (state.screen === "home") {
    renderHome();
    return;
  }

  if (state.screen === "starred") {
    renderGroupCollection("starred");
    return;
  }

  if (state.screen === "archived") {
    renderGroupCollection("archived");
    return;
  }

  if (state.screen === "posts") {
    renderPosts();
    return;
  }

  if (state.screen === "search") {
    renderSearch();
    return;
  }

  if (state.screen === "settings") {
    renderSettings();
    return;
  }

  if (state.screen === "new-group") {
    renderNewGroup();
    return;
  }

  if (state.screen === "group-chat") {
    renderGroupChat();
    return;
  }

  if (state.screen === "group-profile") {
    renderGroupProfile();
    return;
  }

  state.screen = "home";
  renderHome();
}

/* =========================================================
   HOME
   ========================================================= */

function renderHome() {
  setHeader(
    "SimpoChat",
    "Your groups"
  );

  const groups = visibleGroups();

  screen.innerHTML = `
    <div class="section-head">
      <div>
        <div class="section-title">
          Groups
        </div>

        <div class="section-note">
          Groups you belong to
        </div>
      </div>
    </div>

    ${
      groups.length
        ? `
          <div class="group-list">
            ${groups
              .map(renderGroupCard)
              .join("")}
          </div>
        `
        : renderEmptyGroups("home")
    }
  `;

  bindGroupCards();
}

/* =========================================================
   GROUP COLLECTIONS
   ========================================================= */

function renderGroupCollection(type) {
  const groups = visibleGroups();

  setHeader(
    type === "starred"
      ? "Starred"
      : "Archived",
    `${groups.length} group${
      groups.length === 1
        ? ""
        : "s"
    }`
  );

  screen.innerHTML = `
    <div class="section-head">
      <div>
        <div class="section-title">
          ${
            type === "starred"
              ? "Starred"
              : "Archived"
          }
        </div>

        <div class="section-note">
          ${
            type === "starred"
              ? "Groups you've marked as interesting"
              : "Groups you've archived"
          }
        </div>
      </div>
    </div>

    ${
      groups.length
        ? `
          <div class="group-list">
            ${groups
              .map(renderGroupCard)
              .join("")}
          </div>
        `
        : renderEmptyGroups(type)
    }
  `;

  bindGroupCards();
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

function renderEmptyGroups(
  type = "home"
) {
  const title =
    type === "archived"
      ? "No archived groups"
      : type === "starred"
        ? "No starred groups"
        : "No groups yet";

  const description =
    type === "home"
      ? "Create a group or search for an existing group to join."
      : "Your organized groups will appear here.";

  return `
    <div class="empty">
      <div class="empty-icon">
        ${
          type === "archived"
            ? "🗂️"
            : type === "starred"
              ? "⭐"
              : "💬"
        }
      </div>

      <h3>
        ${escapeHtml(title)}
      </h3>

      <p>
        ${escapeHtml(description)}
      </p>

      <button
        class="primary-btn"
        data-action="open-search"
      >
        Find groups
      </button>
    </div>
  `;
}

/* =========================================================
   GROUP CARD
   ========================================================= */

function renderGroupCard(group) {
  const selected =
    state.selectedItems.includes(
      group.id
    );

  const unseen =
    Number(group.unseen || 0);

  return `
    <button
      class="group-card ${
        selected
          ? "selected-card"
          : ""
      }"
      data-group="${escapeHtml(
        group.id
      )}"
      data-longpress="${escapeHtml(
        group.id
      )}"
    >

      ${
        state.selectionMode
          ? `
            <span class="selection-check ${
              selected
                ? "checked"
                : ""
            }">
              ${
                selected
                  ? "✓"
                  : ""
              }
            </span>
          `
          : ""
      }

      <span
        class="group-avatar"
        style="--h:${group.hue}"
      >
        ${escapeHtml(group.icon)}
      </span>

      <span class="group-copy">
        <span class="group-name">
          ${escapeHtml(group.name)}
        </span>

        <span class="group-meta">
          ${group.category
            .map(escapeHtml)
            .join(" · ")}
        </span>
      </span>

      ${
        unseen > 0
          ? `
            <span class="unseen">
              ${
                unseen > 99
                  ? "99+"
                  : unseen
              }
            </span>
          `
          : ""
      }

    </button>
  `;
}

/* =========================================================
   GROUP CARD EVENTS
   ========================================================= */

function bindGroupCards() {
  document
    .querySelectorAll(
      "[data-longpress]"
    )
    .forEach(card => {

      card.addEventListener(
        "pointerdown",
        () => {
          if (state.selectionMode) {
            return;
          }

          longPressTriggered = false;

          longPressTimer =
            setTimeout(() => {
              longPressTriggered =
                true;

              openGroupActions(
                card.dataset.longpress
              );
            }, 550);
        }
      );

      card.addEventListener(
        "pointerup",
        clearLongPress
      );

      card.addEventListener(
        "pointerleave",
        clearLongPress
      );

      card.addEventListener(
        "pointercancel",
        clearLongPress
      );

      card.addEventListener(
        "click",
        event => {
          event.preventDefault();

          if (longPressTriggered) {
            longPressTriggered = false;
            return;
          }

          const groupId =
            card.dataset.group;

          if (state.selectionMode) {
            toggleSelected(groupId);
            return;
          }

          openGroup(groupId);
        }
      );
    });
}

function clearLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

/* =========================================================
   SELECTION
   ========================================================= */

function toggleSelected(groupId) {
  if (
    state.selectedItems.includes(
      groupId
    )
  ) {
    state.selectedItems =
      state.selectedItems.filter(
        id => id !== groupId
      );
  } else {
    state.selectedItems.push(
      groupId
    );
  }

  saveState();
  renderSelectionMode();
}

function enterSelectionMode(groupId) {
  state.selectionMode = true;
  state.selectedItems = [
    groupId
  ];

  renderSelectionMode();
}

function renderSelectionMode() {
  const groups = visibleGroups();

  setHeader(
    `${state.selectedItems.length} selected`,
    "Choose groups"
  );

  screen.innerHTML = `
    <div class="selection-toolbar">

      <button
        class="secondary-btn"
        data-action="select-all"
      >
        ${
          state.selectedItems.length ===
          groups.length
            ? "Unselect All"
            : "Select All"
        }
      </button>

      <button
        class="danger-btn"
        data-action="remove-selected"
      >
        Remove
      </button>

      <button
        class="secondary-btn"
        data-action="cancel-selection"
      >
        Cancel
      </button>

    </div>

    <div class="group-list">
      ${
        groups.length
          ? groups
              .map(renderGroupCard)
              .join("")
          : renderEmptyGroups()
      }
    </div>
  `;

  bindGroupCards();
}

function selectAllVisible() {
  state.selectedItems =
    visibleGroups().map(
      group => group.id
    );

  saveState();
  renderSelectionMode();
}

function unselectAllVisible() {
  state.selectedItems = [];

  saveState();
  renderSelectionMode();
}

function removeSelectedGroups() {
  if (
    !state.selectedItems.length
  ) {
    return;
  }

  const selected =
    new Set(
      state.selectedItems
    );

  state.groups =
    state.groups.filter(
      group =>
        !selected.has(
          group.id
        )
    );

  state.starred =
    state.starred.filter(
      id => !selected.has(id)
    );

  state.archived =
    state.archived.filter(
      id => !selected.has(id)
    );

  state.selectedItems = [];
  state.selectionMode = false;

  saveState();
  render();
}

/* =========================================================
   GROUP ACTIONS
   ========================================================= */

function openGroupActions(groupId) {
  const group =
    getGroup(groupId);

  if (!group) {
    return;
  }

  modalRoot.innerHTML = `
    <div
      class="modal-backdrop"
      data-close
    >
      <div class="modal">

        <div class="modal-head">
          <div>
            <div class="modal-title">
              ${escapeHtml(
                group.name
              )}
            </div>

            <div class="section-note">
              Group actions
            </div>
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>
        </div>

        <div class="menu-list">

          <button
            class="menu-item"
            data-group-action="star"
            data-group-id="${group.id}"
          >
            <div class="menu-icon">
              ${
                isStarred(group.id)
                  ? "★"
                  : "☆"
              }
            </div>

            <div>
              <strong>
                ${
                  isStarred(group.id)
                    ? "Remove from Starred"
                    : "Star Group"
                }
              </strong>

              <span>
                Add or remove this group from Starred.
              </span>
            </div>
          </button>

          <button
            class="menu-item"
            data-group-action="archive"
            data-group-id="${group.id}"
          >
            <div class="menu-icon">
              🗂
            </div>

            <div>
              <strong>
                ${
                  isArchived(group.id)
                    ? "Unarchive Group"
                    : "Archive Group"
                }
              </strong>

              <span>
                Organize this group without deleting it.
              </span>
            </div>
          </button>

          <button
            class="menu-item"
            data-group-action="select"
            data-group-id="${group.id}"
          >
            <div class="menu-icon">
              ✓
            </div>

            <div>
              <strong>
                Select More
              </strong>

              <span>
                Select multiple groups at once.
              </span>
            </div>
          </button>

          <button
            class="menu-item"
            data-group-action="open"
            data-group-id="${group.id}"
          >
            <div class="menu-icon">
              💬
            </div>

            <div>
              <strong>
                Open Group
              </strong>

              <span>
                Enter the group conversation.
              </span>
            </div>
          </button>

        </div>
      </div>
    </div>
  `;
}

/* =========================================================
   OPEN GROUP
   ========================================================= */

function openGroup(groupId) {
  const group =
    getGroup(groupId);

  if (!group) {
    return;
  }

  state.previousScreen =
    state.screen;

  state.selectedGroup =
    groupId;

  markGroupRead(groupId);

  state.screen =
    "group-chat";

  saveState();
  render();
}

function markGroupRead(groupId) {
  const group =
    getGroup(groupId);

  if (group) {
    group.unseen = 0;
  }

  if (state.messages[groupId]) {
    state.messages[groupId].forEach(
      message => {
        message.read = true;
      }
    );
  }
}

/* =========================================================
   GROUP CHAT
   ========================================================= */

function renderGroupChat() {
  const group =
    getGroup(
      state.selectedGroup
    );

  if (!group) {
    state.screen = "home";
    render();
    return;
  }

  const messages =
    state.messages[group.id] || [];

  setHeader(
    group.name,
    "Group chat"
  );

  screen.innerHTML = `
    <div class="chat-screen">

      <div class="chat-header-card">

        <button
          class="chat-back"
          data-action="back"
          aria-label="Back"
        >
          ←
        </button>

        <button
          class="chat-group-info"
          data-action="group-profile"
        >
          <span
            class="group-avatar small"
            style="--h:${group.hue}"
          >
            ${escapeHtml(
              group.icon
            )}
          </span>

          <span>
            <strong>
              ${escapeHtml(
                group.name
              )}
            </strong>

            <small>
              ${group.members.length}
              members
            </small>
          </span>
        </button>

        <div class="chat-header-actions">

          <button
            class="icon-btn"
            data-action="voice-call"
            aria-label="Voice call"
          >
            📞
          </button>

          <button
            class="icon-btn"
            data-action="video-call"
            aria-label="Video call"
          >
            🎥
          </button>

          <button
            class="icon-btn"
            data-action="chat-menu"
            aria-label="Chat menu"
          >
            ⋮
          </button>

        </div>

      </div>

      <button
        class="view-post-bar"
        data-action="view-group-posts"
      >
        <span>
          View Post
        </span>

        <span>
          ›
        </span>
      </button>

      <div class="message-list">

        ${
          messages.length
            ? messages
                .map(message =>
                  renderMessage(
                    group,
                    message
                  )
                )
                .join("")
            : `
              <div class="empty chat-empty">
                <div class="empty-icon">
                  💬
                </div>

                <h3>
                  No messages yet
                </h3>

                <p>
                  Start the conversation in this group.
                </p>
              </div>
            `
        }

      </div>

      <div class="message-composer">

        <button
          class="composer-icon"
          data-action="attachment"
          aria-label="Attachment"
        >
          ＋
        </button>

        <input
          id="messageInput"
          placeholder="Message group"
          autocomplete="off"
        >

        <button
          class="composer-icon"
          data-action="camera"
          aria-label="Camera"
        >
          ◉
        </button>

        <button
          class="composer-icon"
          data-action="microphone"
          aria-label="Voice message"
        >
          🎙
        </button>

        <button
          class="send-btn"
          data-action="send-message"
          aria-label="Send"
        >
          ↑
        </button>

      </div>

    </div>
  `;

  const messageInput =
    $("#messageInput");

  if (messageInput) {
    setTimeout(() => {
      messageInput.focus();
    }, 40);
  }
}

/* =========================================================
   MESSAGE RENDER
   ========================================================= */

function renderMessage(
  group,
  message
) {
  const member =
    getMember(
      group,
      message.member
    );

  if (!member) {
    return `
      <div class="message-row">
        <span
          class="member-avatar"
          style="--h:${state.currentUser.hue}"
        >
          ${escapeHtml(
            state.currentUser.avatar
          )}
        </span>

        <div class="message-content">
          <div class="message-name">
            ${escapeHtml(
              state.currentUser.name
            )}
          </div>

          <div class="message-bubble">
            ${escapeHtml(
              message.text
            )}
          </div>

          <div class="message-time">
            ${formatTime(
              message.createdAt
            )}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div
      class="message-row"
      data-message-id="${escapeHtml(
        message.id
      )}"
    >

      <span
        class="member-avatar"
        style="--h:${member.hue}"
      >
        ${escapeHtml(
          member.avatar
        )}
      </span>

      <div class="message-content">

        <div class="message-name">
          ${escapeHtml(
            member.name
          )}
        </div>

        <div class="message-bubble">
          ${escapeHtml(
            message.text
          )}
        </div>

        <div class="message-time">
          ${formatTime(
            message.createdAt
          )}
        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   SEND MESSAGE
   ========================================================= */

function sendMessage() {
  const input =
    $("#messageInput");

  if (!input) {
    return;
  }

  const text =
    input.value.trim();

  if (!text) {
    return;
  }

  const group =
    getGroup(
      state.selectedGroup
    );

  if (!group) {
    return;
  }

  if (!state.messages[group.id]) {
    state.messages[group.id] =
      [];
  }

  state.messages[group.id].push({
    id: uid("message"),
    member:
      group.members[0]?.id ||
      "me",
    text,
    createdAt: now(),
    read: true
  });

  input.value = "";

  saveState();
  renderGroupChat();

  setTimeout(() => {
    const list =
      document.querySelector(
        ".message-list"
      );

    if (list) {
      list.scrollTop =
        list.scrollHeight;
    }
  }, 20);
}

/* =========================================================
   GROUP PROFILE
   ========================================================= */

function renderGroupProfile() {
  const group =
    getGroup(
      state.selectedGroup
    );

  if (!group) {
    state.screen = "home";
    render();
    return;
  }

  setHeader(
    group.name,
    "Group profile"
  );

  screen.innerHTML = `
    <div class="profile-page">

      <div class="profile-hero">

        <button
          class="chat-back"
          data-action="back"
        >
          ←
        </button>

        <div
          class="profile-group-avatar"
          style="--h:${group.hue}"
        >
          ${escapeHtml(
            group.icon
          )}
        </div>

        <h2>
          ${escapeHtml(
            group.name
          )}
        </h2>

        <p>
          ${group.members.length}
          members
        </p>

        <div class="chip-row">
          ${group.category
            .map(category => `
              <span class="chip">
                ${escapeHtml(
                  category
                )}
              </span>
            `)
            .join("")}
        </div>

      </div>

      <div class="section-head">
        <div>
          <div class="section-title">
            Members
          </div>

          <div class="section-note">
            ${group.members.length}
            members in this group
          </div>
        </div>
      </div>

      <div class="member-list">

        ${
          group.members.length
            ? group.members
                .map(
                  member => `
                    <button
                      class="member-card"
                      data-member-id="${escapeHtml(
                        member.id
                      )}"
                    >

                      <span
                        class="member-avatar"
                        style="--h:${member.hue}"
                      >
                        ${escapeHtml(
                          member.avatar
                        )}
                      </span>

                      <span class="group-copy">
                        <span class="group-name">
                          ${escapeHtml(
                            member.name
                          )}
                        </span>

                        <span class="group-meta">
                          Group member
                        </span>
                      </span>

                      <span>
                        ›
                      </span>

                    </button>
                  `
                )
                .join("")
            : `
              <div class="empty">
                <div class="empty-icon">
                  👥
                </div>

                <h3>
                  No members yet
                </h3>

                <p>
                  Members will appear here.
                </p>
              </div>
            `
        }

      </div>

    </div>
  `;

  document
    .querySelectorAll(
      "[data-member-id]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const memberId =
            button.dataset.memberId;

          openMemberActions(
            group.id,
            memberId
          );
        }
      );
    });
}

/* =========================================================
   MEMBER ACTIONS
   ========================================================= */

function openMemberActions(
  groupId,
  memberId
) {
  const group =
    getGroup(groupId);

  const member =
    getMember(
      group,
      memberId
    );

  if (!group || !member) {
    return;
  }

  modalRoot.innerHTML = `
    <div
      class="modal-backdrop"
      data-close
    >
      <div class="modal">

        <div class="modal-head">

          <div>
            <div class="modal-title">
              ${escapeHtml(
                member.name
              )}
            </div>

            <div class="section-note">
              Member options
            </div>
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>

        <div class="menu-list">

          <button
            class="menu-item"
            data-member-action="temporary-chat"
            data-group-id="${group.id}"
            data-member-id="${member.id}"
          >
            <div class="menu-icon">
              💬
            </div>

            <div>
              <strong>
                Temporary Chat
              </strong>

              <span>
                Request a private temporary conversation.
              </span>
            </div>
          </button>

          <button
            class="menu-item"
            data-member-action="cancel"
          >
            <div class="menu-icon">
              ×
            </div>

            <div>
              <strong>
                Cancel
              </strong>

              <span>
                Close this menu.
              </span>
            </div>
          </button>

        </div>
      </div>
    </div>
  `;
}

/* =========================================================
   POSTS
   ========================================================= */

function getPostGroups() {
  const ids =
    new Set(
      state.groups.map(
        group => group.id
      )
    );

  return state.groups.filter(
    group => ids.has(group.id)
  );
}

function getFilteredPosts() {
  const cutoff =
    now() -
    MESSAGE_LIFETIME;

  const validPosts =
    state.posts.filter(
      post =>
        Number(post.createdAt || 0) >
        cutoff
    );

  if (
    state.postFilter === "all"
  ) {
    return validPosts;
  }

  return validPosts.filter(
    post =>
      post.groupId ===
      state.postFilter
  );
}

function renderPosts() {
  setHeader(
    "Posts",
    "Video posts from your groups"
  );

  const posts =
    getFilteredPosts();

  const groups =
    getPostGroups();

  screen.innerHTML = `
    <div class="section-head">

      <div>
        <div class="section-title">
          Posts
        </div>

        <div class="section-note">
          Posts disappear after 2 days
        </div>
      </div>

    </div>

    <div class="post-filter-row">

      <button
        class="chip ${
          state.postFilter === "all"
            ? "selected"
            : ""
        }"
        data-post-group="all"
      >
        All
      </button>

      ${groups
        .map(
          group => `
            <button
              class="chip ${
                state.postFilter ===
                group.id
                  ? "selected"
                  : ""
              }"
              data-post-group="${escapeHtml(
                group.id
              )}"
            >
              ${escapeHtml(
                group.name
              )}
            </button>
          `
        )
        .join("")}

    </div>

    ${
      posts.length
        ? `
          <div class="post-grid">
            ${posts
              .map(renderPostCard)
              .join("")}
          </div>
        `
        : `
          <div class="empty">
            <div class="empty-icon">
              🎥
            </div>

            <h3>
              No posts
            </h3>

            <p>
              New video posts from your groups will appear here.
            </p>
          </div>
        `
    }

    <button
      class="fab"
      data-action="create-post"
      aria-label="Create post"
      title="Create post"
    >
      <svg viewBox="0 0 24 24">
        <path d="M7 5h10v14H7z"/>
        <path d="m10 9 5 3-5 3z"/>
      </svg>
    </button>
  `;

  document
    .querySelectorAll(
      "[data-post-group]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          state.postFilter =
            button.dataset.postGroup;

          saveState();
          renderPosts();
        }
      );
    });
}

function renderPostCard(post) {
  const group =
    getGroup(post.groupId);

  return `
    <button
      class="post-card"
      data-post="${escapeHtml(
        post.id
      )}"
    >

      <div class="post-media">

        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M7 5h10v14H7z"/>
          <path d="m10 9 5 3-5 3z"/>
        </svg>

      </div>

      <div class="post-info">

        <strong>
          ${escapeHtml(
            post.author
          )}
        </strong>

        <span>
          ${
            group
              ? escapeHtml(
                  group.name
                )
              : "Group"
          }
        </span>

        <small>
          ${post.views} views
          ·
          ${post.reactions} reactions
        </small>

      </div>

    </button>
  `;
}

function postModal(postId) {
  const post =
    state.posts.find(
      item => item.id === postId
    );

  if (!post) {
    return;
  }

  const group =
    getGroup(post.groupId);

  modalRoot.innerHTML = `
    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div>

            <div class="modal-title">
              ${escapeHtml(
                post.author
              )}'s Post
            </div>

            <div class="section-note">
              ${
                group
                  ? escapeHtml(
                      group.name
                    )
                  : ""
              }
            </div>

          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>

        <div
          class="post-media"
          style="
            height:330px;
            border-radius:20px;
          "
        >
          <svg viewBox="0 0 24 24">
            <path d="M7 5h10v14H7z"/>
            <path d="m10 9 5 3-5 3z"/>
          </svg>
        </div>

        <div
          style="
            display:flex;
            gap:8px;
            margin-top:12px;
            flex-wrap:wrap;
          "
        >

          <span class="chip">
            ${post.views} views
          </span>

          <span class="chip">
            ♡ ${post.reactions}
          </span>

          <span class="chip">
            Comments ${post.comments}
          </span>

        </div>

        <p
          style="
            color:var(--muted);
            font-size:12px;
            line-height:1.5;
          "
        >
          Posts disappear automatically after 2 days.
        </p>

      </div>

    </div>
  `;
}

/* =========================================================
   SEARCH / FIND GROUPS
   ========================================================= */

function renderSearch() {
  setHeader(
    "Find Groups",
    "Search and request to join"
  );

  screen.innerHTML = `
    <div class="section-head">

      <div>
        <div class="section-title">
          Find groups
        </div>

        <div class="section-note">
          Search existing groups and request to join.
        </div>
      </div>

    </div>

    <div class="search-box">

      <svg viewBox="0 0 24 24">
        <circle
          cx="10.8"
          cy="10.8"
          r="6.7"
        />
        <path
          d="m16 16 4.2 4.2"
        />
      </svg>

      <input
        id="groupSearch"
        autofocus
        placeholder="Search groups"
      >

    </div>

    <div
      id="searchResults"
      class="group-list"
    >
      ${renderSearchResults(
        state.groups
      )}
    </div>
  `;

  const input =
    $("#groupSearch");

  if (input) {
    input.addEventListener(
      "input",
      event => {
        const query =
          event.target.value
            .toLowerCase()
            .trim();

        const results =
          state.groups.filter(
            group =>
              group.name
                .toLowerCase()
                .includes(query) ||
              group.category.some(
                category =>
                  category
                    .toLowerCase()
                    .includes(query)
              )
          );

        const resultBox =
          $("#searchResults");

        if (resultBox) {
          resultBox.innerHTML =
            renderSearchResults(
              results
            );

          bindSearchJoinButtons();
        }
      }
    );
  }

  bindSearchJoinButtons();
}

function renderSearchResults(
  groups
) {
  if (!groups.length) {
    return `
      <div class="empty">
        <div class="empty-icon">
          🔎
        </div>

        <h3>
          No groups found
        </h3>

        <p>
          Try another group name or category.
        </p>
      </div>
    `;
  }

  return groups
    .map(
      group => `
        <div
          class="group-card"
          style="cursor:default"
        >

          <span
            class="group-avatar"
            style="--h:${group.hue}"
          >
            ${escapeHtml(
              group.icon
            )}
          </span>

          <span class="group-copy">

            <span class="group-name">
              ${escapeHtml(
                group.name
              )}
            </span>

            <span class="group-meta">
              ${group.category
                .map(escapeHtml)
                .join(" · ")}
              ·
              ${group.members.length}
              members
            </span>

          </span>

          <button
            class="secondary-btn"
            data-join-group="${escapeHtml(
              group.id
            )}"
          >
            ${
              state.joinRequests[
                group.id
              ]
                ? "Requested"
                : "Request"
            }
          </button>

        </div>
      `
    )
    .join("");
}

function bindSearchJoinButtons() {
  document
    .querySelectorAll(
      "[data-join-group]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          requestJoin(
            button.dataset.joinGroup
          );
        }
      );
    });
}

function requestJoin(groupId) {
  const group =
    getGroup(groupId);

  if (!group) {
    return;
  }

  if (
    state.joinRequests[groupId]
  ) {
    alert(
      "Your join request is already pending in this local prototype."
    );
    return;
  }

  state.joinRequests[groupId] = {
    status: "pending",
    createdAt: now()
  };

  saveState();

  alert(
    `Join request sent to ${group.name}.`
  );

  renderSearch();
}

/* =========================================================
   JOIN MODAL
   ========================================================= */

function joinGroupModal() {
  modalRoot.innerHTML = `
    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            Find a group
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>

        <p
          style="
            color:var(--muted);
            font-size:13px;
            line-height:1.5;
          "
        >
          Search existing groups and request to join them.
        </p>

        <button
          class="primary-btn"
          data-action="open-search"
        >
          Open Group Search
        </button>

      </div>

    </div>
  `;
}

/* =========================================================
   NEW GROUP
   ========================================================= */

function renderNewGroup() {
  setHeader(
    "New Group",
    "Create a group"
  );

  screen.innerHTML = `
    <div class="section-head">

      <div>
        <div class="section-title">
          New Group
        </div>

        <div class="section-note">
          Select up to 3 categories.
        </div>
      </div>

    </div>

    <div class="field">

      <label>
        Group name
      </label>

      <input
        id="newGroupName"
        placeholder="Enter group name"
        maxlength="80"
      >

    </div>

    <div class="field">

      <label>
        Categories
      </label>

      <div
        class="chip-row"
        id="categoryOptions"
      >

        ${CATEGORIES
          .map(
            category => `
              <button
                class="chip"
                type="button"
                data-cat="${escapeHtml(
                  category
                )}"
              >
                ${escapeHtml(
                  category
                )}
              </button>
            `
          )
          .join("")}

      </div>

    </div>

    <button
      class="primary-btn"
      data-action="create-group"
    >
      Create Group
    </button>
  `;

  document
    .querySelectorAll(
      "[data-cat]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {

          const selected =
            document.querySelectorAll(
              "[data-cat].selected"
            );

          if (
            !button.classList.contains(
              "selected"
            ) &&
            selected.length >= 3
          ) {
            alert(
              "You can select a maximum of 3 categories."
            );

            return;
          }

          button.classList.toggle(
            "selected"
          );
        }
      );
    });
}

function createGroup() {
  const input =
    $("#newGroupName");

  if (!input) {
    return;
  }

  const name =
    input.value.trim();

  const categories =
    [
      ...document.querySelectorAll(
        "[data-cat].selected"
      )
    ].map(
      button =>
        button.dataset.cat
    );

  if (!name) {
    alert(
      "Enter a group name."
    );
    return;
  }

  if (!categories.length) {
    alert(
      "Select at least one category."
    );
    return;
  }

  if (categories.length > 3) {
    alert(
      "You can select a maximum of 3 categories."
    );
    return;
  }

  const id =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now();

  const newGroup = {
    id,
    name,
    icon:
      name
        .charAt(0)
        .toUpperCase(),
    hue: randomHue(),
    category: categories,
    admin: true,
    unseen: 0,
    members: [
      {
        id: state.currentUser.id,
        name: state.currentUser.name,
        avatar: state.currentUser.avatar,
        hue: state.currentUser.hue
      }
    ]
  };

  state.groups.unshift(
    newGroup
  );

  state.messages[id] = [];

  state.selectedGroup = id;
  state.previousScreen =
    "home";
  state.screen =
    "group-profile";

  saveState();
  render();
}

/* =========================================================
   READ ALL
   ========================================================= */

function readAll() {
  state.groups.forEach(
    group => {
      group.unseen = 0;

      if (
        state.messages[group.id]
      ) {
        state.messages[
          group.id
        ].forEach(message => {
          message.read = true;
        });
      }
    }
  );

  saveState();
  render();

  alert(
    "All group messages are marked as read."
  );
}

/* =========================================================
   CHAT MENU
   ========================================================= */

function openChatMenu() {
  const group =
    getGroup(
      state.selectedGroup
    );

  if (!group) {
    return;
  }

  modalRoot.innerHTML = `
    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            Chat options
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>

        <div class="menu-list">

          <button
            class="menu-item"
            data-chat-action="report"
          >
            <div class="menu-icon">
              ⚑
            </div>

            <div>
              <strong>
                Report
              </strong>

              <span>
                Report this group.
              </span>
            </div>
          </button>

          <button
            class="menu-item"
            data-chat-action="leave"
          >
            <div class="menu-icon">
              ←
            </div>

            <div>
              <strong>
                Leave Group
              </strong>

              <span>
                Leave and remove the group from Home.
              </span>
            </div>
          </button>

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettings() {
  setHeader(
    "Settings",
    "Profile and appearance"
  );

  const user =
    state.currentUser;

  screen.innerHTML = `
    <div class="section-head">

      <div>
        <div class="section-title">
          Settings
        </div>

        <div class="section-note">
          Profile and appearance
        </div>
      </div>

    </div>

    <button
      class="group-card"
      data-action="profile"
    >

      <span
        class="group-avatar"
        style="--h:${user.hue}"
      >
        ${escapeHtml(
          user.avatar
        )}
      </span>

      <span class="group-copy">

        <span class="group-name">
          ${escapeHtml(
            user.name
          )}
        </span>

        <span class="group-meta">
          @${escapeHtml(
            user.username
          )}
          ·
          ${escapeHtml(
            user.email
          )}
        </span>

      </span>

      <span>
        ›
      </span>

    </button>

    <div style="height:12px"></div>

    <div
      class="group-card"
      style="display:block"
    >

      <div class="setting-row">

        <div class="setting-copy">

          <strong>
            Theme
          </strong>

          <p>
            Follow the phone or choose light/dark.
          </p>

        </div>

        <div class="theme-options">

          ${
            ["system", "light", "dark"]
              .map(
                theme => `
                  <button
                    class="theme-option ${
                      state.theme ===
                      theme
                        ? "active"
                        : ""
                    }"
                    data-theme="${theme}"
                  >
                    ${
                      theme
                        .charAt(0)
                        .toUpperCase() +
                      theme.slice(1)
                    }
                  </button>
                `
              )
              .join("")
          }

        </div>

      </div>

      <div class="setting-row">

        <div class="setting-copy">

          <strong>
            Message lifetime
          </strong>

          <p>
            Messages disappear automatically after 2 days.
          </p>

        </div>

        <span
          style="color:var(--accent)"
        >
          2 days
        </span>

      </div>

      <div class="setting-row">

        <div class="setting-copy">

          <strong>
            Posts lifetime
          </strong>

          <p>
            Video posts disappear automatically after 2 days.
          </p>

        </div>

        <span
          style="color:var(--accent)"
        >
          2 days
        </span>

      </div>

    </div>
  `;

  document
    .querySelectorAll(
      "[data-theme]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          state.theme =
            button.dataset.theme;

          saveState();
          renderSettings();
          applyTheme();
        }
      );
    });
}

/* =========================================================
   PROFILE
   ========================================================= */

function openProfileEditor() {
  const user =
    state.currentUser;

  modalRoot.innerHTML = `
    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            Edit Profile
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>

        <div class="field">

          <label>
            Profile picture
          </label>

          <input
            id="profileAvatar"
            maxlength="1"
            value="${escapeHtml(
              user.avatar
            )}"
          >

        </div>

        <div class="field">

          <label>
            Username
          </label>

          <input
            id="profileUsername"
            value="${escapeHtml(
              user.username
            )}"
          >

        </div>

        <div class="field">

          <label>
            Email
          </label>

          <input
            id="profileEmail"
            type="email"
            value="${escapeHtml(
              user.email
            )}"
          >

        </div>

        <button
          class="primary-btn"
          data-action="save-profile"
        >
          Save Profile
        </button>

      </div>

    </div>
  `;
}

function saveProfile() {
  const avatar =
    $("#profileAvatar");

  const username =
    $("#profileUsername");

  const email =
    $("#profileEmail");

  if (
    !avatar ||
    !username ||
    !email
  ) {
    return;
  }

  const cleanUsername =
    username.value.trim();

  const cleanEmail =
    email.value.trim();

  if (!cleanUsername) {
    alert(
      "Enter a username."
    );
    return;
  }

  if (!cleanEmail) {
    alert(
      "Enter an email."
    );
    return;
  }

  state.currentUser.avatar =
    (
      avatar.value.trim() ||
      "Y"
    )
      .charAt(0)
      .toUpperCase();

  state.currentUser.username =
    cleanUsername;

  state.currentUser.email =
    cleanEmail;

  saveState();

  modalRoot.innerHTML = "";

  renderSettings();
}

/* =========================================================
   CALL FOUNDATION
   ========================================================= */

function startGroupCall(type) {
  const group =
    getGroup(
      state.selectedGroup
    );

  if (!group) {
    return;
  }

  if (!group.admin) {
    alert(
      "Only group admins can start group calls."
    );
    return;
  }

  alert(
    `${
      type === "video"
        ? "Video"
        : "Voice"
    } group call interface will be connected in the calls stage.`
  );
}

/* =========================================================
   MAIN MENU
   ========================================================= */

function openMainMenu() {
  modalRoot.innerHTML = `
    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            SimpoChat
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>

        <div class="menu-list">

          <button
            class="menu-item"
            data-action="new-group"
          >
            <div class="menu-icon">
              ＋
            </div>

            <div>
              <strong>
                New Group
              </strong>

              <span>
                Create a group and choose up to 3 categories.
              </span>
            </div>
          </button>

          <button
            class="menu-item"
            data-action="open-search"
          >
            <div class="menu-icon">
              🔎
            </div>

            <div>
              <strong>
                Find Groups
              </strong>

              <span>
                Search groups and request to join.
              </span>
            </div>
          </button>

          <button
            class="menu-item"
            data-screen="starred"
          >
            <div class="menu-icon">
              ★
            </div>

            <div>
              <strong>
                Starred
              </strong>

              <span>
                View your favourite groups.
              </span>
            </div>
          </button>

          <button
            class="menu-item"
            data-menu="read-all"
          >
            <div class="menu-icon">
              ✓
            </div>

            <div>
              <strong>
                Read All
              </strong>

              <span>
                Mark group messages as seen.
              </span>
            </div>
          </button>

          <button
            class="menu-item"
            data-screen="settings"
          >
            <div class="menu-icon">
              ⚙
            </div>

            <div>
              <strong>
                Settings
              </strong>

              <span>
                Profile and appearance.
              </span>
            </div>
          </button>

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   TEMPORARY CHAT FOUNDATION
   ========================================================= */

function temporaryChatRequest(
  groupId,
  memberId
) {
  const group =
    getGroup(groupId);

  const member =
    getMember(
      group,
      memberId
    );

  if (!group || !member) {
    return;
  }

  alert(
    `Temporary chat request prepared for ${member.name}. The acceptance/temporary-chat system will be connected in the next communication stage.`
  );
}

/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    /* -----------------------------------------
       Modal close
       ----------------------------------------- */

    if (
      event.target.closest(
        "[data-close]"
      )
    ) {
      modalRoot.innerHTML = "";
      return;
    }

    /* -----------------------------------------
       General actions
       ----------------------------------------- */

    const actionElement =
      event.target.closest(
        "[data-action]"
      );

    const action =
      actionElement?.dataset.action;

    if (action === "open-menu") {
      openMainMenu();
      return;
    }

    if (action === "open-posts") {
      state.previousScreen =
        state.screen;

      state.screen = "posts";

      saveState();
      render();

      return;
    }

    if (action === "open-search") {
      modalRoot.innerHTML = "";

      state.previousScreen =
        state.screen;

      state.screen = "search";

      saveState();
      render();

      return;
    }

    if (action === "join-group") {
      joinGroupModal();
      return;
    }

    if (action === "new-group") {
      modalRoot.innerHTML = "";

      state.previousScreen =
        state.screen;

      state.screen =
        "new-group";

      saveState();
      render();

      return;
    }

    if (action === "create-group") {
      createGroup();
      return;
    }

    if (action === "back") {
      goBack();
      return;
    }

    if (action === "group-profile") {
      state.previousScreen =
        state.screen;

      state.screen =
        "group-profile";

      saveState();
      render();

      return;
    }

    if (
      action ===
      "view-group-posts"
    ) {
      state.previousScreen =
        state.screen;

      state.postFilter =
        state.selectedGroup ||
        "all";

      state.screen = "posts";

      saveState();
      render();

      return;
    }

    if (action === "chat-menu") {
      openChatMenu();
      return;
    }

    if (action === "voice-call") {
      startGroupCall("voice");
      return;
    }

    if (action === "video-call") {
      startGroupCall("video");
      return;
    }

    if (action === "attachment") {
      alert(
        "Attachments will be connected in the media stage."
      );
      return;
    }

    if (action === "camera") {
      alert(
        "Camera and media selection will be connected in the media stage."
      );
      return;
    }

    if (action === "microphone") {
      alert(
        "Voice messages will be connected in the media stage."
      );
      return;
    }

    if (action === "send-message") {
      sendMessage();
      return;
    }

    if (action === "create-post") {
      alert(
        "Post creation will be connected next: record/select a video or select a group of photos."
      );
      return;
    }

    if (action === "select-all") {
      const groups =
        visibleGroups();

      if (
        state.selectedItems.length ===
        groups.length
      ) {
        unselectAllVisible();
      } else {
        selectAllVisible();
      }

      return;
    }

    if (
      action ===
      "cancel-selection"
    ) {
      state.selectionMode =
        false;

      state.selectedItems = [];

      saveState();
      render();

      return;
    }

    if (
      action ===
      "remove-selected"
    ) {
      removeSelectedGroups();
      return;
    }

    if (action === "profile") {
      openProfileEditor();
      return;
    }

    if (
      action ===
      "save-profile"
    ) {
      saveProfile();
      return;
    }

    /* -----------------------------------------
       Bottom / menu screen navigation
       ----------------------------------------- */

    const nav =
      event.target.closest(
        "[data-screen]"
      );

    if (nav) {
      modalRoot.innerHTML = "";

      setScreen(
        nav.dataset.screen
      );

      return;
    }

    /* -----------------------------------------
       Read All
       ----------------------------------------- */

    const menuItem =
      event.target.closest(
        "[data-menu]"
      );

    if (
      menuItem &&
      menuItem.dataset.menu ===
        "read-all"
    ) {
      modalRoot.innerHTML = "";

      readAll();
      return;
    }

    /* -----------------------------------------
       Post cards
       ----------------------------------------- */

    const post =
      event.target.closest(
        "[data-post]"
      );

    if (post) {
      postModal(
        post.dataset.post
      );
      return;
    }

    /* -----------------------------------------
       Group actions
       ----------------------------------------- */

    const groupAction =
      event.target.closest(
        "[data-group-action]"
      );

    if (groupAction) {
      const groupId =
        groupAction.dataset.groupId;

      const type =
        groupAction.dataset.groupAction;

      const group =
        getGroup(groupId);

      if (!group) {
        return;
      }

      modalRoot.innerHTML = "";

      if (type === "star") {

        if (
          isStarred(groupId)
        ) {
          removeStar(groupId);
        } else {
          addStar(groupId);
        }

        saveState();
        render();

        return;
      }

      if (type === "archive") {

        if (
          isArchived(groupId)
        ) {
          unarchiveGroup(
            groupId
          );
        } else {
          archiveGroup(
            groupId
          );
        }

        saveState();
        render();

        return;
      }

      if (type === "select") {
        enterSelectionMode(
          groupId
        );
        return;
      }

      if (type === "open") {
        openGroup(groupId);
        return;
      }
    }

    /* -----------------------------------------
       Chat actions
       ----------------------------------------- */

    const chatAction =
      event.target.closest(
        "[data-chat-action]"
      );

    if (chatAction) {

      const type =
        chatAction.dataset.chatAction;

      modalRoot.innerHTML = "";

      if (type === "leave") {

        const group =
          getGroup(
            state.selectedGroup
          );

        if (group) {

          state.groups =
            state.groups.filter(
              item =>
                item.id !==
                group.id
            );

          removeStar(
            group.id
          );

          unarchiveGroup(
            group.id
          );

          delete state.messages[
            group.id
          ];
        }

        state.selectedGroup =
          null;

        state.screen =
          "home";

        saveState();
        render();

        return;
      }

      if (type === "report") {
        alert(
          "Report will use the Tally form when the reporting stage is connected."
        );
        return;
      }
    }

    /* -----------------------------------------
       Member actions
       ----------------------------------------- */

    const memberAction =
      event.target.closest(
        "[data-member-action]"
      );

    if (memberAction) {

      const type =
        memberAction.dataset
          .memberAction;

      if (
        type ===
        "temporary-chat"
      ) {

        modalRoot.innerHTML =
          "";

        temporaryChatRequest(
          memberAction
            .dataset
            .groupId,
          memberAction
            .dataset
            .memberId
        );

        return;
      }

      if (
        type === "cancel"
      ) {
        modalRoot.innerHTML =
          "";

        return;
      }
    }

    /* -----------------------------------------
       Theme
       ----------------------------------------- */

    const themeButton =
      event.target.closest(
        "[data-theme]"
      );

    if (themeButton) {

      state.theme =
        themeButton.dataset.theme;

      saveState();
      applyTheme();

      if (
        state.screen ===
        "settings"
      ) {
        renderSettings();
      }

      return;
    }
  }
);

/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      document.activeElement?.id ===
        "messageInput"
    ) {
      event.preventDefault();
      sendMessage();
      return;
    }

    if (
      event.key === "Escape"
    ) {
      modalRoot.innerHTML = "";
    }
  }
);

/* =========================================================
   PERIODIC EXPIRATION
   ========================================================= */

setInterval(
  () => {
    removeExpiredMessages();

    if (
      state.screen ===
      "home"
    ) {
      render();
    }
  },
  60 * 1000
);

/* =========================================================
   INITIALIZE
   ========================================================= */

removeExpiredMessages();
applyTheme();
render();
