const state = {
  screen: "home",

  theme:
    localStorage.getItem("simpochat-theme") ||
    "system",

  groups: [
    {
      name: "Creators Hub",
      icon: "C",
      hue: 265,
      unseen: 4
    },

    {
      name: "Business Network",
      icon: "B",
      hue: 200,
      unseen: 0
    },

    {
      name: "Tech Builders",
      icon: "T",
      hue: 145,
      unseen: 12
    },

    {
      name: "Design Circle",
      icon: "D",
      hue: 320,
      unseen: 2
    },

    {
      name: "Opportunity Room",
      icon: "O",
      hue: 42,
      unseen: 0
    }
  ],

  starred:
    new Set([
      "Creators Hub"
    ]),

  archived:
    new Set()
};


const $ = selector =>
  document.querySelector(selector);


const screen =
  document.querySelector("#screen");


const modalRoot =
  document.querySelector("#modal-root");


/* =========================
   SAFETY
========================= */

function escapeHtml(value) {

  return String(value).replace(
    /[&<>"']/g,

    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character])
  );
}


/* =========================
   THEME
========================= */

function applyTheme() {

  document.documentElement.dataset.theme =
    state.theme;

  localStorage.setItem(
    "simpochat-theme",
    state.theme
  );
}


/* =========================
   GROUP FILTER
========================= */

function visibleGroups() {

  if (state.screen === "archived") {

    return state.groups.filter(
      group =>
        state.archived.has(group.name)
    );
  }


  if (state.screen === "starred") {

    return state.groups.filter(
      group =>
        state.starred.has(group.name) &&
        !state.archived.has(group.name)
    );
  }


  return state.groups.filter(
    group =>
      !state.archived.has(group.name)
  );
}


/* =========================
   MAIN RENDER
========================= */

function render() {

  applyTheme();


  const title =
    state.screen === "home"
      ? "Your groups"
      : state.screen
          .charAt(0)
          .toUpperCase() +
        state.screen.slice(1);


  document.querySelector(
    "#screenSubtitle"
  ).textContent = title;


  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.screen ===
          state.screen
      );

    });


  if (
    state.screen === "posts"
  ) {

    return renderPosts();
  }


  if (
    state.screen === "search"
  ) {

    return renderSearch();
  }


  if (
    state.screen === "settings"
  ) {

    return renderSettings();
  }


  if (
    state.screen === "new-group"
  ) {

    return renderNewGroup();
  }


  const groups =
    visibleGroups();


  screen.innerHTML = `

    <div class="section-head">

      <div>

        <div class="section-title">
          ${escapeHtml(title)}
        </div>

        <div class="section-note">
          ${
            groups.length
              ? "Groups you belong to"
              : "Nothing here yet"
          }
        </div>

      </div>

    </div>


    ${
      groups.length

        ? `
          <div class="group-list">

            ${groups
              .map(groupCard)
              .join("")}

          </div>
        `

        : `

          <div class="empty">

            <div class="empty-icon">
              ${
                state.screen === "archived"
                  ? "🗂️"
                  : "⭐"
              }
            </div>

            <h3>
              ${
                state.screen === "archived"
                  ? "No archived groups"
                  : "No starred groups"
              }
            </h3>

            <p>
              Use the group actions
              to organize your
              SimpoChat space.
            </p>

            <button
              class="primary-btn"
              data-action="open-search"
            >
              Find groups
            </button>

          </div>

        `
    }

  `;
}


/* =========================
   GROUP CARD
========================= */

function groupCard(group) {

  return `

    <button
      class="group-card"
      data-group="${escapeHtml(group.name)}"
    >

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
          Group
        </span>

      </span>


      ${
        group.unseen

          ? `
            <span class="unseen">
              ${
                group.unseen > 99
                  ? "99+"
                  : group.unseen
              }
            </span>
          `

          : ""
      }

    </button>

  `;
}


/* =========================
   VIDEO CAMERA GRAPHIC
========================= */

function videoGraphicSvg() {

  return `

    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >

      <rect
        x="3.5"
        y="6.5"
        width="11.5"
        height="11"
        rx="2.5"
      />

      <path
        d="
          M15 10
          L20.5 7
          V17
          L15 14
        "
      />

    </svg>

  `;
}


/* =========================
   POSTS PAGE
========================= */

