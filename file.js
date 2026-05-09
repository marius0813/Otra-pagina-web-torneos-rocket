// ===================================================
// CONFIGURACIÓN — CAMBIA ESTO ANTES DE PUBLICAR
// ===================================================
const EDITORS = [
  { user: "admin",   pass: "tuPassword1" },   // ← TÚ
  { user: "editor2", pass: "tuPassword2" }    // ← SEGUNDA PERSONA
];
// ===================================================

// -------- STATE --------
let isEditor = false;
let data = loadData();

function loadData() {
  const saved = localStorage.getItem("rlhub_data");
  if (saved) return JSON.parse(saved);
  return { players: [], tournaments: [], matches: [] };
}

function saveData() {
  localStorage.setItem("rlhub_data", JSON.stringify(data));
}

// -------- AUTH --------
function openLogin() { document.getElementById("loginModal").classList.remove("hidden"); }
function closeLogin() {
  document.getElementById("loginModal").classList.add("hidden");
  document.getElementById("loginError").classList.add("hidden");
}

function doLogin() {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value;
  const ok = EDITORS.some(e => e.user === u && e.pass === p);
  if (ok) {
    isEditor = true;
    document.getElementById("loginBtn").classList.add("hidden");
    document.getElementById("logoutBtn").classList.remove("hidden");
    document.getElementById("editorBadge").classList.remove("hidden");
    document.querySelectorAll(".editor-only").forEach(el => el.classList.remove("hidden"));
    document.querySelectorAll(".card-actions").forEach(el => el.classList.remove("hidden"));
    closeLogin();
    renderAll();
  } else {
    document.getElementById("loginError").classList.remove("hidden");
  }
}

function doLogout() {
  isEditor = false;
  document.getElementById("loginBtn").classList.remove("hidden");
  document.getElementById("logoutBtn").classList.add("hidden");
  document.getElementById("editorBadge").classList.add("hidden");
  document.querySelectorAll(".editor-only").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".card-actions").forEach(el => el.classList.add("hidden"));
  renderAll();
}

// -------- TABS --------
function showTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  const btns = document.querySelectorAll(".nav-btn");
  const names = ["stats","players","tournaments","matches"];
  btns[names.indexOf(name)]?.classList.add("active");
  if (name === "stats") renderStats();
  if (name === "players") renderPlayers();
  if (name === "tournaments") renderTournaments();
  if (name === "matches") renderMatches();
}

// -------- PLAYERS --------
function openPlayerForm(id = null) {
  document.getElementById("playerForm").classList.remove("hidden");
  document.getElementById("editPlayerId").value = id || "";
  if (id) {
    const p = data.players.find(x => x.id === id);
    document.getElementById("playerFormTitle").textContent = "Editar Jugador";
    document.getElementById("pName").value = p.name;
    document.getElementById("pPlatform").value = p.platform;
    document.getElementById("pRank").value = p.rank;
    document.getElementById("pTeam").value = p.team;
    document.getElementById("pTracker").value = p.tracker;
    document.getElementById("pNotes").value = p.notes;
  } else {
    document.getElementById("playerFormTitle").textContent = "Nuevo Jugador";
    ["pName","pTeam","pTracker","pNotes"].forEach(f => document.getElementById(f).value = "");
  }
}

function closePlayerForm() { document.getElementById("playerForm").classList.add("hidden"); }

function savePlayer() {
  const id = document.getElementById("editPlayerId").value;
  const player = {
    id: id || Date.now().toString(),
    name: document.getElementById("pName").value.trim(),
    platform: document.getElementById("pPlatform").value,
    rank: document.getElementById("pRank").value,
    team: document.getElementById("pTeam").value.trim(),
    tracker: document.getElementById("pTracker").value.trim(),
    notes: document.getElementById("pNotes").value.trim(),
    wins: id ? data.players.find(x => x.id === id)?.wins || 0 : 0,
    losses: id ? data.players.find(x => x.id === id)?.losses || 0 : 0,
  };
  if (!player.name) return alert("El nombre es obligatorio.");
  if (id) {
    const idx = data.players.findIndex(x => x.id === id);
    data.players[idx] = player;
  } else {
    data.players.push(player);
  }
  saveData();
  closePlayerForm();
  renderPlayers();
  renderStats();
}

