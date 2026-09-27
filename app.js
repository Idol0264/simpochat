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

function openGroup(id) {

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
}


/* ---------------------------------------------------------
   NEW GROUP SCREEN
   --------------------------------------------------------- */

function renderNewGroup() {

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


      <div class="field">

        <label>
          Categories
        </label>

        <div
          class="theme-options"
          id="categoryPicker"
        >

          ${CATEGORIES
            .map(category => `

              <button
                type="button"
                class="theme-option"
                data-cat="${esc(category)}"
              >
                ${esc(category)}
              </button>

            `)
            .join("")}

        </div>

      </div>


      <div style="height:10px"></div>


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


    </form>

  `;


  /*
   * Category selection.
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
   * IMPORTANT:
   * Form submit is handled directly.
   * This makes Create Group reliable
   * on mobile.
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


  if (!name) {

    alert(
      "Enter a group name."
    );

    input.focus();

    return;
  }


  if (
    categories.length < 1
  ) {

    alert(
      "Select at least 1 category."
    );

    return;
  }


  if (
    categories.length > 3
  ) {

    alert(
      "Select no more than 3 categories."
    );

    return;
  }


  /*
   * Create the new group.
   */

  const id =
    uid("group");

  const user =
    state.currentUser;


  const group = {

    id,

    name,

    icon:
      name
        .charAt(0)
        .toUpperCase(),

    hue:
      randomHue(),

    category:
      categories,

    admin:
      true,

    unseen:
      0,

    members: [

      {
        id:
          user.id,

        name:
          user.name,

        avatar:
          user.avatar,

        hue:
          user.hue

      }

    ]

  };


  /*
   * Add group immediately.
   */

  state.groups.unshift(
    group
  );


  /*
   * Create empty message
   * storage for the group.
   */

  state.messages[id] =
    [];


  /*
   * New creator becomes
   * the selected group.
   */

  state.selectedGroup =
    id;

  state.previousScreen =
    "home";


  /*
   * Open the new group's
   * profile after creation.
   */

  state.screen =
    "group-profile";


  state.selectionMode =
    false;

  state.selectedItems =
    [];


  /*
   * THIS SAVE IS IMPORTANT.
   * Without it the new group
   * would disappear after refresh.
   */

  saveState();

  render();
}

/* =========================================================
   SIMPOCHAT — SECTION 3/5
   GROUP CHAT + GROUP PROFILE + MESSAGES + CHAT ACTIONS
   ========================================================= */

/* ---------------------------------------------------------
   GROUP CHAT
   --------------------------------------------------------- */

function renderGroupChat() {

  const group =
    getGroup(state.selectedGroup);

  if (!group) {

    state.screen = "home";

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
            class="group-avatar small"
            style="--h:${group.hue}"
          >
            ${esc(group.icon)}
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


        <input
          id="messageInput"
          type="text"
          autocomplete="off"
          placeholder="Message ${esc(group.name)}"
        >


        <button
          type="button"
          class="composer-btn"
          data-action="camera"
          aria-label="Camera"
        >
          ◉
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


  /*
   * Scroll to the newest message.
   */

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


  const sender =
    member || {
      name: "Member",
      avatar: "?",
      hue: 210
    };


  const own =
    message.member ===
    state.currentUser.id;


  return `

    <article
      class="
        message-row
        ${own ? "mine" : ""}
      "
    >

      ${
        own
          ? ""
          : `
            <span
              class="member-avatar"
              style="--h:${sender.hue}"
            >
              ${esc(sender.avatar)}
            </span>
          `
      }


      <div class="message-content">

        ${
          own
            ? ""
            : `
              <div class="message-author">
                ${esc(sender.name)}
              </div>
            `
        }


        <div class="message-bubble">

          ${
            message.type === "voice"
              ? `
                <div class="voice-message">
                  <span>🎙</span>
                  <span>
                    Voice message
                  </span>
                </div>
              `
              : esc(message.text)
          }

        </div>


        <div class="message-time">
          ${formatTime(message.createdAt)}
        </div>

      </div>

    </article>

  `;
}


/* ---------------------------------------------------------
   SEND MESSAGE
   --------------------------------------------------------- */

function sendMessage() {

  const input =
    $("#messageInput");

  const group =
    getGroup(state.selectedGroup);

  if (!input || !group) {
    return;
  }

  const text =
    input.value.trim();

  if (!text) {
    return;
  }


  if (!state.messages[group.id]) {

    state.messages[group.id] =
      [];

  }


  state.messages[group.id].push({

    id:
      uid("message"),

    member:
      state.currentUser.id,

    text,

    createdAt:
      now(),

    read:
      true

  });


  input.value = "";

  saveState();

  renderGroupChat();
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


        <div
          class="profile-avatar"
          style="--h:${group.hue}"
        >
          ${esc(group.icon)}
        </div>


        <h2>
          ${esc(group.name)}
        </h2>


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
