/* popup_a3f7k9.js | Groupie | Tab group manager popup logic and event handling. */

const STORE = 'groupie_v1';
const PALETTE = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899'];
const SUPPORT_URL = 'https://lorelabyrinth.entropicsystems.net/dogecoffee';

let state = { groups: [] };
let selectedColor = PALETTE[5];
let addMenuOpen = false;

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadState() {
  const r = await chrome.storage.local.get(STORE);
  state = r[STORE] || { groups: [] };
}

async function persist() {
  await chrome.storage.local.set({ [STORE]: state });
}

async function getActiveTab() {
  const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
  return t;
}

async function jumpToTab(url) {
  const all = await chrome.tabs.query({});
  const normalize = u => u.replace(/\/$/, '');
  const match = all.find(t => t.url && normalize(t.url) === normalize(url));
  if (match) {
    await chrome.tabs.update(match.id, { active: true });
    await chrome.windows.update(match.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url });
  }
  window.close();
}


function tabHTML(t, gid) {
  return `
    <div class="tab-row" data-url="${esc(t.url)}" title="${esc(t.url)}">
      <span class="favicon-placeholder">🔗</span>
      <span class="tab-title">${esc(t.title || t.url)}</span>
      <button class="btn-del-tab icon-btn" data-gid="${gid}" data-tid="${t.id}" title="Remove">✕</button>
    </div>`;
}

function groupHTML(g) {
  const inner = g.expanded
    ? (g.tabs.length
        ? g.tabs.map(t => tabHTML(t, g.id)).join('')
        : `<div class="no-tabs">No tabs yet — click "+ Add Tab" to add one.</div>`)
    : '';
  return `
    <div class="group ${g.expanded ? 'open' : ''}">
      <div class="group-header" data-gid="${g.id}">
        <span class="dot" style="background:${g.color}"></span>
        <span class="group-name">${esc(g.name)}</span>
        <span class="tab-count">${g.tabs.length}</span>
        <button class="btn-del-group icon-btn" data-gid="${g.id}" title="Delete group">✕</button>
        <span class="chevron">▸</span>
      </div>
      ${g.expanded ? `<div class="tab-list">${inner}</div>` : ''}
    </div>`;
}

function renderGroups() {
  const el = document.getElementById('groups');
  if (!state.groups.length) {
    el.innerHTML = `<div class="empty">No groups yet.<br>Hit <strong>+ New Group</strong> to get started.</div>`;
    return;
  }
  el.innerHTML = state.groups.map(g => groupHTML(g)).join('');

  el.querySelectorAll('.group-header').forEach(h => {
    h.addEventListener('click', e => {
      if (e.target.closest('.btn-del-group')) return;
      toggleExpand(h.dataset.gid);
    });
  });

  el.querySelectorAll('.btn-del-group').forEach(b => {
    b.addEventListener('click', () => deleteGroup(b.dataset.gid));
  });

  el.querySelectorAll('.tab-row').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.closest('.btn-del-tab')) return;
      jumpToTab(row.dataset.url);
    });
  });

  el.querySelectorAll('.btn-del-tab').forEach(b => {
    b.addEventListener('click', () => removeTab(b.dataset.gid, b.dataset.tid));
  });

  el.querySelectorAll('.favicon').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });
}

function renderAddMenu() {
  const menu = document.getElementById('add-menu');
  if (!state.groups.length) {
    menu.innerHTML = `<div class="menu-empty">Create a group first.</div>`;
    return;
  }
  menu.innerHTML = state.groups.map(g => `
    <div class="menu-item" data-gid="${g.id}">
      <span class="dot" style="background:${g.color}"></span>
      ${esc(g.name)}
    </div>`).join('');
  menu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => addCurrentTab(item.dataset.gid));
  });
}

function renderPalette() {
  const el = document.getElementById('palette');
  el.innerHTML = PALETTE.map(c => `
    <button class="swatch ${c === selectedColor ? 'active' : ''}" style="background:${c}" data-color="${c}"></button>`
  ).join('');
  el.querySelectorAll('.swatch').forEach(s => {
    s.addEventListener('click', () => {
      selectedColor = s.dataset.color;
      renderPalette();
    });
  });
}

async function toggleExpand(gid) {
  const g = state.groups.find(x => x.id === gid);
  if (g) g.expanded = !g.expanded;
  await persist();
  renderGroups();
}

async function deleteGroup(gid) {
  state.groups = state.groups.filter(g => g.id !== gid);
  await persist();
  renderGroups();
}

async function removeTab(gid, tid) {
  const g = state.groups.find(x => x.id === gid);
  if (g) g.tabs = g.tabs.filter(t => t.id !== tid);
  await persist();
  renderGroups();
}

async function addCurrentTab(gid) {
  const tab = await getActiveTab();
  const g = state.groups.find(x => x.id === gid);
  if (!g || !tab?.url) return;
  if (!g.tabs.find(t => t.url === tab.url)) {
    g.tabs.push({ id: uid(), url: tab.url, title: tab.title, addedAt: Date.now() });
    g.expanded = true;
  }
  await persist();
  closeAddMenu();
  renderGroups();
}

async function createGroup() {
  const nameEl = document.getElementById('new-name');
  const name = nameEl.value.trim();
  if (!name) { nameEl.focus(); return; }
  state.groups.push({ id: uid(), name, color: selectedColor, expanded: true, tabs: [] });
  await persist();
  nameEl.value = '';
  document.getElementById('new-group-panel').classList.add('hidden');
  renderGroups();
}

function closeAddMenu() {
  document.getElementById('add-menu').classList.add('hidden');
  addMenuOpen = false;
}

async function init() {
  await loadState();
  renderGroups();
  renderPalette();

  document.getElementById('btn-add-tab').addEventListener('click', () => {
    addMenuOpen = !addMenuOpen;
    document.getElementById('add-menu').classList.toggle('hidden', !addMenuOpen);
    if (addMenuOpen) renderAddMenu();
  });

  document.getElementById('btn-new-group').addEventListener('click', () => {
    document.getElementById('new-group-panel').classList.toggle('hidden');
    document.getElementById('new-name').focus();
  });

  document.getElementById('btn-create').addEventListener('click', createGroup);

  document.getElementById('new-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') createGroup();
    if (e.key === 'Escape') document.getElementById('new-group-panel').classList.add('hidden');
  });

  document.getElementById('btn-support').addEventListener('click', () => {
    chrome.tabs.create({ url: SUPPORT_URL });
    window.close();
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#btn-add-tab') && !e.target.closest('#add-menu')) {
      closeAddMenu();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