function deletePlayer(id) {
  if (!confirm("¿Borrar este jugador?")) return;
  data.players = data.players.filter(x => x.id !== id);
  saveData();
  renderPlayers();
  renderStats();
}

function renderPlayers() {
  const container = document.getElementById("playersList");
  if (!data.players.length) {
    container.innerHTML = '<p class="empty-state">No hay jugadores registrados.</p>';
    return;
  }
  container.innerHTML = data.players.map(p => {
    const rankClass = "rank-" + p.rank.replace(/\s/g,"_").replace(/_/g," ");
    const wr = (p.wins + p.losses) > 0
      ? Math.round(p.wins / (p.wins + p.losses) * 100) : 0;
    const actions = isEditor ? `
      <div class="card-actions">
        <button class="btn-icon edit" onclick="openPlayerForm('${p.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon" onclick="deletePlayer('${p.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>` : `<div class="card-actions hidden"></div>`;
    return `
    <div class="player-card">
      ${actions}
      <div class="player-name">${p.name}</div>
      <span class="rank-badge rank-${p.rank}">${p.rank}</span>
      <div class="player-meta"><i class="fa-solid fa-desktop"></i> ${p.platform}</div>
      ${p.team ? `<div class="player-meta"><i class="fa-solid fa-shield"></i> ${p.team}</div>` : ""}
      <div class="player-meta"><i class="fa-solid fa-trophy"></i> ${p.wins}W / ${p.losses}L · ${wr}% WR</div>
      ${p.notes ? `<div class="player-meta" style="margin-top:.4rem;font-style:italic;">${p.notes}</div>` : ""}
      ${p.tracker ? `<a class="tracker-link" href="${p.tracker}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> RL Tracker</a>` : ""}
    </div>`;
  }).join("");
}

// -------- TOURNAMENTS --------
function openTournamentForm(id = null) {
  document.getElementById("tournamentForm").classList.remove("hidden");
  document.getElementById("editTournamentId").value = id || "";
  if (id) {
    const t = data.tournaments.find(x => x.id === id);
    document.getElementById("tournamentFormTitle").textContent = "Editar Torneo";
    document.getElementById("tName").value = t.name;
    document.getElementById("tFormat").value = t.format;
    document.getElementById("tDate").value = t.date;
    document.getElementById("tStatus").value = t.status;
    document.getElementById("tPrize").value = t.prize;
    document.getElementById("tImage").value = t.image;
  } else {
    document.getElementById("tournamentFormTitle").textContent = "Nuevo Torneo";
    ["tName","tDate","tPrize","tImage"].forEach(f => document.getElementById(f).value = "");
  }
}

function closeTournamentForm() { document.getElementById("tournamentForm").classList.add("hidden"); }

function saveTournament() {
  const id = document.getElementById("editTournamentId").value;
  const t = {
    id: id || Date.now().toString(),
    name: document.getElementById("tName").value.trim(),
    format: document.getElementById("tFormat").value,
    date: document.getElementById("tDate").value,
    status: document.getElementById("tStatus").value,
    prize: document.getElementById("tPrize").value.trim(),
    image: document.getElementById("tImage").value.trim(),
  };
  if (!t.name) return alert("El nombre es obligatorio.");
  if (id) {
    const idx = data.tournaments.findIndex(x => x.id === id);
    data.tournaments[idx] = t;
  } else {
    data.tournaments.push(t);
  }
  saveData();
  closeTournamentForm();
  renderTournaments();
  refreshMatchTournamentSelects();
  renderStats();
}

function deleteTournament(id) {
  if (!confirm("¿Borrar este torneo y sus partidos?")) return;
  data.tournaments = data.tournaments.filter(x => x.id !== id);
  data.matches = data.matches.filter(x => x.tournamentId !== id);
  saveData();
  renderTournaments();
  renderMatches();
  renderStats();
}

function renderTournaments() {
  const container = document.getElementById("tournamentsList");
  if (!data.tournaments.length) {
    container.innerHTML = '<p class="empty-state">No hay torneos creados.</p>';
    return;
  }
  container.innerHTML = data.tournaments.map(t => {
    const matchCount = data.matches.filter(m => m.tournamentId === t.id).length;
    const actions = isEditor ? `
      <div style="margin-top:.8rem;display:flex;gap:.5rem;">
        <button class="btn-icon edit" onclick="openTournamentForm('${t.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon" onclick="deleteTournament('${t.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>` : "";
    const banner = t.image
      ? `<img class="tournament-banner" src="${t.image}" alt="banner"/>`
      : `<div class="tournament-banner-placeholder">🏆</div>`;
    return `
    <div class="tournament-card">
      ${banner}
      <div class="tournament-body">
        <div class="tournament-name">${t.name}</div>
        <span class="status-badge status-${t.status}">${t.status}</span>
        <div class="tournament-meta"><i class="fa-solid fa-gamepad"></i> ${t.format}</div>
        ${t.date ? `<div class="tournament-meta"><i class="fa-regular fa-calendar"></i> ${t.date}</div>` : ""}
        ${t.prize ? `<div class="tournament-meta"><i class="fa-solid fa-gift"></i> ${t.prize}</div>` : ""}
        <div class="tournament-meta"><i class="fa-solid fa-flag-checkered"></i> ${matchCount} partido(s)</div>
        ${actions}
      </div>
    </div>`;
  }).join("");
}

