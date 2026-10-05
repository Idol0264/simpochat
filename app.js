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
const PROFILE_SETUP_KEY = "simpochat-profile-setup-v1";
const SESSION_TOKEN_KEY = "simpochat-session-token-v1";
const SIMPOCHAT_ACCESS_URL =
  "https://uaxxzgkvjzemsevuzlcw.supabase.co/functions/v1/check-simpochat-access";

const MESSAGE_LIFETIME = 2 * 24 * 60 * 60 * 1000;
const TWO_DAYS_MS = MESSAGE_LIFETIME;

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

let messageActionTimer = null;
let activeMessageActionId = null;
let pendingReplyMessageId = null;

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

let pendingNewGroupPhoto = "";

let activeCameraStream = null;

let cameraMediaItems = [];

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

/* ---------------------------------------------------------
   GROUP JOIN NOTIFICATIONS + ADMIN HELPERS
   --------------------------------------------------------- */

function isGroupAdmin(group) {

  if (!group) {
    return false;
  }

  /* Local admin flag */
  if (group.admin === true) {
    return true;
  }

  /* Creator */
  if (
    group.creatorId &&
    state.currentUser?.id &&
    group.creatorId ===
      state.currentUser.id
  ) {
    return true;
  }

  /* Remote/member role */
  const currentMember =
    safeArray(group.members).find(
      member =>
        member.id ===
        state.currentUser?.id
    );

  return (
    currentMember?.role === "admin" ||
    currentMember?.role === "creator"
  );
}


/* ---------------------------------------------------------
   LOAD GROUP JOIN REQUESTS
   --------------------------------------------------------- */

async function loadGroupJoinNotifications(
  groupId
) {

  if (!groupId) {
    return [];
  }

  const sessionToken =
    localStorage.getItem(
      SESSION_TOKEN_KEY
    );

  if (!sessionToken) {
    return [];
  }

  try {

    const response =
      await fetch(
        SIMPOCHAT_ACCESS_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${sessionToken}`
          },

          body: JSON.stringify({
            action:
              "get_group_join_requests",

            group_id:
              groupId
          })
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      data.success !== true
    ) {
      console.warn(
        "Could not load group join requests:",
        data.message
      );

      return [];
    }

    const requests =
      safeArray(data.requests);

    state.groupJoinNotifications =
      state.groupJoinNotifications ||
      {};

    state.groupJoinNotifications[
      groupId
    ] = requests;

    saveState();

    return requests;

  } catch (error) {

    console.error(
      "Group join notifications failed:",
      error
    );

    return [];
  }
}


/* ---------------------------------------------------------
   GET CACHED GROUP JOIN REQUESTS
   --------------------------------------------------------- */

function getGroupJoinNotifications(
  groupId
) {

  return safeArray(
    state.groupJoinNotifications?.[
      groupId
    ]
  );
}


/* ---------------------------------------------------------
   REVIEW GROUP JOIN REQUEST
   --------------------------------------------------------- */

async function reviewGroupJoinRequest(
  groupId,
  requestId,
  decision
) {

  if (
    !groupId ||
    !requestId ||
    ![
      "approved",
      "rejected"
    ].includes(decision)
  ) {
    return {
      success: false,
      message:
        "Invalid join request."
    };
  }

  const sessionToken =
    localStorage.getItem(
      SESSION_TOKEN_KEY
    );

  if (!sessionToken) {
    return {
      success: false,
      message:
        "Your SimpoChat session has expired."
    };
  }

  try {

    const response =
      await fetch(
        SIMPOCHAT_ACCESS_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${sessionToken}`
          },

          body: JSON.stringify({
            action:
              "review_group_join_request",

            group_id:
              groupId,

            request_id:
              requestId,

            decision:
              decision
          })
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      data.success !== true
    ) {
      return {
        success: false,
        message:
          data.message ||
          "Unable to review this request."
      };
    }

    /*
     * Refresh the notification list so the
     * red notification dot disappears when
     * there are no remaining pending requests.
     */
    await loadGroupJoinNotifications(
      groupId
    );

    return {
      success: true,
      message:
        data.message ||
        (
          decision === "approved"
            ? "Member approved."
            : "Request declined."
        )
    };

  } catch (error) {

    console.error(
      "Join request review failed:",
      error
    );

    return {
      success: false,
      message:
        "Unable to process the request right now."
    };
  }
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

    stopGroupMessageRefresh();
     
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

/* =========================================================
   SIMPOCHAT — SECTION 2/5
   RENDERING + HOME + STARRED + ARCHIVED
   ========================================================= */

/* ---------------------------------------------------------
   MAIN RENDER CONTROLLER
   --------------------------------------------------------- */

function render() {

  cleanupExpired();

  applyTheme();

     const temporaryChatFab =
  document.querySelector(
    "#temporaryChatFab"
  );

if (temporaryChatFab) {
  const onHome =
    state.screen === "home";

  const deletingSelectedGroups =
    onHome &&
    state.selectionMode &&
    state.selectedItems.length > 0;

  temporaryChatFab.hidden =
    !onHome;

  /*
   * HOME:
   *
   * No groups selected:
   * → Temporary Chat button
   *
   * Groups selected:
   * → Delete button
   */
  temporaryChatFab.dataset.action =
    deletingSelectedGroups
      ? "remove-selected"
      : "open-temporary-chat";

  temporaryChatFab.setAttribute(
    "aria-label",
    deletingSelectedGroups
      ? "Delete selected groups"
      : "Temporary Chat"
  );

  temporaryChatFab.setAttribute(
    "title",
    deletingSelectedGroups
      ? "Delete selected groups"
      : "Temporary Chat"
  );

  temporaryChatFab.innerHTML =
    deletingSelectedGroups
      ? `
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          aria-hidden="true"
        >
          <path
            d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M7 7l.8 12.2a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7M10 11v6M14 11v6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `
      : `
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          aria-hidden="true"
        >
          <path
            d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <path
            d="M7.5 10h9M7.5 13.5h6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />
        </svg>
      `;
}

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
    return renderHome();
  }
   
   if (
      state.screen ===
      "temporary-chat-inbox"
   ) {
      return renderTemporaryChatInbox();
   }

  if (state.screen === "starred") {
    return renderGroupCollection(
      "starred"
    );
  }

  if (state.screen === "archived") {
    return renderGroupCollection(
      "archived"
    );
  }

  if (state.screen === "posts") {
    return renderPosts();
  }

  if (state.screen === "search") {
    return renderSearch();
  }

  if (state.screen === "settings") {
    return renderSettings();
  }

  if (state.screen === "new-group") {
    return renderNewGroup();
  }

 if (state.screen === "temporary-chat") {
    return renderTemporaryChat(
       state.selectedMember
    );

  }

  if (state.screen === "group-chat") {
    return renderGroupChat();
  }

  if (state.screen === "group-profile") {
    return renderGroupProfile();
  }

  state.screen = "home";

  renderHome();
}


/* ---------------------------------------------------------
   HOME
   --------------------------------------------------------- */

function renderHome() {

  setHeader(
    "SimpoChat",
    "Your groups"
  );

  const groups =
    visibleGroups();

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
        : emptyGroups("home")
    }

  `;

  bindGroupCards();
}


/* ---------------------------------------------------------
   STARRED / ARCHIVED COLLECTIONS
   --------------------------------------------------------- */

function renderGroupCollection(
  type
) {

  const groups =
    visibleGroups();

  const title =
    type === "starred"
      ? "Starred"
      : "Archived";

  setHeader(
    title,
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
          ${title}
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
        : emptyGroups(type)
    }

  `;

  bindGroupCards();
}


/* ---------------------------------------------------------
   EMPTY GROUP STATE
   --------------------------------------------------------- */

function emptyGroups(type) {

  let title =
    "No groups yet";

  let icon =
    "💬";

  let description =
    "Create a group or search for an existing group to join.";

  if (type === "starred") {

    title =
      "No starred groups";

    icon =
      "⭐";

    description =
      "Groups you star will appear here.";

  }

  if (type === "archived") {

    title =
      "No archived groups";

    icon =
      "🗂️";

    description =
      "Groups you archive will appear here.";

  }

  return `

    <div class="empty">

      <div class="empty-icon">
        ${icon}
      </div>

      <h3>
        ${esc(title)}
      </h3>

      <p>
        ${esc(description)}
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


/* ---------------------------------------------------------
   GROUP CARD
   --------------------------------------------------------- */

function renderGroupCard(
  group
) {

  const selected =
    state.selectedItems
      .includes(group.id);

  const unseen =
    Number(group.unseen || 0);

  return `

    <button
      class="
        group-card
        ${selected
          ? "selected-card"
          : ""}
      "
      data-group="${esc(group.id)}"
      data-longpress="${esc(group.id)}"
    >

      ${
        state.selectionMode
          ? `
            <span
              class="
                selection-check
                ${
                  selected
                    ? "checked"
                    : ""
                }
              "
            >
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
      class="group-avatar ${group.photo ? "has-photo" : ""}"
      style="--h:${group.hue}"
      >
      ${
         group.photo
         ? `
         <img
         src="${group.photo}"
         alt="${esc(group.name)}"
         >
         `
         : esc(group.icon)
      }
      </span>
      ${esc(group.icon)}
      </span>

      <span class="group-copy">

        <span class="group-name">
          ${esc(group.name)}
        </span>

        <span class="group-meta">
          ${
            safeArray(
              group.category
            )
              .map(esc)
              .join(" · ")
          }
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


/* ---------------------------------------------------------
   GROUP CARD LONG-PRESS / TAP
   --------------------------------------------------------- */

function bindGroupCards() {

  document
    .querySelectorAll(
      "[data-longpress]"
    )
    .forEach(card => {

      const startPress = () => {

        clearTimeout(
          longPressTimer
        );

        longPressTriggered =
          false;

        longPressTimer =
          setTimeout(() => {

            longPressTriggered =
              true;

            openGroupActions(
              card.dataset.longpress
            );

          }, 550);

      };


      const clearPress = () => {

        clearTimeout(
          longPressTimer
        );

      };


      card.addEventListener(
        "pointerdown",
        startPress
      );

      card.addEventListener(
        "pointerup",
        clearPress
      );

      card.addEventListener(
        "pointerleave",
        clearPress
      );

      card.addEventListener(
        "pointercancel",
        clearPress
      );


      card.addEventListener(
        "click",
        event => {

          event.preventDefault();

          if (
            longPressTriggered
          ) {

            longPressTriggered =
              false;

            return;

          }

          const id =
            card.dataset.longpress;

          if (state.selectionMode) {

            toggleSelected(id);

          } else {

            openGroup(id);

          }

        }
      );

    });
}


/* ---------------------------------------------------------
   LONG-PRESS GROUP MENU
   --------------------------------------------------------- */

function openGroupActions(
  id
) {

  const group =
    getGroup(id);

  if (!group) {
    return;
  }

  const starred =
    isStarred(id);

  const archived =
    isArchived(id);

  modalRoot.innerHTML = `

    <div
      class="modal-backdrop"
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            ${esc(group.name)}
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>


        <div class="menu-list">


          <!-- STAR -->

          <button
            class="menu-item"
            data-group-action="star"
            data-group-id="${esc(id)}"
          >

            <div class="menu-icon">

              ${
                starred
                  ? "★"
                  : "☆"
              }

            </div>

            <div>

              <strong>
                ${
                  starred
                    ? "Remove Star"
                    : "Star Group"
                }
              </strong>

              <span>
                Keep this group in Starred.
              </span>

            </div>

          </button>


          <!-- ARCHIVE -->

          <button
            class="menu-item"
            data-group-action="archive"
            data-group-id="${esc(id)}"
          >

            <div class="menu-icon">
              🗂️
            </div>

            <div>

              <strong>
                ${
                  archived
                    ? "Unarchive"
                    : "Archive"
                }
              </strong>

              <span>
                ${
                  archived
                    ? "Return this group to Home."
                    : "Move this group to Archived."
                }
              </span>

            </div>

          </button>


          <!-- SELECT -->

          <button
            class="menu-item"
            data-group-action="select"
            data-group-id="${esc(id)}"
          >

            <div class="menu-icon">
              ✓
            </div>

            <div>

              <strong>
                Select
              </strong>

              <span>
                Select this group for more actions.
              </span>

            </div>

          </button>


          <!-- OPEN -->

          <button
            class="menu-item"
            data-group-action="open"
            data-group-id="${esc(id)}"
          >

            <div class="menu-icon">
              →
            </div>

            <div>

              <strong>
                Open Group
              </strong>

              <span>
                Open the group chat.
              </span>

            </div>

          </button>


        </div>

      </div>

    </div>

  `;
}


/* ---------------------------------------------------------
   SELECTION MODE
   --------------------------------------------------------- */

function enterSelectionMode(
  id
) {

  state.selectionMode =
    true;

  state.selectedItems =
    [id];

  modalRoot.innerHTML = "";

  saveState();

  render();
}


function toggleSelected(
  id
) {

  state.selectionMode =
    true;

  if (
    state.selectedItems
      .includes(id)
  ) {

    state.selectedItems =
      state.selectedItems.filter(
        item => item !== id
      );

  } else {

    state.selectedItems =
      [
        ...state.selectedItems,
        id
      ];

  }


  if (
    state.selectedItems.length === 0
  ) {

    state.selectionMode =
      false;

  }

  saveState();

  render();
}


/* ---------------------------------------------------------
   SELECT ALL
   --------------------------------------------------------- */

function selectAllVisible() {

  state.selectionMode =
    true;

  state.selectedItems =
    visibleGroups()
      .map(group => group.id);

  saveState();

  render();
}


/* ---------------------------------------------------------
   UNSELECT ALL
   --------------------------------------------------------- */

function unselectAllVisible() {

  state.selectedItems =
    [];

  state.selectionMode =
    false;

  saveState();

  render();
}


/* ---------------------------------------------------------
   REMOVE SELECTED GROUPS
   --------------------------------------------------------- */

function removeSelectedGroups() {

  const ids =
    new Set(
      state.selectedItems
    );

  if (!ids.size) {
    return;
  }

  state.groups =
    state.groups.filter(
      group =>
        !ids.has(group.id)
    );

  state.starred =
    state.starred.filter(
      id =>
        !ids.has(id)
    );

  state.archived =
    state.archived.filter(
      id =>
        !ids.has(id)
    );

  ids.forEach(id => {
    delete state.messages[id];
  });

  state.selectedItems =
    [];

  state.selectionMode =
    false;

  saveState();

  render();
}


/* ---------------------------------------------------------
   OPEN GROUP
   --------------------------------------------------------- */

async function openGroup(id) {

  const group =
    getGroup(id);

  if (!group) {
    return;
  }

  state.selectedGroup =
    id;

  /*
   * Opening a group marks its
   * unseen messages as read.
   */

  group.unseen = 0;

  state.previousScreen =
    state.screen;

  state.screen =
    "group-chat";

  saveState();

  render();

  await loadGroupMessages(id);

  /*
   * Only refresh if the user is
   * still viewing this same group.
   */

  if (
    state.screen === "group-chat" &&
    state.selectedGroup === id
  ) {
    renderGroupChat();
    startGroupMessageRefresh(id);
  }
}

/* ---------------------------------------------------------
   NEW GROUP SCREEN
   --------------------------------------------------------- */

function renderNewGroup() {
   
   pendingNewGroupPhoto = "";
   
   setHeader(
      "New Group",
      "Create a group"
   );

  screen.innerHTML = `

    <div class="section-head">

      <div>

        <div class="section-title">
          Create New Group
        </div>

        <div class="section-note">
          Choose up to 3 categories
        </div>

      </div>

    </div>


    <form id="newGroupForm">


      <!-- GROUP NAME -->

      <div class="field">

        <label
          for="newGroupName"
        >
          Group name
        </label>

        <input
          id="newGroupName"
          maxlength="80"
          autocomplete="off"
          placeholder="Enter group name"
          required
        >

      </div>


      
      <!-- GROUP PHOTO -->

      <div class="field">

        <label>
          Group photo
        </label>

        <div class="group-photo-picker">

          <div
            class="group-photo-preview"
            id="newGroupPhotoPreview"
            style="--h:265"
          >
            <span id="newGroupPhotoLetter">G</span>
          </div>

          <div class="group-photo-picker-actions">

            <label class="secondary-btn group-photo-button">
              Choose photo

              <input
                id="newGroupPhotoInput"
                type="file"
                accept="image/*"
                hidden
              >
            </label>

            <button
              type="button"
              class="secondary-btn"
              id="removeNewGroupPhoto"
              hidden
            >
              Remove
            </button>

          </div>

          <div class="form-note">
            Add a photo for your group. You can also change it later from Group Profile.
          </div>

        </div>

      </div>

      <!-- CATEGORIES -->

      <div class="field">

        <label>
          Categories
        </label>

        <div
          class="category-picker"
          id="categoryPicker"
        >

          <!-- FIRST CATEGORIES -->

          <div
            class="category-grid"
            id="categoryGrid"
          >

            ${CATEGORIES
              .slice(0, 4)
              .map(category => `

                <button
                  type="button"
                  class="category-option"
                  data-cat="${esc(category)}"
                >
                  ${esc(category)}
                </button>

              `)
              .join("")}

          </div>


          <!-- MORE CATEGORIES BUTTON -->

          <button
            type="button"
            class="category-more-btn"
            id="moreCategoriesToggle"
            aria-expanded="false"
          >
            More categories
          </button>


          <!-- REMAINING CATEGORIES -->

          <div
            class="category-grid category-grid-more"
            id="moreCategories"
            hidden
          >

            ${CATEGORIES
              .slice(4)
              .map(category => `

                <button
                  type="button"
                  class="category-option"
                  data-cat="${esc(category)}"
                >
                  ${esc(category)}
                </button>

              `)
              .join("")}

          </div>

        </div>

      </div>


      <!-- GROUP ACCESS -->

      <div class="field">

        <label>
          Group access
        </label>

        <div class="group-setting-options">

          <label class="group-setting-option">

            <input
              type="radio"
              name="joinPolicy"
              value="open"
              checked
            >

            <span>

              <strong>
                Anyone can join
              </strong>

              <small>
                People can join the group without approval.
              </small>

            </span>

          </label>


          <label class="group-setting-option">

            <input
              type="radio"
              name="joinPolicy"
              value="approval"
            >

            <span>

              <strong>
                Approval required
              </strong>

              <small>
                People must request to join before becoming members.
              </small>

            </span>

          </label>

        </div>

      </div>


      <!-- JOIN APPROVAL AUTHORITY -->

      <div
        class="field"
        id="joinApprovalField"
        hidden
      >

        <label>
          Who can approve join requests?
        </label>

        <div class="group-setting-options">

          <label class="group-setting-option">

            <input
              type="radio"
              name="joinApproval"
              value="any-admin"
              checked
            >

            <span>

              <strong>
                Any admin
              </strong>

              <small>
                Any group administrator can approve requests.
              </small>

            </span>

          </label>


          <label class="group-setting-option">

            <input
              type="radio"
              name="joinApproval"
              value="creator-only"
            >

            <span>

              <strong>
                Creator only
              </strong>

              <small>
                Only the original group creator can approve requests.
              </small>

            </span>

          </label>

        </div>

      </div>


      <!-- ACTIONS -->

      <div class="new-group-actions">

        <button
          class="primary-btn"
          type="submit"
        >
          Create Group
        </button>


        <button
          class="secondary-btn"
          type="button"
          data-action="back"
        >
          Cancel
        </button>

      </div>


    </form>

  `;


   
  /* ---------------------------------------------------------
     GROUP PHOTO PICKER
     --------------------------------------------------------- */

  const newGroupPhotoInput =
    $("#newGroupPhotoInput");

  const newGroupPhotoPreview =
    $("#newGroupPhotoPreview");

  const newGroupPhotoLetter =
    $("#newGroupPhotoLetter");

  const removeNewGroupPhoto =
    $("#removeNewGroupPhoto");

  if (
    newGroupPhotoInput &&
    newGroupPhotoPreview &&
    newGroupPhotoLetter
  ) {

    newGroupPhotoInput.addEventListener(
      "change",
      () => {

        const file =
          newGroupPhotoInput.files?.[0];

        if (!file) {
          return;
        }

        if (!file.type.startsWith("image/")) {
          alert("Please choose an image.");
          newGroupPhotoInput.value = "";
          return;
        }

        const reader =
          new FileReader();

        reader.onload = () => {

          pendingNewGroupPhoto =
            String(reader.result || "");

          newGroupPhotoPreview.style.backgroundImage =
            `url("${pendingNewGroupPhoto}")`;

          newGroupPhotoPreview.classList.add(
            "has-photo"
          );

          newGroupPhotoLetter.hidden = true;

          if (removeNewGroupPhoto) {
            removeNewGroupPhoto.hidden = false;
          }

        };

        reader.readAsDataURL(file);

      }
    );

  }

  if (removeNewGroupPhoto) {

    removeNewGroupPhoto.addEventListener(
      "click",
      () => {

        pendingNewGroupPhoto = "";

        if (newGroupPhotoInput) {
          newGroupPhotoInput.value = "";
        }

        if (newGroupPhotoPreview) {
          newGroupPhotoPreview.style.backgroundImage =
            "";
          newGroupPhotoPreview.classList.remove(
            "has-photo"
          );
        }

        if (newGroupPhotoLetter) {
          newGroupPhotoLetter.hidden = false;
        }

        removeNewGroupPhoto.hidden = true;

      }
    );

  }

  /*
   * CATEGORY SELECTION
   * Maximum = 3.
   */

  document
    .querySelectorAll(
      "[data-cat]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const selected =
            [
              ...document
                .querySelectorAll(
                  "[data-cat].selected"
                )
            ];


          /*
           * Unselect category.
           */

          if (
            button.classList.contains(
              "selected"
            )
          ) {

            button.classList.remove(
              "selected"
            );

            return;
          }


          /*
           * Maximum of 3 categories.
           */

          if (
            selected.length >= 3
          ) {

            alert(
              "You can select up to 3 categories."
            );

            return;
          }


          button.classList.add(
            "selected"
          );

        }
      );

    });


  /*
   * MORE CATEGORIES
   */

  const moreCategoriesToggle =
    $("#moreCategoriesToggle");

  const moreCategories =
    $("#moreCategories");


  if (
    moreCategoriesToggle &&
    moreCategories
  ) {

    moreCategoriesToggle.addEventListener(
      "click",
      () => {

        const opening =
          moreCategories.hidden;


        moreCategories.hidden =
          !opening;


        moreCategoriesToggle.textContent =
          opening
            ? "Hide categories"
            : "More categories";


        moreCategoriesToggle.setAttribute(
          "aria-expanded",
          String(opening)
        );

      }
    );

  }


  /*
   * GROUP ACCESS
   *
   * Approval options only appear when
   * "Approval required" is selected.
   */

  const joinPolicyInputs =
    document.querySelectorAll(
      'input[name="joinPolicy"]'
    );

  const joinApprovalField =
    $("#joinApprovalField");


  joinPolicyInputs.forEach(
    input => {

      input.addEventListener(
        "change",
        () => {

          const approvalRequired =
            input.value === "approval" &&
            input.checked;


          if (joinApprovalField) {

            joinApprovalField.hidden =
              !approvalRequired;

          }

        }
      );

    }
  );


  /*
   * FORM SUBMIT
   *
   * Handle submit directly so the Create Group
   * button works reliably on mobile.
   */

  const form =
    $("#newGroupForm");


  if (form) {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        createGroup();

      }
    );

  }

}


/* ---------------------------------------------------------
   CREATE GROUP
   --------------------------------------------------------- */

async function createGroup() {

  const input =
    $("#newGroupName");

  if (!input) {
    return;
  }

  const name =
    input.value.trim();

  const categories =
    [
      ...document
        .querySelectorAll(
          "[data-cat].selected"
        )
    ]
      .map(
        button =>
          button.dataset.cat
      )
      .filter(Boolean);

  const joinPolicyInput =
    document.querySelector(
      'input[name="joinPolicy"]:checked'
    );

  const joinPolicy =
    joinPolicyInput
      ? joinPolicyInput.value
      : "open";

  const joinApprovalInput =
    document.querySelector(
      'input[name="joinApproval"]:checked'
    );

  const joinApproval =
    joinApprovalInput
      ? joinApprovalInput.value
      : "any-admin";

  if (!name) {
    alert(
      "Enter a group name."
    );
    input.focus();
    return;
  }

  if (categories.length < 1) {
    alert(
      "Select at least 1 category."
    );
    return;
  }

  if (categories.length > 3) {
    alert(
      "Select no more than 3 categories."
    );
    return;
  }

  const sessionToken =
    localStorage.getItem(
      SESSION_TOKEN_KEY
    );

  if (!sessionToken) {
    alert(
      "Your SimpoChat session is not available. Please try again."
    );
    return;
  }

  const createButton =
    document.querySelector(
      "[data-action='create-group']"
    );

  if (createButton) {
    createButton.disabled = true;
    createButton.textContent =
      "Creating...";
  }

  try {

    const response =
      await fetch(
        SIMPOCHAT_ACCESS_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${sessionToken}`
          },

          body: JSON.stringify({
            action:
              "create_group",

            name,

            categories,

            join_policy:
              joinPolicy,

            approval_mode:
              joinApproval ===
              "creator-only"
                ? "creator"
                : "admins"
          })
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.group
    ) {
      throw new Error(
        data.message ||
        "Unable to create group."
      );
    }

    const remote =
      data.group;

    const group = {

      id:
        remote.id,

      name:
        remote.name ||
        name,

      icon:
        remote.icon ||
        name
          .charAt(0)
          .toUpperCase(),

      hue:
        randomHue(),

      category:
        safeArray(
          remote.category
        ).length
          ? safeArray(
              remote.category
            )
          : categories,

      photo:
        pendingNewGroupPhoto ||
        remote.photo_url ||
        "",

      creatorId:
        remote.creator_id ||
        remote.created_by ||
        state.currentUser.id,

      admin:
        true,

      joinPolicy:
        remote.join_policy ||
        remote.join_mode ||
        joinPolicy,

      joinApproval:
        remote.join_approval ||
        remote.approval_mode ||
        (
          joinApproval ===
          "creator-only"
            ? "creator"
            : "admins"
        ),

      unseen:
        0,

      members: [

        {
          id:
            state.currentUser.id,

          name:
            state.currentUser.name,

          avatar:
            state.currentUser.avatar,

          avatarImage:
            state.currentUser.avatarImage ||
            "",

          hue:
            state.currentUser.hue
        }

      ]

    };

    /*
     * Replace any local copy of
     * this same server group.
     */

    state.groups =
      safeArray(
        state.groups
      ).filter(
        existing =>
          existing.id !==
          group.id
      );

    state.groups.unshift(
      group
    );

    state.messages[group.id] =
      [];

    state.selectedGroup =
      group.id;

    state.previousScreen =
      "home";

    state.screen =
      "group-profile";

    state.selectionMode =
      false;

    state.selectedItems =
      [];

    pendingNewGroupPhoto =
      "";

    if (
      typeof modalRoot !==
      "undefined"
    ) {
      modalRoot.innerHTML =
        "";
    }

    saveState();

    render();

  } catch (error) {

    console.error(
      "SimpoChat group creation failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to create group right now."
    );

  } finally {

    if (createButton) {
      createButton.disabled =
        false;

      createButton.textContent =
        "Create Group";
    }

  }
}