function renderPosts() {

  const posts = [
    "Maya",
    "Daniel",
    "Amina",
    "Chris",
    "Tolu",
    "Grace"
  ];


  screen.innerHTML = `

    <div class="section-head">

      <div>

        <div class="section-title">
          Posts
        </div>

        <div class="section-note">
          Video and photo posts
          from your groups ·
          2-day lifetime
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
        id="postSearch"
        placeholder="Search a person’s post"
        aria-label="Search posts"
      />

    </div>


    <div class="post-grid">

      ${
        posts
          .map(
            (person, index) => `

              <button
                class="post-card"
                data-post="${escapeHtml(person)}"
              >

                <div class="post-media">

                  ${videoGraphicSvg()}

                </div>


                <div class="post-info">

                  <strong>
                    ${escapeHtml(person)}
                  </strong>

                  <span>
                    ${
                      [
                        "Creators Hub",
                        "Business Network",
                        "Tech Builders"
                      ][index % 3]
                    }

                    ·

                    ${index + 1}h

                  </span>

                </div>

              </button>

            `
          )
          .join("")
      }

    </div>


    <!--
      IMPORTANT:
      This is now the VIDEO POST
      creation button, not a plus button.
    -->

    <button
      class="fab"
      data-action="create-post"
      aria-label="Create video post"
      title="Create video post"
    >

      ${videoGraphicSvg()}

    </button>

  `;
}


/* =========================
   FULL SCREEN POST
========================= */

function postViewer(
  name = "Maya"
) {

  screen.innerHTML = `

    <div
      class="post-viewer"
      aria-label="${escapeHtml(
        name
      )}'s full-screen post"
    >


      <!-- CLOSE -->

      <button
        class="post-viewer-close"
        data-action="close-post"
        aria-label="Close post"
        title="Close post"
      >
        ×
      </button>


      <!-- POST MEDIA -->

      <div class="post-viewer-media">

        <div class="viewer-play">

          ${videoGraphicSvg()}

        </div>

      </div>


      <!-- POST INFORMATION -->

      <div class="post-viewer-info">

        <div class="post-viewer-person">

          <div class="post-viewer-avatar">

            ${escapeHtml(
              name.charAt(0)
            )}

          </div>


          <div class="post-viewer-copy">

            <strong>
              ${escapeHtml(name)}
            </strong>

            <span>
              Creators Hub
              ·
              posted 1h ago
            </span>

          </div>

        </div>


        <div class="post-viewer-stats">

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

      </div>

    </div>

  `;
}


/* =========================
   GROUP SEARCH
========================= */

function renderSearch() {

  screen.innerHTML = `

    <div class="section-head">

      <div>

        <div class="section-title">
          Find groups
        </div>

        <div class="section-note">
          Search existing groups
          and request to join.
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
      />

    </div>


    <div
      id="searchResults"
      class="group-list"
    >

      ${
        state.groups
          .map(groupCard)
          .join("")
      }

    </div>

  `;


  $("#groupSearch")
    .addEventListener(
      "input",
      event => {

        const query =
          event.target.value
            .toLowerCase();


        const results =
          state.groups.filter(
            group =>
              group.name
                .toLowerCase()
                .includes(query)
          );


        $("#searchResults")
          .innerHTML =

          results.length

            ? results
                .map(groupCard)
                .join("")

            : `

              <div class="empty">

                <h3>
                  No groups found
                </h3>

                <p>
                  Try another
                  group name.
                </p>

              </div>

            `;

      }
    );
}


/* =========================
   SETTINGS
========================= */

