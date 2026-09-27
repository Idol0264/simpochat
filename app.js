const state = {
  screen: "home",
  previousScreen: "home",

  theme: localStorage.getItem("simpochat-theme") || "system",

  selectedGroup: null,
  selectedMember: null,

  selectionMode: false,
  selectedItems: new Set(),

  groups: [
    {
      id: "creators",
      name: "Creators Hub",
      icon: "C",
      hue: 265,
      unseen: 4,
      category: ["Creative", "Community"],
      admin: true,
      members: [
        { id: "maya", name: "Maya", avatar: "M", hue: 315 },
        { id: "daniel", name: "Daniel", avatar: "D", hue: 205 },
        { id: "amina", name: "Amina", avatar: "A", hue: 145 },
        { id: "chris", name: "Chris", avatar: "C", hue: 42 }
      ]
    },
    {
      id: "business",
      name: "Business Network",
      icon: "B",
      hue: 200,
      unseen: 0,
      category: ["Business", "Opportunities"],
      admin: false,
      members: [
        { id: "john", name: "John", avatar: "J", hue: 190 },
        { id: "grace", name: "Grace", avatar: "G", hue: 320 },
        { id: "paul", name: "Paul", avatar: "P", hue: 40 }
      ]
    },
    {
      id: "tech",
      name: "Tech Builders",
      icon: "T",
      hue: 145,
      unseen: 12,
      category: ["Technology", "Education"],
      admin: true,
      members: [
        { id: "tolu", name: "Tolu", avatar: "T", hue: 145 },
        { id: "sam", name: "Sam", avatar: "S", hue: 230 },
        { id: "ruth", name: "Ruth", avatar: "R", hue: 285 }
      ]
    },
    {
      id: "design",
      name: "Design Circle",
      icon: "D",
      hue: 320,
      unseen: 2,
      category: ["Creative", "Community"],
      admin: false,
      members: [
        { id: "linda", name: "Linda", avatar: "L", hue: 300 },
        { id: "mark", name: "Mark", avatar: "M", hue: 170 }
      ]
    },
    {
      id: "opportunity",
      name: "Opportunity Room",
      icon: "O",
      hue: 42,
      unseen: 0,
      category: ["Opportunities", "Business"],
      admin: false,
      members: [
        { id: "victor", name: "Victor", avatar: "V", hue: 45 },
        { id: "emma", name: "Emma", avatar: "E", hue: 260 }
      ]
    }
  ],

  starred: new Set(["creators"]),
  archived: new Set(),

  messages: {
    creators: [
      {
        id: "m1",
        member: "maya",
        text: "Welcome everyone 👋",
        time: "18:02"
      },
      {
        id: "m2",
        member: "daniel",
        text: "Good to be here.",
        time: "18:05"
      },
      {
        id: "m3",
        member: "amina",
        text: "Let's build something great.",
        time: "18:08"
      }
    ],

    business: [
      {
        id: "m4",
        member: "john",
        text: "Welcome to the network.",
        time: "17:40"
      }
    ],

    tech: [
      {
        id: "m5",
        member: "tolu",
        text: "New project discussion starts here.",
        time: "16:31"
      },
      {
        id: "m6",
        member: "sam",
        text: "I have some ideas to share.",
        time: "16:38"
      }
    ],

    design: [],
    opportunity: []
  }
};

const $ = selector => document.querySelector(selector);

const screen = $("#screen");
const modalRoot = $("#modal-root");

let longPressTimer = null;
let longPressTriggered = false;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem("simpochat-theme", state.theme);
}

function getGroup(id) {
  return state.groups.find(group => group.id === id);
}

function getMember(group, id) {
  return group?.members.find(member => member.id === id);
}

function visibleGroups() {
  if (state.screen === "archived") {
    return state.groups.filter(group =>
      state.archived.has(group.id)
    );
  }

  if (state.screen === "starred") {
    return state.groups.filter(group =>
      state.starred.has(group.id) &&
      !state.archived.has(group.id)
    );
  }

  return state.groups.filter(group =>
    !state.archived.has(group.id)
  );
}