/* =========================================================
   SIMPOCHAT — SECTION 3/5
   GROUP CHAT + GROUP PROFILE + MESSAGES + CHAT ACTIONS
   ========================================================= */


async function loadGroupMessages(groupId) {

  const sessionToken =
    localStorage.getItem(
      SESSION_TOKEN_KEY
    );

  if (!sessionToken || !groupId) {
    return [];
  }

  try {

    const response =
      await fetch(
        SIMPOCHAT_ACCESS_URL,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${sessionToken}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            action: "list_messages",
            group_id: groupId
          })
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.allowed ||
      !Array.isArray(data.messages)
    ) {
      throw new Error(
        data.message ||
        "Unable to load messages."
      );
    }

        state.messages[groupId] =
      data.messages.map(
        message => ({
          id: message.id,
          member: message.sender_id,
          sender: message.sender || null,
          text: message.text,
          createdAt: message.created_at,
          read: true,
          replyTo:
            message.reply_to || null,
          expiresAt:
            message.expires_at
        })
      );

    saveState();

    return state.messages[groupId];

  } catch (error) {

    console.error(
      "SimpoChat loadGroupMessages error:",
      error
    );

    return safeArray(
      state.messages[groupId]
    );

  }
}


let groupMessageRefreshTimer = null;

function startGroupMessageRefresh(groupId) {

  stopGroupMessageRefresh();

  groupMessageRefreshTimer =
    setInterval(async () => {

      if (
        state.screen !== "group-chat" ||
        state.selectedGroup !== groupId
      ) {
        stopGroupMessageRefresh();
        return;
      }

      await loadGroupMessages(groupId);

      if (
        state.screen === "group-chat" &&
        state.selectedGroup === groupId
      ) {
        renderGroupChat();
      }

    }, 1000);
}

function stopGroupMessageRefresh() {

  if (groupMessageRefreshTimer) {

    clearInterval(
      groupMessageRefreshTimer
    );

    groupMessageRefreshTimer =
      null;
  }
}


/* ---------------------------------------------------------
   GROUP CHAT
   --------------------------------------------------------- */

function renderGroupChat() {

  const group =
    getGroup(state.selectedGroup);

  if (!group) {

    state.screen =
      "home";

    saveState();

    return render();

  }


  setHeader(
    group.name,
    ""
  );


  const messages =
    safeArray(
      state.messages[group.id]
    );


  screen.innerHTML = `

    <div class="chat-screen">


      <!-- STICKY CHAT HEADER -->

      <div class="chat-sticky-header">


        <!-- GROUP HEADER -->

        <div class="chat-header">


          <button
            class="icon-btn"
            data-action="back"
            aria-label="Back"
          >
            ‹
          </button>


          <button
            class="chat-header-main"
            data-action="group-profile"
          >

            <span
            class="group-avatar small ${group.photo ? "has-photo" : ""}"
            style="--h:${group.hue}"
            >
            ${
               group.photo
               ? `
               <img
               src="${group.photo}"
               alt="${esc(group.name)}"
               >
               `
               : esc(group.icon)
            }
            </span>

            <span class="chat-header-copy">

              <strong>
                ${esc(group.name)}
              </strong>

              <span>
                ${group.members.length}
                members
              </span>

            </span>

          </button>


          <div class="chat-header-actions">


            <button
              class="icon-btn"
              data-action="voice-call"
              aria-label="Voice call"
            >
              ☎
            </button>


            <button
              class="icon-btn"
              data-action="video-call"
              aria-label="Video call"
            >
              ▣
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


        <!-- VIEW POST -->

        <button
          class="view-post-bar"
          data-action="group-posts"
        >

          <span>
            ◉
          </span>

          <strong>
            View Post
          </strong>

          <span>
            ›
          </span>

        </button>


      </div>


      <!-- MESSAGES -->

      <div
        class="messages"
        id="messages"
      >

        ${
          messages.length
            ? messages
                .map(
                  message =>
                    renderMessage(
                      message,
                      group
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
                  Start the conversation.
                </p>

              </div>
            `
        }

      </div>


      <!-- MESSAGE INPUT -->

      ${
  pendingReplyMessageId
    ? (() => {

        const replyMessage =
          safeArray(
            state.messages[group.id]
          ).find(
            message =>
              message.id ===
              pendingReplyMessageId
          );

        if (!replyMessage) {
          return "";
        }

        return `
          <div class="reply-composer-preview">

            <div class="reply-composer-copy">

              <strong>
                Replying to
              </strong>

              <span>
                ${
                  replyMessage.type === "voice"
                    ? "🎙 Voice message"
                    : esc(
                        replyMessage.text
                          || ""
                      )
                }
              </span>

            </div>

            <button
              type="button"
              class="reply-composer-close"
              data-action="cancel-reply"
              aria-label="Cancel reply"
            >
              ×
            </button>

          </div>
        `;

      })()
    : ""
}

      <form
        class="message-composer"
        id="messageForm"
      >


        <button
          type="button"
          class="composer-btn"
          data-action="attachment"
          aria-label="Attachment"
        >
          ＋
        </button>
        
        
        <textarea
        id="messageInput"
        rows="1"
        autocomplete="off"
        placeholder="Message ${esc(group.name)}"
        aria-label="Message"
        ></textarea>
        
        
        <button
          type="button"
          class="composer-btn"
          data-action="emoji"
          aria-label="Emoji"
          title="Emoji"
        >
          😊
        </button>


        <button
          type="button"
          class="composer-btn"
          data-action="voice-message"
          aria-label="Voice message"
        >
          🎙
        </button>


        <button
          type="submit"
          class="send-btn"
          aria-label="Send"
        >
          ➤
        </button>


      </form>


    </div>

  `;


  /* -------------------------------------------------------
     MESSAGE FORM
     ------------------------------------------------------- */

  const form =
    $("#messageForm");


  if (form) {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        sendMessage();

      }
    );

  }

const messageInput =
   $("#messageInput");
   
if (messageInput) {

  messageInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.stopPropagation();

      }

    }
  );

}


  /* -------------------------------------------------------
     SCROLL TO NEWEST MESSAGE
     ------------------------------------------------------- */

  const messagesBox =
    $("#messages");


  if (messagesBox) {

    requestAnimationFrame(
      () => {

        messagesBox.scrollTop =
          messagesBox.scrollHeight;

      }
    );

  }

     attachMessageLongPress();
   
     attachMediaImageViewer();
}


/* ---------------------------------------------------------
   FULL-SCREEN MESSAGE IMAGE VIEWER
   --------------------------------------------------------- */

function attachMediaImageViewer() {

  const messagesBox =
    document.querySelector(
      "#messages"
    );

  if (!messagesBox) {
    return;
  }


  messagesBox
    .querySelectorAll(
      ".message-media-image"
    )
    .forEach(image => {

      image.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          const imageUrl =
            image.getAttribute(
              "src"
            );


          if (!imageUrl) {
            return;
          }


          modalRoot.innerHTML = `

            <div
              class="camera-preview-screen"
            >

              <button
                type="button"
                class="camera-preview-close"
                id="messageImageViewerClose"
                aria-label="Close image"
              >
                ×
              </button>


              <img
                class="camera-preview-image"
                src="${esc(imageUrl)}"
                alt="Full screen image"
                draggable="false"
              >

            </div>

          `;


          document
            .querySelector(
              "#messageImageViewerClose"
            )
            ?.addEventListener(
              "click",
              () => {

                modalRoot.innerHTML = "";

              }
            );

        }
      );

    });

}


/* ---------------------------------------------------------
   USER AVATAR
   --------------------------------------------------------- */

function renderUserAvatar(
  user,
  className = "member-avatar"
) {

  if (!user) {
    return `
      <span
        class="${className}"
        style="--h:210"
      >
        ?
      </span>
    `;
  }

  const photo =
    user.avatarImage || "";

  const fallback =
    user.avatar ||
    user.name
      ?.charAt(0)
      ?.toUpperCase() ||
    "?";

  return `
    <span
      class="${className} ${photo ? "has-photo" : ""}"
      style="--h:${user.hue || 210}"
      aria-hidden="true"
    >
      ${
        photo
          ? `
            <img
              src="${esc(photo)}"
              alt="${esc(user.name || "Profile photo")}"
            >
          `
          : esc(fallback)
      }
    </span>
  `;
}


/* ---------------------------------------------------------
   MESSAGE
   --------------------------------------------------------- */

function renderMessage(
  message,
  group
) {

  const member =
    getMember(
      group,
      message.member
    );

  const own =
    message.member ===
    state.currentUser.id;

  const sender =
    own
      ? state.currentUser
      : (
          message.sender ||
          member || {
            name: "Member",
            avatar: "?",
            hue: 210
          }
        );


  const actionsVisible =
    activeMessageActionId ===
      message.id;

  return `

    <article
      class="
        message-row
        ${own ? "mine" : ""}
        ${actionsVisible ? "message-actions-open" : ""}
      "
      data-message-id="${esc(message.id)}"
    >

      ${renderUserAvatar(
        sender,
        "member-avatar message-avatar"
      )}


      <div class="message-content">

        ${
          actionsVisible
            ? `
              <div class="message-action message-action-reply">
                <button
                  type="button"
                  class="message-action-btn"
                  data-message-action="reply"
                  data-message-id="${esc(message.id)}"
                  aria-label="Reply to message"
                  title="Reply"
                >
                  ↥
                </button>
              </div>
            `
            : ""
        }


        <div class="message-author">

          ${esc(
            own
              ? "You"
              : sender.name
          )}

        </div>
        
        
        
        <div
        class="message-bubble"
        data-message-id="${esc(message.id)}"
        >
        
        ${
           message.replyTo
           ? (() => {
              
              const repliedMessage =
                 safeArray(
                    state.messages[group.id]
                 ).find(
                    item =>
                       item.id ===
                       message.replyTo
                 );
              
              if (!repliedMessage) {
                 return "";
              }
              
              return `
              <div class="message-reply-preview">
              
              <strong>
              Replying to
              </strong>
              
              <span>
              ${
                 repliedMessage.type === "voice"
                 ? "🎙 Voice message"
                 : esc(
                    repliedMessage.text
                    || ""
                 )
              }
              </span>
              
              </div>
              `;
           
           })()
           
           : ""
        }
        
        
        ${
   message.type === "voice"
   ? `
   <div class="voice-message">
   
   <span>
   🎙
   </span>
   
   <span>
   Voice message
   </span>
   
   </div>
   `

   : message.type === "media"
   ? `
   <div class="media-message">

     ${
       safeArray(message.media)
         .map(
           media => `
             <img
               class="message-media-image"
               src="${esc(media.url)}"
               alt="Photo"
               draggable="false"
             >
           `
         )
         .join("")
     }

     ${
       message.text
         ? `
           <div class="media-message-text">
             ${esc(message.text)}
           </div>
           `
         : ""
     }

   </div>
   `

   : esc(message.text)
}
        
        </div>


        <div class="message-time">

          ${formatTime(
            message.createdAt
          )}

        </div>


        ${
           actionsVisible && own
           ? `
           <div class="message-action message-action-delete">
           <button
           type="button"
           class="message-action-btn"
           data-message-action="delete"
           data-message-id="${esc(message.id)}"
           aria-label="Delete message"
           title="Delete"
           >
           ↧
           </button>
           </div>
           `
           : ""
        }

      </div>

    </article>

  `;
}


/* ---------------------------------------------------------
   MESSAGE LONG PRESS
   --------------------------------------------------------- */

function attachMessageLongPress() {

  const messagesBox =
    document.querySelector("#messages");

  if (!messagesBox) {
    return;
  }


  messagesBox
    .querySelectorAll(
      ".message-row"
    )
    .forEach(row => {

      const messageId =
        row.dataset.messageId;

      if (!messageId) {
        return;
      }


      const startPress = event => {

        if (
          event.target.closest(
            "[data-message-action]"
          )
        ) {
          return;
        }


        clearTimeout(
          messageActionTimer
        );


        messageActionTimer =
          setTimeout(() => {

            activeMessageActionId =
              messageId;

            renderGroupChat();

          }, 550);

      };


      const cancelPress = () => {

        clearTimeout(
          messageActionTimer
        );

        messageActionTimer =
          null;

      };


      row.addEventListener(
        "touchstart",
        startPress,
        { passive: true }
      );

      row.addEventListener(
        "touchend",
        cancelPress
      );

      row.addEventListener(
        "touchcancel",
        cancelPress
      );

      row.addEventListener(
        "mousedown",
        startPress
      );

      row.addEventListener(
        "mouseup",
        cancelPress
      );

      row.addEventListener(
        "mouseleave",
        cancelPress
      );

    });


  messagesBox
    .querySelectorAll(
      "[data-message-action]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          const action =
            button.dataset.messageAction;

          const messageId =
            button.dataset.messageId;


          if (action === "reply") {
             
             pendingReplyMessageId =
                messageId;
             
             activeMessageActionId =
                null;
             
             messageActionTimer =
                null;
             
             renderGroupChat();
          
          }


          if (action === "delete") {
             
             const group =
                getGroup(
                   state.selectedGroup
                );
             
             if (!group) {
                return;
             }
             
             const messages =
                safeArray(
                   state.messages[group.id]
                );
             
             const messageIndex =
                messages.findIndex(
                   message =>
                      message.id ===
                      messageId
                );
             
             if (messageIndex === -1) {
                return;
             }
             
             messages.splice(
                messageIndex,
                1
             );
             
             state.messages[group.id] =
                messages;
             
             if (
                pendingReplyMessageId ===
                messageId
             ) {
                pendingReplyMessageId =
                   null;
             }
             
             activeMessageActionId =
                null;
             
             messageActionTimer =
                null;
             
             saveState();
             
             renderGroupChat();
          }

        }
      );

    });

}


/* ---------------------------------------------------------
   SEND MESSAGE
   --------------------------------------------------------- */

async function sendMessage() {
  const input = $("#messageInput");
  const group = getGroup(state.selectedGroup);
  const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);

  if (!input || !group || !sessionToken) return;

  const text = input.value.trim();
  if (!text) return;

  const replyTo = pendingReplyMessageId || null;

  try {
    const response = await fetch(SIMPOCHAT_ACCESS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "send_message",
        group_id: group.id,
        text,
        reply_to: replyTo
      })
    });

    const data = await response.json();

    if (!response.ok || !data.allowed || !data.message) {
      throw new Error(data.message || "Unable to send message.");
    }

    if (!state.messages[group.id]) {
      state.messages[group.id] = [];
    }

    state.messages[group.id].push({
      id: data.message.id,
      member: data.message.sender_id,
      text: data.message.text,
      createdAt: data.message.created_at,
      read: true,
      replyTo: data.message.reply_to || null,
      expiresAt: data.message.expires_at
    });

    input.value = "";
    pendingReplyMessageId = null;
    activeMessageActionId = null;

    saveState();
    renderGroupChat();

  } catch (error) {
    console.error("SimpoChat sendMessage error:", error);
    alert(error.message || "Unable to send message.");
  }
}

/* ---------------------------------------------------------
   SEND CAMERA MEDIA MESSAGE
   --------------------------------------------------------- */

function sendCameraMediaMessage() {

  const group =
    getGroup(state.selectedGroup);

  if (!group) {
    return;
  }


  if (!cameraMediaItems.length) {
    return;
  }


  const textInput =
    document.querySelector(
      "#cameraGalleryText"
    );


  const text =
    textInput
      ? textInput.value.trim()
      : "";


  /*
   * Keep the current Gallery order.
   *
   * Selection is only for rearranging/removing.
   * Sending sends every picture currently
   * remaining in the Gallery.
   */
  const media =
    cameraMediaItems.map(
      item => ({
        type:
          item.type || "image",

        url:
          item.url,

        name:
          item.name || ""
      })
    );


  if (!state.messages[group.id]) {

    state.messages[group.id] =
      [];

  }


  state.messages[group.id].push({

    id:
      uid("message"),

    member:
      state.currentUser.id,

    type:
      "media",

    media,

    text,

    createdAt:
      now(),

    read:
      true,

    replyTo:
      null

  });


  /*
   * Clean up the Gallery object URLs
   * only after the message has received
   * their references.
   */
  cameraMediaItems =
    [];


  if (textInput) {
    textInput.value = "";
  }


  const textWrap =
    document.querySelector(
      "#cameraGalleryTextWrap"
    );


  if (textWrap) {
    textWrap.hidden = true;
  }


  saveState();

  renderGroupChat();


  /*
 * Return from Camera to the Group Chat.
 */

if (activeCameraStream) {

  activeCameraStream
    .getTracks()
    .forEach(
      track => track.stop()
    );

  activeCameraStream =
    null;
}


modalRoot.innerHTML = "";

}

/* ---------------------------------------------------------
   VOICE MESSAGE
   --------------------------------------------------------- */

function createVoiceMessage() {

  const group =
    getGroup(state.selectedGroup);

  if (!group) {
    return;
  }


  if (!state.messages[group.id]) {

    state.messages[group.id] =
      [];

  }


  state.messages[group.id].push({

    id:
      uid("voice"),

    member:
      state.currentUser.id,

    type:
      "voice",

    text:
      "",

    createdAt:
      now(),

    read:
      true

  });


  saveState();

  renderGroupChat();
}


/* ---------------------------------------------------------
   GROUP PROFILE
   --------------------------------------------------------- */

function renderGroupProfile() {

  const group =
    getGroup(
      state.selectedGroup
    );


  if (!group) {

    state.screen =
      "home";

    return render();

  }


  setHeader(
    group.name,
    "Group profile"
  );


  screen.innerHTML = `

    <div class="profile-page">