// -------- MATCHES --------
function refreshMatchTournamentSelects() {
  ["mTournament","filterTournament"].forEach(selId => {
    const sel = document.getElementById(selId);
    const isFilter = selId === "filterTournament";
    sel.innerHTML = (isFilter ? '<option value="">Todos los torneos</option>' : "") +
      data.tournaments.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
  });
}

function openMatchForm(id = null) {
  refreshMatchTournamentSelects();
  document.getElementById("matchForm").classList.remove("hidden");
  document.getElementById("editMatchId").value = id || "";
  if (id) {
    const m = data.matches.find(x => x.id === id);
    document.getElementById("matchFormTitle").textContent = "Editar Partido";
    document.getElementById("mTournament").value = m.tournamentId;
    document.getElementById("mRound").value = m.round;
    document.getElementById("mDate").value = m.date;
    document.getElementById("mTeamA").value = m.teamA;
    document.getElementById("mTeamB").value = m.teamB;
    document.getElementById("mScoreA").value = m.scoreA;
    document.getElementById("mScoreB").value = m.scoreB;
    document.getElementById("mPlayers").value = m.players;
    document.getElementById("mStats").value = m.stats;
    document.getElementById("mImage").value = m.image;
    document.getElementById("mNotes").value = m.notes;
  } else {
    document.getElementById("matchFormTitle").textContent = "Nuevo Partido";
    ["mRound","mDate","mTeamA","mTeamB","mPlayers","mStats","mImage","mNotes"]
      .forEach(f => document.getElementById(f).value = "");
    document.getElementById("mScoreA").value = "";
    document.getElementById("mScoreB").value = "";
  }
}

function closeMatchForm() { document.getElementById("matchForm").classList.add("hidden"); }

