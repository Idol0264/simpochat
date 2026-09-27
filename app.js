const state = {
  screen: "home",
  theme: localStorage.getItem("simpochat-theme") || "system",
  groups: [
    {name:"Creators Hub", icon:"C", hue:265, unseen:4},
    {name:"Business Network", icon:"B", hue:200, unseen:0},
    {name:"Tech Builders", icon:"T", hue:145, unseen:12},
    {name:"Design Circle", icon:"D", hue:320, unseen:2},
    {name:"Opportunity Room", icon:"O", hue:42, unseen:0}
  ],
  starred: new Set(["Creators Hub"]),
  archived: new Set()
};

const $ = s => document.querySelector(s);
const screen = $("#screen");
const modalRoot = $("#modal-root");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem("simpochat-theme", state.theme);
}

function visibleGroups() {
  if (state.screen === "archived") return state.groups.filter(g => state.archived.has(g.name));
  if (state.screen === "starred") return state.groups.filter(g => state.starred.has(g.name) && !state.archived.has(g.name));
  return state.groups.filter(g => !state.archived.has(g.name));
}

function render() {
  applyTheme();
  const title = state.screen === "home" ? "Your groups" : state.screen[0].toUpperCase()+state.screen.slice(1);
  $("#screenSubtitle").textContent = title;
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.screen === state.screen));

  if (state.screen === "posts") return renderPosts();
  if (state.screen === "search") return renderSearch();
  if (state.screen === "settings") return renderSettings();
  if (state.screen === "new-group") return renderNewGroup();

  const groups = visibleGroups();
  screen.innerHTML = `
    <div class="section-head">
      <div>
        <div class="section-title">${escapeHtml(title)}</div>
        <div class="section-note">${groups.length ? "Groups you belong to" : "Nothing here yet"}</div>
      </div>
    </div>
    ${groups.length ? `<div class="group-list">${groups.map(groupCard).join("")}</div>` : `
      <div class="empty">
        <div class="empty-icon">${state.screen === "archived" ? "🗂️" : "⭐"}</div>
        <h3>${state.screen === "archived" ? "No archived groups" : "No starred groups"}</h3>
        <p>Use the group actions to organize your SimpoChat space.</p>
        <button class="primary-btn" data-action="open-search">Find groups</button>
      </div>`}
  `;
}

function groupCard(g) {
  return `<button class="group-card" data-group="${escapeHtml(g.name)}">
    <span class="group-avatar" style="--h:${g.hue}">${escapeHtml(g.icon)}</span>
    <span class="group-copy">
      <span class="group-name">${escapeHtml(g.name)}</span>
      <span class="group-meta">Group</span>
    </span>
    ${g.unseen ? `<span class="unseen">${g.unseen > 99 ? "99+" : g.unseen}</span>` : ""}
  </button>`;
}

function renderPosts() {
  const posts = ["Maya","Daniel","Amina","Chris","Tolu","Grace"];
  screen.innerHTML = `
    <div class="section-head"><div><div class="section-title">Posts</div><div class="section-note">Video and photo posts from your groups · 2-day lifetime</div></div></div>
    <div class="search-box">
      <svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 4.2 4.2"/></svg>
      <input id="postSearch" placeholder="Search a person’s post" aria-label="Search posts">
    </div>
    <div class="post-grid">${posts.map((p,i)=>`
      <button class="post-card" data-post="${p}">
        <div class="post-media">${i === 1 ? "▧" : "▶"}</div>
        <div class="post-info"><strong>${p}</strong><span>${["Creators Hub","Business Network","Tech Builders"][i%3]} · ${i+1}h</span></div>
      </button>`).join("")}</div>
    <button class="fab" data-action="create-post" aria-label="Create post" title="Create post">
      <svg viewBox="0 0 24 24"><path d="M7 5h10v14H7z"/><path d="m10 9 5 3-5 3z"/></svg>
    </button>`;
}

function renderSearch() {
  screen.innerHTML = `
    <div class="section-head"><div><div class="section-title">Find groups</div><div class="section-note">Search existing groups and request to join.</div></div></div>
    <div class="search-box"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 4.2 4.2"/></svg><input id="groupSearch" autofocus placeholder="Search groups"></div>
    <div id="searchResults" class="group-list">${state.groups.map(g=>groupCard(g)).join("")}</div>`;
  $("#groupSearch").addEventListener("input", e => {
    const q=e.target.value.toLowerCase();
    $("#searchResults").innerHTML=state.groups.filter(g=>g.name.toLowerCase().includes(q)).map(groupCard).join("") || `<div class="empty"><h3>No groups found</h3><p>Try another group name.</p></div>`;
  });
}