<div class="profile-hero">

  <button
    class="icon-btn profile-back"
    data-action="back"
  >
    ‹
  </button>


  <div class="profile-photo-wrap">

    <div
      class="profile-avatar ${group.photo ? "has-photo" : ""}"
      style="--h:${group.hue}"
    >
      ${
        group.photo
          ? `
            <img
              src="${group.photo}"
              alt="${esc(group.name)}"
            >
          `
          : esc(group.icon)
      }
    </div>


    ${
      (
        isGroupAdmin(group) &&
        (
          group.approval_mode === "admins" ||
          group.creatorId ===
            state.currentUser?.id
        )
      )
        ? `
          <button
            class="profile-notification-btn"
            data-action="group-notifications"
            aria-label="Group notifications"
          >
            🔔
            ${
              getGroupJoinNotifications(
                group.id
              ).length > 0
                ? `<span class="profile-notification-dot"></span>`
                : ""
            }
          </button>
        `
        : ""
    }

  </div>


  <p>
    ${group.members.length}
    members
  </p>


  <div class="profile-actions">

    <button
      class="secondary-btn"
      data-action="star-group"
    >
      ${
        isStarred(group.id)
          ? "★ Starred"
          : "☆ Star"
      }
    </button>


    <button
      class="secondary-btn"
      data-action="group-chat"
    >
      Open Chat
    </button>

  </div>

</div>


      <section class="profile-section">

        <div class="section-title">
          Category
        </div>

        <div class="chip-list">

          ${
            safeArray(
              group.category
            )
              .map(
                category => `
                  <span class="chip">
                    ${esc(category)}
                  </span>
                `
              )
              .join("")
          }

        </div>

      </section>


      <section class="profile-section">

        <div class="section-title">
          Members
        </div>


        <div class="member-list">

          ${
            safeArray(
              group.members
            )
              .map(
                member =>
                  renderMemberRow(
                    member,
                    group
                  )
              )
              .join("")
          }

        </div>

      </section>


      <section class="profile-section">

        <button
          class="danger-btn"
          data-action="leave-group"
        >
          Leave Group
        </button>

      </section>


    </div>

  `;
}


/* ---------------------------------------------------------
   MEMBER ROW
   --------------------------------------------------------- */

function renderMemberRow(
  member,
  group
) {

  return `

    <button
      class="member-row"
      data-member-id="${esc(member.id)}"
      data-group-id="${esc(group.id)}"
    >

      <span
        class="member-avatar"
        style="--h:${member.hue}"
      >
        ${esc(member.avatar)}
      </span>


      <span class="member-copy">

        <strong>
          ${esc(member.name)}
        </strong>

        ${
          member.id ===
          state.currentUser.id
            ? `
              <span>
                You
              </span>
            `
            : ""
        }

      </span>

    </button>

  `;
}


/* ---------------------------------------------------------
   CHAT MENU
   --------------------------------------------------------- */

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
            ${esc(group.name)}
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
            data-action="group-profile"
          >

            <div class="menu-icon">
              👥
            </div>

            <div>

              <strong>
                Group profile
              </strong>

              <span>
                View members and group information.
              </span>

            </div>

          </button>


          <button
            class="menu-item"
            data-action="group-report"
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
            data-action="leave-group"
          >

            <div class="menu-icon">
              ⎋
            </div>

            <div>

              <strong>
                Exit and delete group
              </strong>

              <span>
                Leave this group and remove it from Home.
              </span>

            </div>

          </button>


          <button
            class="menu-item"
            data-action="export-chat"
          >

            <div class="menu-icon">
              ⇧
            </div>

            <div>

              <strong>
                Export chat
              </strong>

              <span>
                Select a member to start a temporary chat.
              </span>

            </div>

          </button>


        </div>

      </div>

    </div>

  `;
}


/* ---------------------------------------------------------
   LEAVE GROUP
   --------------------------------------------------------- */

function leaveCurrentGroup() {

  const id =
    state.selectedGroup;

  const group =
    getGroup(id);

  if (!group) {
    return;
  }


  const confirmed =
    confirm(
      `Leave "${group.name}" and remove it from Home?`
    );


  if (!confirmed) {
    return;
  }


  state.groups =
    state.groups.filter(
      item =>
        item.id !== id
    );


  state.starred =
    state.starred.filter(
      groupId =>
        groupId !== id
    );


  state.archived =
    state.archived.filter(
      groupId =>
        groupId !== id
    );


  delete state.messages[id];


  state.selectedGroup =
    null;

  state.screen =
    "home";


  saveState();

  modalRoot.innerHTML = "";

  render();
}


/* ---------------------------------------------------------
   START TEMPORARY CHAT
   --------------------------------------------------------- */

function startTemporaryChat(
  memberId
) {

  const group =
    getGroup(
      state.selectedGroup
    );

  if (!group) {
    return;
  }


  const member =
    getMember(
      group,
      memberId
    );


  if (!member) {
    return;
  }


  state.selectedMember =
    member.id;


  openTemporaryChatInvite(
    member
  );
}


/* ---------------------------------------------------------
   TEMPORARY CHAT INVITATION
   --------------------------------------------------------- */

function openTemporaryChatInvite(
  member
) {

  modalRoot.innerHTML = `

    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            Temporary Chat
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>


        <div class="invite-card">

          <div
            class="profile-avatar small"
            style="--h:${member.hue}"
          >
            ${esc(member.avatar)}
          </div>


          <h3>
            ${esc(member.name)}
          </h3>


          <p>
            Send a temporary chat invitation.
            The chat only begins after the other
            person accepts.
          </p>


          <button
            class="primary-btn"
            data-temp-invite="${esc(member.id)}"
          >
            Send Invitation
          </button>


          <button
            class="secondary-btn"
            data-close
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  `;
}


/* ---------------------------------------------------------
   TEMPORARY CHAT INBOX
   --------------------------------------------------------- */

function renderTemporaryChatInbox() {

  setHeader(
    "Temporary Chat",
    "Private conversations"
  );

  state.temporaryChatTab =
    state.temporaryChatTab ||
    "messages";


  const temporaryChats =
    safeArray(
      state.temporaryChats
    );

  const temporaryInvites =
    safeArray(
      state.temporaryInvites
    ).filter(
      invite =>
        invite.to ===
          state.currentUser.id &&
        invite.status ===
          "pending"
    );


  screen.innerHTML = `

    <div class="temporary-chat-inbox">

      <!-- BACK -->

      <div class="temporary-chat-topbar">

        <button
          class="icon-btn"
          data-action="back"
          aria-label="Back"
          title="Back"
        >
          ‹
        </button>

        <div>
          <strong>
            Temporary Chat
          </strong>

          <span>
            Chats disappear when they end
          </span>
        </div>

      </div>


      <!-- TWO MENUS -->

      <div
        class="temporary-chat-tabs"
        role="tablist"
      >

        <button
          class="
            temporary-chat-tab
            ${
              state.temporaryChatTab ===
              "messages"
                ? "active"
                : ""
            }
          "
          data-action="temporary-chat-messages"
          role="tab"
        >

          <span>
            Private Messages
          </span>

          ${
            temporaryChats.length
              ? `
                <b>
                  ${temporaryChats.length}
                </b>
              `
              : ""
          }

        </button>


        <button
          class="
            temporary-chat-tab
            ${
              state.temporaryChatTab ===
              "invites"
                ? "active"
                : ""
            }
          "
          data-action="temporary-chat-invites"
          role="tab"
        >

          <span>
            Received Invites
          </span>

          ${
            temporaryInvites.length
              ? `
                <b>
                  ${temporaryInvites.length}
                </b>
              `
              : ""
          }

        </button>

      </div>


      <!-- CONTENT -->

      <div
      class="temporary-chat-swipe"
      id="temporaryChatSwipe"
      >
      <section
      class="temporary-chat-swipe-page"
      data-tab="messages"
      >
      ${renderTemporaryMessages(temporaryChats)}
      </section>
      
      <section
      class="temporary-chat-swipe-page"
      data-tab="invites"
      >
      ${renderTemporaryInvites(temporaryInvites)}
      </section>
      </div>
      
      </div>
      
      `;
   
   bindTemporaryChatSwipe();

}


/* ---------------------------------------------------------
   TEMPORARY CHAT — PRIVATE MESSAGES
   --------------------------------------------------------- */

function renderTemporaryMessages(
  temporaryChats
) {

  if (!temporaryChats.length) {

    return `

      <div class="temporary-chat-empty">

        <div class="temporary-chat-empty-icon">
          💬
        </div>

        <h3>
          No temporary chats
        </h3>

        <p>
          Accepted temporary chat
          conversations will appear here.
        </p>

      </div>

    `;
  }


  return `

    <div class="temporary-chat-list">

      ${temporaryChats
        .map(chat => {

          const member =
            findMemberAcrossGroups(
              chat.memberId
            );

          if (!member) {
            return "";
          }

          const group =
            getGroup(
              chat.groupId
            );

          return `

            <button
              class="temporary-chat-item"
              data-temp-chat-member="${esc(
                member.id
              )}"
            >

              <span
                class="temporary-chat-avatar"
                style="--h:${member.hue}"
              >
                ${esc(member.avatar)}
              </span>


              <span
                class="temporary-chat-copy"
              >

                <strong>
                  ${esc(member.name)}
                </strong>

                <small>
                  ${
                    group
                      ? `From ${esc(group.name)}`
                      : "Temporary Chat"
                  }
                </small>

              </span>


              <span
                class="temporary-chat-arrow"
              >
                ›
              </span>

            </button>

          `;

        })
        .join("")}

    </div>

  `;
}


/* ---------------------------------------------------------
   TEMPORARY CHAT — RECEIVED INVITES
   --------------------------------------------------------- */

function renderTemporaryInvites(
  temporaryInvites
) {

  if (!temporaryInvites.length) {

    return `

      <div class="temporary-chat-empty">

        <div class="temporary-chat-empty-icon">
          ✉
        </div>

        <h3>
          No received invites
        </h3>

        <p>
          Temporary Chat invitations from
          members of your groups will appear here.
        </p>

      </div>

    `;
  }


  return `

    <div class="temporary-chat-invite-list">

      ${temporaryInvites
        .map(invite => {

          const member =
            findMemberAcrossGroups(
              invite.from
            );

          if (!member) {
            return "";
          }

          const group =
            getGroup(
              invite.groupId
            );

          return `

            <div
              class="temporary-chat-invite-card"
            >

              <div
                class="temporary-chat-invite-head"
              >

                <span
                  class="temporary-chat-avatar"
                  style="--h:${member.hue}"
                >
                  ${esc(member.avatar)}
                </span>


                <div
                  class="temporary-chat-copy"
                >

                  <strong>
                    ${esc(member.name)}
                  </strong>

                  <small>
                    ${
                      group
                        ? `From ${esc(group.name)}`
                        : "Group member"
                    }
                  </small>

                </div>

              </div>


              <p>
                Wants to start a
                temporary chat with you.
              </p>


              <div
                class="temporary-chat-invite-actions"
              >

                <button
                  class="secondary-btn"
                  data-action="reject-temporary-invite"
                  data-invite-id="${esc(
                    invite.id
                  )}"
                >
                  Reject
                </button>


                <button
                  class="primary-btn"
                  data-action="accept-temporary-invite"
                  data-invite-id="${esc(
                    invite.id
                  )}"
                >
                  Accept
                </button>

              </div>

            </div>

          `;

        })
        .join("")}

    </div>

  `;
}


/* ---------------------------------------------------------
   TEMPORARY CHAT PAGE
   --------------------------------------------------------- */

function renderTemporaryChat(
  memberId
) {

  const member =
    findMemberAcrossGroups(
      memberId
    );


  if (!member) {
    return;
  }


  setHeader(
    member.name,
    "Temporary chat"
  );


  screen.innerHTML = `

    <div class="chat-screen">

        <div class="chat-header">

        <button
          class="icon-btn"
          data-action="back"
        >
          ‹
        </button>


        <div class="chat-header-main">

          <span
            class="group-avatar small"
            style="--h:${member.hue}"
          >
            ${esc(member.avatar)}
          </span>


          <span class="chat-header-copy">

            <strong>
              ${esc(member.name)}
            </strong>

            <span>
              Temporary chat
            </span>

          </span>

        </div>

      </div>


      <div class="temporary-chat-body">

        <div class="empty">

          <div class="empty-icon">
            ⏳
          </div>

          <h3>
            Temporary chat
          </h3>

          <p>
            Messages in this chat disappear
            when the temporary chat ends.
          </p>

        </div>

      </div>


      <div class="temporary-chat-footer">

        <button
          class="danger-btn"
          data-action="finish-temp-chat"
        >
          Finish Chat
        </button>

      </div>

    </div>

  `;
}


/* ---------------------------------------------------------
   FIND MEMBER ACROSS GROUPS
   --------------------------------------------------------- */

function findMemberAcrossGroups(
  memberId
) {

  for (
    const group of state.groups
  ) {

    const member =
      getMember(
        group,
        memberId
      );

    if (member) {
      return member;
    }

  }

  return null;
}

/* =========================================================
   SIMPOCHAT — SECTION 4/5
   POSTS + SEARCH + SETTINGS + VIDEO POST CREATION
   ========================================================= */

/* ---------------------------------------------------------
   POSTS PAGE
   --------------------------------------------------------- */

function renderPosts() {

  setHeader(
    "Posts",
    "Video updates from your groups"
  );


  const groups =
    state.groups.filter(
      group => !isArchived(group.id)
    );


  const activeFilter =
    state.postFilter || "all";


  const visiblePosts =
    getVisiblePosts(
      activeFilter
    );


  screen.innerHTML = `

    <div class="posts-page">


      <!-- POST FILTER -->

      <div class="post-filter-wrap">

        <div class="post-filter">

          <button
            class="
              filter-btn
              ${
                activeFilter === "all"
                  ? "active"
                  : ""
              }
            "
            data-post-filter="all"
          >
            All
          </button>


          ${
            groups
              .map(
                group => `

                  <button
                    class="
                      filter-btn
                      ${
                        activeFilter ===
                        group.id
                          ? "active"
                          : ""
                      }
                    "
                    data-post-filter="${esc(
                      group.id
                    )}"
                  >
                    ${esc(group.name)}
                  </button>

                `
              )
              .join("")
          }

        </div>

      </div>


      <!-- POST GRID -->

      ${
        visiblePosts.length
          ? `
            <div class="post-grid">

              ${visiblePosts
                .map(
                  post =>
                    renderPostCard(
                      post
                    )
                )
                .join("")}

            </div>
          `
          : `
            <div class="empty">

              <div class="empty-icon">
                ▣
              </div>

              <h3>
                No posts here
              </h3>

              <p>
                Video posts from this selection
                will appear here.
              </p>

            </div>
          `
      }


      <!-- FLOATING VIDEO BUTTON -->

      <button
        class="floating-post-btn"
        data-action="create-post"
        aria-label="Create video post"
      >

        <span>
          ▷
        </span>

      </button>


    </div>

  `;


  /*
   * Post filter buttons
   */

  document
    .querySelectorAll(
      "[data-post-filter]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.postFilter =
            button.dataset.postFilter;

          saveState();

          renderPosts();

        }
      );

    });
}