function setScreen(screenName) {
  state.previousScreen = state.screen;
  state.screen = screenName;
  state.selectionMode = false;
  state.selectedItems.clear();

  render();
}

function render() {
  applyTheme();

  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.screen === state.screen
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
}

function setHeader(title, subtitle = "") {
  $("#screenSubtitle").textContent = subtitle;

  const brand = document.querySelector(".brand-name");

  if (brand) {
    brand.textContent = title;
  }
}

function renderHome() {
  setHeader("SimpoChat", "Your groups");

  const groups = visibleGroups();

  screen.innerHTML = `
    <div class="section-head">
      <div>
        <div class="section-title">Groups</div>
        <div class="section-note">
          Groups you belong to
        </div>
      </div>
    </div>

    ${
      groups.length
        ? `<div class="group-list">
            ${groups.map(renderGroupCard).join("")}
           </div>`
        : renderEmptyGroups()
    }
  `;

  bindGroupCards();
}

function renderGroupCollection(type) {
  const groups = visibleGroups();

  setHeader(
    type === "starred" ? "Starred" : "Archived",
    `${groups.length} group${groups.length === 1 ? "" : "s"}`
  );

  screen.innerHTML = `
    <div class="section-head">
      <div>
        <div class="section-title">
          ${type === "starred" ? "Starred" : "Archived"}
        </div>

        <div class="section-note">
          ${type === "starred"
            ? "Groups you've marked as interesting"
            : "Groups you've archived"}
        </div>
      </div>
    </div>

    ${
      groups.length
        ? `<div class="group-list">
            ${groups.map(renderGroupCard).join("")}
           </div>`
        : renderEmptyGroups(type)
    }
  `;

  bindGroupCards();
}