function renderSettings() {
  screen.innerHTML = `
    <div class="section-head"><div><div class="section-title">Settings</div><div class="section-note">Profile and appearance</div></div></div>
    <div class="group-card">
      <span class="group-avatar" style="--h:265">M</span><span class="group-copy"><span class="group-name">My profile</span><span class="group-meta">Username · Email · Profile picture</span></span>
      <span>›</span>
    </div>
    <div style="height:12px"></div>
    <div class="group-card" style="display:block">
      <div class="setting-row"><div class="setting-copy"><strong>Theme</strong><p>Follow the phone or choose light/dark.</p></div>
        <div class="theme-options">
          ${["system","light","dark"].map(t=>`<button class="theme-option ${state.theme===t?"active":""}" data-theme="${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join("")}
        </div>
      </div>
      <div class="setting-row"><div class="setting-copy"><strong>Motion</strong><p>Waving ambient lights are designed to stay subtle.</p></div><span style="color:var(--accent)">On</span></div>
    </div>
    <div class="tally-shell">
      <strong style="font-size:13px">Tally-ready visual surface</strong>
      <div class="tally-note">Future Tally forms will sit inside this same rounded, glassy container so the embedded form can visually blend with SimpoChat rather than looking like a separate page.</div>
    </div>`;
  document.querySelectorAll("[data-theme]").forEach(b=>b.addEventListener("click",()=>{state.theme=b.dataset.theme;render()}));
}

function renderNewGroup() {
  const cats=["Business","Technology","Creative","Education","Community","Entertainment","Investment","Sports","Opportunities","Other"];
  screen.innerHTML = `
    <div class="section-head"><div><div class="section-title">New Group</div><div class="section-note">Choose up to 3 SimpoChat categories.</div></div></div>
    <div class="field"><label>Group name</label><input placeholder="Enter group name"></div>
    <div class="field"><label>Categories</label><div class="chip-row">${cats.map(c=>`<button class="chip" data-cat="${c}">${c}</button>`).join("")}</div></div>
    <button class="primary-btn" data-action="create-group">Create group</button>`;
  document.querySelectorAll("[data-cat]").forEach(b=>b.addEventListener("click",()=>{
    const selected=[...document.querySelectorAll("[data-cat].selected")];
    if(!b.classList.contains("selected") && selected.length>=3) return;
    b.classList.toggle("selected");
  }));
}

function openMenu() {
  modalRoot.innerHTML = `<div class="modal-backdrop" data-close>
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head"><div class="modal-title">SimpoChat</div><button class="close-btn" data-close>×</button></div>
      <div class="menu-list">
        <button class="menu-item" data-menu="new-group"><div class="menu-icon">＋</div><div><strong>New Group</strong><span>Create a group and choose up to 3 categories.</span></div></button>
        <button class="menu-item" data-menu="starred"><div class="menu-icon">★</div><div><strong>Starred</strong><span>View groups you marked as favourites.</span></div></button>
        <button class="menu-item" data-menu="read-all"><div class="menu-icon">✓</div><div><strong>Read All</strong><span>Mark visible group messages as seen.</span></div></button>
        <button class="menu-item" data-menu="settings"><div class="menu-icon">⚙</div><div><strong>Settings</strong><span>Edit profile and appearance.</span></div></button>
      </div>
    </div></div>`;
}

function joinGroupModal() {
  modalRoot.innerHTML = `<div class="modal-backdrop" data-close><div class="modal">
    <div class="modal-head"><div class="modal-title">Find a group</div><button class="close-btn" data-close>×</button></div>
    <p style="color:var(--muted);font-size:13px;line-height:1.5">Search existing groups and request to join them.</p>
    <div class="search-box"><input autofocus placeholder="Group name or category"><span>⌕</span></div>
    <button class="primary-btn" data-action="open-search">Open group search</button>
  </div></div>`;
}

function postModal(name="Maya") {
  modalRoot.innerHTML = `
    <div class="post-view-backdrop" data-close>
      <div class="post-view" role="dialog" aria-modal="true">

        <button
          class="post-view-close"
          data-close
          aria-label="Close post"
          title="Close post"
        >×</button>

        <div class="post-view-media">
          <div class="post-placeholder-icon">
            ▶
          </div>
        </div>

        <div class="post-view-info">

          <div class="post-view-user">
            <div class="post-view-avatar">
              ${escapeHtml(name.charAt(0).toUpperCase())}
            </div>

            <div class="post-view-user-copy">
              <div class="post-view-user-name">
                ${escapeHtml(name)}
              </div>

              <div class="post-view-group">
                Posted from Creators Hub
              </div>
            </div>
          </div>

          <div class="post-view-stats">
            <span class="chip">128 views</span>
            <span class="chip">♡ 19 reactions</span>
            <span class="chip">Comments 6</span>
          </div>

        </div>

      </div>
    </div>
  `;
}

document.addEventListener("click", e => {
  const close = e.target.closest("[data-close]");
  if (close) { modalRoot.innerHTML=""; return; }

  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "open-menu") return openMenu();
  if (action === "open-posts") { state.screen="posts"; return render(); }
  if (action === "open-search" || action === "join-group") { state.screen="search"; modalRoot.innerHTML=""; return render(); }
  if (action === "create-post") return alert("Post creator placeholder — video/photo selection will be connected in the next build step.");
  if (action === "new-group") { state.screen="new-group"; modalRoot.innerHTML=""; return render(); }
  if (action === "create-group") { alert("Group creation will be connected after the visual shell."); return; }

  const menu = e.target.closest("[data-menu]")?.dataset.menu;
  if (menu === "new-group") { state.screen="new-group"; modalRoot.innerHTML=""; render(); }
  if (menu === "starred") { state.screen="starred"; modalRoot.innerHTML=""; render(); }
  if (menu === "settings") { state.screen="settings"; modalRoot.innerHTML=""; render(); }
  if (menu === "read-all") { state.groups.forEach(g=>g.unseen=0); modalRoot.innerHTML=""; render(); }

  const nav = e.target.closest("[data-screen]");
  if (nav) { state.screen=nav.dataset.screen; render(); }

  const group = e.target.closest("[data-group]");
  if (group) {
    const g = state.groups.find(x=>x.name===group.dataset.group);
    if (!g) return;
    g.unseen=0;
    if (e.detail === 0) return;
    alert(`${g.name}\n\nGroup chat screen will be connected in the next build step.`);
    render();
  }

  const post = e.target.closest("[data-post]");
  if (post) postModal(post.dataset.post);
});

applyTheme();
render();