/* ---------------------------------------------------------
   VISIBLE POSTS
   --------------------------------------------------------- */

function getVisiblePosts(
  filter
) {

  const allPosts =
    safeArray(state.posts)
      .filter(
        post =>
          post.type === "video"
      );


  /*
   * Groups this viewer belongs to.
   *
   * In the current prototype,
   * every group in state.groups
   * represents a group the user
   * belongs to.
   */

  const viewerGroupIds =
    state.groups.map(
      group =>
        group.id
    );


  /*
   * First determine which posts
   * this viewer is allowed to see.
   */

  const allowedPosts =
    allPosts.filter(
      post => {

        /*
         * New post format:
         *
         * groupIds: ["business", "tech"]
         */

        if (
          Array.isArray(
            post.groupIds
          )
        ) {

          return post.groupIds.some(
            groupId =>
              viewerGroupIds.includes(
                groupId
              )
          );

        }


        /*
         * Backward compatibility
         * for older prototype posts.
         */

        if (post.groupId) {

          return viewerGroupIds.includes(
            post.groupId
          );

        }


        return false;

      }
    );


  /*
   * ALL means:
   *
   * Show every post this viewer
   * is allowed to see.
   */

  if (
    filter === "all"
  ) {

    return allowedPosts;

  }


  /*
   * Specific group filter:
   *
   * The viewer must belong to
   * that group AND the creator
   * must have selected that group.
   */

  if (
    !viewerGroupIds.includes(
      filter
    )
  ) {

    return [];

  }


  return allowedPosts.filter(
    post => {

      if (
        Array.isArray(
          post.groupIds
        )
      ) {

        return post.groupIds.includes(
          filter
        );

      }


      /*
       * Backward compatibility.
       */

      return (
        post.groupId ===
        filter
      );

    }
  );

}


/* ---------------------------------------------------------
   POST CARD
   --------------------------------------------------------- */

function renderPostCard(
  post
) {

  /*
   * New posts use groupIds.
   * Older prototype posts may still
   * use groupId.
   */

  const postGroupIds =
    Array.isArray(post.groupIds)
      ? post.groupIds
      : post.groupId
        ? [post.groupId]
        : [];


  const postGroups =
    postGroupIds
      .map(
        id =>
          getGroup(id)
      )
      .filter(Boolean);


  const group =
    postGroups[0];


  if (!group) {
    return "";
  }


  /*
   * Display the groups this post
   * belongs to.
   */

  const groupNames =
    postGroups
      .map(
        item =>
          item.name
      )
      .join(" · ");


  return `

    <button
      class="post-card"
      data-post-id="${esc(post.id)}"
    >

      <!-- VIDEO VISUAL -->

      <span
        class="post-video-thumb"
        style="--h:${group.hue}"
      >

        <span class="post-video-symbol">
          ▷
        </span>

        <span class="post-video-label">
          VIDEO
        </span>

      </span>


      <!-- CREATOR -->

      <span class="post-card-info">

        <span class="post-creator">

          <span
            class="member-avatar tiny"
            style="--h:${group.hue}"
          >
            ${esc(
              String(post.author)
                .charAt(0)
                .toUpperCase()
            )}
          </span>

          <span>
            ${esc(post.author)}
          </span>

        </span>


        <span class="post-group">
          ${esc(groupNames)}
        </span>

      </span>

    </button>

  `;

}


/* ---------------------------------------------------------
   OPEN POST
   --------------------------------------------------------- */

function openPost(
  postId
) {

  const post =
    state.posts.find(
      item =>
        item.id === postId
    );


  if (!post) {
    return;
  }


  const group =
    getGroup(post.groupId);


  if (!group) {
    return;
  }


  /*
   * Increase views when opened.
   */

  post.views =
    Number(post.views || 0) + 1;


  saveState();


  modalRoot.innerHTML = `

    <div
      class="post-viewer-backdrop"
      data-close
    >

      <div
        class="post-viewer"
        data-stop-close
      >


        <!-- VIEWER HEADER -->

        <div class="post-viewer-header">

          <button
            class="icon-btn"
            data-close
            aria-label="Close post"
          >
            ×
          </button>


          <div class="post-viewer-user">

            <span
              class="member-avatar"
              style="--h:${group.hue}"
            >
              ${esc(
                String(post.author)
                  .charAt(0)
                  .toUpperCase()
              )}
            </span>


            <div>

              <strong>
                ${esc(post.author)}
              </strong>

              <span>
                ${esc(group.name)}
              </span>

            </div>

          </div>


          <div class="post-viewer-spacer">
          </div>

        </div>


        <!-- VIDEO -->

        <div class="post-viewer-video">

          <div
            class="post-video-placeholder"
            style="--h:${group.hue}"
          >

            <span>
              ▷
            </span>

            <small>
              Video Post
            </small>

          </div>

        </div>


        <!-- POST DETAILS -->

        <div class="post-viewer-details">

          <div class="post-stats">

            <span>
              ${Number(post.views || 0)}
              views
            </span>

            <button
              data-post-reaction="${esc(
                post.id
              )}"
            >
              ♡
              ${Number(
                post.reactions || 0
              )}
            </button>

            <button
              data-post-comments="${esc(
                post.id
              )}"
            >
              ◌
              ${Number(
                post.comments || 0
              )}
            </button>

          </div>


          <div class="post-action-row">

            <button
              class="secondary-btn"
              data-post-reaction="${esc(
                post.id
              )}"
            >
              React
            </button>


            <button
              class="secondary-btn"
              data-post-comments="${esc(
                post.id
              )}"
            >
              Comments
            </button>

          </div>

        </div>

      </div>

    </div>

  `;

}


/* =========================================================
   POST CREATOR — MEDIA HELPERS
   ========================================================= */

const MAX_DAILY_POSTS = 10;
const MAX_VIDEO_SECONDS = 15;
const PHOTO_SECONDS = 3;
const MAX_PHOTOS_PER_POST =
  Math.floor(MAX_VIDEO_SECONDS / PHOTO_SECONDS);

/*
 * Runtime-only media files.
 *
 * These are temporary until Supabase Storage
 * is connected.
 */
let postDraftMedia = [];


/* ---------------------------------------------------------
   TODAY'S POST COUNT
   --------------------------------------------------------- */

function getTodayPostCount() {

  const start = new Date();

  start.setHours(
    0,
    0,
    0,
    0
  );

  const startTime =
    start.getTime();

  return safeArray(
    state.posts
  ).filter(post => {

    const createdAt =
      Number(
        post.createdAt || 0
      );

    return (
      createdAt >= startTime &&
      createdAt <
        startTime +
        24 * 60 * 60 * 1000
    );

  }).length;

}

function postBelongsToGroup(post, groupId) {

  if (!post) {
    return false;
  }

  if (Array.isArray(post.groupIds)) {
    return post.groupIds.includes(groupId);
  }

  if (post.groupId) {
    return post.groupId === groupId;
  }

  return false;
}


/* ---------------------------------------------------------
   REMAINING DAILY POSTS
   --------------------------------------------------------- */

function getRemainingDailyPosts() {

  return Math.max(
    0,
    MAX_DAILY_POSTS -
      getTodayPostCount()
  );

}


/* ---------------------------------------------------------
   FORMAT SECONDS
   --------------------------------------------------------- */

function formatPostSeconds(
  seconds
) {

  const value =
    Math.max(
      0,
      Number(seconds) || 0
    );

  const minutes =
    Math.floor(
      value / 60
    );

  const remaining =
    Math.floor(
      value % 60
    );

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;

}


/* ---------------------------------------------------------
   CREATE TEMPORARY OBJECT URL
   --------------------------------------------------------- */

function createPostObjectUrl(
  file
) {

  try {

    return URL.createObjectURL(
      file
    );

  } catch (error) {

    console.warn(
      "Could not create media preview URL:",
      error
    );

    return "";

  }

}


/* ---------------------------------------------------------
   RELEASE TEMPORARY URL
   --------------------------------------------------------- */

function releasePostObjectUrl(
  url
) {

  if (!url) {
    return;
  }

  try {

    URL.revokeObjectURL(
      url
    );

  } catch (error) {

    console.warn(
      "Could not release media URL:",
      error
    );

  }

}


/* ---------------------------------------------------------
   RESET POST DRAFT
   --------------------------------------------------------- */

function resetPostDraft() {

  postDraftMedia.forEach(
    item => {

      releasePostObjectUrl(
        item.url
      );

    }
  );

  postDraftMedia = [];

}


/* ---------------------------------------------------------
   CALCULATE RESULTING POSTS
   --------------------------------------------------------- */

function getDraftPostCount() {

  const videos =
    postDraftMedia.filter(
      item =>
        item.kind === "video"
    ).length;

  const photos =
    postDraftMedia.filter(
      item =>
        item.kind === "image"
    ).length;


  /*
   * Every video becomes one post.
   *
   * All selected photos become one
   * photo-collection post.
   */

  return (
    videos +
    (photos > 0 ? 1 : 0)
  );

}


/* ---------------------------------------------------------
   RENDER DRAFT MEDIA PREVIEW
   --------------------------------------------------------- */

function renderPostDraftPreview() {

  const container =
    document.querySelector(
      "#postMediaPreview"
    );


  if (!container) {
    return;
  }


  if (!postDraftMedia.length) {

    container.innerHTML = `

      <div class="post-preview-empty">

        <div class="post-preview-empty-icon">
          +
        </div>

        <strong>
          Preview will appear here
        </strong>

        <span>
          Select videos or photos to begin.
        </span>

      </div>

    `;

    return;
  }


  const videos =
    postDraftMedia.filter(
      item =>
        item.kind === "video"
    );

  const photos =
    postDraftMedia.filter(
      item =>
        item.kind === "image"
    );


  let html = "";


  /*
   * VIDEO PREVIEWS
   */

  videos.forEach(
    (item, index) => {

      const actualIndex =
        postDraftMedia.indexOf(
          item
        );


      html += `

        <div
          class="post-media-editor"
          data-media-editor="${actualIndex}"
        >

          <div class="post-media-editor-head">

            <div>

              <strong>
                Video ${index + 1}
              </strong>

              <span
                data-duration-label="${actualIndex}"
              >
                Reading duration…
              </span>

            </div>

            <button
              type="button"
              class="post-remove-media"
              data-remove-media="${actualIndex}"
              aria-label="Remove video"
            >
              ×
            </button>

          </div>


          <div class="post-video-preview-wrap">

            <video
              class="post-video-preview"
              data-preview-video="${actualIndex}"
              src="${esc(item.url)}"
              controls
              playsinline
              preload="metadata"
            ></video>

          </div>


          <div class="post-trim-panel">

            <div class="post-trim-title">
              Trim this video
            </div>


            <div class="post-trim-info">

              <span>
                Start:
                <strong
                  data-start-label="${actualIndex}"
                >
                  00:00
                </strong>
              </span>

              <span>
                End:
                <strong
                  data-end-label="${actualIndex}"
                >
                  00:00
                </strong>
              </span>

              <span>
                Plays:
                <strong
                  data-length-label="${actualIndex}"
                >
                  00:00
                </strong>
              </span>

            </div>


            <label class="post-range-row">

              <span>
                Start point
              </span>

              <input
                type="range"
                min="0"
                max="0"
                step="0.1"
                value="0"
                data-start-range="${actualIndex}"
              >

            </label>


            <label class="post-range-row">

              <span>
                Clip length
              </span>

              <input
                type="range"
                min="0.1"
                max="15"
                step="0.1"
                value="15"
                data-length-range="${actualIndex}"
              >

            </label>


            <button
              type="button"
              class="secondary-btn post-preview-clip-btn"
              data-preview-clip="${actualIndex}"
            >
              Preview selected clip
            </button>


          </div>

        </div>

      `;

    }
  );


  /*
   * PHOTO COLLECTION
   */

  if (photos.length) {

    html += `

      <div
        class="post-media-editor photo-collection-editor"
      >

        <div class="post-media-editor-head">

          <div>

            <strong>
              Photo post
            </strong>

            <span>
              ${photos.length}
              ${
                photos.length === 1
                  ? "photo"
                  : "photos"
              }
              · ${
                photos.length *
                PHOTO_SECONDS
              } seconds
            </span>

          </div>

        </div>


        <div class="post-photo-preview-grid">

          ${
            photos
              .map(
                (item, index) => {

                  const actualIndex =
                    postDraftMedia.indexOf(
                      item
                    );

                  return `

                    <div
                      class="post-photo-preview-item"
                    >

                      <img
                        src="${esc(item.url)}"
                        alt="Selected photo ${index + 1}"
                      >

                      <button
                        type="button"
                        class="post-photo-remove"
                        data-remove-media="${actualIndex}"
                      >
                        ×
                      </button>

                    </div>

                  `;

                }
              )
              .join("")
          }

        </div>


        <div class="post-photo-timing">

          Each photo plays for
          ${PHOTO_SECONDS} seconds.
          Total:
          <strong>
            ${photos.length * PHOTO_SECONDS}s
          </strong>

        </div>

      </div>

    `;

  }


  container.innerHTML =
    html;


  /*
   * Attach video metadata listeners.
   */

  videos.forEach(
    item => {

      const index =
        postDraftMedia.indexOf(
          item
        );


      const video =
        document.querySelector(
          `[data-preview-video="${index}"]`
        );


      if (!video) {
        return;
      }


      video.addEventListener(
        "loadedmetadata",
        () => {

          const duration =
            Number(
              video.duration
            );


          if (
            !Number.isFinite(
              duration
            ) ||
            duration <= 0
          ) {
            return;
          }


          item.duration =
            duration;


          item.start =
            Math.min(
              Number(item.start || 0),
              Math.max(
                0,
                duration - 0.1
              )
            );


          item.length =
            Math.min(
              Number(
                item.length ||
                Math.min(
                  MAX_VIDEO_SECONDS,
                  duration
                )
              ),
              MAX_VIDEO_SECONDS,
              duration
            );


          if (
            item.start +
              item.length >
            duration
          ) {

            item.start =
              Math.max(
                0,
                duration -
                  item.length
              );

          }


          const startRange =
            document.querySelector(
              `[data-start-range="${index}"]`
            );


          const lengthRange =
            document.querySelector(
              `[data-length-range="${index}"]`
            );


          if (startRange) {

            startRange.max =
              Math.max(
                0,
                duration -
                  item.length
              );

            startRange.value =
              item.start;

          }


          if (lengthRange) {

            lengthRange.max =
              Math.min(
                MAX_VIDEO_SECONDS,
                duration
              );

            lengthRange.value =
              item.length;

          }


          updatePostVideoEditor(
            index
          );

        },
        {
          once: true
        }
      );


      /*
       * If metadata is already ready.
       */

      if (
        video.readyState >= 1
      ) {

        video.dispatchEvent(
          new Event(
            "loadedmetadata"
          )
        );

      }

    }
  );


  /*
   * Start-range controls.
   */

  document
    .querySelectorAll(
      "[data-start-range]"
    )
    .forEach(
      range => {

        range.addEventListener(
          "input",
          () => {

            const index =
              Number(
                range.dataset.startRange
              );

            const item =
              postDraftMedia[index];


            if (!item) {
              return;
            }


            item.start =
              Number(
                range.value
              );


            const maxStart =
              Math.max(
                0,
                Number(item.duration || 0) -
                  Number(item.length || 0)
              );


            if (
              item.start >
              maxStart
            ) {

              item.start =
                maxStart;

              range.value =
                maxStart;

            }


            updatePostVideoEditor(
              index
            );

          }
        );

      }
    );


  /*
   * Clip-length controls.
   */

  document
    .querySelectorAll(
      "[data-length-range]"
    )
    .forEach(
      range => {

        range.addEventListener(
          "input",
          () => {

            const index =
              Number(
                range.dataset.lengthRange
              );

            const item =
              postDraftMedia[index];


            if (!item) {
              return;
            }


            item.length =
              Math.min(
                MAX_VIDEO_SECONDS,
                Number(
                  range.value
                )
              );


            const duration =
              Number(
                item.duration || 0
              );


            if (
              duration > 0
            ) {

              item.length =
                Math.min(
                  item.length,
                  duration
                );

              const maxStart =
                Math.max(
                  0,
                  duration -
                    item.length
                );


              if (
                item.start >
                maxStart
              ) {

                item.start =
                  maxStart;

              }


              const startRange =
                document.querySelector(
                  `[data-start-range="${index}"]`
                );


              if (startRange) {

                startRange.max =
                  maxStart;

                startRange.value =
                  item.start;

              }

            }


            updatePostVideoEditor(
              index
            );

          }
        );

      }
    );


  /*
   * Preview selected clip.
   */

  document
    .querySelectorAll(
      "[data-preview-clip]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.previewClip
              );

            previewPostClip(
              index
            );

          }
        );

      }
    );


  /*
   * Remove selected media.
   */

  document
    .querySelectorAll(
      "[data-remove-media]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          event => {

            event.preventDefault();
            event.stopPropagation();


            const index =
              Number(
                button.dataset.removeMedia
              );


            removePostDraftMedia(
              index
            );

          }
        );

      }
    );

}


/* ---------------------------------------------------------
   UPDATE VIDEO EDITOR
   --------------------------------------------------------- */

function updatePostVideoEditor(
  index
) {

  const item =
    postDraftMedia[index];


  if (!item) {
    return;
  }


  const duration =
    Number(
      item.duration || 0
    );


  const start =
    Number(
      item.start || 0
    );


  const length =
    Math.min(
      MAX_VIDEO_SECONDS,
      Number(
        item.length ||
        Math.min(
          MAX_VIDEO_SECONDS,
          duration
        )
      )
    );


  const end =
    Math.min(
      duration,
      start + length
    );


  item.start =
    start;

  item.length =
    end - start;

  item.end =
    end;


  const startLabel =
    document.querySelector(
      `[data-start-label="${index}"]`
    );


  const endLabel =
    document.querySelector(
      `[data-end-label="${index}"]`
    );


  const lengthLabel =
    document.querySelector(
      `[data-length-label="${index}"]`
    );


  const durationLabel =
    document.querySelector(
      `[data-duration-label="${index}"]`
    );


  if (startLabel) {

    startLabel.textContent =
      formatPostSeconds(
        start
      );

  }


  if (endLabel) {

    endLabel.textContent =
      formatPostSeconds(
        end
      );

  }


  if (lengthLabel) {

    lengthLabel.textContent =
      formatPostSeconds(
        item.length
      );

  }


  if (durationLabel) {

    durationLabel.textContent =
      `Original: ${formatPostSeconds(
        duration
      )}`;

  }


  const video =
    document.querySelector(
      `[data-preview-video="${index}"]`
    );


  if (video) {

    video.dataset.trimStart =
      String(start);

    video.dataset.trimEnd =
      String(end);

  }

}


/* ---------------------------------------------------------
   PREVIEW SELECTED VIDEO CLIP
   --------------------------------------------------------- */