function saveMatch() {
  const id = document.getElementById("editMatchId").value;
  const m = {
    id: id || Date.now().toString(),
    tournamentId: document.getElementById("mTournament").value,
    round: document.getElementById("mRound").value.trim(),
    date: document.getElementById("mDate").value,
    teamA: document.getElementById("mTeamA").value.trim(),
    teamB: document.getElementById("mTeamB").value.trim(),
    scoreA: parseInt(document.getElementById("mScoreA").value) || 0,
    scoreB: parseInt(document.getElementById("mScoreB").value) || 0,
    players: document.getElementById("mPlayers").value.trim(),
    stats: document.getElementById("mStats").value.trim(),
    image: document.getElementById("mImage").value.trim(),
    notes: document.getElementById("mNotes").value.trim(),
  };
  if (!m.teamA || !m.teamB) return alert("Los dos equipos son obligatorios.");
  // Update player wins/losses
  updatePlayerRecord(m, id);
  if (id) {
    const idx = data.matches.findIndex(x => x.id === id);
    data.matches[idx] = m;
  } else {
    data.matches.push(m);
  }
  saveData();
  closeMatchForm();
  renderMatches();
  renderStats();
}

function updatePlayerRecord(newMatch, editId) {
  // If editing, revert old result first
  if (editId) {
    const old = data.matches.find(x => x.id === editId);
    if (old) revertMatchRecord(old);
  }
  applyMatchRecord(newMatch);
}

function applyMatchRecord(m) {
  const playerNames = (m.players || "").split(",").map(s => s.trim()).filter(Boolean);
  playerNames.forEach(name => {
    const p = data.players.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!p) return;
    if (m.scoreA > m.scoreB && m.teamA.toLowerCase().includes(name.toLowerCase())) p.wins++;
    else if (m.scoreB > m.scoreA && m.teamB.toLowerCase().includes(name.toLowerCase())) p.wins++;
    else if (m.scoreA !== m.scoreB) p.losses++;
  });
}

function revertMatchRecord(m) {
  const playerNames = (m.players || "").split(",").map(s => s.trim()).filter(Boolean);
  playerNames.forEach(name => {
    const p = data.players.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!p) return;
    if (m.scoreA > m.scoreB && m.teamA.toLowerCase().includes(name.toLowerCase())) p.wins = Math.max(0, p.wins - 1);
    else if (m.scoreB > m.scoreA && m.teamB.toLowerCase().includes(name.toLowerCase())) p.wins = Math.max(0, p.wins - 1);
    else if (m.scoreA !== m.scoreB) p.losses = Math.max(0, p.losses - 1);
  });
}

function deleteMatch(id) {
  if (!confirm("¿Borrar este partido?")) return;
  const m = data.matches.find(x => x.id === id);
  if (m) revertMatchRecord(m);
  data.matches = data.matches.filter(x => x.id !== id);
  saveData();
  renderMatches();
  renderStats();
}

function renderMatches() {
  refreshMatchTournamentSelects();
  const container = document.getElementById("matchesList");
  const filter = document.getElementById("filterTournament").value;
  const filtered = filter
    ? data.matches.filter(m => m.tournamentId === filter)
    : data.matches;

  if (!filtered.length) {
    container.innerHTML = '<p class="empty-state">No hay partidos registrados.</p>';
    return;
  }

  // Sort by date descending
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = sorted.map(m => {
    const tournament = data.tournaments.find(t => t.id === m.tournamentId);
    const tName = tournament ? tournament.name : "Torneo desconocido";
    const dateStr = m.date ? new Date(m.date).toLocaleString("es-ES") : "";
    const winner = m.scoreA > m.scoreB ? "A" : m.scoreB > m.scoreA ? "B" : null;
    const colorA = winner === "A" ? "var(--green)" : winner === "B" ? "var(--red)" : "var(--text)";
    const colorB = winner === "B" ? "var(--green)" : winner === "A" ? "var(--red)" : "var(--text)";
    const actions = isEditor ? `
      <div style="padding:0 1.2rem .8rem;display:flex;gap:.5rem;">
        <button class="btn-icon edit" onclick="openMatchForm('${m.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon" onclick="deleteMatch('${m.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>` : "";
    return `
    <div class="match-card">
      <div class="match-header">
        <span class="match-tournament"><i class="fa-solid fa-trophy"></i> ${tName}</span>
        <span class="match-round">${m.round}</span>
        <span class="match-date">${dateStr}</span>
      </div>
      <div class="match-score-row">
        <div class="team-name" style="color:${colorA}">${m.teamA}</div>
        <div class="score-display">
          <span class="score-a" style="color:${colorA}">${m.scoreA}</span>
          <span class="score-sep">–</span>
          <span class="score-b" style="color:${colorB}">${m.scoreB}</span>
        </div>
        <div class="team-name right" style="color:${colorB}">${m.teamB}</div>
      </div>
      <div class="match-body">
        ${m.image ? `<img class="match-image" src="${m.image}" alt="Captura del partido"/>` : ""}
        ${m.players ? `<div class="match-players"><i class="fa-solid fa-users"></i> ${m.players}</div>` : ""}
        ${m.stats ? `<div class="match-stats"><i class="fa-solid fa-chart-bar"></i> ${m.stats}</div>` : ""}
        ${m.notes ? `<div class="match-notes"><i class="fa-solid fa-quote-left"></i> ${m.notes}</div>` : ""}
      </div>
      ${actions}
    </div>`;
  }).join("");
}