function renderEmptyGroups(type = "home") {
  return `
    <div class="empty">
      <div class="empty-icon">
        ${type === "archived" ? "🗂️" : "⭐"}
      </div>

      <h3>
        ${
          type === "archived"
            ? "No archived groups"
            : type === "starred"
              ? "No starred groups"
              : "No groups yet"
        }
      </h3>

      <p>
        ${
          type === "home"
            ? "Create a group or search for an existing group to join."
            : "Your organized groups will appear here."
        }
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

function renderGroupCard(group) {
  const selected = state.selectedItems.has(group.id);

  return `
    <button
      class="group-card ${selected ? "selected-card" : ""}"
      data-group="${escapeHtml(group.id)}"
      data-longpress="${escapeHtml(group.id)}"
    >
      ${
        state.selectionMode
          ? `
            <span class="selection-check ${
              selected ? "checked" : ""
            }">
              ${selected ? "✓" : ""}
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
          ${group.category.join(" · ")}
        </span>
      </span>

      ${
        group.unseen
          ? `
            <span class="unseen">
              ${group.unseen > 99 ? "99+" : group.unseen}
            </span>
          `
          : ""
      }
    </button>
  `;
}

function bindGroupCards() {
  document
    .querySelectorAll("[data-longpress]")
    .forEach(card => {

      card.addEventListener("pointerdown", event => {
        if (state.selectionMode) return;

        longPressTriggered = false;

        longPressTimer = setTimeout(() => {
          longPressTriggered = true;

          const groupId = card.dataset.longpress;

          openGroupActions(groupId);
        }, 550);
      });

      card.addEventListener("pointerup", clearLongPress);
      card.addEventListener("pointerleave", clearLongPress);
      card.addEventListener("pointercancel", clearLongPress);

      card.addEventListener("click", event => {
        event.preventDefault();

        if (longPressTriggered) {
          longPressTriggered = false;
          return;
        }

        const groupId = card.dataset.group;

        if (state.selectionMode) {
          toggleSelected(groupId);
          return;
        }

        openGroup(groupId);
      });
    });
}

function clearLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function toggleSelected(groupId) {
  if (state.selectedItems.has(groupId)) {
    state.selectedItems.delete(groupId);
  } else {
    state.selectedItems.add(groupId);
  }

  renderSelectionMode();
}

function enterSelectionMode(groupId) {
  state.selectionMode = true;
  state.selectedItems.clear();
  state.selectedItems.add(groupId);

  renderSelectionMode();
}

function renderSelectionMode() {
  const groups = visibleGroups();

  setHeader(
    `${state.selectedItems.size} selected`,
    "Choose groups"
  );

  screen.innerHTML = `
    <div class="selection-toolbar">
      <button
        class="secondary-btn"
        data-action="select-all"
      >
        ${
          state.selectedItems.size === groups.length
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
      ${groups.map(renderGroupCard).join("")}
    </div>
  `;

  bindGroupCards();
}

function openGroupActions(groupId) {
  const group = getGroup(groupId);

  if (!group) return;

  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-close>
      <div class="modal">
        <div class="modal-head">
          <div>
            <div class="modal-title">
              ${escapeHtml(group.name)}
            </div>

            <div class="section-note">
              Group actions
            </div>
          </div>

          <button class="close-btn" data-close>
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
              ${state.starred.has(group.id) ? "★" : "☆"}
            </div>

            <div>
              <strong>
                ${
                  state.starred.has(group.id)
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
                  state.archived.has(group.id)
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

function openGroup(groupId) {
  const group = getGroup(groupId);

  if (!group) return;

  state.selectedGroup = groupId;
  group.unseen = 0;
  state.screen = "group-chat";

  render();
}

function renderGroupChat() {
  const group = getGroup(state.selectedGroup);

  if (!group) {
    setScreen("home");
    return;
  }

  const messages = state.messages[group.id] || [];

  setHeader(group.name, "Group chat");

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
            ${escapeHtml(group.icon)}
          </span>

          <span>
            <strong>
              ${escapeHtml(group.name)}
            </strong>

            <small>
              ${group.members.length} members
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
        <span>View Post</span>
        <span>›</span>
      </button>

      <div class="message-list">
        ${
          messages.length
            ? messages.map(message => renderMessage(group, message)).join("")
            : `
              <div class="empty chat-empty">
                <div class="empty-icon">💬</div>
                <h3>No messages yet</h3>
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
}

function renderMessage(group, message) {
  const member = getMember(group, message.member);

  if (!member) return "";

  return `
    <div class="message-row">

      <span
        class="member-avatar"
        style="--h:${member.hue}"
      >
        ${escapeHtml(member.avatar)}
      </span>

      <div class="message-content">

        <div class="message-name">
          ${escapeHtml(member.name)}
        </div>

        <div class="message-bubble">
          ${escapeHtml(message.text)}
        </div>

        <div class="message-time">
          ${escapeHtml(message.time)}
        </div>

      </div>

    </div>
  `;
}

function renderGroupProfile() {
  const group = getGroup(state.selectedGroup);

  if (!group) {
    setScreen("home");
    return;
  }

  setHeader(group.name, "Group profile");

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
          ${escapeHtml(group.icon)}
        </div>

        <h2>
          ${escapeHtml(group.name)}
        </h2>

        <p>
          ${group.members.length} members
        </p>

        <div class="chip-row">
          ${group.category
            .map(category => `
              <span class="chip">
                ${escapeHtml(category)}
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
            Long press a member for temporary chat options later.
          </div>
        </div>
      </div>

      <div class="member-list">
        ${
          group.members
            .map(member => `
              <button
                class="member-card"
                data-member="${member.id}"
              >

                <span
                  class="member-avatar"
                  style="--h:${member.hue}"
                >
                  ${escapeHtml(member.avatar)}
                </span>

                <span class="group-copy">
                  <span class="group-name">
                    ${escapeHtml(member.name)}
                  </span>

                  <span class="group-meta">
                    ${member.id === "maya" && group.admin
                      ? "Admin"
                      : "Member"}
                  </span>
                </span>

              </button>
            `)
            .join("")
        }
      </div>

    </div>
  `;
}

function renderPosts() {
  setHeader("Posts", "All groups");

  const posts = [
    ["Maya", "Creators Hub"],
    ["Daniel", "Business Network"],
    ["Amina", "Tech Builders"],
    ["Chris", "Design Circle"],
    ["Tolu", "Opportunity Room"],
    ["Grace", "Creators Hub"]
  ];

  screen.innerHTML = `
    <div class="section-head">
      <div>
        <div class="section-title">
          Posts
        </div>

        <div class="section-note">
          Posts from members of your groups
        </div>
      </div>
    </div>

    <div class="search-box">
      <svg viewBox="0 0 24 24">
        <circle cx="10.8" cy="10.8" r="6.7"/>
        <path d="m16 16 4.2 4.2"/>
      </svg>

      <input
        id="postSearch"
        placeholder="Search a person's post"
        aria-label="Search posts"
      >
    </div>

    <div class="post-filter-row">
      <button class="chip selected">
        All
      </button>

      ${
        state.groups
          .map(group => `
            <button
              class="chip"
              data-post-group="${group.id}"
            >
              ${escapeHtml(group.name)}
            </button>
          `)
          .join("")
      }
    </div>

    <div class="post-grid">

      ${
        posts.map((post, index) => `
          <button
            class="post-card"
            data-post="${escapeHtml(post[0])}"
          >

            <div class="post-media">

              ${
                index % 2 === 0
                  ? "▶"
                  : "▧"
              }

            </div>

            <div class="post-info">

              <strong>
                ${escapeHtml(post[0])}
              </strong>

              <span>
                ${escapeHtml(post[1])}
              </span>

            </div>

          </button>
        `).join("")
      }

    </div>

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
    .querySelectorAll("[data-post-group]")
    .forEach(button => {
      button.addEventListener("click", () => {

        document
          .querySelectorAll("[data-post-group]")
          .forEach(item =>
            item.classList.remove("selected")
          );

        button.classList.add("selected");
      });
    });
}

function renderSearch() {
  setHeader("Find Groups", "Search and request to join");

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
        <circle cx="10.8" cy="10.8" r="6.7"/>
        <path d="m16 16 4.2 4.2"/>
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
      ${state.groups.map(renderGroupCard).join("")}
    </div>
  `;

  $("#groupSearch").addEventListener("input", event => {

    const query =
      event.target.value
        .toLowerCase()
        .trim();

    const results =
      state.groups.filter(group =>
        group.name
          .toLowerCase()
          .includes(query)
      );

    $("#searchResults").innerHTML =
      results.length
        ? results.map(renderGroupCard).join("")
        : `
          <div class="empty">
            <h3>No groups found</h3>
            <p>
              Try another group name.
            </p>
          </div>
        `;

    bindGroupCards();
  });
}

function renderSettings() {
  setHeader("Settings", "Profile and appearance");

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
        style="--h:265"
      >
        M
      </span>

      <span class="group-copy">

        <span class="group-name">
          My profile
        </span>

        <span class="group-meta">
          Username · Email · Profile picture
        </span>

      </span>

      <span>›</span>
    </button>

    <div style="height:12px"></div>

    <div class="group-card" style="display:block">

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
              .map(theme => `
                <button
                  class="theme-option ${
                    state.theme === theme
                      ? "active"
                      : ""
                  }"
                  data-theme="${theme}"
                >
                  ${
                    theme[0].toUpperCase() +
                    theme.slice(1)
                  }
                </button>
              `)
              .join("")
          }

        </div>

      </div>

      <div class="setting-row">

        <div class="setting-copy">
          <strong>
            Ambient motion
          </strong>

          <p>
            Waving lights remain subtle behind the interface.
          </p>
        </div>

        <span style="color:var(--accent)">
          On
        </span>

      </div>

    </div>
  `;

  document
    .querySelectorAll("[data-theme]")
    .forEach(button => {

      button.addEventListener("click", () => {

        state.theme = button.dataset.theme;

        render();
      });

    });
}

function renderNewGroup() {
  setHeader("New Group", "Create a group");

  const categories = [
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
      >

    </div>

    <div class="field">

      <label>
        Categories
      </label>

      <div class="chip-row">

        ${
          categories.map(category => `
            <button
              class="chip"
              data-cat="${escapeHtml(category)}"
            >
              ${escapeHtml(category)}
            </button>
          `).join("")
        }

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
    .querySelectorAll("[data-cat]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const selected =
          document.querySelectorAll(
            "[data-cat].selected"
          );

        if (
          !button.classList.contains("selected") &&
          selected.length >= 3
        ) {
          return;
        }

        button.classList.toggle("selected");
      });

    });
}

function openChatMenu() {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-close>

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

function postModal(name = "Maya") {
  modalRoot.innerHTML = `
    <div
      class="modal-backdrop"
      data-close
    >

      <div class="modal">

        <div class="modal-head">

          <div class="modal-title">
            ${escapeHtml(name)}'s Post
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
          ▶
        </div>

        <div
          style="
            display:flex;
            gap:8px;
            margin-top:12px;
          "
        >
          <span class="chip">
            128 views
          </span>

          <span class="chip">
            ♡ 19
          </span>

          <span class="chip">
            Comments 6
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

function selectAllVisible() {
  visibleGroups().forEach(group => {
    state.selectedItems.add(group.id);
  });

  renderSelectionMode();
}

function unselectAllVisible() {
  visibleGroups().forEach(group => {
    state.selectedItems.delete(group.id);
  });

  renderSelectionMode();
}

function removeSelectedGroups() {
  if (!state.selectedItems.size) {
    return;
  }

  state.selectedItems.forEach(groupId => {
    state.archived.delete(groupId);
    state.starred.delete(groupId);
  });

  state.groups = state.groups.filter(
    group => !state.selectedItems.has(group.id)
  );

  state.selectedItems.clear();
  state.selectionMode = false;

  render();
}

function createGroup() {
  const input = $("#newGroupName");

  if (!input) return;

  const name = input.value.trim();

  const selectedCategories =
    [...document.querySelectorAll("[data-cat].selected")]
      .map(button => button.dataset.cat);

  if (!name) {
    alert("Enter a group name.");
    return;
  }

  if (!selectedCategories.length) {
    alert("Select at least one category.");
    return;
  }

  if (selectedCategories.length > 3) {
    alert("You can select a maximum of 3 categories.");
    return;
  }

  const id =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now();

  state.groups.unshift({
    id,
    name,
    icon: name.charAt(0).toUpperCase(),
    hue: Math.floor(Math.random() * 360),
    unseen: 0,
    category: selectedCategories,
    admin: true,
    members: []
  });

  state.messages[id] = [];

  state.selectedGroup = id;
  state.screen = "group-profile";

  render();
}

function sendMessage() {
  const input = $("#messageInput");

  if (!input) return;

  const text = input.value.trim();

  if (!text) return;

  const group = getGroup(state.selectedGroup);

  if (!group) return;

  if (!state.messages[group.id]) {
    state.messages[group.id] = [];
  }

  state.messages[group.id].push({
    id: "message-" + Date.now(),
    member: group.members[0]?.id || "",
    text,
    time: new Date().toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    )
  });

  renderGroupChat();
}

document.addEventListener("click", event => {

  if (event.target.closest("[data-close]")) {
    modalRoot.innerHTML = "";
    return;
  }

  const actionElement =
    event.target.closest("[data-action]");

  const action =
    actionElement?.dataset.action;

  if (action === "open-menu") {
    openMainMenu();
    return;
  }

  if (action === "open-posts") {
    setScreen("posts");
    return;
  }

  if (action === "open-search") {
    modalRoot.innerHTML = "";
    setScreen("search");
    return;
  }

  if (action === "join-group") {
    joinGroupModal();
    return;
  }

  if (action === "create-post") {
    alert(
      "Post creation will be connected next: record/select video or select a group of photos."
    );
    return;
  }

  if (action === "new-group") {
    setScreen("new-group");
    return;
  }

  if (action === "create-group") {
    createGroup();
    return;
  }

  if (action === "back") {
    setScreen(
      state.previousScreen === "group-chat" ||
      state.previousScreen === "group-profile"
        ? "home"
        : state.previousScreen
    );
    return;
  }

  if (action === "group-profile") {
    state.previousScreen = state.screen;
    state.screen = "group-profile";
    render();
    return;
  }

  if (action === "view-group-posts") {
    state.previousScreen = state.screen;
    state.screen = "posts";
    render();
    return;
  }

  if (action === "chat-menu") {
    openChatMenu();
    return;
  }

  if (action === "voice-call") {
    if (!getGroup(state.selectedGroup)?.admin) {
      alert("Only group admins can start group calls.");
      return;
    }

    alert(
      "Voice group call interface will be connected in the calls stage."
    );
    return;
  }

  if (action === "video-call") {
    if (!getGroup(state.selectedGroup)?.admin) {
      alert("Only group admins can start group calls.");
      return;
    }

    alert(
      "Video group call interface will be connected in the calls stage."
    );
    return;
  }

  if (action === "attachment") {
    alert("Attachments will be connected in the media stage.");
    return;
  }

  if (action === "camera") {
    alert("Camera will be connected in the media stage.");
    return;
  }

  if (action === "microphone") {
    alert("Voice messages will be connected in the media stage.");
    return;
  }

  if (action === "send-message") {
    sendMessage();
    return;
  }

  if (action === "select-all") {
    const groups = visibleGroups();

    if (state.selectedItems.size === groups.length) {
      unselectAllVisible();
    } else {
      selectAllVisible();
    }

    return;
  }

  if (action === "cancel-selection") {
    state.selectionMode = false;
    state.selectedItems.clear();
    render();
    return;
  }

  if (action === "remove-selected") {
    removeSelectedGroups();
    return;
  }

  if (action === "profile") {
    alert(
      "Profile editing will be connected in the profile stage."
    );
    return;
  }

  const nav =
    event.target.closest("[data-screen]");

  if (nav) {
    setScreen(nav.dataset.screen);
    return;
  }

  const post =
    event.target.closest("[data-post]");

  if (post) {
    postModal(post.dataset.post);
    return;
  }

  const groupAction =
    event.target.closest("[data-group-action]");

  if (groupAction) {

    const groupId =
      groupAction.dataset.groupId;

    const type =
      groupAction.dataset.groupAction;

    const group = getGroup(groupId);

    if (!group) return;

    modalRoot.innerHTML = "";

    if (type === "star") {

      if (state.starred.has(groupId)) {
        state.starred.delete(groupId);
      } else {
        state.starred.add(groupId);
      }

      render();
      return;
    }

    if (type === "archive") {

      if (state.archived.has(groupId)) {
        state.archived.delete(groupId);
      } else {
        state.archived.add(groupId);
      }

      render();
      return;
    }

    if (type === "select") {
      enterSelectionMode(groupId);
      return;
    }

    if (type === "open") {
      openGroup(groupId);
      return;
    }
  }

  const chatAction =
    event.target.closest("[data-chat-action]");

  if (chatAction) {

    const actionType =
      chatAction.dataset.chatAction;

    modalRoot.innerHTML = "";

    if (actionType === "leave") {

      const group =
        getGroup(state.selectedGroup);

      if (group) {
        state.groups =
          state.groups.filter(
            item => item.id !== group.id
          );

        state.starred.delete(group.id);
        state.archived.delete(group.id);
      }

      state.selectedGroup = null;
      state.screen = "home";

      render();
      return;
    }

    if (actionType === "report") {
      alert(
        "Report will use the Tally form when the reporting stage is connected."
      );
      return;
    }
  }

  const themeButton =
    event.target.closest("[data-theme]");

  if (themeButton) {
    state.theme = themeButton.dataset.theme;
    render();
  }
});

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

document.addEventListener("keydown", event => {

  if (
    event.key === "Enter" &&
    document.activeElement?.id === "messageInput"
  ) {
    sendMessage();
  }

  if (event.key === "Escape") {
    modalRoot.innerHTML = "";
  }
});

applyTheme();
render();