function previewPostClip(
  index
) {

  const item =
    postDraftMedia[index];


  const video =
    document.querySelector(
      `[data-preview-video="${index}"]`
    );


  if (
    !item ||
    !video ||
    !Number.isFinite(
      item.duration
    )
  ) {
    return;
  }


  const start =
    Number(
      item.start || 0
    );


  const end =
    Number(
      item.end ||
      Math.min(
        item.duration,
        start +
          Math.min(
            MAX_VIDEO_SECONDS,
            item.duration
          )
      )
    );


  video.currentTime =
    start;


  video.play().catch(
    () => {}
  );


  const stopPreview =
    () => {

      if (
        video.currentTime >=
        end
      ) {

        video.pause();

        video.currentTime =
          start;

        video.removeEventListener(
          "timeupdate",
          stopPreview
        );

      }

    };


  video.addEventListener(
    "timeupdate",
    stopPreview
  );

}


/* ---------------------------------------------------------
   REMOVE DRAFT MEDIA
   --------------------------------------------------------- */

function removePostDraftMedia(
  index
) {

  const item =
    postDraftMedia[index];


  if (!item) {
    return;
  }


  releasePostObjectUrl(
    item.url
  );


  postDraftMedia.splice(
    index,
    1
  );


  renderPostDraftPreview();

}


/* ---------------------------------------------------------
   HANDLE MEDIA SELECTION
   --------------------------------------------------------- */

function handlePostMediaSelection(
  fileList
) {

  const files =
    Array.from(
      fileList || []
    );


  if (!files.length) {
    return;
  }


  const images =
    files.filter(
      file =>
        file.type.startsWith(
          "image/"
        )
    );


  const videos =
    files.filter(
      file =>
        file.type.startsWith(
          "video/"
        )
    );


  if (
    images.length >
    MAX_PHOTOS_PER_POST
  ) {

    alert(
      `You can select a maximum of ${MAX_PHOTOS_PER_POST} photos for one photo post.`
    );

  }


  const acceptedImages =
    images.slice(
      0,
      MAX_PHOTOS_PER_POST
    );


  /*
   * Replace the previous draft.
   */

  resetPostDraft();


  /*
   * Photos.
   */

  acceptedImages.forEach(
    file => {

      postDraftMedia.push({

        kind:
          "image",

        file,

        url:
          createPostObjectUrl(
            file
          )

      });

    }
  );


  /*
   * Videos.
   */

  videos.forEach(
    file => {

      postDraftMedia.push({

        kind:
          "video",

        file,

        url:
          createPostObjectUrl(
            file
          ),

        duration:
          0,

        start:
          0,

        length:
          MAX_VIDEO_SECONDS,

        end:
          MAX_VIDEO_SECONDS

      });

    }
  );


  renderPostDraftPreview();


  const remaining =
    getRemainingDailyPosts();


  const resulting =
    getDraftPostCount();


  if (
    resulting >
    remaining
  ) {

    const note =
      document.querySelector(
        "#postDailyLimitNote"
      );


    if (note) {

      note.textContent =
        `This selection creates ${resulting} posts, but you have only ${remaining} post${remaining === 1 ? "" : "s"} remaining today.`;

      note.classList.add(
        "limit-warning"
      );

    }

  }

}


/* ---------------------------------------------------------
   DAILY LIMIT NOTE
   --------------------------------------------------------- */

function updatePostDailyLimitNote() {

  const note =
    document.querySelector(
      "#postDailyLimitNote"
    );


  if (!note) {
    return;
  }


  const used =
    getTodayPostCount();


  const remaining =
    getRemainingDailyPosts();


  const draftCount =
    getDraftPostCount();


  note.textContent =
    draftCount > 0
      ? `${used}/${MAX_DAILY_POSTS} used today · This selection creates ${draftCount} post${draftCount === 1 ? "" : "s"} · ${Math.max(0, remaining - draftCount)} remaining after posting.`
      : `${used}/${MAX_DAILY_POSTS} used today · ${remaining} post${remaining === 1 ? "" : "s"} remaining.`;


  note.classList.toggle(
    "limit-warning",
    draftCount >
      remaining
  );

}


/* ---------------------------------------------------------
   CREATE VIDEO POST
   --------------------------------------------------------- */

function openCreatePost() {

  const groups =
    state.groups.filter(
      group =>
        !isArchived(group.id)
    );


  if (!groups.length) {

    alert(
      "You need to belong to a group before creating a post."
    );

    return;
  }


  const remaining =
    getRemainingDailyPosts();


  if (
    remaining <= 0
  ) {

    alert(
      "You have reached your 10-post limit for today. Upgrade to Pro for the higher posting limit."
    );

    return;
  }


  resetPostDraft();


  modalRoot.innerHTML = `

    <div
      class="modal-backdrop"
      data-close
    >

      <div
        class="modal post-creator-modal"
        data-stop-close
      >

        <div class="modal-head">

          <div>

            <div class="modal-title">
              Create Post
            </div>

            <div class="post-creator-subtitle">
              Video or photo post
            </div>

          </div>


          <button
            class="close-btn"
            data-close
            aria-label="Close"
          >
            ×
          </button>

        </div>


        <form id="postForm">


          <!-- POST TARGET -->

          <div class="field">

            <label>
              Post to
            </label>


            <div class="post-target-list">


              <label
                class="
                  post-target-option
                  all-groups-option
                "
              >

                <input
                  type="checkbox"
                  id="postAllGroups"
                  checked
                >

                <span>
                  All groups
                </span>

              </label>


              ${
                groups
                  .map(
                    group => `

                      <label
                        class="post-target-option"
                      >

                        <input
                          type="checkbox"
                          class="post-group-checkbox"
                          value="${esc(
                            group.id
                          )}"
                        >

                        <span>
                          ${esc(
                            group.name
                          )}
                        </span>

                      </label>

                    `
                  )
                  .join("")
              }

            </div>

          </div>


          <!-- MEDIA PICKER -->

          <div class="field">

            <label>
              Media
            </label>


            <label
              class="post-media-picker"
              for="postMedia"
            >

              <span
                class="post-media-picker-icon"
              >
                +
              </span>


              <span>

                <strong>
                  Select videos or photos
                </strong>

                <small>
                  Multiple videos or up to
                  ${MAX_PHOTOS_PER_POST}
                  photos
                </small>

              </span>

            </label>


            <input
              id="postMedia"
              type="file"
              accept="video/*,image/*"
              multiple
              hidden
            >

          </div>


          <!-- PREVIEW -->

          <div
            id="postMediaPreview"
            class="post-media-preview"
          >

            <div class="post-preview-empty">

              <div class="post-preview-empty-icon">
                +
              </div>

              <strong>
                Preview will appear here
              </strong>

              <span>
                Select videos or photos to begin.
              </span>

            </div>

          </div>


          <!-- DAILY LIMIT -->

          <div
          id="postDailyLimitNote"
          class="post-daily-limit-note"
          >
          ${getTodayPostCount()}/${MAX_DAILY_POSTS}
          used today ·
          ${getRemainingDailyPosts()}
          ${
             getRemainingDailyPosts() === 1
             ? "post"
             : "posts"
          }
          remaining.
          </div>


          <div class="form-note post-expiry-note">

            Posts disappear automatically
            after 2 days.

          </div>


          <div class="post-creator-actions">

            <button
              class="primary-btn"
              type="submit"
            >
              Create Post
            </button>


            <button
              class="secondary-btn"
              type="button"
              data-close
            >
              Cancel
            </button>

          </div>


        </form>

      </div>

    </div>

  `;


  /*
   * ALL GROUPS
   */

  const allGroups =
    $("#postAllGroups");


  const groupCheckboxes =
    [
      ...document.querySelectorAll(
        ".post-group-checkbox"
      )
    ];


  if (allGroups) {

    allGroups.addEventListener(
      "change",
      () => {

        if (
          allGroups.checked
        ) {

          groupCheckboxes.forEach(
            checkbox => {

              checkbox.checked =
                false;

            }
          );

        }


        /*
         * If ALL is unchecked and
         * nothing else is selected,
         * restore ALL.
         */

        const selected =
          groupCheckboxes.some(
            checkbox =>
              checkbox.checked
          );


        if (
          !allGroups.checked &&
          !selected
        ) {

          allGroups.checked =
            true;

        }

      }
    );

  }


  /*
   * INDIVIDUAL GROUPS
   */

  groupCheckboxes.forEach(
    checkbox => {

      checkbox.addEventListener(
        "change",
        () => {

          if (
            checkbox.checked &&
            allGroups
          ) {

            allGroups.checked =
              false;

          }


          const selected =
            groupCheckboxes.some(
              item =>
                item.checked
            );


          if (
            !selected &&
            allGroups
          ) {

            allGroups.checked =
              true;

          }

        }
      );

    }
  );


  /*
   * MEDIA INPUT
   */

  const mediaInput =
    $("#postMedia");


  if (mediaInput) {

    mediaInput.addEventListener(
      "change",
      () => {

        handlePostMediaSelection(
          mediaInput.files
        );

        updatePostDailyLimitNote();

      }
    );

  }


  /*
   * FORM SUBMIT
   */

  const form =
    $("#postForm");


  if (form) {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        createVideoPost();

      }
    );

  }

}


/* ---------------------------------------------------------
   CREATE VIDEO POST
   --------------------------------------------------------- */

function createVideoPost() {

  if (
    !postDraftMedia.length
  ) {

    alert(
      "Select at least one video or photo."
    );

    return;
  }


  const remaining =
    getRemainingDailyPosts();


  /*
   * Determine the number of
   * actual posts this batch creates.
   */

  const resultingPosts =
    getDraftPostCount();


  if (
    resultingPosts >
    remaining
  ) {

    alert(
      `This selection creates ${resultingPosts} posts, but you only have ${remaining} post${remaining === 1 ? "" : "s"} remaining today.`
    );

    return;
  }


  /*
   * Resolve target groups.
   */

  const allGroupsCheckbox =
    $("#postAllGroups");


  const selectedGroupIds =
    [
      ...document.querySelectorAll(
        ".post-group-checkbox:checked"
      )
    ]
      .map(
        checkbox =>
          checkbox.value
      )
      .filter(Boolean);


  let groupIds = [];


  if (
    allGroupsCheckbox?.checked
  ) {

    groupIds =
      state.groups
        .filter(
          group =>
            !isArchived(
              group.id
            )
        )
        .map(
          group =>
            group.id
        );

  } else {

    groupIds =
      selectedGroupIds;

  }


  if (!groupIds.length) {

    alert(
      "Select at least one group."
    );

    return;
  }


  groupIds =
    groupIds.filter(
      id =>
        getGroup(id)
    );


  if (!groupIds.length) {

    alert(
      "The selected groups are no longer available."
    );

    return;
  }


  /*
   * Validate every video.
   */

  const invalidVideo =
    postDraftMedia.find(
      item => {

        if (
          item.kind !==
          "video"
        ) {

          return false;

        }


        const length =
          Number(
            item.length || 0
          );


        return (
          !Number.isFinite(
            length
          ) ||
          length <= 0 ||
          length >
            MAX_VIDEO_SECONDS
        );

      }
    );


  if (invalidVideo) {

    alert(
      "Every video post must be 15 seconds or less."
    );

    return;
  }


  /*
   * Validate photos.
   */

  const photoCount =
    postDraftMedia.filter(
      item =>
        item.kind === "image"
    ).length;


  if (
    photoCount >
    MAX_PHOTOS_PER_POST
  ) {

    alert(
      `A photo post can contain a maximum of ${MAX_PHOTOS_PER_POST} photos.`
    );

    return;
  }


  const createdAt =
    now();


  /*
   * Create VIDEO posts.
   *
   * Every selected video becomes
   * its own post.
   */

  postDraftMedia
    .filter(
      item =>
        item.kind === "video"
    )
    .forEach(
      item => {

        const start =
          Number(
            item.start || 0
          );


        const length =
          Math.min(
            MAX_VIDEO_SECONDS,
            Number(
              item.length ||
              0
            )
          );


        const end =
          Math.min(
            Number(
              item.duration ||
              length
            ),
            start +
              length
          );


        state.posts.unshift({

          id:
            uid("post"),

          author:
            state.currentUser.name,

          authorId:
            state.currentUser.id,

          groupIds:
            [...groupIds],

          type:
            "video",

          fileName:
            item.file.name,

          /*
           * Temporary local preview URL.
           *
           * Supabase Storage will replace
           * this later.
           */

          mediaUrl:
            item.url,

          originalDuration:
            Number(
              item.duration || 0
            ),

          trimStart:
            start,

          trimEnd:
            end,

          duration:
            end - start,

          createdAt,

          expiresAt:
            createdAt +
            TWO_DAYS_MS,

          views:
            0,

          reactions:
            0,

          comments:
            0

        });

      }
    );


  /*
   * Create ONE PHOTO COLLECTION
   * from all selected photos.
   */

  const photos =
    postDraftMedia.filter(
      item =>
        item.kind === "image"
    );


  if (
    photos.length
  ) {

    state.posts.unshift({

      id:
        uid("post"),

      author:
        state.currentUser.name,

      authorId:
        state.currentUser.id,

      groupIds:
        [...groupIds],

      type:
        "photos",

      photos:
        photos.map(
          item => ({

            fileName:
              item.file.name,

            mediaUrl:
              item.url

          })
        ),

      photoDuration:
        PHOTO_SECONDS,

      duration:
        photos.length *
        PHOTO_SECONDS,

      createdAt,

      expiresAt:
        createdAt +
        TWO_DAYS_MS,

      views:
        0,

      reactions:
        0,

      comments:
        0

    });

  }


  /*
   * Save prototype state.
   */

  saveState();


  /*
   * Do not release the object URLs
   * here because the current-session
   * post viewer still needs them.
   *
   * They will be cleaned up when
   * the browser session ends or when
   * Supabase media replaces them.
   */

  postDraftMedia = [];


  modalRoot.innerHTML = "";


  state.postFilter =
  "all";
   
   state.screen =
      "posts";
   
   saveState();
   
   render();
   
   setTimeout(() => {
      
      updatePostDailyLimitNote();
   
   }, 0);

}
      


/* ---------------------------------------------------------
   SEARCH
   --------------------------------------------------------- */

function renderSearch() {

  setHeader(
    "Search",
    "Find groups"
  );


  screen.innerHTML = `

    <div class="search-page">


      <div class="search-box">

        <span>
          ⌕
        </span>

        <input
          id="groupSearchInput"
          type="search"
          autocomplete="off"
          placeholder="Search groups"
          value="${esc(
            state.searchQuery || ""
          )}"
        >

      </div>


      <div id="searchResults">
      </div>


    </div>

  `;


  const input =
    $("#groupSearchInput");


  if (input) {

    input.addEventListener(
      "input",
      () => {

        state.searchQuery =
          input.value;

        renderSearchResults();

      }
    );

  }


  renderSearchResults();
}


/* ---------------------------------------------------------
   SEARCH RESULTS
   --------------------------------------------------------- */

function renderSearchResults() {

  const container =
    $("#searchResults");


  if (!container) {
    return;
  }


  const query =
    String(
      state.searchQuery || ""
    )
      .trim()
      .toLowerCase();


  /*
   * No query:
   * show all discoverable groups.
   */

  const groups =
    state.groups.filter(
      group => {

        if (!query) {
          return true;
        }


        const searchable =
          [
            group.name,
            ...safeArray(
              group.category
            )
          ]
            .join(" ")
            .toLowerCase();


        return searchable.includes(
          query
        );

      }
    );


  container.innerHTML = `

    ${
      groups.length
        ? `
          <div class="group-list">

            ${groups
              .map(
                group =>
                  renderSearchGroup(
                    group
                  )
              )
              .join("")}

          </div>
        `
        : `
          <div class="empty">

            <div class="empty-icon">
              ⌕
            </div>

            <h3>
              No groups found
            </h3>

            <p>
              Try another group name or category.
            </p>

          </div>
        `
    }

  `;


  container
    .querySelectorAll(
      "[data-request-group]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          requestToJoinGroup(
            button.dataset.requestGroup
          );

        }
      );

    });

     container
    .querySelectorAll(
      "[data-open-group]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openGroup(
            button.dataset.openGroup
          );

        }
      );

    });
}


/* ---------------------------------------------------------
   SEARCH GROUP CARD
   --------------------------------------------------------- */

function renderSearchGroup(
  group
) {

  const alreadyMember =
    state.groups.some(
      item =>
        item.id === group.id
    );


  const requested =
    Boolean(
      state.joinRequests[
        group.id
      ]
    );


  return `

    <div class="group-card search-group-card">

      <span
        class="group-avatar"
        style="--h:${group.hue}"
      >
        ${esc(group.icon)}
      </span>


      <span class="group-copy">

        <span class="group-name">
          ${esc(group.name)}
        </span>

        <span class="group-meta">

          ${safeArray(
            group.category
          )
            .map(esc)
            .join(" · ")}

          ·

          ${group.members.length}
          members

        </span>

      </span>


      ${
        alreadyMember
          ? `
            <button
              class="small-action-btn"
              data-open-group="${esc(
                group.id
              )}"
            >
              Open
            </button>
          `
          : requested
            ? `
              <span class="status-label">
                Requested
              </span>
            `
            : `
              <button
                class="small-action-btn"
                data-request-group="${esc(
                  group.id
                )}"
              >
                Join
              </button>
            `
      }

    </div>

  `;
}


/* ---------------------------------------------------------
   JOIN REQUEST
   --------------------------------------------------------- */

function requestToJoinGroup(
  groupId
) {

  const group =
    getGroup(groupId);


  if (!group) {
    return;
  }


  if (
    state.groups.some(
      item =>
        item.id === groupId
    )
  ) {
    return;
  }


  state.joinRequests[
    groupId
  ] = {

    createdAt:
      now(),

    status:
      "pending"

  };


  saveState();

  renderSearchResults();

  alert(
    `Join request sent to ${group.name}.`
  );
}


/* ---------------------------------------------------------
   SETTINGS / PROFILE
   --------------------------------------------------------- */

function renderSettings() {

  setHeader(
    "Settings",
    "Profile and appearance"
  );


  const user =
    state.currentUser;


  screen.innerHTML = `

    <div class="settings-page">


      <!-- PROFILE -->

      <section class="settings-section">

        <div class="settings-profile">

          <div
          class="profile-avatar"
          style="--h:${user.hue}"
          >
          ${
             user.avatarImage
             ? `
             <img
             src="${esc(user.avatarImage)}"
             alt="Profile photo"
             >
             `
             : `
             ${esc(
                user.avatar ||
                user.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "?"
             )}
             `
          }
          
          </div>


          <div>

            <h2>
              ${esc(user.name)}
            </h2>

            <p>
              ${esc(user.email)}
            </p>

          </div>

        </div>


        <button
          class="secondary-btn"
          data-action="edit-profile"
        >
          Edit Profile
        </button>

      </section>


      <!-- APPEARANCE -->

      <section class="settings-section">

        <div class="section-title">
          Appearance
        </div>

        <div class="section-note">
          Follow your device or choose a theme.
        </div>


        <div class="theme-options">


          <button
            class="
              theme-option
              ${
                state.theme === "system"
                  ? "selected"
                  : ""
              }
            "
            data-theme-value="system"
          >
            Device
          </button>


          <button
            class="
              theme-option
              ${
                state.theme === "light"
                  ? "selected"
                  : ""
              }
            "
            data-theme-value="light"
          >
            Light
          </button>


          <button
            class="
              theme-option
              ${
                state.theme === "dark"
                  ? "selected"
                  : ""
              }
            "
            data-theme-value="dark"
          >
            Dark
          </button>


        </div>

      </section>


      <!-- INFORMATION -->

      <section class="settings-section">

        <button
          class="menu-item"
          data-action="about"
        >

          <div class="menu-icon">
            ⓘ
          </div>

          <div>

            <strong>
              About SimpoChat
            </strong>

            <span>
              Group communication platform.
            </span>

          </div>

        </button>

      </section>


    </div>

  `;


  /*
   * Theme controls
   */

  document
    .querySelectorAll(
      "[data-theme-value]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.theme =
            button.dataset.themeValue;

          saveState();

          applyTheme();

          renderSettings();

        }
      );

    });
}