// -------- STATS --------
function renderStats() {
  const { players, tournaments, matches } = data;
  const totalMatches = matches.length;
  const activeTournaments = tournaments.filter(t => t.status === "En curso").length;
  const finishedTournaments = tournaments.filter(t => t.status === "Finalizado").length;
  const totalGoals = matches.reduce((a, m) => a + m.scoreA + m.scoreB, 0);

  // Global stat cards
  document.getElementById("globalStatsGrid").innerHTML = [
    { number: players.length, label: "Jugadores" },
    { number: tournaments.length, label: "Torneos" },
    { number: totalMatches, label: "Partidos" },
    { number: activeTournaments, label: "En curso" },
    { number: finishedTournaments, label: "Finalizados" },
    { number: totalGoals, label: "Goles totales" },
  ].map(s => `
    <div class="stat-card">
      <div class="number">${s.number}</div>
      <div class="label">${s.label}</div>
    </div>`).join("");

  // Top winners
  const sorted = [...players].sort((a, b) => b.wins - a.wins).slice(0, 8);
  document.getElementById("topWinners").innerHTML = sorted.length
    ? sorted.map((p, i) => `
        <div class="top-list-item">
          <span class="top-rank">${i + 1}</span>
          <span class="top-name">${p.name}</span>
          <span class="top-value">${p.wins}W / ${p.losses}L</span>
          ${p.tracker ? `<a href="${p.tracker}" target="_blank" style="color:var(--accent2);font-size:.8rem;"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ""}
        </div>`).join("")
    : '<p class="empty-state" style="padding:1rem">Sin datos aún</p>';

  // Recent tournaments
  const recent = [...tournaments].reverse().slice(0, 5);
  document.getElementById("recentTournaments").innerHTML = recent.length
    ? recent.map(t => `
        <div class="recent-item">
          <div class="recent-name">${t.name}</div>
          <div class="recent-meta">${t.format} · <span class="status-badge status-${t.status}" style="padding:.1rem .5rem">${t.status}</span></div>
        </div>`).join("")
    : '<p class="empty-state" style="padding:1rem">Sin torneos aún</p>';

  // Performance bars
  const maxWins = Math.max(...players.map(p => p.wins), 1);
  document.getElementById("playerPerformance").innerHTML = players.length
    ? players.map(p => {
        const wr = (p.wins + p.losses) > 0
          ? Math.round(p.wins / (p.wins + p.losses) * 100) : 0;
        return `
          <div class="perf-row">
            <span class="perf-name">${p.name}</span>
            <div class="perf-bar-bg"><div class="perf-bar" style="width:${wr}%"></div></div>
            <span class="perf-pct">${wr}%</span>
          </div>`;
      }).join("")
    : '<p class="empty-state" style="padding:1rem">Sin jugadores aún</p>';
}

// -------- INIT --------
function renderAll() {
  renderStats();
  renderPlayers();
  renderTournaments();
  renderMatches();
}

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  refreshMatchTournamentSelects();
});