function renderSettings() {

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


    <div class="group-card">

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
          Username · Email ·
          Profile picture
        </span>

      </span>


      <span>
        ›
      </span>

    </div>


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
            Follow the phone
            or choose light/dark.
          </p>

        </div>


        <div class="theme-options">

          ${
            [
              "system",
              "light",
              "dark"
            ]
              .map(
                theme => `

                  <button
                    class="
                      theme-option
                      ${
                        state.theme === theme
                          ? "active"
                          : ""
                      }
                    "
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
            Motion
          </strong>

          <p>
            Waving ambient lights
            stay subtle.
          </p>

        </div>

        <span
          style="color:var(--accent)"
        >
          On
        </span>

      </div>

    </div>


    <div class="tally-shell">

      <strong style="font-size:13px">
        Tally-ready visual surface
      </strong>

      <div class="tally-note">

        Future Tally forms will
        sit inside this same
        rounded glassy surface.

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

          render();

        }
      );

    });
}


/* =========================
   NEW GROUP
========================= */

function renderNewGroup() {

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
          Choose up to 3
          SimpoChat categories.
        </div>

      </div>

    </div>


    <div class="field">

      <label>
        Group name
      </label>

      <input
        placeholder="Enter group name"
      />

    </div>


    <div class="field">

      <label>
        Categories
      </label>


      <div class="chip-row">

        ${
          categories
            .map(
              category => `

                <button
                  class="chip"
                  data-cat="${category}"
                >
                  ${category}
                </button>

              `
            )
            .join("")
        }

      </div>

    </div>


    <button
      class="primary-btn"
      data-action="create-group"
    >
      Create group
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
            [
              ...document
                .querySelectorAll(
                  "[data-cat].selected"
                )
            ];


          if (
            !button.classList.contains(
              "selected"
            ) &&
            selected.length >= 3
          ) {

            return;

          }


          button.classList.toggle(
            "selected"
          );

        }
      );

    });
}


/* =========================
   MAIN MENU
========================= */

function openMenu() {

  modalRoot.innerHTML = `

    <div
      class="modal-backdrop"
      data-close
    >

      <div
        class="modal"
        role="dialog"
        aria-modal="true"
      >

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
            data-menu="new-group"
          >

            <div class="menu-icon">
              ＋
            </div>

            <div>

              <strong>
                New Group
              </strong>

              <span>
                Create a group and
                choose up to 3
                categories.
              </span>

            </div>

          </button>


          <button
            class="menu-item"
            data-menu="starred"
          >

            <div class="menu-icon">
              ★
            </div>

            <div>

              <strong>
                Starred
              </strong>

              <span>
                View groups you
                marked as favourites.
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
                Mark visible group
                messages as seen.
              </span>

            </div>

          </button>


          <button
            class="menu-item"
            data-menu="settings"
          >

            <div class="menu-icon">
              ⚙
            </div>

            <div>

              <strong>
                Settings
              </strong>

              <span>
                Edit profile and
                appearance.
              </span>

            </div>

          </button>

        </div>

      </div>

    </div>

  `;
}


/* =========================
   GLOBAL CLICK HANDLER
========================= */

document.addEventListener(
  "click",
  event => {

    /* CLOSE MODALS */

    const close =
      event.target.closest(
        "[data-close]"
      );


    if (close) {

      modalRoot.innerHTML = "";

      return;

    }


    /* ACTION */

    const actionButton =
      event.target.closest(
        "[data-action]"
      );


    const action =
      actionButton?.dataset.action;


    if (
      action === "open-menu"
    ) {

      return openMenu();

    }


    if (
      action === "open-posts"
    ) {

      state.screen = "posts";

      return render();

    }


    if (
      action === "open-search" ||
      action === "join-group"
    ) {

      state.screen = "search";

      modalRoot.innerHTML = "";

      return render();

    }


    /* VIDEO POST CREATION */

    if (
      action === "create-post"
    ) {

      alert(
        "Post creator placeholder — " +
        "video selection will be " +
        "connected in the next build step."
      );

      return;

    }


    /* CLOSE FULL POST */

    if (
      action === "close-post"
    ) {

      state.screen = "posts";

      return render();

    }


    /* NEW GROUP */

    if (
      action === "new-group"
    ) {

      state.screen = "new-group";

      modalRoot.innerHTML = "";

      return render();

    }


    if (
      action === "create-group"
    ) {

      alert(
        "Group creation will be connected " +
        "after the visual shell."
      );

      return;

    }


    /* MENU ACTION */

    const menuButton =
      event.target.closest(
        "[data-menu]"
      );


    const menu =
      menuButton?.dataset.menu;


    if (
      menu === "new-group"
    ) {

      state.screen = "new-group";

      modalRoot.innerHTML = "";

      return render();

    }


    if (
      menu === "starred"
    ) {

      state.screen = "starred";

      modalRoot.innerHTML = "";

      return render();

    }


    if (
      menu === "settings"
    ) {

      state.screen = "settings";

      modalRoot.innerHTML = "";

      return render();

    }


    if (
      menu === "read-all"
    ) {

      state.groups.forEach(
        group => {
          group.unseen = 0;
        }
      );

      modalRoot.innerHTML = "";

      return render();

    }


    /* BOTTOM NAV */

    const nav =
      event.target.closest(
        "[data-screen]"
      );


    if (nav) {

      state.screen =
        nav.dataset.screen;

      return render();

    }


    /* GROUP */

    const groupButton =
      event.target.closest(
        "[data-group]"
      );


    if (groupButton) {

      const group =
        state.groups.find(
          item =>
            item.name ===
            groupButton.dataset.group
        );


      if (!group) {
        return;
      }


      group.unseen = 0;


      alert(
        `${group.name}\n\n` +
        "Group chat screen will " +
        "be connected in the next build step."
      );


      return render();

    }


    /* POST */

    const postButton =
      event.target.closest(
        "[data-post]"
      );


    if (postButton) {

      return postViewer(
        postButton.dataset.post
      );

    }

  }
);


/* =========================
   START
========================= */

applyTheme();

render();