/* ---------------------------------------------------------
   EDIT PROFILE
   --------------------------------------------------------- */

function openEditProfile() {

   let pendingProfilePhoto = null;

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


        <!-- PROFILE PHOTO -->
        
        
        <div class="profile-photo-editor">

          <div id="profilePhotoPreview">
            ${renderUserAvatar(
              user,
              "profile-photo-preview"
            )}
          </div>


          <input
            type="file"
            id="profilePhotoInput"
            accept="image/*"
            hidden
          >


          <button
            class="secondary-btn"
            type="button"
            data-action="choose-profile-photo"
          >
            ${
              user.avatarImage
                ? "Change Photo"
                : "Add Photo"
            }
          </button>


          ${
            user.avatarImage
              ? `
                <button
                  class="secondary-btn"
                  type="button"
                  data-action="remove-profile-photo"
                >
                  Remove Photo
                </button>
              `
              : ""
          }

        </div>


        <form id="profileForm">


          <div class="field">

            <label>
              User name
            </label>

            <input
              id="profileName"
              maxlength="60"
              value="${esc(user.name)}"
              required
            >

          </div>


          <div class="field">

            <label>
              Email
            </label>

            <input
              id="profileEmail"
              type="email"
              value="${esc(user.email)}"
              required
            >

          </div>


          <button
            class="primary-btn"
            type="submit"
          >
            Save Profile
          </button>


          <button
            class="secondary-btn"
            type="button"
            data-close
          >
            Cancel
          </button>


        </form>

      </div>

    </div>

  `;


  /*
   * PROFILE PHOTO PICKER
   */

  const photoInput =
    $("#profilePhotoInput");


  const photoPreview =
    $("#profilePhotoPreview");


  if (photoInput) {

    photoInput.addEventListener(
      "change",
      () => {

        const file =
          photoInput.files?.[0];


        if (!file) {
          return;
        }


        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          alert(
            "Please choose an image."
          );

          return;

        }


        const reader =
          new FileReader();


        reader.onload = event => {
           
           const image =
              event.target?.result;
           
           if (!image || !photoPreview) {
              return;
           }
           
           pendingProfilePhoto =
              String(image);
           
           photoPreview.innerHTML =
              renderUserAvatar(
                 {
                    ...user,
                    avatarImage: String(image)
                 },
                 "profile-photo-preview"
              );

        };


        reader.readAsDataURL(file);

      }
    );

  }


  /*
   * CHANGE / ADD PROFILE PHOTO
   */

  const choosePhotoButton =
    document.querySelector(
      '[data-action="choose-profile-photo"]'
    );


  if (choosePhotoButton) {

    choosePhotoButton.addEventListener(
      "click",
      () => {

        photoInput?.click();

      }
    );

  }


  /*
   * REMOVE PROFILE PHOTO
   */

  const removePhotoButton =
    document.querySelector(
      '[data-action="remove-profile-photo"]'
    );


  if (removePhotoButton) {

    removePhotoButton.addEventListener(
      "click",
      () => {

        state.currentUser.avatarImage =
          null;


        saveState();

        openEditProfile();

      }
    );

  }


  /*
   * SAVE PROFILE
   */

  const form =
    $("#profileForm");


  if (form) {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const name =
          $("#profileName")
            ?.value
            .trim();


        const email =
          $("#profileEmail")
            ?.value
            .trim();


        if (!name || !email) {

          alert(
            "Complete your profile details."
          );

          return;

        }


        state.currentUser.name =
          name;


        state.currentUser.email =
          email;



         if (pendingProfilePhoto !== null) {
            state.currentUser.avatarImage =
               pendingProfilePhoto;
         }


        /*
         * Keep the first letter as the
         * fallback avatar.
         *
         * Do NOT remove avatarImage.
         */

        state.currentUser.avatar =
          name
            .charAt(0)
            .toUpperCase();


        saveState();

        modalRoot.innerHTML = "";

        render();

      }
    );

  }

}


/* ---------------------------------------------------------
   ABOUT
   --------------------------------------------------------- */

function openAbout() {

  modalRoot.innerHTML = `

    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            About SimpoChat
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>


        <div class="about-content">

          <div class="profile-avatar">
            S
          </div>

          <h2>
            SimpoChat
          </h2>

          <p>
            A group-focused communication platform
            designed around communities, conversations
            and temporary content.
          </p>

        </div>

      </div>

    </div>

  `;
}


/* ---------------------------------------------------------
   POST REACTION
   --------------------------------------------------------- */

function reactToPost(
  postId
) {

  const post =
    state.posts.find(
      item =>
        item.id === postId
    );


  if (!post) {
    return;
  }


  post.reactions =
    Number(post.reactions || 0) + 1;


  saveState();

  openPost(postId);
}


/* ---------------------------------------------------------
   POST COMMENTS
   --------------------------------------------------------- */

function openPostComments(
  postId
) {

  const post =
    state.posts.find(
      item =>
        item.id === postId
    );


  if (!post) {
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
            Comments
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>


        <div class="empty">

          <div class="empty-icon">
            ◌
          </div>

          <h3>
            Post comments
          </h3>

          <p>
            Comments will appear here.
          </p>

        </div>


        <form
          id="commentForm"
          class="message-composer"
        >

          <input
            id="commentInput"
            placeholder="Write a comment..."
            autocomplete="off"
          >

          <button
            class="send-btn"
            type="submit"
          >
            ➤
          </button>

        </form>

      </div>

    </div>

  `;


  const form =
    $("#commentForm");


  if (form) {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const input =
          $("#commentInput");


        const text =
          input?.value.trim();


        if (!text) {
          return;
        }


        post.comments =
          Number(
            post.comments || 0
          ) + 1;


        saveState();

        openPostComments(
          postId
        );

      }
    );

  }
}

/* =========================================================
   SIMPOCHAT — SECTION 5/5
   EVENTS + NAVIGATION + ACTIONS + CLEANUP + STARTUP
   ========================================================= */


/* ---------------------------------------------------------
   GLOBAL CLICK HANDLER
   --------------------------------------------------------- */

document.addEventListener(
  "click",
  event => {

    const target =
      event.target.closest(
        "[data-action], [data-close], [data-group-action], [data-post-id], [data-post-reaction], [data-post-comments], [data-member-id], [data-temp-invite]"
      );


    if (!target) {
      return;
    }


    
   /* -------------------------------------
   CLOSE MODALS / POST VIEWER
   ------------------------------------- */

const clickedElement =
  event.target;

const clickedModal =
  clickedElement.closest(
    ".modal"
  );

const clickedPostViewer =
  clickedElement.closest(
    ".post-viewer"
  );

const clickedModalBackdrop =
  clickedElement.closest(
    ".modal-backdrop"
  );

const clickedPostViewerBackdrop =
  clickedElement.closest(
    ".post-viewer-backdrop"
  );


/*
 * REAL CLOSE BUTTONS
 *
 * IMPORTANT:
 *
 * Do NOT search for [data-close]
 * globally because the backdrop
 * itself also has data-close.
 *
 * Only elements INSIDE the modal
 * or post viewer can act as a
 * close button.
 */

const closeControl =
  clickedElement.closest(
    ".modal [data-close], .post-viewer [data-close]"
  );


/*
 * CLOSE BUTTON / CANCEL
 */

if (
  closeControl &&
  (
    clickedModal ||
    clickedPostViewer
  )
) {

  modalRoot.innerHTML = "";

  return;

}


/*
 * CLICK DIRECTLY ON MODAL BACKDROP
 *
 * Clicking inside the modal must
 * NOT close it.
 */

if (
  clickedModalBackdrop &&
  !clickedModal &&
  clickedElement ===
    clickedModalBackdrop
) {

  modalRoot.innerHTML = "";

  return;

}


/*
 * CLICK DIRECTLY ON POST VIEWER
 * BACKDROP
 */

if (
  clickedPostViewerBackdrop &&
  !clickedPostViewer &&
  clickedElement ===
    clickedPostViewerBackdrop
) {

  modalRoot.innerHTML = "";

  return;

}

    /* -------------------------------------
       GROUP ACTION MENU
       ------------------------------------- */

    if (
      target.dataset.groupAction
    ) {

      const action =
        target.dataset.groupAction;

      const id =
        target.dataset.groupId;


      modalRoot.innerHTML = "";


      if (action === "star") {

        toggleStarred(id);

        return;
      }


      if (action === "archive") {

        toggleArchived(id);

        return;
      }


      if (action === "select") {

        enterSelectionMode(id);

        return;
      }


      if (action === "open") {

        openGroup(id);

        return;
      }

    }


    /* -------------------------------------
       POST CARD
       ------------------------------------- */

    if (
      target.dataset.postId
    ) {

      openPost(
        target.dataset.postId
      );

      return;
    }


    /* -------------------------------------
       POST REACTION
       ------------------------------------- */

    if (
      target.dataset.postReaction
    ) {

      reactToPost(
        target.dataset.postReaction
      );

      return;
    }


    /* -------------------------------------
       POST COMMENTS
       ------------------------------------- */

    if (
      target.dataset.postComments
    ) {

      openPostComments(
        target.dataset.postComments
      );

      return;
    }


    /* -------------------------------------
       TEMPORARY CHAT INVITE
       ------------------------------------- */

    if (
      target.dataset.tempInvite
    ) {

      sendTemporaryChatInvite(
         target.dataset.tempInvite,
         state.selectedGroup
      );

      return;
    }


         /* -------------------------------------
       EXISTING TEMPORARY CHAT
       ------------------------------------- */

    if (
      target.dataset.tempChatMember
    ) {

      state.selectedMember =
        target.dataset.tempChatMember;

      state.screen =
        "temporary-chat";

      saveState();

      render();

      return;
    }


    /* -------------------------------------
       MEMBER
       ------------------------------------- */

    if (
      target.dataset.memberId
    ) {

      startTemporaryChat(
        target.dataset.memberId
      );

      return;
    }


    /* -------------------------------------
       NORMAL ACTIONS
       ------------------------------------- */

    const action =
      target.dataset.action;


    if (!action) {
      return;
    }


    handleAction(
       action,
       target
    );

  }
);


/* ---------------------------------------------------------
   ACTION ROUTER
   --------------------------------------------------------- */

function handleAction(
   action,
   actionTarget
) {

  switch (action) {


    /* ================================
       NAVIGATION
       ================================= */

    case "home":

      state.screen =
        "home";

      state.selectionMode =
        false;

      state.selectedItems =
        [];

      saveState();

      render();

      break;


    case "starred":

  /* Close the main menu before opening Starred. */
  if (typeof modalRoot !== "undefined") {
    modalRoot.innerHTML = "";
  }

  state.screen =
    "starred";

  state.selectionMode =
    false;

  state.selectedItems =
    [];

  saveState();

  render();

  break;


    case "archived":

  /* Close the main menu before opening Archived. */
  if (typeof modalRoot !== "undefined") {
    modalRoot.innerHTML = "";
  }

  state.screen =
    "archived";

  state.selectionMode =
    false;

  state.selectedItems =
    [];

  saveState();

  render();

  break;


    case "temporary-chat-messages":
        
        state.temporaryChatTab =
           "messages";
        
        scrollTemporaryChatTo("messages");
        
        break;


    case "temporary-chat-invites":
        
        state.temporaryChatTab =
           "invites";
        
        scrollTemporaryChatTo("invites");
        
        break;
      

       /* ================================
       HOME HEADER / FLOATING BUTTONS
       ================================= */

   case "open-temporary-chat":
        
        state.screen =
           "temporary-chat-inbox";
        
        state.temporaryChatTab =
           "messages";
        
        saveState();
        
        render();
        
        break;

        
     case "open-posts":

      state.postFilter =
        "all";

      state.screen =
        "posts";

      saveState();

      render();

      break;


    case "open-search":

      state.screen =
        "search";

      saveState();

      render();

      break;


    case "open-menu":

      openMainMenu();

      break;


    case "join-group":

  /*
   * The floating + button has two functions:
   *
   * HOME  → search/join an existing group
   * POSTS → create a new post
   *
   * The visible + symbol does not change.
   */

  if (
    state.screen ===
    "posts"
  ) {

    openCreatePost();

  } else {

    state.screen =
      "search";

    state.searchQuery =
      "";

    saveState();

    render();

  }

  break;


    case "posts":

      state.screen =
        "posts";

      saveState();

      render();

      break;


    case "search":


    case "settings":

  /* Close the main menu before opening Settings. */
  if (typeof modalRoot !== "undefined") {
    modalRoot.innerHTML = "";
  }

  state.screen =
    "settings";

  state.selectionMode =
    false;

  state.selectedItems =
    [];

  saveState();

  render();

  break;

    /* ================================
       GROUP
       ================================= */

    case "new-group":

  /*
   * Close the menu overlay before opening
   * the full New Group screen.
   *
   * Without this, the invisible menu layer
   * can remain above the page and block taps.
   */

  if (typeof modalRoot !== "undefined") {
    modalRoot.innerHTML = "";
  }

  state.screen =
    "new-group";

  saveState();

  render();

  break;


    case "group-chat":

      if (
        state.selectedGroup
      ) {

        state.screen =
          "group-chat";

        saveState();

        render();

      }

      break;


    case "group-profile":
        
        if (
           state.selectedGroup
        ) {
           /* Close the three-dot menu first. */
           if (
              typeof modalRoot !== "undefined"
           ) {
              modalRoot.innerHTML = "";
           }
           
           state.screen =
              "group-profile";
           
           saveState();
           
           render();
        
        }
        
        break;


    case "back":

      goBack();

      break;


    /* ================================
       GROUP ACTIONS
       ================================= */

    case "star-group":

      if (
        state.selectedGroup
      ) {

        toggleStarred(
          state.selectedGroup
        );

      }

      break;


    case "leave-group":

      leaveCurrentGroup();

      break;


    /* ================================
       CHAT
       ================================= */

    case "chat-menu":

      openChatMenu();

      break;


    case "voice-call":

      startGroupCall(
        "voice"
      );

      break;


    case "video-call":

      startGroupCall(
        "video"
      );

      break;


    case "voice-message":

      createVoiceMessage();

      break;


    case "attachment":

      openAttachmentMenu();

      break;


    case "camera":

      openCamera();

      break;


    case "emoji":

      openEmojiPicker();

      break;


    case "cancel-reply":
        
        pendingReplyMessageId =
           null;
        
        activeMessageActionId =
           null;
        
        renderGroupChat();
        
        break;


    case "group-posts":

      state.postFilter =
        state.selectedGroup ||
        "all";

      state.screen =
        "posts";

      saveState();

      render();

      break;


    case "group-report":

      openReportForm();

      break;


    case "export-chat":

      openTemporaryMemberPicker();

      break;


    /* ================================
       POSTS
       ================================= */

    case "create-post":

      openCreatePost();

      break;


    /* ================================
       SETTINGS
       ================================= */

    case "edit-profile":

      openEditProfile();

      break;


    case "about":

      openAbout();

      break;


    /* ================================
       SELECTION
       ================================= */

    case "select-all":

      selectAllVisible();

      break;


    case "clear-selection":

      unselectAllVisible();

      break;


    case "remove-selected":

      removeSelectedGroups();

      break;

  }

}


/* ---------------------------------------------------------
   NAVIGATION BACK
   --------------------------------------------------------- */

function goBack() {

  modalRoot.innerHTML = "";


  if (
    state.screen ===
    "group-chat"
  ) {

    state.screen =
      "home";

  }


  else if (
     state.screen ===
     "group-profile"
  ) {
     
     state.screen =
        "group-chat";
  }


  else if (
    state.screen ===
    "new-group"
  ) {

    state.screen =
      "home";

  }


  else if (
    state.screen ===
    "search"
  ) {

    state.screen =
      "home";

  }


  else if (
    state.screen ===
    "settings"
  ) {

    state.screen =
      "home";

  }


  else {

    state.screen =
      "home";

  }


  state.selectionMode =
    false;

  state.selectedItems =
    [];


  saveState();

  render();
}


/* ---------------------------------------------------------
   STAR GROUP
   --------------------------------------------------------- */

function toggleStarred(
  groupId
) {

  if (!groupId) {
    return;
  }


  const exists =
    state.starred.includes(
      groupId
    );


  if (exists) {

    state.starred =
      state.starred.filter(
        id =>
          id !== groupId
      );

  } else {

    state.starred.push(
      groupId
    );

  }


  saveState();

  modalRoot.innerHTML = "";

  render();
}


/* ---------------------------------------------------------
   ARCHIVE GROUP
   --------------------------------------------------------- */

function toggleArchived(
  groupId
) {

  if (!groupId) {
    return;
  }


  const exists =
    state.archived.includes(
      groupId
    );


  if (exists) {

    state.archived =
      state.archived.filter(
        id =>
          id !== groupId
      );

  } else {

    state.archived.push(
      groupId
    );

  }


  saveState();

  modalRoot.innerHTML = "";

  render();
}


/* ---------------------------------------------------------
   GROUP CALL
   --------------------------------------------------------- */

function startGroupCall(
  type
) {

  const group =
    getGroup(
      state.selectedGroup
    );


  if (!group) {
    return;
  }


  /*
   * Only admins can create/start
   * group calls.
   */

  if (!group.admin) {

    alert(
      "Only group admins can start a group call."
    );

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
            ${
              type === "video"
                ? "Video"
                : "Voice"
            }
            Call
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>


        <div class="call-start-card">

          <div class="call-icon">

            ${
              type === "video"
                ? "▣"
                : "☎"
            }

          </div>


          <h3>
            Start ${
              type === "video"
                ? "video"
                : "voice"
            } call
          </h3>


          <p>
            Choose members to invite.
            Each member can participate
            in only one call at a time.
          </p>


          <div class="member-list">

            ${
              group.members
                .filter(
                  member =>
                    member.id !==
                    state.currentUser.id
                )
                .map(
                  member => `

                    <label
                      class="member-row call-member"
                    >

                      <input
                        type="checkbox"
                        value="${esc(
                          member.id
                        )}"
                      >

                      <span
                        class="member-avatar"
                        style="--h:${member.hue}"
                      >
                        ${esc(
                          member.avatar
                        )}
                      </span>

                      <span class="member-copy">
                        <strong>
                          ${esc(
                            member.name
                          )}
                        </strong>
                      </span>

                    </label>

                  `
                )
                .join("")
            }

          </div>


          <button
            class="primary-btn"
            data-action="confirm-call"
            data-call-type="${esc(type)}"
          >
            Start Call
          </button>


        </div>

      </div>

    </div>

  `;
}


/* ---------------------------------------------------------
   CONFIRM CALL
   --------------------------------------------------------- */

function confirmGroupCall(
  type
) {

  const selected =
    [
      ...document.querySelectorAll(
        ".call-member input:checked"
      )
    ]
      .map(
        input =>
          input.value
      );


  if (!selected.length) {

    alert(
      "Select at least one member."
    );

    return;
  }


  const group =
    getGroup(
      state.selectedGroup
    );


  if (!group) {
    return;
  }


  state.activeCalls =
    safeArray(
      state.activeCalls
    );


  state.activeCalls.push({

    id:
      uid("call"),

    groupId:
      group.id,

    type,

    host:
      state.currentUser.id,

    members:
      [
        state.currentUser.id,
        ...selected
      ],

    createdAt:
      now()

  });


  saveState();

  modalRoot.innerHTML = "";


  alert(
    `${
      type === "video"
        ? "Video"
        : "Voice"
    } call started.`
  );

}


/* ---------------------------------------------------------
   ATTACHMENT MENU
   --------------------------------------------------------- */

function openAttachmentMenu() {

  modalRoot.innerHTML = `

    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            Attachment
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
            data-action="camera"
          >

            <div class="menu-icon">
              ◉
            </div>

            <div>

              <strong>
                Camera
              </strong>

              <span>
                Take a photo or video.
              </span>

            </div>

          </button>


          <button
            class="menu-item"
            data-action="choose-file"
          >

            <div class="menu-icon">
              ▣
            </div>

            <div>

              <strong>
                File
              </strong>

              <span>
                Choose a file.
              </span>

            </div>

          </button>

        </div>

      </div>

    </div>

  `;
}


/* ---------------------------------------------------------
   EMOJI PICKER
   --------------------------------------------------------- */

function openEmojiPicker() {

  const emojis = [
    "😀","😃","😄","😁","😆","😅","😂","🤣",
    "😊","😇","🙂","🙃","😉","😌","😍","🥰",
    "😘","😗","😙","😚","😋","😛","😝","😜",
    "🤪","🤨","🧐","🤓","😎","🤩","🥳","😏",
    "😢","😭","😤","😡","🤬","😱","😴","🤔",
    "🤗","🤭","🤫","🤥","😶","🙄","😬","😮",
    "👍","👎","👏","🙌","🙏","❤️","🔥","🎉",
    "💯","😂","🤣","😍","🥰","😘","💔","✨",
    "🎯","💪","👋","🤝","✌️","👌","❤️‍🔥","💜"
  ];

  modalRoot.innerHTML = `

    <div
      class="modal-backdrop emoji-picker-backdrop"
      data-close
    >

      <div class="modal emoji-picker-modal">

        <div class="modal-head">

          <div class="modal-title">
            Emoji
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>

        <div class="emoji-grid">

          ${
            emojis
              .map(
                emoji => `
                  <button
                    type="button"
                    class="emoji-option"
                    data-emoji="${emoji}"
                  >
                    ${emoji}
                  </button>
                `
              )
              .join("")
          }

        </div>

      </div>

    </div>

  `;

  document
    .querySelectorAll("[data-emoji]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const input =
            document.querySelector(
              "#messageInput"
            );

          if (!input) {
            return;
          }

          const emoji =
            button.dataset.emoji || "";

          const start =
            input.selectionStart ??
            input.value.length;

          const end =
            input.selectionEnd ??
            input.value.length;

          input.value =
            input.value.slice(0, start) +
            emoji +
            input.value.slice(end);

          const cursor =
            start + emoji.length;

          input.focus();

          input.setSelectionRange(
            cursor,
            cursor
          );

          modalRoot.innerHTML = "";

        }
      );

    });
}


/* ---------------------------------------------------------
   CAMERA
   --------------------------------------------------------- */

function openCamera() {

  modalRoot.innerHTML = `
    <div
      class="camera-screen"
      id="simpoCameraScreen"
    >

      <video
        id="simpoCameraVideo"
        class="camera-video"
        autoplay
        playsinline
        muted
      ></video>

      <div class="camera-overlay">

        <div class="camera-topbar">

          <button
            type="button"
            class="camera-close-btn"
            id="cameraCloseBtn"
            aria-label="Close camera"
          >
            ×
          </button>

          <div class="camera-title">
            Camera
          </div>

          <div class="camera-top-space"></div>

        </div>


        <div class="camera-bottom">

          <div
            class="camera-gallery-tray"
            id="cameraGalleryTray"
          >

            <div class="camera-gallery-handle"></div>

            <div class="camera-gallery-title">
            
            <div class="camera-gallery-title-left">
            
            <span>
            Gallery
            </span>
            
            <span id="cameraGalleryCount">
            0 selected
            </span>
            
            </div>
            
            
            <div class="camera-gallery-title-actions">

  <button
    type="button"
    class="camera-gallery-selection-btn"
    id="cameraGalleryRemove"
    hidden
  >
    Remove
  </button>

  <button
    type="button"
    class="camera-gallery-selection-btn"
    id="cameraGalleryPreview"
    hidden
  >
    Preview
  </button>

  <button
    type="button"
    class="camera-gallery-text-btn"
    id="cameraGalleryAddText"
  >
    Add text
  </button>

  <button
    type="button"
    class="camera-gallery-send-btn"
    id="cameraGallerySend"
  >
    Send
  </button>

</div>
            
            </div>
            
            <div
            class="camera-gallery-text-wrap"
            id="cameraGalleryTextWrap"
            hidden
            >
            
            <textarea
            id="cameraGalleryText"
            class="camera-gallery-text"
            rows="2"
            maxlength="1000"
            placeholder="Add a message..."
            aria-label="Message with pictures"
            ></textarea>
            
            </div>

            <div
              class="camera-gallery-items"
              id="cameraGalleryItems"
            >
              <button
                type="button"
                class="camera-gallery-add"
                id="cameraGalleryAdd"
                aria-label="Open phone gallery"
              >
                +
              </button>
            </div>

          </div>


          <div class="camera-controls">

            <button
              type="button"
              class="camera-shutter"
              id="cameraShutterBtn"
              aria-label="Take photo"
            >
              <span></span>
            </button>

          </div>

        </div>

      </div>

      <input
        type="file"
        id="cameraGalleryInput"
        accept="image/*"
        multiple
        hidden
      >

    </div>
  `;


  const video =
    document.querySelector(
      "#simpoCameraVideo"
    );

  const closeButton =
    document.querySelector(
      "#cameraCloseBtn"
    );

  const shutterButton =
    document.querySelector(
      "#cameraShutterBtn"
    );

  const galleryAdd =
    document.querySelector(
      "#cameraGalleryAdd"
    );
   
const galleryAddText =
  document.querySelector(
    "#cameraGalleryAddText"
  );

const gallerySend =
  document.querySelector(
    "#cameraGallerySend"
  );

const galleryTextWrap =
  document.querySelector(
    "#cameraGalleryTextWrap"
  );

const galleryText =
  document.querySelector(
    "#cameraGalleryText"
  );

  const galleryInput =
    document.querySelector(
      "#cameraGalleryInput"
    );

  const galleryTray =
    document.querySelector(
      "#cameraGalleryTray"
    );


  /* -------------------------------------------------------
     CLOSE CAMERA
     ------------------------------------------------------- */

  function closeCamera() {

    if (activeCameraStream) {

      activeCameraStream
        .getTracks()
        .forEach(
          track => track.stop()
        );

      activeCameraStream = null;

    }

    cameraMediaItems = [];

    modalRoot.innerHTML = "";

  }


  /* -------------------------------------------------------
     OPEN PHONE GALLERY
     ------------------------------------------------------- */

  function openPhoneGallery() {

    galleryInput.click();

  }


  /* -------------------------------------------------------
     ADD GALLERY FILES
     ------------------------------------------------------- */

  function addGalleryFiles(files) {

    const selectedFiles =
      Array.from(files || [])
        .filter(
          file =>
            file.type.startsWith(
              "image/"
            )
        );


    selectedFiles.forEach(file => {

      cameraMediaItems.push({

        id: uid("camera-media"),

        type: "image",

        name: file.name,

        url:
          URL.createObjectURL(
            file
          ),

        source: "gallery",

        file

      });

    });


    renderCameraGallery();

  }


  /* -------------------------------------------------------
     TAKE PHOTO
     ------------------------------------------------------- */

  function capturePhoto() {

    if (
      !video ||
      video.readyState < 2
    ) {
      return;
    }


    const canvas =
      document.createElement(
        "canvas"
      );


    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {
      return;
    }


    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    canvas.toBlob(
      blob => {

        if (!blob) {
          return;
        }


        const file =
          new File(
            [blob],
            `simpochat-${Date.now()}.jpg`,
            {
              type:
                "image/jpeg"
            }
          );


        cameraMediaItems.push({

          id:
            uid("camera-media"),

          type:
            "image",

          name:
            file.name,

          url:
            URL.createObjectURL(
              blob
            ),

          source:
            "camera",

          file

        });


        renderCameraGallery();

      },
      "image/jpeg",
      0.92
    );

  }


  /* -------------------------------------------------------
     RENDER CAMERA GALLERY
     ------------------------------------------------------- */

   function renderCameraGallery() {

  const items =
    document.querySelector(
      "#cameraGalleryItems"
    );

  const count =
    document.querySelector(
      "#cameraGalleryCount"
    );


  if (!items || !count) {
    return;
  }


  const selectedCount =
    cameraMediaItems.filter(
      item => item.selected
    ).length;


  const removeButton =
    document.querySelector(
      "#cameraGalleryRemove"
    );

  const previewButton =
    document.querySelector(
      "#cameraGalleryPreview"
    );


  if (removeButton) {
    removeButton.hidden =
      selectedCount === 0;
  }


  if (previewButton) {
    previewButton.hidden =
      selectedCount === 0;
  }


  count.textContent =
    selectedCount
      ? `${selectedCount} selected`
      : `${cameraMediaItems.length} added`;


  items.innerHTML = `


    <button
      type="button"
      class="camera-gallery-add"
      id="cameraGalleryAdd"
      aria-label="Open phone gallery"
    >
      +
    </button>


    ${cameraMediaItems
      .map(
        item => `

          <div
            class="camera-gallery-thumb ${
              item.selected
                ? "selected"
                : ""
            }"
            data-camera-media-id="${esc(
              item.id
            )}"
            title="${esc(item.name)}"
          >

            <img
              src="${esc(item.url)}"
              alt=""
            >

            <span
              class="camera-gallery-source"
            >
              ${
                item.source ===
                "camera"
                  ? "●"
                  : ""
              }
            </span>

          </div>

        `
      )
      .join("")}

  `;


  const newGalleryAdd =
    document.querySelector(
      "#cameraGalleryAdd"
    );


  newGalleryAdd?.addEventListener(
    "click",
    openPhoneGallery
  );


  /* =======================================================
     LONG PRESS + TOUCH DRAG REORDER
     ======================================================= */

  let pressTimer = null;

  let dragMediaId = null;

  let draggedThumb = null;

  let dragTargetThumb = null;

  let isDragging = false;

  let suppressClick = false;


  function clearPressTimer() {

    if (pressTimer) {

      clearTimeout(
        pressTimer
      );

      pressTimer = null;

    }

  }


  function getThumbFromPoint(
    clientX,
    clientY
  ) {

    const element =
      document.elementFromPoint(
        clientX,
        clientY
      );


    return element?.closest(
      ".camera-gallery-thumb"
    );

  }


  /*
   * Change the order without
   * rebuilding the gallery.
   */
  function reorderMediaInPlace(
    draggedId,
    targetId,
    draggedElement,
    targetElement
  ) {

    if (
      !draggedId ||
      !targetId ||
      draggedId === targetId ||
      !draggedElement ||
      !targetElement
    ) {
      return;
    }


    const fromIndex =
      cameraMediaItems.findIndex(
        item =>
          item.id ===
          draggedId
      );


    const toIndex =
      cameraMediaItems.findIndex(
        item =>
          item.id ===
          targetId
      );


    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex === toIndex
    ) {
      return;
    }


    const moved =
      cameraMediaItems.splice(
        fromIndex,
        1
      )[0];


    cameraMediaItems.splice(
      toIndex,
      0,
      moved
    );


    /*
     * Move the actual DOM element
     * instead of rebuilding everything.
     */
    if (fromIndex < toIndex) {

      targetElement.after(
        draggedElement
      );

    } else {

      targetElement.before(
        draggedElement
      );

    }

  }


  items
    .querySelectorAll(
      ".camera-gallery-thumb"
    )
    .forEach(
      thumb => {

        const mediaId =
          thumb.dataset
            .cameraMediaId;


        let startX = 0;

        let startY = 0;


        const startPress =
          event => {

            const point =
              event.touches?.[0] ||
              event;


            startX =
              point.clientX;

            startY =
              point.clientY;


            clearPressTimer();


            pressTimer =
              setTimeout(
                () => {

                  const item =
                    cameraMediaItems
                      .find(
                        media =>
                          media.id ===
                          mediaId
                      );


                  if (!item) {
                    return;
                  }


                  dragMediaId =
                    mediaId;

                  draggedThumb =
                    thumb;

                  dragTargetThumb =
                    null;

                                    /*
                   * Long-press selects the picture
                   * and immediately enters rearrange mode.
                   */
                  item.selected = true;

                  isDragging =
                    true;

                  suppressClick =
                    true;


                  thumb.classList.add(
                    "selected"
                  );

                  thumb.classList.add(
                    "dragging"
                  );


                  items.classList.add(
                    "reordering"
                  );

                },
                500
              );

          };


        const movePress =
          event => {

            const point =
              event.touches?.[0] ||
              event;


            const dx =
              Math.abs(
                point.clientX -
                startX
              );


            const dy =
              Math.abs(
                point.clientY -
                startY
              );


            /*
             * Before long-press:
             * allow normal scrolling.
             */
            if (
              !isDragging &&
              (
                dx > 10 ||
                dy > 10
              )
            ) {

              clearPressTimer();

              return;

            }


            if (!isDragging) {
              return;
            }


            /*
             * Once dragging has started,
             * stop the browser from scrolling
             * the page underneath.
             */
            event.preventDefault();


            const target =
              getThumbFromPoint(
                point.clientX,
                point.clientY
              );


            if (!target) {
              return;
            }


            const targetId =
              target.dataset
                .cameraMediaId;


            if (
              !targetId ||
              targetId ===
                dragMediaId
            ) {
              return;
            }


            /*
             * Highlight the thumbnail
             * we are moving toward.
             */
            if (
              dragTargetThumb !==
              target
            ) {

              if (
                dragTargetThumb
              ) {

                dragTargetThumb
                  .classList
                  .remove(
                    "drag-target"
                  );

              }


              dragTargetThumb =
                target;


              dragTargetThumb
                .classList
                .add(
                  "drag-target"
                );

            }


            /*
             * Change the actual order
             * without rebuilding the gallery.
             */
            reorderMediaInPlace(
              dragMediaId,
              targetId,
              draggedThumb,
              target
            );

          };


        const endPress =
          () => {

            clearPressTimer();


            const wasDragging =
              isDragging;


            if (
              draggedThumb
            ) {

              draggedThumb
                .classList
                .remove(
                  "dragging"
                );

            }


            if (
              dragTargetThumb
            ) {

              dragTargetThumb
                .classList
                .remove(
                  "drag-target"
                );

            }


            items.classList.remove(
              "reordering"
            );


            if (wasDragging) {

              isDragging =
                false;

              dragMediaId =
                null;

              draggedThumb =
                null;

              dragTargetThumb =
                null;

              suppressClick =
                true;


              /*
               * Rebuild only once,
               * after the drag is finished.
               */
              renderCameraGallery();


              setTimeout(
                () => {

                  suppressClick =
                    false;

                },
                100
              );

              return;

            }


            dragMediaId =
              null;

            draggedThumb =
              null;

            dragTargetThumb =
              null;

          };


        thumb.addEventListener(
          "touchstart",
          startPress,
          {
            passive: false
          }
        );


        thumb.addEventListener(
          "touchmove",
          movePress,
          {
            passive: false
          }
        );


        thumb.addEventListener(
          "touchend",
          endPress
        );
         
         
         thumb.addEventListener(
            "touchcancel",
            endPress
         );
         
         /*
         * Stop Android/Chrome's native
         * long-press image menu.
         */
         thumb.addEventListener(
            "contextmenu",
            event => {
               event.preventDefault();
               event.stopPropagation();
            }
         );


        thumb.addEventListener(
          "mousedown",
          startPress
        );


        thumb.addEventListener(
          "mousemove",
          movePress
        );


        thumb.addEventListener(
          "mouseup",
          endPress
        );


        thumb.addEventListener(
          "mouseleave",
          () => {

            if (!isDragging) {

              clearPressTimer();

            }

          }
        );


        thumb.addEventListener(
          "click",
          () => {

            if (suppressClick) {
              return;
            }


            const item =
              cameraMediaItems
                .find(
                  media =>
                    media.id ===
                    mediaId
                );


            if (!item) {
              return;
            }


            /*
             * Once selection mode
             * has started, normal taps
             * select/deselect pictures.
             */
            if (
              cameraMediaItems
                .some(
                  media =>
                    media.selected
                )
            ) {

              item.selected =
                !item.selected;


              renderCameraGallery();

            }

          }
        );

      }
    );
 }


  /* =======================================================
     REMOVE SELECTED
     ======================================================= */

  const removeButton =
    document.querySelector(
      "#cameraGalleryRemove"
    );


  removeButton?.addEventListener(
    "click",
    () => {

      cameraMediaItems =
        cameraMediaItems.filter(
          item =>
            !item.selected
        );


      renderCameraGallery();

    }
  );


  /* =======================================================
     PREVIEW SELECTED
     ======================================================= */

  const previewButton =
    document.querySelector(
      "#cameraGalleryPreview"
    );


  previewButton?.addEventListener(
    "click",
    () => {

      const selected =
        cameraMediaItems.filter(
          item =>
            item.selected
        );


      if (!selected.length) {
        return;
      }


      const previewItem =
        selected[0];


      modalRoot.innerHTML = `

        <div
          class="camera-preview-screen"
        >

          <button
            type="button"
            class="camera-preview-close"
            id="cameraPreviewClose"
            aria-label="Close preview"
          >
            ×
          </button>

          <img
            class="camera-preview-image"
            src="${esc(
              previewItem.url
            )}"
            alt=""
          >

        </div>

      `;


      document
  .querySelector(
    "#cameraPreviewClose"
  )
  ?.addEventListener(
    "click",
    () => {

      /*
       * Stop the old camera stream before
       * rebuilding the Camera screen.
       *
       * Do NOT clear cameraMediaItems.
       * Those pictures must remain in Gallery.
       */
      if (activeCameraStream) {

        activeCameraStream
          .getTracks()
          .forEach(
            track => track.stop()
          );

        activeCameraStream =
          null;
      }


      openCamera();


      /*
       * openCamera() rebuilds the Camera DOM.
       * Render the existing pictures back
       * into the Gallery.
       */
      renderCameraGallery();

    }
  );

    }
  );

        /* =======================================================
     SEND CAMERA MEDIA
     ======================================================= */

  const sendButton =
    document.querySelector(
      "#cameraGallerySend"
    );


  sendButton?.addEventListener(
    "click",
    () => {

      sendCameraMediaMessage();

    }
  );



  /* -------------------------------------------------------
     BUTTON EVENTS
     ------------------------------------------------------- */

  closeButton?.addEventListener(
    "click",
    closeCamera
  );


  shutterButton?.addEventListener(
    "click",
    capturePhoto
  );


  galleryAdd?.addEventListener(
    "click",
    openPhoneGallery
  );


  galleryAddText?.addEventListener(
     "click",
     () => {

    if (!galleryTextWrap) {
      return;
    }

    galleryTextWrap.hidden =
      !galleryTextWrap.hidden;

    if (
      !galleryTextWrap.hidden &&
      galleryText
    ) {
      galleryText.focus();
    }

  }
);


  galleryInput?.addEventListener(
    "change",
    () => {

      addGalleryFiles(
        galleryInput.files
      );

      galleryInput.value = "";

    }
  );


  /* -------------------------------------------------------
     SWIPE-UP / TAP GALLERY TRAY
     ------------------------------------------------------- */

  let touchStartY = 0;


  galleryTray?.addEventListener(
    "touchstart",
    event => {

      touchStartY =
        event.touches[0]?.clientY || 0;

    },
    {
      passive: true
    }
  );


  galleryTray?.addEventListener(
    "touchend",
    event => {

      const touchEndY =
        event.changedTouches[0]?.clientY || 0;

      const distance =
        touchStartY -
        touchEndY;


      if (distance > 35) {
        openPhoneGallery();
      }

    },
    {
      passive: true
    }
  );


  /* -------------------------------------------------------
     OPEN PHONE CAMERA
     ------------------------------------------------------- */

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    openPhoneGallery();

    return;

  }


  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: {
          ideal: "environment"
        }
      },
      audio: false
    })
    .then(stream => {

      activeCameraStream =
        stream;

      video.srcObject =
        stream;

    })
    .catch(error => {

      console.warn(
        "SimpoChat camera access:",
        error
      );

      openPhoneGallery();

    });

}


/* ---------------------------------------------------------
   FILE PICKER
   --------------------------------------------------------- */

function openFilePicker() {

  const input =
    document.createElement(
      "input"
    );


  input.type =
    "file";


  input.addEventListener(
    "change",
    () => {

      const file =
        input.files?.[0];


      if (!file) {
        return;
      }


      alert(
        `${file.name} selected.`
      );

    }
  );


  input.click();
}


/* ---------------------------------------------------------
   REPORT FORM
   --------------------------------------------------------- */

function openReportForm() {

  modalRoot.innerHTML = `

    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            Report
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>


        <div class="form-note">

          The Tally report form will be embedded
          here when the reporting system is connected.

        </div>


        <div class="tally-placeholder">

          TALLY REPORT FORM

        </div>

      </div>

    </div>

  `;

}


/* ---------------------------------------------------------
   TEMPORARY CHAT MEMBER PICKER
   --------------------------------------------------------- */

function openTemporaryMemberPicker() {

  const group =
    getGroup(
      state.selectedGroup
    );


  if (!group) {
    return;
  }


  const members =
    group.members.filter(
      member =>
        member.id !==
        state.currentUser.id
    );


  modalRoot.innerHTML = `

    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            Temporary Chat
          </div>

          <button
            class="close-btn"
            data-close
          >
            ×
          </button>

        </div>


        <p class="form-note">
          Select a member to send a temporary
          chat invitation.
        </p>


        <div class="member-list">

          ${
            members.length
              ? members
                  .map(
                    member => `

                      <button
                        class="member-row"
                        data-member-id="${esc(
                          member.id
                        )}"
                      >

                        <span
                          class="member-avatar"
                          style="--h:${member.hue}"
                        >
                          ${esc(
                            member.avatar
                          )}
                        </span>

                        <span class="member-copy">

                          <strong>
                            ${esc(
                              member.name
                            )}
                          </strong>

                          <span>
                            Send invitation
                          </span>

                        </span>

                      </button>

                    `
                  )
                  .join("")
              : `
                <div class="empty">

                  <h3>
                    No other members
                  </h3>

                  <p>
                    There are no other members
                    available in this group.
                  </p>

                </div>
              `
          }

        </div>

      </div>

    </div>

  `;
}


/* ---------------------------------------------------------
   ACCEPT TEMPORARY CHAT INVITE
   --------------------------------------------------------- */

function acceptTemporaryChatInvite(
  inviteId
) {

  const invite =
    safeArray(
      state.temporaryInvites
    ).find(
      item =>
        item.id === inviteId &&
        item.to ===
          state.currentUser.id &&
        item.status ===
          "pending"
    );


  if (!invite) {
    return;
  }


  invite.status =
    "accepted";


  state.temporaryChats =
    safeArray(
      state.temporaryChats
    );


  const alreadyExists =
    state.temporaryChats.some(
      chat =>
        chat.memberId ===
          invite.from &&
        chat.status ===
          "active"
    );


  if (!alreadyExists) {

    state.temporaryChats.push({

      id:
        uid("temp-chat"),

      memberId:
        invite.from,

      groupId:
        invite.groupId || null,

      createdAt:
        now(),

      status:
        "active",

      messages:
        []

    });

  }


  state.temporaryChatTab =
    "messages";


  saveState();

  render();

}


/* ---------------------------------------------------------
   REJECT TEMPORARY CHAT INVITE
   --------------------------------------------------------- */

function rejectTemporaryChatInvite(
  inviteId
) {

  const invite =
    safeArray(
      state.temporaryInvites
    ).find(
      item =>
        item.id === inviteId &&
        item.to ===
          state.currentUser.id &&
        item.status ===
          "pending"
    );


  if (!invite) {
    return;
  }


  invite.status =
    "rejected";


  saveState();

  render();

}


/* ---------------------------------------------------------
   TEMPORARY CHAT INVITE
   --------------------------------------------------------- */

function sendTemporaryChatInvite(
   memberId,
   groupId
) {

  const member =
    findMemberAcrossGroups(
      memberId
    );


  if (!member) {
    return;
  }


  state.temporaryInvites =
    safeArray(
      state.temporaryInvites
    );


  state.temporaryInvites.push({
     
     id:
        uid("invite"),
     
     from:
        state.currentUser.id,
     
     to:
        member.id,
     
     groupId:
        groupId || null,
     
     createdAt:
        now(),
     
     status:
        "pending"
  
  });


  saveState();

  modalRoot.innerHTML = "";


  alert(
    `Temporary chat invitation sent to ${member.name}.`
  );
}


/* ---------------------------------------------------------
   CLEAN EXPIRED CONTENT
   --------------------------------------------------------- */

function cleanupExpired() {

  const cutoff =
    Date.now() -
    TWO_DAYS_MS;


  /*
   * Posts
   */

  state.posts =
    safeArray(
      state.posts
    ).filter(
      post =>
        Number(
          post.createdAt
        ) > cutoff
    );


  /*
   * Messages
   */

  Object.keys(
    state.messages || {}
  )
    .forEach(
      groupId => {

        state.messages[groupId] =
          safeArray(
            state.messages[groupId]
          ).filter(
            message =>
              Number(
                message.createdAt
              ) > cutoff
          );

      }
    );


  /*
   * Temporary invitations
   */

  state.temporaryInvites =
    safeArray(
      state.temporaryInvites
    ).filter(
      invite =>
        Number(
          invite.createdAt
        ) > cutoff
    );


  /*
   * Temporary chats
   */

  state.temporaryChats =
    safeArray(
      state.temporaryChats
    ).filter(
      chat =>
        Number(
          chat.createdAt
        ) > cutoff
    );


  saveState();
}


/* ---------------------------------------------------------
   POST CREATION BUTTON
   --------------------------------------------------------- */

function createPostButton() {

  openCreatePost();

}


/* ---------------------------------------------------------
   SELECTION HEADER
   --------------------------------------------------------- */

function renderSelectionHeader() {

  if (
    !state.selectionMode
  ) {
    return "";
  }


  return `

    <div class="selection-header">

      <button
        class="icon-btn"
        data-action="clear-selection"
      >
        ×
      </button>


      <strong>
        ${
          state.selectedItems.length
        }
        selected
      </strong>


      <button
        class="icon-btn"
        data-action="select-all"
      >
        All
      </button>


      <button
        class="icon-btn danger-icon"
        data-action="remove-selected"
      >
        Delete
      </button>

    </div>

  `;
}


/* ---------------------------------------------------------
   CONFIRM CALL ROUTE
   --------------------------------------------------------- */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-action='confirm-call']"
      );


    if (!button) {
      return;
    }


    confirmGroupCall(
      button.dataset.callType
    );

  }
);


/* ---------------------------------------------------------
   CHOOSE FILE ROUTE
   --------------------------------------------------------- */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-action='choose-file']"
      );


    if (!button) {
      return;
    }


    modalRoot.innerHTML = "";

    openFilePicker();

  }
);


/* ---------------------------------------------------------
   BOTTOM NAVIGATION
   --------------------------------------------------------- */

function bindNavigation() {

  document
    .querySelectorAll(
      "[data-nav]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const screenName =
            button.dataset.nav;


          state.screen =
            screenName;


          state.selectionMode =
            false;

          state.selectedItems =
            [];


          saveState();

          render();

        }
      );

    });

}


/* ---------------------------------------------------------
   HEADER SEARCH
   --------------------------------------------------------- */

function bindHeaderSearch() {

  document
    .querySelectorAll(
      "[data-action='search']"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.screen =
            "search";

          saveState();

          render();

        }
      );

    });

}


/* ---------------------------------------------------------
   APPLY THEME
   --------------------------------------------------------- */

function applyTheme() {

  const root =
    document.documentElement;


  let theme =
    state.theme || "system";


  if (
    theme === "system"
  ) {

    const dark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;


    root.dataset.theme =
      dark
        ? "dark"
        : "light";

  }

  else {

    root.dataset.theme =
      theme;

  }

}


/* ---------------------------------------------------------
   SYSTEM THEME CHANGE
   --------------------------------------------------------- */

if (
  window.matchMedia
) {

  const media =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    );


  media.addEventListener?.(
    "change",
    () => {

      if (
        state.theme ===
        "system"
      ) {

        applyTheme();

      }

    }
  );

}


/* ---------------------------------------------------------
   SIMPOCHAT ACCESS — NAME + EMAIL SETUP
   --------------------------------------------------------- */

function renderAccessSetup() {

  modalRoot.innerHTML = `

    <div class="simpo-access-screen">

      <div class="simpo-access-card">

        <div class="simpo-access-logo">
  <img
    src="icons/simpochat-icon-192.png"
    alt="SimpoChat"
  >
</div>

        <h1>
          Welcome to SimpoChat
        </h1>

        <p class="simpo-access-subtitle">
          Enter your name and email to continue.
        </p>


        <div
          id="simpoAccessMessage"
          class="simpo-access-message"
          hidden
        ></div>


        <form id="simpoAccessForm">

          <div class="field">

            <label for="simpoAccessName">
              Name
            </label>

            <input
              id="simpoAccessName"
              type="text"
              autocomplete="name"
              placeholder="Your name"
              required
            >

          </div>


          <div class="field">

            <label for="simpoAccessEmail">
              Email
            </label>

            <input
              id="simpoAccessEmail"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              required
            >

          </div>


          <button
            class="primary-btn simpo-access-continue"
            type="submit"
          >
            Continue
          </button>

        </form>

      </div>

    </div>

  `;


  const form =
    document.querySelector(
      "#simpoAccessForm"
    );


  if (!form) {
    return;
  }


  form.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const name =
      document
        .querySelector("#simpoAccessName")
        ?.value
        .trim();

    const email =
      document
        .querySelector("#simpoAccessEmail")
        ?.value
        .trim()
        .toLowerCase();

    const button =
      form.querySelector(
        ".simpo-access-continue"
      );

    if (!name || !email) {
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Checking...";
    }

    try {

      const response =
        await fetch(
          SIMPOCHAT_ACCESS_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              name,
              email
            })
          }
        );

      const data =
        await response.json();

      if (
  response.ok &&
  data.allowed === true
) {

  state.currentUser.id =
    data.user?.id || state.currentUser.id;

  state.currentUser.name =
    data.user?.name || name;

  state.currentUser.email =
    data.user?.email || email;

  localStorage.setItem(
    SESSION_TOKEN_KEY,
    data.session_token || ""
  );

  localStorage.setItem(
    "simpochat-session-expires-at-v1",
    data.session_expires_at || ""
  );

  saveState();

        localStorage.setItem(
          PROFILE_SETUP_KEY,
          "1"
        );

        modalRoot.innerHTML = "";

        render();

        return;
      }

            const message =
        data.message ||
        "Access denied.";

      const messageBox =
        document.querySelector(
          "#simpoAccessMessage"
        );

      if (messageBox) {
        messageBox.textContent = message;
        messageBox.hidden = false;
      }

    } catch (error) {

      console.error(
        "SimpoChat access check failed:",
        error
      );

       const messageBox =
        document.querySelector(
          "#simpoAccessMessage"
        );

      if (messageBox) {
        messageBox.textContent =
          "Unable to check access right now. Please try again.";

        messageBox.hidden = false;
      }
       
    } finally {

      if (button) {
        button.disabled = false;
        button.textContent = "Continue";
      }

    }

  }
);

}


/* ---------------------------------------------------------
   STARTUP
   --------------------------------------------------------- */

async function startSimpoChat() {

  cleanupExpired();

  applyTheme();

  bindNavigation();

  bindHeaderSearch();


  const profileSetupComplete =
    localStorage.getItem(
      PROFILE_SETUP_KEY
    ) === "1";


  const storedName =
    state.currentUser?.name
      ?.trim();

  const storedEmail =
    state.currentUser?.email
      ?.trim()
      .toLowerCase();


  if (
    !profileSetupComplete ||
    !storedName ||
    !storedEmail
  ) {

    localStorage.removeItem(
      PROFILE_SETUP_KEY
    );

    renderAccessSetup();

    return;

  }


  const name =
    state.currentUser?.name
      ?.trim();

  const email =
    state.currentUser?.email
      ?.trim()
      .toLowerCase();


  if (!name || !email) {

    localStorage.removeItem(
      PROFILE_SETUP_KEY
    );

    renderAccessSetup();

    return;

  }


  try {

const sessionToken =
  localStorage.getItem(
    SESSION_TOKEN_KEY
  );

const response =
  await fetch(
    SIMPOCHAT_ACCESS_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        ...(sessionToken
          ? {
              "Authorization":
                `Bearer ${sessionToken}`
            }
          : {})
      },

      body: JSON.stringify({
        name,
        email
      })
    }
  );


    const data =
      await response.json();


  if (
  response.ok &&
  data.allowed === true
) {

  state.currentUser.id =
    data.user?.id || state.currentUser.id;

  state.currentUser.name =
    data.user?.name || name;

  state.currentUser.email =
    data.user?.email || email;

  if (data.session_token) {
    localStorage.setItem(
      SESSION_TOKEN_KEY,
      data.session_token
    );
  }

  if (data.session_expires_at) {
    localStorage.setItem(
      "simpochat-session-expires-at-v1",
      data.session_expires_at
    );
  }

  saveState();

  render();

  return;

}


localStorage.removeItem(
  PROFILE_SETUP_KEY
);

localStorage.removeItem(
  SESSION_TOKEN_KEY
);

localStorage.removeItem(
  "simpochat-session-expires-at-v1"
);

modalRoot.innerHTML = "";

renderAccessSetup();

    const messageBox =
      document.querySelector(
        "#simpoAccessMessage"
      );

    if (messageBox) {
      messageBox.textContent =
        data.message ||
        "Access denied.";

      messageBox.hidden = false;
    }

    return;


  } catch (error) {

    console.error(
      "SimpoChat startup access check failed:",
      error
    );


    localStorage.removeItem(
      PROFILE_SETUP_KEY
    );

    modalRoot.innerHTML = "";

    renderAccessSetup();

    const messageBox =
      document.querySelector(
        "#simpoAccessMessage"
      );

    if (messageBox) {
      messageBox.textContent =
        "Unable to check access right now. Please try again.";

      messageBox.hidden = false;
    }

  }

}


/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startSimpoChat,
    {
      once: true
    }
  );

}

else {

  startSimpoChat();

}


/* =========================================================
   SIMPOCHAT — HOME MAIN MENU
   ========================================================= */

function openMainMenu() {

  modalRoot.innerHTML = `

    <div
      class="modal-backdrop"
      data-close
    >

      <div
        class="modal home-menu-modal"
        data-stop-close
      >

        <div class="modal-head">

          <div class="modal-title">
            SimpoChat
          </div>

          <button
            class="close-btn"
            data-close
            aria-label="Close"
          >
            ×
          </button>

        </div>


        <div class="menu-list">


          <!-- New Group -->

          <button
            class="menu-item"
            data-action="new-group"
          >

            <div class="menu-icon">
              +
            </div>

            <div>

              <strong>
                New group
              </strong>

              <span>
                Create a new group
              </span>

            </div>

          </button>


          <!-- Starred -->

          <button
            class="menu-item"
            data-action="starred"
          >

            <div class="menu-icon">
              ☆
            </div>

            <div>

              <strong>
                Starred
              </strong>

              <span>
                Favourite groups
              </span>

            </div>

          </button>


          <!-- Read All -->

          <button
            class="menu-item"
            data-action="read-all"
          >

            <div class="menu-icon">
              ✓
            </div>

            <div>

              <strong>
                Read all
              </strong>

              <span>
                Mark all unseen messages as read
              </span>

            </div>

          </button>


          <!-- Settings -->

          <button
            class="menu-item"
            data-action="settings"
          >

            <div class="menu-icon">
              ⚙
            </div>

            <div>

              <strong>
                Settings
              </strong>

              <span>
                Profile and appearance
              </span>

            </div>

          </button>


        </div>

      </div>

    </div>

  `;
}


/* =========================================================
   READ ALL UNSEEN MESSAGES
   ========================================================= */

function markAllAsRead() {

  state.unseen =
    state.unseen || {};


  Object.keys(
    state.unseen
  ).forEach(
    groupId => {

      state.unseen[groupId] =
        0;

    }
  );


  /*
   * Also support group objects that
   * store their unseen count directly.
   */

  safeArray(
    state.groups
  ).forEach(
    group => {

      group.unseen =
        0;

      group.unseenCount =
        0;

    }
  );


  saveState();

  modalRoot.innerHTML = "";

  render();

}


/* =========================================================
   READ-ALL ACTION
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-action='read-all']"
      );


    if (!button) {
      return;
    }


    markAllAsRead();

  }
);


/* =========================================================
   TEMPORARY CHAT — SWIPE CONTROLLER
   ========================================================= */

function scrollTemporaryChatTo(tab) {

  const swipe =
    document.querySelector(
      "#temporaryChatSwipe"
    );

  if (!swipe) {
    return;
  }

  const index =
    tab === "invites"
      ? 1
      : 0;

  swipe.scrollTo({
    left:
      index *
      swipe.clientWidth,
    behavior: "smooth"
  });

  updateTemporaryChatTabs(
    tab
  );
}


/* ---------------------------------------------------------
   UPDATE ACTIVE TAB
   --------------------------------------------------------- */

function updateTemporaryChatTabs(
  activeTab
) {

  document
    .querySelectorAll(
      ".temporary-chat-tab"
    )
    .forEach(button => {

      const isActive =
        (
          activeTab ===
          "messages" &&
          button.dataset.action ===
            "temporary-chat-messages"
        ) ||
        (
          activeTab ===
          "invites" &&
          button.dataset.action ===
            "temporary-chat-invites"
        );

      button.classList.toggle(
        "active",
        isActive
      );

    });
}


/* ---------------------------------------------------------
   WATCH HORIZONTAL SWIPING
   --------------------------------------------------------- */

function bindTemporaryChatSwipe() {

  const swipe =
    document.querySelector(
      "#temporaryChatSwipe"
    );

  if (!swipe) {
    return;
  }

  let ticking = false;

  swipe.addEventListener(
    "scroll",
    () => {

      if (ticking) {
        return;
      }

      ticking = true;

      requestAnimationFrame(() => {

        const width =
          swipe.clientWidth;

        if (!width) {
          ticking = false;
          return;
        }

        const index =
          Math.round(
            swipe.scrollLeft /
              width
          );

        const tab =
          index === 1
            ? "invites"
            : "messages";

        if (
          state.temporaryChatTab !==
          tab
        ) {

          state.temporaryChatTab =
            tab;

          updateTemporaryChatTabs(
            tab
          );

          saveState();
        }

        ticking = false;

      });

    },
    {
      passive: true
    }
  );

  const initialTab =
    state.temporaryChatTab ===
    "invites"
      ? "invites"
      : "messages";

  requestAnimationFrame(() => {

    swipe.scrollLeft =
      initialTab === "invites"
        ? swipe.clientWidth
        : 0;

    updateTemporaryChatTabs(
      initialTab
    );

  });
}
