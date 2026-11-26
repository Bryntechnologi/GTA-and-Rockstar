/* ==========================================================================
   CHANNEL SURF — app.js
   Zero-build, zero-backend, zero-asset fan arcade.
   ========================================================================== */

(() => {
  "use strict";

  const DATA = window.CS_DATA;
  if (!DATA) {
    document.body.innerHTML = "<p style='padding:2rem;font-family:monospace'>CHANNEL SURF data failed to load.</p>";
    return;
  }

  const { eras, eraOrder, questions, fakeFacts, atlas, timeline, badges, chatter, site } = DATA;

  const STORAGE = {
    settings: "channelsurf.settings.v1",
    stats: "channelsurf.stats.v1"
  };

  const DEFAULT_SETTINGS = {
    era: "gta6",
    sound: false,
    autoMorph: false
  };

  const DEFAULT_STATS = {
    highScores: { classic: 0, blitz: 0, sudden: 0, fake: 0, channel: 0, daily: 0 },
    bestStreak: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    runs: 0,
    dailyStreak: 0,
    lastDaily: "",
    badges: [],
    erasSeen: [],
    vaultSolves: 0,
    vaultStreak: 0,
    gridSolves: 0,
    gridBestPar: null
  };

  const ERA_ACCENTS = {
    gta6: "#ff5d7e",
    vicecity: "#ff4fa3",
    sanandreas: "#f5a623",
    gta5: "#ff9f1c",
    gta4: "#eab308",
    warriors: "#d23b2f",
    reddead: "#8f2f21",
    bully: "#d4af37"
  };

  const CREW_COLORS = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "#8f86ff"];
  const CREW_NAMES = ["You", "Wheelman", "Hacker", "Muscle"];
  const CREW_ROLES = ["Mastermind", "Wheelman", "Hacker", "Muscle"];

  const MODES = {
    classic: {
      name: "Classic Run",
      desc: "Ten questions. No clock. One clean run.",
      icon: "trivia",
      count: 10
    },
    blitz: {
      name: "60-Second Blitz",
      desc: "Answer as many as you can before the clock runs out.",
      icon: "clock",
      count: 40
    },
    sudden: {
      name: "Sudden Death",
      desc: "One wrong answer ends the run. Build the streak.",
      icon: "bolt",
      count: 40
    },
    fake: {
      name: "Mythbuster",
      desc: "Four statements. Three are true. Find the lie.",
      icon: "eye",
      count: 6
    },
    channel: {
      name: "Channel Surf",
      desc: "Mixed eras. The whole site morphs with every question.",
      icon: "shuffle",
      count: 8
    },
    daily: {
      name: "Daily Signal",
      desc: "Five UTC-seeded questions. The same run for everyone.",
      icon: "calendar",
      count: 5
    }
  };

  const MODE_LABELS = {
    classic: "Classic",
    blitz: "Blitz",
    sudden: "Sudden Death",
    fake: "Mythbuster",
    channel: "Channel Surf",
    daily: "Daily Signal"
  };

  const ROUTE_TITLES = {
    arcade: "CHANNEL SURF — Unofficial Rockstar Universe Arcade",
    trivia: "Trivia Arena — CHANNEL SURF",
    puzzles: "Puzzles & Safehouse — CHANNEL SURF",
    atlas: "The Era Atlas — CHANNEL SURF",
    timeline: "Franchise Timeline — CHANNEL SURF",
    toolkit: "Crew & Heist Splitter — CHANNEL SURF",
    about: "About / IP Note — CHANNEL SURF"
  };

  const GRID_LEVELS = {
    chill: { label: "Chill", size: 6, density: 0.17, blurb: "A clean line through a quiet block." },
    heat: { label: "Heat", size: 7, density: 0.25, blurb: "More patrols. Less patience." },
    five: { label: "Five-Star", size: 8, density: 0.31, blurb: "The whole city is looking for you." }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const icon = (name, cls = "icon") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatMoney(value) {
    const n = Number(value) || 0;
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function formatPercent(value) {
    return Math.round(value * 100) + "%";
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function todayUTC() {
    return new Date().toISOString().slice(0, 10);
  }

  function yesterdayUTC() {
    return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  }

  function dateLabelUTC() {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date()).toUpperCase();
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function random() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rngFrom(seed) {
    return mulberry32(hashString(String(seed)));
  }

  function shuffle(list, rng = Math.random) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function randomSeed() {
    return Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* Storage can be full or blocked; gameplay still works in memory. */
    }
  }

  function loadSettings() {
    const loaded = loadJSON(STORAGE.settings, {});
    const settings = { ...DEFAULT_SETTINGS, ...(loaded && typeof loaded === "object" ? loaded : {}) };
    if (!eras[settings.era]) settings.era = DEFAULT_SETTINGS.era;
    return settings;
  }

  function loadStats() {
    const loaded = loadJSON(STORAGE.stats, {});
    const stats = {
      ...DEFAULT_STATS,
      ...(loaded && typeof loaded === "object" ? loaded : {}),
      highScores: {
        ...DEFAULT_STATS.highScores,
        ...((loaded && loaded.highScores) || {})
      },
      badges: Array.isArray(loaded && loaded.badges) ? loaded.badges : [],
      erasSeen: Array.isArray(loaded && loaded.erasSeen) ? loaded.erasSeen : []
    };
    return stats;
  }

  const state = {
    settings: loadSettings(),
    stats: loadStats(),
    currentView: "arcade",
    triviaSetup: { mode: "classic", filter: "all" },
    trivia: null,
    vault: null,
    grid: null,
    puzzleTab: "vault",
    atlasSelected: null,
    timelineFilter: "All",
    timelineSelected: "t-2026",
    heist: {
      take: 1250000,
      cost: 150000,
      count: 3,
      members: [
        { name: "You", role: "Mastermind", weight: 4 },
        { name: "Wheelman", role: "Wheelman", weight: 3 },
        { name: "Hacker", role: "Hacker", weight: 2 },
        { name: "Muscle", role: "Muscle", weight: 1 }
      ]
    }
  };

  let toastTimer = null;

  function saveSettings() {
    saveJSON(STORAGE.settings, state.settings);
  }

  function saveStats() {
    saveJSON(STORAGE.stats, state.stats);
  }

  function showToast(message, ms = 3200) {
    const toast = $("#toast");
    if (!toast) return;
    toast.innerHTML = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), ms);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      /* fall through */
    }
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch (error) {
      return false;
    }
  }

  /* ---------------------------------------------------------------------
     AUDIO — synthesized only. No files, no licensing, no autoplay.
     --------------------------------------------------------------------- */
  let audioCtx = null;

  function getAudio() {
    if (!state.settings.sound) return null;
    if (!audioCtx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      audioCtx = new AudioCtor();
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function tone(freq, start, duration, type = "sine", volume = 0.032) {
    const ctx = getAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.03);
  }

  function sfx(kind) {
    if (!state.settings.sound) return;
    switch (kind) {
      case "click":
        tone(520, 0, 0.045, "triangle", 0.022);
        break;
      case "tick":
        tone(760, 0, 0.025, "square", 0.012);
        break;
      case "tune":
        tone(280, 0, 0.1, "triangle", 0.025);
        tone(520, 0.05, 0.12, "sine", 0.025);
        break;
      case "correct":
        tone(660, 0, 0.09, "triangle", 0.03);
        tone(990, 0.08, 0.16, "sine", 0.028);
        break;
      case "wrong":
        tone(190, 0, 0.16, "sawtooth", 0.025);
        tone(130, 0.1, 0.2, "triangle", 0.02);
        break;
      case "win":
        tone(523, 0, 0.1, "triangle", 0.032);
        tone(659, 0.09, 0.1, "triangle", 0.032);
        tone(784, 0.18, 0.14, "triangle", 0.032);
        tone(1047, 0.29, 0.24, "sine", 0.03);
        break;
      case "loss":
        tone(220, 0, 0.16, "triangle", 0.03);
        tone(165, 0.14, 0.28, "sine", 0.028);
        break;
      case "move":
        tone(430, 0, 0.035, "triangle", 0.018);
        break;
      case "unlock":
        tone(420, 0, 0.05, "square", 0.015);
        tone(620, 0.05, 0.08, "triangle", 0.025);
        break;
      default:
        tone(500, 0, 0.04, "sine", 0.02);
    }
  }

  /* ---------------------------------------------------------------------
     BADGES
     --------------------------------------------------------------------- */
  const BADGE_ICONS = {
    signal: "atlas",
    calendar: "calendar",
    lock: "lock",
    route: "route",
    star: "star",
    bolt: "bolt",
    book: "book",
    eye: "eye"
  };

  function awardBadge(id, quiet = false) {
    if (state.stats.badges.includes(id)) return false;
    const badge = badges.find((item) => item.id === id);
    if (!badge) return false;
    state.stats.badges.push(id);
    saveStats();
    renderBadgeShelf();
    renderAboutStats();
    if (!quiet) {
      showToast(`<strong>Badge unlocked</strong> — ${escapeHTML(badge.name)}`);
      sfx("win");
    }
    return true;
  }

  function checkGlobalBadges() {
    if (state.stats.erasSeen.length >= eraOrder.length) awardBadge("tuned-in");
    if (state.stats.totalCorrect >= 50) awardBadge("lorekeeper");
  }

  function trackEra(era) {
    if (!state.stats.erasSeen.includes(era)) {
      state.stats.erasSeen.push(era);
      saveStats();
      checkGlobalBadges();
    }
  }

  /* ---------------------------------------------------------------------
     AMBIENT ART — original inline SVG per era.
     --------------------------------------------------------------------- */
  function ambientArt(era) {
    const common = `class="fade" preserveAspectRatio="xMidYMax slice" viewBox="0 0 1600 900"`;
    switch (era) {
      case "gta6":
        return `<svg ${common}>
          <defs>
            <radialGradient id="a-sun6"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".55"/><stop offset="55%" stop-color="var(--accent)" stop-opacity=".18"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></radialGradient>
            <linearGradient id="a-sea6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent-2)" stop-opacity=".08"/><stop offset="100%" stop-color="var(--bg)" stop-opacity="0"/></linearGradient>
          </defs>
          <circle class="glow-pulse" cx="1220" cy="690" r="310" fill="url(#a-sun6)"/>
          <g opacity=".38" fill="var(--surface-2)">
            <rect x="1090" y="700" width="18" height="120"/><rect x="1120" y="670" width="26" height="150"/><rect x="1160" y="720" width="15" height="100"/><rect x="1190" y="650" width="34" height="170"/><rect x="1240" y="710" width="22" height="110"/><rect x="1280" y="680" width="30" height="140"/><rect x="1330" y="730" width="14" height="90"/>
          </g>
          <rect y="800" width="1600" height="100" fill="url(#a-sea6)"/>
          <g opacity=".18" fill="none" stroke="var(--accent-2)" stroke-width="1.2">
            <path d="M0 820c90-9 170 9 260 0s170 9 260 0 170 9 260 0 170 9 260 0 170 9 260 0 170 9 300 0"/>
            <path d="M0 855c90-9 170 9 260 0s170 9 260 0 170 9 260 0 170 9 260 0 170 9 260 0 170 9 300 0"/>
          </g>
          <g transform="translate(125 895)" opacity=".26" fill="var(--accent-2)">
            <path d="M0 0c-8-84 9-166 40-236" fill="none" stroke="var(--accent-2)" stroke-width="7"/>
            <g class="sway">
              <path d="M40-236c-66-50-122-44-166-8 60-8 111 7 148 33Z"/>
              <path d="M40-236c12-75 60-112 124-117-48 26-78 66-92 112Z"/>
              <path d="M40-236c62-32 114-17 145 27-52-23-95-26-130-6Z"/>
              <path d="M40-236c-48-8-84 18-101 62 31-31 67-45 101-40Z"/>
            </g>
          </g>
          <g transform="translate(1495 895) scale(-1 1)" opacity=".2" fill="var(--accent-2)">
            <path d="M0 0c-8-84 9-166 40-236" fill="none" stroke="var(--accent-2)" stroke-width="7"/>
            <g class="sway-slow">
              <path d="M40-236c-66-50-122-44-166-8 60-8 111 7 148 33Z"/>
              <path d="M40-236c12-75 60-112 124-117-48 26-78 66-92 112Z"/>
              <path d="M40-236c62-32 114-17 145 27-52-23-95-26-130-6Z"/>
            </g>
          </g>
        </svg>`;
      case "vicecity":
        return `<svg ${common}>
          <defs>
            <radialGradient id="a-sunvc"><stop offset="0%" stop-color="var(--accent-3)" stop-opacity=".42"/><stop offset="100%" stop-color="var(--accent-3)" stop-opacity="0"/></radialGradient>
            <linearGradient id="a-gridvc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent-2)" stop-opacity="0"/><stop offset="100%" stop-color="var(--accent-2)" stop-opacity=".15"/></linearGradient>
          </defs>
          <circle class="glow-pulse" cx="800" cy="430" r="330" fill="url(#a-sunvc)"/>
          <circle cx="800" cy="430" r="150" fill="none" stroke="var(--accent)" stroke-opacity=".19" stroke-width="1.4"/>
          <g stroke="var(--accent-2)" stroke-opacity=".12">
            <path d="M0 900 660 520M1600 900 940 520M0 820 700 520M1600 820 900 520M0 740 740 520M1600 740 860 520"/>
            <path d="M0 560h1600M0 620h1600M0 700h1600M0 800h1600"/>
          </g>
          <g transform="translate(260 900)" opacity=".25" fill="var(--accent)">
            <path d="M0 0c-4-90 10-170 40-235" fill="none" stroke="var(--accent)" stroke-width="6"/>
            <g class="sway">
              <path d="M40-235c-58-45-108-42-150-8 53-8 100 6 135 29Z"/>
              <path d="M40-235c9-68 52-102 111-105-43 23-70 58-83 100Z"/>
              <path d="M40-235c55-26 102-10 128 28-46-21-84-22-116-5Z"/>
            </g>
          </g>
        </svg>`;
      case "sanandreas":
        return `<svg ${common}>
          <defs><radialGradient id="a-sunsa"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".34"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></radialGradient></defs>
          <circle class="glow-pulse" cx="1100" cy="650" r="360" fill="url(#a-sunsa)"/>
          <path d="M0 790c220-120 380-130 540-60s290 27 440-35 380-45 620 70v135H0Z" fill="var(--surface-2)" opacity=".42"/>
          <path d="M0 860c250-65 480-58 700 4s420 50 900-26v62H0Z" fill="var(--surface-3)" opacity=".32"/>
          <g opacity=".3" fill="var(--accent-2)">
            <g transform="translate(1290 870)"><path d="M0 0c-6-70 8-130 35-185" fill="none" stroke="var(--accent-2)" stroke-width="6"/><g class="sway"><path d="M35-185c-50-35-90-30-125-4 46-6 84 5 113 25Z"/><path d="M35-185c8-50 40-80 88-86-34 20-55 46-66 77Z"/><path d="M35-185c45-20 82-6 102 25-38-17-68-17-93-4Z"/></g></g>
          </g>
          <path d="M0 870c330-34 490-16 730 12s430 12 870-38" fill="none" stroke="var(--accent)" stroke-opacity=".14" stroke-width="3" stroke-dasharray="20 16"/>
        </svg>`;
      case "gta5":
        return `<svg ${common}>
          <defs><radialGradient id="a-sun5"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".32"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></radialGradient></defs>
          <circle class="glow-pulse" cx="1180" cy="610" r="330" fill="url(#a-sun5)"/>
          <path d="M0 760c260-95 470-105 650-45s350 22 500-26 300-15 450 45v166H0Z" fill="var(--surface-2)" opacity=".45"/>
          <g opacity=".3" fill="var(--surface-3)">
            <rect x="1000" y="650" width="20" height="150"/><rect x="1030" y="620" width="34" height="180"/><rect x="1074" y="680" width="18" height="120"/><rect x="1102" y="600" width="42" height="200"/><rect x="1154" y="660" width="26" height="140"/><rect x="1190" y="630" width="30" height="170"/>
          </g>
          <g transform="translate(230 900)" opacity=".22" fill="var(--accent-2)">
            <path d="M0 0c-4-80 10-150 36-210" fill="none" stroke="var(--accent-2)" stroke-width="6"/>
            <g class="sway-slow"><path d="M36-210c-55-40-100-36-138-4 50-7 92 6 122 28Z"/><path d="M36-210c8-56 44-88 96-95-36 22-60 52-71 84Z"/><path d="M36-210c48-20 88-5 110 27-41-18-74-17-99-3Z"/></g>
          </g>
          <path d="M0 870h1600" stroke="var(--accent-2)" stroke-opacity=".1"/>
        </svg>`;
      case "gta4":
        return `<svg ${common}>
          <defs><linearGradient id="a-city4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--surface-3)" stop-opacity=".5"/><stop offset="100%" stop-color="var(--bg)" stop-opacity=".1"/></linearGradient></defs>
          <g opacity=".42" fill="url(#a-city4)">
            <rect x="40" y="560" width="60" height="240"/><rect x="110" y="620" width="40" height="180"/><rect x="160" y="520" width="80" height="280"/><rect x="250" y="660" width="50" height="140"/><rect x="310" y="590" width="90" height="210"/><rect x="410" y="640" width="45" height="160"/><rect x="465" y="550" width="70" height="250"/><rect x="545" y="670" width="35" height="130"/><rect x="590" y="600" width="100" height="200"/><rect x="700" y="650" width="45" height="150"/><rect x="755" y="530" width="75" height="270"/><rect x="840" y="620" width="40" height="180"/><rect x="890" y="570" width="90" height="230"/><rect x="990" y="660" width="50" height="140"/><rect x="1050" y="540" width="80" height="260"/><rect x="1140" y="610" width="40" height="190"/><rect x="1190" y="560" width="95" height="240"/><rect x="1295" y="650" width="50" height="150"/><rect x="1355" y="530" width="80" height="270"/><rect x="1445" y="620" width="45" height="180"/><rect x="1500" y="580" width="70" height="220"/>
          </g>
          <g stroke="var(--accent-3)" stroke-opacity=".16" stroke-width="1.2">
            <line class="rain" x1="300" y1="0" x2="280" y2="100" style="animation-delay:-.2s"/><line class="rain" x1="520" y1="60" x2="500" y2="160" style="animation-delay:-.7s"/><line class="rain" x1="760" y1="-20" x2="740" y2="80" style="animation-delay:-.4s"/><line class="rain" x1="980" y1="50" x2="960" y2="150" style="animation-delay:-.9s"/><line class="rain" x1="1240" y1="-10" x2="1220" y2="90" style="animation-delay:-.3s"/><line class="rain" x1="1440" y1="40" x2="1420" y2="140" style="animation-delay:-.6s"/>
            <line class="rain" x1="180" y1="70" x2="160" y2="170" style="animation-delay:-.5s"/><line class="rain" x1="660" y1="30" x2="640" y2="130" style="animation-delay:-.1s"/><line class="rain" x1="1110" y1="80" x2="1090" y2="180" style="animation-delay:-.8s"/><line class="rain" x1="1360" y1="0" x2="1340" y2="100" style="animation-delay:-.2s"/>
          </g>
        </svg>`;
      case "warriors":
        return `<svg ${common}>
          <g opacity=".34" fill="none" stroke-width="3">
            <path class="train-line" d="M-40 240c250 0 350 120 600 120s330-150 560-150 300 110 560 110" stroke="var(--accent)"/>
            <path class="train-line" d="M-30 420c280 0 320-150 580-150s370 180 630 180 260-120 500-120" stroke="var(--accent-2)" style="animation-delay:-.8s"/>
            <path class="train-line" d="M-20 620c300 0 400-180 620-180s300 200 540 200 330-150 500-150" stroke="var(--accent-3)" style="animation-delay:-1.4s"/>
          </g>
          <g fill="var(--surface-2)" opacity=".36">
            <rect x="0" y="780" width="1600" height="120"/><rect x="0" y="760" width="1600" height="4"/>
          </g>
          <g opacity=".2" stroke="var(--accent-3)" stroke-width="2">
            <path d="M50 70h240v78H50z" fill="none"/><path d="M68 88h204M68 104h150" stroke-width="4"/>
          </g>
          <g class="flicker" opacity=".35" fill="var(--accent-2)">
            <circle cx="1500" cy="140" r="4"/><circle cx="1520" cy="140" r="4"/><circle cx="1540" cy="140" r="4"/>
          </g>
          <path d="M0 900 320 760h960L1600 900Z" fill="var(--surface-3)" opacity=".15"/>
        </svg>`;
      case "reddead":
        return `<svg ${common}>
          <defs><radialGradient id="a-sunrd"><stop offset="0%" stop-color="var(--accent-3)" stop-opacity=".26"/><stop offset="100%" stop-color="var(--accent-3)" stop-opacity="0"/></radialGradient></defs>
          <circle class="glow-pulse" cx="1220" cy="450" r="300" fill="url(#a-sunrd)"/>
          <path d="M0 720 250 500l190 160 180-110 250 200 180-140 210 170 340-260v380H0Z" fill="var(--surface-3)" opacity=".3"/>
          <path d="M0 810 300 630l210 120 260-170 200 160 240-120 390 190v90H0Z" fill="var(--surface-2)" opacity=".32"/>
          <g fill="var(--accent)" opacity=".12">
            <circle cx="380" cy="300" r="2.5"/><circle cx="540" cy="420" r="2"/><circle cx="820" cy="260" r="2.5"/><circle cx="1080" cy="380" r="1.8"/><circle cx="1400" cy="290" r="2"/>
          </g>
          <g class="dust" opacity=".15" fill="var(--accent-3)">
            <circle cx="120" cy="760" r="2"/><circle cx="300" cy="690" r="1.5"/><circle cx="520" cy="820" r="2"/><circle cx="760" cy="740" r="1.5"/><circle cx="980" cy="810" r="2.2"/><circle cx="1210" cy="720" r="1.5"/><circle cx="1430" cy="800" r="2"/>
          </g>
        </svg>`;
      case "bully":
        return `<svg ${common}>
          <defs><linearGradient id="a-archbw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent-2)" stop-opacity=".13"/><stop offset="100%" stop-color="var(--accent-2)" stop-opacity="0"/></linearGradient></defs>
          <g fill="url(#a-archbw)" stroke="var(--accent-2)" stroke-opacity=".12">
            <path d="M560 900V360c0-140 100-240 240-240s240 100 240 240v540Z"/>
            <path d="M640 900V390c0-95 65-165 160-165s160 70 160 165v510Z" fill="none"/>
            <path d="M880 320v500M720 320v500M640 470h480M640 620h480" fill="none"/>
          </g>
          <g class="dust" opacity=".18" fill="var(--accent-3)">
            <path d="M180 250c20-30 50-30 70 0-25-8-45-8-70 0Z"/><path d="M1320 180c18-28 46-28 64 0-23-7-41-7-64 0Z"/><path d="M1450 420c20-30 50-30 70 0-25-8-45-8-70 0Z"/>
          </g>
          <g opacity=".16" stroke="var(--accent)" stroke-width="1">
            <path d="M0 900 1600 0M0 600 1100 0M200 900 1400 0M0 300 600 0"/>
            <path d="M0 0 1600 900M500 0 1600 700M0 200 900 900M0 500 1300 900"/>
          </g>
        </svg>`;
      default:
        return "";
    }
  }

  function renderAmbient(era) {
    const ambient = $("#ambient");
    if (ambient) ambient.innerHTML = ambientArt(era);
  }

  /* ---------------------------------------------------------------------
     THEME ENGINE
     --------------------------------------------------------------------- */
  function setEra(era, options = {}) {
    const { persist = true, flash = true, track = true, silent = false } = options;
    if (!eras[era]) return;

    const root = document.documentElement;
    const changed = root.dataset.era !== era;
    root.dataset.era = era;

    if (persist) {
      state.settings.era = era;
      saveSettings();
    }
    if (track) trackEra(era);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
      if (bg) meta.setAttribute("content", bg);
    }

    $$(".station-btn").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.station === era));
    });

    const profile = eras[era];
    const freq = $("#tunerFreq");
    const station = $("#tunerStation");
    if (freq) freq.textContent = profile.freq;
    if (station) station.textContent = profile.station;

    renderAmbient(era);
    renderOnAir(era);
    renderTicker(era);

    if (changed) {
      if (flash) flashSignal();
      if (!silent) sfx("tune");
    }

    if (state.currentView === "arcade") {
      renderSpotlight();
      renderEraRack();
    }
    if (state.currentView === "atlas") renderAtlas();
  }

  function flashSignal() {
    const flash = document.createElement("div");
    flash.className = "signal-flash";
    document.body.appendChild(flash);
    window.setTimeout(() => flash.remove(), 620);
  }

  function renderStationButtons() {
    const rail = $("#stationRail");
    if (!rail) return;
    rail.innerHTML = eraOrder.map((key) => {
      const era = eras[key];
      return `<button class="station-btn" type="button" role="tab" aria-selected="${document.documentElement.dataset.era === key}" data-station="${key}" title="${escapeHTML(era.name)} — ${escapeHTML(era.station)}">${escapeHTML(era.short)}</button>`;
    }).join("");
  }

  function renderOnAir(era = document.documentElement.dataset.era) {
    const profile = eras[era];
    if (!profile) return;
    const fields = {
      onairCode: profile.short,
      onairFreq: profile.freq,
      onairStation: profile.station,
      onairTagline: profile.tagline,
      onairEra: profile.name,
      onairYear: profile.year,
      tunerFreq: profile.freq,
      tunerStation: profile.station
    };
    Object.entries(fields).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });

    const eq = $("#onairEq");
    if (eq && !eq.children.length) {
      const heights = [42, 68, 30, 85, 56, 96, 44, 72, 26, 60, 88, 36, 78, 52, 64, 92, 40, 74, 28, 58, 80, 46, 70, 34, 86, 54, 62, 38];
      eq.innerHTML = heights.map((h, index) => {
        const duration = (0.75 + ((index * 7) % 13) / 16).toFixed(2);
        return `<i class="eq-bar" style="--h:${h}%;--dur:${duration}s;animation-delay:-${(index % 11) * 0.12}s"></i>`;
      }).join("");
    }
  }

  function renderTicker(era = document.documentElement.dataset.era) {
    const track = $("#tickerTrack");
    if (!track) return;
    const lines = [
      ...(chatter[era] || []),
      "No servers. No trackers. No signal loss.",
      "An unofficial fan project and portfolio arcade."
    ];
    const html = lines.map((line) => `<span>${escapeHTML(line)}</span>`).join("");
    track.innerHTML = html + html;
  }

  const SPOTLIGHT_TITLES = {
    gta6: "Vice City, reborn.",
    vicecity: "Pastel, dangerous, eternal.",
    sanandreas: "Three cities, one state of mind.",
    gta5: "Sunshine with a body count.",
    gta4: "The cold city and its warm lies.",
    warriors: "One night. One long ride home.",
    reddead: "A map running out of blank space.",
    bully: "Class is in session."
  };

  function renderSpotlight() {
    const era = document.documentElement.dataset.era;
    const profile = eras[era];
    const data = atlas[era];
    if (!profile || !data) return;
    const first = data.locations[0];
    const title = $("#spotlightName");
    const meta = $("#spotlightMeta");
    const note = $("#spotlightNote");
    const tags = $("#spotlightTags");
    const kicker = $("#spotlightKicker");
    if (title) title.textContent = SPOTLIGHT_TITLES[era] || profile.tagline;
    if (meta) meta.textContent = `${profile.place} · ${profile.year}`;
    if (note) note.textContent = first ? first.note : profile.tagline;
    if (kicker) kicker.textContent = `Signal spotlight // ${profile.short}`;
    if (tags) {
      tags.innerHTML = [profile.accentName, profile.station, "fan atlas"]
        .map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`)
        .join("");
    }
  }

  /* ---------------------------------------------------------------------
     HOME RENDERERS
     --------------------------------------------------------------------- */
  function renderHome() {
    renderDaily();
    updateStatsUI();
    renderSpotlight();
    renderHomeGameCards();
    renderToolCards();
    renderEraRack();
    renderBadgeShelf();
  }

  function renderDaily() {
    const dateEl = $("#dailyDate");
    if (dateEl) dateEl.textContent = `${dateLabelUTC()} · UTC`;
  }

  function updateStatsUI() {
    const stats = state.stats;
    const completed = stats.lastDaily === todayUTC();
    const accuracy = stats.totalAnswered ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : null;

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    set("streakCount", stats.dailyStreak);
    set("statStreak", `${stats.dailyStreak} ${stats.dailyStreak === 1 ? "day" : "days"}`);
    set("statAccuracy", accuracy === null ? "—" : `${accuracy}%`);
    set("statBadges", `${stats.badges.length} / ${badges.length}`);
    set("statRuns", stats.runs);
    set("dailyProgressText", completed ? `Today complete · ${stats.dailyStreak}-day streak` : `Not played today · ${stats.dailyStreak}-day streak`);

    const fill = $("#dailyProgressFill");
    if (fill) fill.style.width = completed ? "100%" : "0%";

    const dailyBtn = $("#dailyStartBtn");
    if (dailyBtn) dailyBtn.textContent = completed ? "Replay daily trivia" : "Play daily trivia";
  }

  function renderHomeGameCards() {
    const stats = state.stats;
    const cards = [
      {
        open: "trivia",
        mode: "classic",
        icon: "trivia",
        title: "Trivia Arena",
        copy: "Six formats, eight signals, and a lore note after every answer. Classic, Blitz, Sudden Death, and more.",
        meta: "6 modes",
        score: stats.highScores.classic ? `Best ${stats.highScores.classic}` : "No best yet",
        accent: "var(--accent)"
      },
      {
        open: "trivia",
        mode: "fake",
        icon: "eye",
        title: "Mythbuster",
        copy: "Four statements, three truths, one beautifully planted lie. Built for people who read the fine print.",
        meta: "Spot the lie",
        score: stats.highScores.fake ? `Best ${stats.highScores.fake}` : "No best yet",
        accent: "var(--accent-2)"
      },
      {
        open: "puzzles",
        tab: "vault",
        icon: "lock",
        title: "Vault Cracker",
        copy: "A four-digit safe, six guesses, and a feedback loop. Right digit, right slot — or right digit, wrong place.",
        meta: "Logic loop",
        score: `${stats.vaultSolves} solved`,
        accent: "var(--accent-3)"
      },
      {
        open: "puzzles",
        tab: "grid",
        icon: "route",
        title: "Heat Grid",
        copy: "Thread a route through patrols to the safehouse. Beat par for the Ghost Run badge.",
        meta: "Route puzzle",
        score: `${stats.gridSolves} cleared`,
        accent: "var(--accent-2)"
      },
      {
        open: "atlas",
        icon: "atlas",
        title: "The Era Atlas",
        copy: "A custom vector map of Leonida, plus district dossiers for every other signal in the archive.",
        meta: "8 eras",
        score: "Explore",
        accent: "var(--accent)"
      },
      {
        open: "toolkit",
        icon: "split",
        title: "Crew Splitter",
        copy: "Set the take, subtract the prep, weight the crew, and get an instant, shareable split. No spreadsheet.",
        meta: "Utility",
        score: "Do the math",
        accent: "var(--accent-3)"
      }
    ];

    const grid = $("#homeGameGrid");
    if (!grid) return;
    grid.innerHTML = cards.map((card) => `
      <article class="game-card" role="button" tabindex="0" data-open="${card.open}"${card.mode ? ` data-mode="${card.mode}"` : ""}${card.tab ? ` data-tab="${card.tab}"` : ""} style="--card-accent:${card.accent}">
        <span class="game-icon">${icon(card.icon)}</span>
        <h3>${escapeHTML(card.title)}</h3>
        <p>${escapeHTML(card.copy)}</p>
        <div class="game-card-foot">
          <span>${escapeHTML(card.meta)}</span>
          <span class="score">${escapeHTML(card.score)}</span>
          <span class="play-mark">${icon("arrow")}</span>
        </div>
      </article>
    `).join("");
  }

  function renderToolCards() {
    const tools = [
      {
        open: "toolkit",
        number: "01",
        title: "Crew & Heist Splitter",
        copy: "Turn a fictional nine-figure score into a fair-ish split. Weighted shares, prep costs, copyable summary.",
        link: "Open the field kit"
      },
      {
        open: "atlas",
        number: "02",
        title: "The Era Atlas",
        copy: "Leonida's coastline in custom SVG, plus district dossiers for Vice City, Liberty City, the frontier, and more.",
        link: "Browse the atlas"
      },
      {
        open: "timeline",
        number: "03",
        title: "Franchise Timeline",
        copy: "Scrub from 1997's top-down origins to the modern era. Tune the site to any milestone on the rail.",
        link: "Open the archive"
      }
    ];
    const grid = $("#toolGrid");
    if (!grid) return;
    grid.innerHTML = tools.map((tool) => `
      <article class="tool-card" role="button" tabindex="0" data-open="${tool.open}">
        <span class="tool-number">${tool.number}</span>
        <h3>${escapeHTML(tool.title)}</h3>
        <p>${escapeHTML(tool.copy)}</p>
        <span class="text-link">${escapeHTML(tool.link)} →</span>
      </article>
    `).join("");
  }

  function renderEraRack() {
    const rack = $("#eraRack");
    if (!rack) return;
    rack.innerHTML = eraOrder.map((key) => {
      const era = eras[key];
      const visited = state.stats.erasSeen.includes(key);
      return `<button class="era-tile" type="button" data-era-tile="${key}" data-visited="${visited}" style="--tile-accent:${ERA_ACCENTS[key]}">
        <span>
          <strong>${escapeHTML(era.name)}</strong>
          <small>${escapeHTML(era.station)} · ${escapeHTML(era.year)}</small>
        </span>
      </button>`;
    }).join("");
  }

  function renderBadgeShelf() {
    const shelf = $("#badgeShelf");
    if (!shelf) return;
    shelf.innerHTML = badges.map((badge) => {
      const earned = state.stats.badges.includes(badge.id);
      return `<div class="badge-tile ${earned ? "is-earned" : ""}">
        <span class="badge-icon">${icon(BADGE_ICONS[badge.symbol] || "star")}</span>
        <span>
          <strong>${escapeHTML(badge.name)}</strong>
          <small>${escapeHTML(badge.desc)}</small>
        </span>
      </div>`;
    }).join("");
  }

  /* ---------------------------------------------------------------------
     ROUTER
     --------------------------------------------------------------------- */
  const ROUTES = ["arcade", "trivia", "puzzles", "atlas", "timeline", "toolkit", "about"];

  function navigate(view, options = {}) {
    if (!ROUTES.includes(view)) view = "arcade";
    const previous = state.currentView;
    state.currentView = view;

    $$(".view").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.view === view);
    });

    $$(".nav-link").forEach((link) => {
      const active = link.dataset.route === view;
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    document.title = ROUTE_TITLES[view] || ROUTE_TITLES.arcade;

    if (!options.fromHash && window.location.hash !== "#" + view) {
      try {
        history.pushState(null, "", "#" + view);
      } catch (error) {
        window.location.hash = view;
      }
    }

    const menu = $("#primaryNav");
    const menuButton = $("#menuToggle");
    if (menu) menu.classList.remove("is-open");
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    }

    if (view === "trivia") renderTriviaSetup();
    if (view === "puzzles") renderPuzzleTab();
    if (view === "atlas") renderAtlas();
    if (view === "timeline") renderTimeline();
    if (view === "toolkit") renderHeist();
    if (view === "about") renderAbout();
    if (view === "arcade") renderHome();

    if (!options.noScroll) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }

    if (previous !== view) sfx("click");
  }

  function openContent(kind, dataset = {}) {
    if (kind === "trivia") {
      navigate("trivia");
      if (dataset.mode) selectTriviaMode(dataset.mode);
      return;
    }
    if (kind === "puzzles") {
      navigate("puzzles");
      if (dataset.tab) switchPuzzleTab(dataset.tab);
      return;
    }
    if (kind === "atlas") {
      navigate("atlas");
      return;
    }
    if (kind === "toolkit") {
      navigate("toolkit");
      return;
    }
    if (kind === "timeline") {
      navigate("timeline");
    }
  }

  function bindNavigation() {
    document.addEventListener("click", (event) => {
      const routeButton = event.target.closest("[data-route]");
      if (routeButton) {
        event.preventDefault();
        navigate(routeButton.dataset.route);
        return;
      }
      const openButton = event.target.closest("[data-open]");
      if (openButton) {
        openContent(openButton.dataset.open, openButton.dataset);
        return;
      }
      const eraTile = event.target.closest("[data-era-tile]");
      if (eraTile) {
        setEra(eraTile.dataset.eraTile);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const actionable = event.target.closest("[data-open][role='button']");
      if (!actionable) return;
      event.preventDefault();
      openContent(actionable.dataset.open, actionable.dataset);
    });

    const brand = $(".brand");
    if (brand) {
      brand.addEventListener("click", (event) => {
        event.preventDefault();
        navigate("arcade");
      });
    }

    window.addEventListener("hashchange", () => {
      const view = window.location.hash.replace("#", "");
      if (ROUTES.includes(view) && view !== state.currentView) {
        navigate(view, { fromHash: true });
      }
    });

    window.addEventListener("popstate", () => {
      const view = window.location.hash.replace("#", "");
      if (ROUTES.includes(view) && view !== state.currentView) {
        navigate(view, { fromHash: true });
      }
    });
  }

  function initTuner() {
    renderStationButtons();

    const rail = $("#stationRail");
    if (rail) {
      rail.addEventListener("click", (event) => {
        const button = event.target.closest("[data-station]");
        if (button) setEra(button.dataset.station);
      });
    }

    const rotate = (direction) => {
      const current = document.documentElement.dataset.era;
      const index = eraOrder.indexOf(current);
      const next = eraOrder[(index + direction + eraOrder.length) % eraOrder.length];
      setEra(next);
    };

    $("#prevStation")?.addEventListener("click", () => rotate(-1));
    $("#nextStation")?.addEventListener("click", () => rotate(1));

    const auto = $("#autoMorph");
    if (auto) {
      auto.checked = Boolean(state.settings.autoMorph);
      auto.addEventListener("change", () => {
        state.settings.autoMorph = auto.checked;
        saveSettings();
        sfx("click");
        showToast(auto.checked ? "<strong>Auto-morph on</strong> — each trivia question changes the signal." : "Auto-morph off — the tuner is yours.");
      });
    }
  }

  function initSound() {
    const button = $("#soundToggle");
    const onIcon = $(".sound-on-icon");
    const offIcon = $(".sound-off-icon");
    if (!button) return;

    const update = () => {
      const on = Boolean(state.settings.sound);
      if (onIcon) onIcon.classList.toggle("hidden", !on);
      if (offIcon) offIcon.classList.toggle("hidden", on);
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-label", on ? "Mute sound" : "Enable sound");
      button.title = on ? "Mute sound" : "Enable sound";
    };

    button.addEventListener("click", () => {
      state.settings.sound = !state.settings.sound;
      saveSettings();
      update();
      if (state.settings.sound) {
        getAudio();
        sfx("tune");
        showToast("<strong>Sound on</strong> — synthesized in the browser, no audio files.");
      } else {
        showToast("Sound off.");
      }
    });

    update();
  }

  function bindHeaderAndHome() {
    const menuButton = $("#menuToggle");
    const menu = $("#primaryNav");
    if (menuButton && menu) {
      menuButton.addEventListener("click", () => {
        const open = menu.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        sfx("click");
      });
    }

    $("#streakChip")?.addEventListener("click", () => {
      navigate("arcade");
      window.setTimeout(() => $("#dailyCard")?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    });

    $("#heroDailyBtn")?.addEventListener("click", () => {
      navigate("trivia");
      startTrivia("daily");
    });

    $("#heroRandomBtn")?.addEventListener("click", () => {
      const others = eraOrder.filter((era) => era !== document.documentElement.dataset.era);
      const next = others[Math.floor(Math.random() * others.length)];
      setEra(next);
      showToast(`<strong>Signal acquired</strong> — ${escapeHTML(eras[next].name)}.`);
    });

    $("#dailyStartBtn")?.addEventListener("click", () => {
      navigate("trivia");
      startTrivia("daily");
    });

    $("#dailyVaultBtn")?.addEventListener("click", () => {
      navigate("puzzles");
      switchPuzzleTab("vault");
      startDailyVault();
    });

    $("#onairAtlas")?.addEventListener("click", () => navigate("atlas"));
    $("#spotlightBtn")?.addEventListener("click", () => navigate("atlas"));

    const homeGrid = $("#homeGameGrid");
    const toolGrid = $("#toolGrid");
    const rack = $("#eraRack");

    const handleCardKey = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const card = event.target.closest("[data-open]");
      if (!card) return;
      event.preventDefault();
      openContent(card.dataset.open, card.dataset);
    };
    homeGrid?.addEventListener("keydown", handleCardKey);
    toolGrid?.addEventListener("keydown", handleCardKey);

    rack?.addEventListener("click", (event) => {
      const tile = event.target.closest("[data-era-tile]");
      if (tile) setEra(tile.dataset.eraTile);
    });
  }

  function startClock() {
    const update = () => {
      const now = new Date();
      const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      const diff = Math.max(0, next - now.getTime());
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const clock = $("#resetClock");
      if (clock) clock.textContent = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
      const date = $("#resetDate");
      if (date) {
        date.textContent = new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "2-digit",
          timeZone: "UTC"
        }).format(new Date(next)).toUpperCase();
      }
    };
    update();
    window.setInterval(update, 1000);
  }

  /* ---------------------------------------------------------------------
     BOOT
     --------------------------------------------------------------------- */
  function init() {
    const footer = $("#footerDisclaimer");
    if (footer) footer.textContent = site.disclaimer;
    const aboutDisclaimer = $("#aboutDisclaimer");
    if (aboutDisclaimer) aboutDisclaimer.textContent = site.disclaimer;
    const metaEras = $("#metaEras");
    if (metaEras) metaEras.textContent = pad2(eraOrder.length);

    initTuner();
    initSound();
    bindNavigation();
    bindHeaderAndHome();
    renderTriviaSetup();
    renderHeist();
    renderAboutStats();
    startClock();
    initPuzzleEvents();
    initTriviaEvents();
    initAtlasEvents();
    initTimelineEvents();
    initHeistEvents();
    initAboutEvents();
    initKeyboard();

    setEra(state.settings.era, { persist: false, flash: false, track: true, silent: true });
    renderHome();

    const hashView = window.location.hash.replace("#", "");
    const initialView = ROUTES.includes(hashView) ? hashView : "arcade";
    navigate(initialView, { fromHash: true, noScroll: true });
  }

  /* ---------------------------------------------------------------------
     TRIVIA — SETUP
     --------------------------------------------------------------------- */
  function filterName(filter) {
    return filter === "all" ? "All eras" : (eras[filter]?.name || "All eras");
  }

  function triviaPool(mode, filter) {
    if (mode === "fake") {
      return filter === "all" ? fakeFacts : fakeFacts.filter((item) => item.era === filter);
    }
    if (mode === "daily" || mode === "channel") return questions;
    return filter === "all" ? questions : questions.filter((item) => item.era === filter);
  }

  function renderTriviaSetup() {
    const setup = state.triviaSetup;
    if (!MODES[setup.mode]) setup.mode = "classic";
    if (setup.filter !== "all" && !eras[setup.filter]) setup.filter = "all";

    const filters = $("#triviaFilters");
    if (filters) {
      filters.innerHTML = [
        `<button class="chip" type="button" data-filter="all" aria-pressed="${setup.filter === "all"}">All eras</button>`,
        ...eraOrder.map((key) => `<button class="chip" type="button" data-filter="${key}" aria-pressed="${setup.filter === key}">${escapeHTML(eras[key].name)}</button>`)
      ].join("");
    }

    const modes = $("#triviaModes");
    if (modes) {
      modes.innerHTML = Object.entries(MODES).map(([key, mode]) => {
        const best = state.stats.highScores[key] || 0;
        return `<button class="mode-card" type="button" data-mode="${key}" aria-pressed="${setup.mode === key}">
          <span class="mode-icon">${icon(mode.icon)}</span>
          <strong>${escapeHTML(mode.name)}</strong>
          <small>${escapeHTML(mode.desc)}</small>
          <span class="mode-best">${best ? `Best ${best}` : "No best yet"}</span>
        </button>`;
      }).join("");
    }

    const label = $("#filterLabel");
    if (label) label.textContent = filterName(setup.filter);

    const bank = $("#triviaBankCount");
    if (bank) bank.textContent = triviaPool(setup.mode, setup.filter).length;

    const bestList = $("#triviaBest");
    if (bestList) {
      bestList.innerHTML = Object.keys(MODES).map((key) => {
        const best = state.stats.highScores[key] || 0;
        return `<div class="best-row"><span>${escapeHTML(MODES[key].name)}</span><b>${best ? best : "—"}</b></div>`;
      }).join("");
    }
  }

  function selectTriviaMode(mode) {
    if (!MODES[mode]) return;
    state.triviaSetup.mode = mode;
    renderTriviaSetup();
    sfx("click");
  }

  function selectTriviaFilter(filter) {
    state.triviaSetup.filter = filter;
    renderTriviaSetup();
    sfx("click");
  }

  function initTriviaEvents() {
    $("#triviaFilters")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (button) selectTriviaFilter(button.dataset.filter);
    });

    $("#triviaModes")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mode]");
      if (button) selectTriviaMode(button.dataset.mode);
    });

    $("#triviaStart")?.addEventListener("click", () => {
      startTrivia(state.triviaSetup.mode, state.triviaSetup.filter);
    });

    $("#triviaGame")?.addEventListener("click", (event) => {
      const answer = event.target.closest("[data-answer]");
      if (answer) {
        handleTriviaAnswer(Number(answer.dataset.answer));
        return;
      }
      if (event.target.closest("[data-trivia-next]")) {
        nextTrivia();
        return;
      }
      if (event.target.closest("[data-trivia-abort]")) {
        exitTrivia();
      }
    });

    $("#triviaResult")?.addEventListener("click", (event) => {
      const action = event.target.closest("[data-trivia-action]");
      if (!action) return;
      if (action.dataset.triviaAction === "again") {
        const mode = state.trivia?.mode || state.triviaSetup.mode;
        const filter = state.trivia?.filter || state.triviaSetup.filter;
        startTrivia(mode, filter);
        return;
      }
      if (action.dataset.triviaAction === "setup") {
        exitTrivia();
        return;
      }
      if (action.dataset.triviaAction === "share") {
        shareTriviaResult();
      }
    });
  }

  /* ---------------------------------------------------------------------
     TRIVIA — RUN
     --------------------------------------------------------------------- */
  function pickMixedQuestions(count, rng) {
    const chosen = [];
    const eraOrderRandom = shuffle(eraOrder, rng);
    for (const era of eraOrderRandom) {
      if (chosen.length >= count) break;
      const pool = questions.filter((item) => item.era === era);
      if (pool.length) {
        chosen.push(pool[Math.floor(rng() * pool.length)]);
      }
    }
    if (chosen.length < count) {
      const remaining = shuffle(questions.filter((item) => !chosen.includes(item)), rng);
      chosen.push(...remaining.slice(0, count - chosen.length));
    }
    return shuffle(chosen, rng);
  }

  function startTrivia(mode = state.triviaSetup.mode, filter = state.triviaSetup.filter) {
    if (!MODES[mode]) mode = "classic";
    state.triviaSetup.mode = mode;
    state.triviaSetup.filter = filter;

    if (state.trivia?.timerId) window.clearInterval(state.trivia.timerId);

    let items = [];
    let isFake = mode === "fake";
    let seed = randomSeed();

    if (mode === "daily") {
      seed = `daily-${todayUTC()}`;
      items = pickMixedQuestions(5, rngFrom(seed));
    } else if (mode === "channel") {
      items = pickMixedQuestions(8, Math.random);
    } else if (isFake) {
      let pool = triviaPool("fake", filter);
      if (!pool.length) pool = fakeFacts;
      items = shuffle(pool, Math.random).slice(0, 6);
    } else {
      let pool = triviaPool(mode, filter);
      if (!pool.length) pool = questions;
      items = shuffle(pool, Math.random).slice(0, Math.min(MODES[mode].count, pool.length));
    }

    if (!items.length) {
      showToast("No questions available for that signal. Try another filter.");
      return;
    }

    state.trivia = {
      active: true,
      mode,
      filter,
      isFake,
      items,
      index: 0,
      correct: 0,
      answered: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      missed: 0,
      feedback: false,
      failed: false,
      finished: false,
      timeLeft: 60,
      timerId: null,
      lastTick: Date.now(),
      baseEra: document.documentElement.dataset.era,
      forcedMorph: mode === "channel" || mode === "daily" || state.settings.autoMorph,
      seed,
      newBest: false
    };

    const setup = $("#triviaSetup");
    const game = $("#triviaGame");
    const result = $("#triviaResult");
    setup?.classList.add("hidden");
    result?.classList.add("hidden");
    if (result) result.innerHTML = "";
    game?.classList.remove("hidden");

    renderTriviaQuestion();
    if (mode === "blitz") startBlitzTimer();
    if (state.currentView !== "trivia") navigate("trivia", { noScroll: true });
  }

  function startBlitzTimer() {
    if (!state.trivia) return;
    if (state.trivia.timerId) window.clearInterval(state.trivia.timerId);
    state.trivia.lastTick = Date.now();
    state.trivia.timerId = window.setInterval(() => {
      const trivia = state.trivia;
      if (!trivia || !trivia.active) return;
      if (trivia.feedback || state.currentView !== "trivia") {
        trivia.lastTick = Date.now();
        return;
      }
      const now = Date.now();
      const delta = (now - trivia.lastTick) / 1000;
      trivia.lastTick = now;
      trivia.timeLeft = Math.max(0, trivia.timeLeft - delta);
      updateTimerUI();
      if (trivia.timeLeft <= 0) finishTrivia("time");
    }, 100);
  }

  function updateTimerUI() {
    const trivia = state.trivia;
    if (!trivia) return;
    const label = $("#triviaTimer");
    const fill = $("#triviaTimerFill");
    const seconds = Math.ceil(trivia.timeLeft);
    if (label) label.textContent = `${seconds}s`;
    if (fill) fill.style.width = `${Math.max(0, Math.min(100, (trivia.timeLeft / 60) * 100))}%`;
  }

  function renderTriviaQuestion() {
    const trivia = state.trivia;
    if (!trivia || !trivia.active) return;
    if (trivia.index >= trivia.items.length) {
      finishTrivia("complete");
      return;
    }

    const q = trivia.items[trivia.index];
    if (trivia.forcedMorph) {
      setEra(q.era, { persist: false, flash: true, track: true, silent: false });
    }

    const game = $("#triviaGame");
    if (!game) return;
    trivia.feedback = false;

    const letters = ["A", "B", "C", "D"];
    const answers = (trivia.isFake ? q.statements : q.choices).map((choice, index) => `
      <button class="answer" type="button" data-answer="${index}">
        <span class="answer-key">${letters[index]}</span>
        <span>${escapeHTML(choice)}</span>
      </button>
    `).join("");

    const modeLabel = MODE_LABELS[trivia.mode] || "Run";
    const gameLabel = q.game || eras[q.era]?.name || "Rockstar universe";
    const questionText = trivia.isFake
      ? "Three of these statements are true. Tap the planted lie."
      : q.prompt;

    game.innerHTML = `
      <div class="trivia-topbar">
        <button class="text-link" type="button" data-trivia-abort>← Abort run</button>
        <div class="trivia-scoreline">
          <span class="score-pill">${escapeHTML(modeLabel)}</span>
          <span class="score-pill">Score <b id="triviaScore">${trivia.score}</b></span>
          <span class="score-pill ${trivia.streak > 0 ? "hot" : ""}">Streak <b id="triviaStreak">${trivia.streak}</b></span>
        </div>
      </div>
      ${trivia.mode === "blitz" ? `<div class="timer-wrap"><span class="timer-label" id="triviaTimer">${Math.ceil(trivia.timeLeft)}s</span><span class="timer-track"><span class="timer-fill" id="triviaTimerFill" style="width:${(trivia.timeLeft / 60) * 100}%"></span></span></div>` : ""}
      <article class="question-card panel ${trivia.isFake ? "is-myth" : ""}">
        <div class="question-meta">
          <span class="q-era">${escapeHTML(gameLabel)}</span>
          <span>Question ${trivia.index + 1}${trivia.mode === "blitz" ? "" : ` of ${trivia.items.length}`}</span>
        </div>
        <h2 class="question-text">${escapeHTML(questionText)}</h2>
        <div class="answers ${trivia.isFake ? "is-myth" : ""}" role="group" aria-label="Answer choices">
          ${answers}
        </div>
        <div id="triviaFeedback"></div>
      </article>
    `;

    if (trivia.mode === "blitz") updateTimerUI();
  }

  function handleTriviaAnswer(index) {
    const trivia = state.trivia;
    if (!trivia || !trivia.active || trivia.feedback) return;
    const q = trivia.items[trivia.index];
    if (!q) return;

    const chosen = Number(index);
    const correct = chosen === q.answer;
    const isLast = trivia.index >= trivia.items.length - 1;

    trivia.feedback = true;
    trivia.answered++;
    state.stats.totalAnswered++;

    let gained = 0;
    if (correct) {
      const streakBonus = Math.min(trivia.streak, 5) * 25;
      const timeBonus = trivia.mode === "blitz" ? Math.round(trivia.timeLeft) * 2 : 0;
      gained = 100 + streakBonus + timeBonus;
      trivia.score += gained;
      trivia.correct++;
      trivia.streak++;
      trivia.bestStreak = Math.max(trivia.bestStreak, trivia.streak);
      state.stats.totalCorrect++;
      state.stats.bestStreak = Math.max(state.stats.bestStreak, trivia.bestStreak);
      sfx("correct");
    } else {
      trivia.missed++;
      trivia.streak = 0;
      if (trivia.mode === "sudden") trivia.failed = true;
      sfx("wrong");
    }

    $$(".answer", $("#triviaGame")).forEach((button, answerIndex) => {
      button.disabled = true;
      if (answerIndex === q.answer) button.classList.add("is-correct");
      if (answerIndex === chosen && !correct) button.classList.add("is-wrong");
    });

    const scoreEl = $("#triviaScore");
    const streakEl = $("#triviaStreak");
    if (scoreEl) scoreEl.textContent = trivia.score;
    if (streakEl) streakEl.textContent = trivia.streak;

    const feedback = $("#triviaFeedback");
    if (feedback) {
      const title = correct ? (gained ? `Correct · +${gained}` : "Correct") : "Not this time";
      const nextLabel = trivia.failed || isLast ? "See result" : "Next question";
      feedback.innerHTML = `
        <div class="feedback ${correct ? "is-correct" : "is-wrong"}">
          <div class="feedback-head">${icon(correct ? "check" : "x")} ${title}</div>
          <p>${escapeHTML(q.lore || "")}</p>
          <div class="feedback-actions">
            <span class="feedback-source">Fan-written lore note · ${escapeHTML(eras[q.era]?.name || "Archive")}</span>
            <button class="btn btn-primary btn-sm" type="button" data-trivia-next>${nextLabel} →</button>
          </div>
        </div>
      `;
    }

    if (trivia.mode === "sudden" && trivia.bestStreak >= 5) awardBadge("sudden-survivor", true);
    window.setTimeout(() => $("#triviaGame [data-trivia-next]")?.focus(), 30);
  }

  function nextTrivia() {
    const trivia = state.trivia;
    if (!trivia) return;
    if (trivia.failed) {
      finishTrivia("failed");
      return;
    }
    if (trivia.index >= trivia.items.length - 1) {
      finishTrivia("complete");
      return;
    }
    trivia.index++;
    renderTriviaQuestion();
    sfx("click");
  }

  function getRank(correct, answered) {
    const accuracy = answered ? correct / answered : 0;
    if (answered >= 5 && accuracy === 1) {
      return { title: "Legend of the Streets", text: "A clean sweep. The archive has nothing left to hide from you." };
    }
    if (accuracy >= 0.8) {
      return { title: "Mastermind", text: "Sharp instincts, steady hands, and a suspicious amount of lore in your head." };
    }
    if (accuracy >= 0.6) {
      return { title: "Wheelman", text: "You know the route. A little more time in the passenger seat and you'll be running the crew." };
    }
    if (accuracy >= 0.4) {
      return { title: "Getaway Driver", text: "Not a clean exit, but you got the car started." };
    }
    return { title: "Tourist", text: "Fresh off the bus. The city is loud, but it rewards a second pass." };
  }

  function finishTrivia(reason = "complete") {
    const trivia = state.trivia;
    if (!trivia || trivia.finished) return;
    trivia.finished = true;
    trivia.active = false;
    if (trivia.timerId) {
      window.clearInterval(trivia.timerId);
      trivia.timerId = null;
    }

    if (trivia.answered > 0) {
      const oldBest = state.stats.highScores[trivia.mode] || 0;
      trivia.newBest = trivia.score > oldBest;
      state.stats.highScores[trivia.mode] = Math.max(oldBest, trivia.score);
      state.stats.runs++;
      state.stats.bestStreak = Math.max(state.stats.bestStreak, trivia.bestStreak);
    }

    if (trivia.mode === "daily" && trivia.answered > 0) {
      const today = todayUTC();
      if (state.stats.lastDaily !== today) {
        state.stats.dailyStreak = state.stats.lastDaily === yesterdayUTC() ? state.stats.dailyStreak + 1 : 1;
        state.stats.lastDaily = today;
      }
      awardBadge("daily-driver", true);
    }

    if (trivia.answered >= 5 && trivia.correct === trivia.answered) awardBadge("perfect-signal", true);
    if (trivia.isFake && trivia.answered >= 4 && trivia.missed === 0) awardBadge("decoy-hunter", true);
    if (trivia.mode === "sudden" && trivia.bestStreak >= 5) awardBadge("sudden-survivor", true);

    saveStats();
    checkGlobalBadges();
    renderTriviaSetup();
    updateStatsUI();
    renderBadgeShelf();
    renderAboutStats();

    const accuracy = trivia.answered ? Math.round((trivia.correct / trivia.answered) * 100) : 0;
    const rank = getRank(trivia.correct, trivia.answered);
    const reasonLine = reason === "time"
      ? "The clock ran out."
      : reason === "failed"
        ? "Sudden Death caught you."
        : "Run complete.";

    const result = $("#triviaResult");
    const game = $("#triviaGame");
    game?.classList.add("hidden");
    result?.classList.remove("hidden");

    if (result) {
      result.innerHTML = `
        <article class="panel result-card">
          <div class="result-rank">${escapeHTML(MODE_LABELS[trivia.mode] || "Run")} · ${reasonLine}</div>
          <h2 class="result-title">${escapeHTML(rank.title)}</h2>
          <p class="result-sub">${escapeHTML(rank.text)}</p>
          ${trivia.newBest ? '<span class="new-best">New personal best</span>' : ""}
          <div class="result-stats">
            <div class="result-stat"><b>${trivia.score}</b><span>score</span></div>
            <div class="result-stat"><b>${trivia.correct}/${trivia.answered}</b><span>correct</span></div>
            <div class="result-stat"><b>${trivia.bestStreak}</b><span>best streak</span></div>
            <div class="result-stat"><b>${accuracy}%</b><span>accuracy</span></div>
          </div>
          <div class="result-actions">
            <button class="btn btn-primary" type="button" data-trivia-action="again">${icon("refresh")} Play again</button>
            <button class="btn btn-ghost" type="button" data-trivia-action="setup">Change setup</button>
            <button class="btn btn-quiet" type="button" data-trivia-action="share">${icon("copy")} Copy result</button>
          </div>
        </article>
      `;
    }

    if (accuracy >= 0.6) sfx("win");
    else sfx("loss");

    window.setTimeout(() => {
      $("#triviaResult .btn-primary")?.focus();
    }, 50);
  }

  function shareTriviaResult() {
    const trivia = state.trivia;
    if (!trivia) return;
    const mode = MODE_LABELS[trivia.mode] || "Run";
    const accuracy = trivia.answered ? Math.round((trivia.correct / trivia.answered) * 100) : 0;
    const rank = getRank(trivia.correct, trivia.answered);
    const text = [
      `CHANNEL SURF // ${mode}`,
      `${trivia.score} pts · ${trivia.correct}/${trivia.answered} correct · ${trivia.bestStreak} best streak · ${accuracy}% accuracy`,
      `Rank: ${rank.title}`,
      "Unofficial fan arcade — not affiliated with Rockstar Games or Take-Two."
    ].join("\n");
    copyText(text).then((ok) => {
      showToast(ok ? "<strong>Result copied.</strong> Go make it someone else's problem." : "Couldn't access the clipboard here.");
    });
  }

  function exitTrivia() {
    const trivia = state.trivia;
    if (trivia?.timerId) window.clearInterval(trivia.timerId);
    if (trivia?.forcedMorph && trivia.baseEra && trivia.baseEra !== document.documentElement.dataset.era) {
      setEra(trivia.baseEra, { persist: false, flash: false, track: false, silent: true });
    }
    state.trivia = null;
    $("#triviaSetup")?.classList.remove("hidden");
    $("#triviaGame")?.classList.add("hidden");
    const result = $("#triviaResult");
    if (result) {
      result.classList.add("hidden");
      result.innerHTML = "";
    }
    renderTriviaSetup();
    sfx("click");
  }

  /* ---------------------------------------------------------------------
     VAULT CRACKER
     --------------------------------------------------------------------- */
  const VAULT_SCENARIOS = {
    gta6: { name: "Beachfront starlet's safe", detail: "A four-digit lock behind a very expensive painting. The view is better than the security." },
    vicecity: { name: "Ocean Drive lockbox", detail: "Palm shadows, a bad alibi, and a safe that thinks it is smarter than you." },
    sanandreas: { name: "Lowrider shop safe", detail: "Hydraulics outside, paperwork inside, and four digits between you and the weekend." },
    gta5: { name: "Vinewood agent's wall safe", detail: "The contract is fake. The commission is real. The combination is somewhere in the middle." },
    gta4: { name: "Hove Beach apartment safe", detail: "Thin walls, thick door, and a neighbor who has definitely heard this before." },
    warriors: { name: "Turnstile token box", detail: "Four digits, no repeats, and a train leaving in exactly the wrong amount of time." },
    reddead: { name: "Dead man's strongbox", detail: "A lock older than the county and a debt older than the lock." },
    bully: { name: "Trophy cabinet lock", detail: "School property, questionable ethics, and a combination the faculty thought was clever." }
  };

  function generateVaultCode(seed) {
    const rng = rngFrom(seed);
    return shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], rng).slice(0, 4);
  }

  function startVault(options = {}) {
    const seed = options.seed || randomSeed();
    const era = document.documentElement.dataset.era;
    const scenario = VAULT_SCENARIOS[era] || VAULT_SCENARIOS.gta6;
    state.vault = {
      code: generateVaultCode(seed),
      input: [],
      guesses: [],
      maxTries: 6,
      solved: false,
      failed: false,
      scenario,
      era,
      seed,
      daily: Boolean(options.daily),
      message: "",
      messageTone: ""
    };
    renderVault();
    if (options.daily) showToast("<strong>Daily vault loaded.</strong> Same code for everyone until 00:00 UTC.");
  }

  function renderVaultKeypad(disabled) {
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];
    return keys.map((key) => {
      if (key === "clear") return `<button class="keypad-key is-util" type="button" data-vault-key="clear"${disabled ? " disabled" : ""}>CLR</button>`;
      if (key === "back") return `<button class="keypad-key is-util" type="button" data-vault-key="back"${disabled ? " disabled" : ""}>⌫</button>`;
      return `<button class="keypad-key" type="button" data-vault-key="${key}"${disabled ? " disabled" : ""}>${key}</button>`;
    }).join("");
  }

  function renderVault() {
    const vault = state.vault;
    if (!vault) return;
    const ended = vault.solved || vault.failed;

    const scenario = $("#vaultScenario");
    if (scenario) {
      scenario.innerHTML = `${icon("lock")}<span><strong>${escapeHTML(vault.scenario.name)}</strong> — ${escapeHTML(vault.scenario.detail)}</span>`;
    }

    const display = $("#vaultDisplay");
    if (display) {
      display.innerHTML = Array.from({ length: 4 }, (_, index) => {
        const value = vault.input[index];
        const classes = ["vault-slot"];
        if (value !== undefined) classes.push("is-filled");
        if (value === undefined && vault.input.length === index) classes.push("is-active");
        const content = value !== undefined ? value : (vault.input.length === index ? '<span class="slot-cursor"></span>' : "");
        return `<div class="${classes.join(" ")}">${content}</div>`;
      }).join("");
    }

    const keypad = $("#vaultKeypad");
    if (keypad) keypad.innerHTML = renderVaultKeypad(ended);

    const attempts = $("#vaultAttempts");
    if (attempts) attempts.textContent = ended ? (vault.solved ? "Cracked" : "Locked") : `${vault.maxTries - vault.guesses.length} tries`;

    const submit = $("#vaultSubmit");
    if (submit) submit.disabled = ended || vault.input.length !== 4;

    const status = $("#vaultStatus");
    if (status) {
      if (vault.message) {
        status.textContent = vault.message;
        status.className = `vault-status ${vault.messageTone}`;
      } else if (vault.solved) {
        status.textContent = "Vault open.";
        status.className = "vault-status is-win";
      } else if (vault.failed) {
        status.textContent = `Locked out. The code was ${vault.code.join("")}.`;
        status.className = "vault-status is-loss";
      } else {
        status.textContent = vault.input.length === 0 ? "Enter four digits to begin." : `${4 - vault.input.length} digit${4 - vault.input.length === 1 ? "" : "s"} left.`;
        status.className = "vault-status";
      }
    }

    const history = $("#vaultHistory");
    if (history) {
      if (!vault.guesses.length) {
        history.innerHTML = "";
      } else {
        history.innerHTML = vault.guesses.map((guess, index) => {
          const digits = guess.digits.map((digit, digitIndex) => {
            let cls = "miss";
            if (digit === vault.code[digitIndex]) cls = "exact";
            else if (vault.code.includes(digit)) cls = "near";
            return `<span class="guess-digit ${cls}">${digit}</span>`;
          }).join("");
          return `<div class="guess-row"><span class="guess-number">#${index + 1}</span><span class="guess-digits">${digits}</span><span class="guess-summary">${guess.exact}● ${guess.near}○</span></div>`;
        }).join("");
      }
    }
  }

  function handleVaultKey(key) {
    const vault = state.vault;
    if (!vault || vault.solved || vault.failed) return;
    if (key === "clear") {
      vault.input = [];
      vault.message = "";
      vault.messageTone = "";
      renderVault();
      sfx("click");
      return;
    }
    if (key === "back") {
      vault.input.pop();
      vault.message = "";
      vault.messageTone = "";
      renderVault();
      sfx("click");
      return;
    }
    if (/^\d$/.test(key) && vault.input.length < 4) {
      vault.input.push(Number(key));
      vault.message = "";
      vault.messageTone = "";
      renderVault();
      sfx("tick");
    }
  }

  function submitVault() {
    const vault = state.vault;
    if (!vault || vault.solved || vault.failed) return;
    if (vault.input.length !== 4) {
      vault.message = "Four digits, no shortcuts.";
      vault.messageTone = "";
      renderVault();
      sfx("wrong");
      return;
    }

    const digits = vault.input.slice();
    let exact = 0;
    let near = 0;
    digits.forEach((digit, index) => {
      if (digit === vault.code[index]) exact++;
      else if (vault.code.includes(digit)) near++;
    });
    vault.guesses.push({ digits, exact, near });

    if (exact === 4) {
      vault.solved = true;
      state.stats.vaultSolves++;
      state.stats.vaultStreak++;
      saveStats();
      awardBadge("cracked-safe");
      updatePuzzleStats();
      vault.message = `Vault open in ${vault.guesses.length} guess${vault.guesses.length === 1 ? "" : "es"}. ${vault.code.join("")}`;
      vault.messageTone = "is-win";
      sfx("unlock");
      window.setTimeout(() => sfx("win"), 130);
    } else if (vault.guesses.length >= vault.maxTries) {
      vault.failed = true;
      state.stats.vaultStreak = 0;
      saveStats();
      vault.message = `Locked out. The code was ${vault.code.join("")}.`;
      vault.messageTone = "is-loss";
      sfx("loss");
    } else {
      vault.input = [];
      vault.message = `${exact} exact · ${near} misplaced. Keep going.`;
      vault.messageTone = "";
      sfx("move");
    }

    updatePuzzleStats();
    renderVault();
  }

  function startDailyVault() {
    navigate("puzzles");
    switchPuzzleTab("vault");
    startVault({ seed: `daily-vault-${todayUTC()}`, daily: true });
  }

  /* ---------------------------------------------------------------------
     HEAT GRID
     --------------------------------------------------------------------- */
  function gridNeighbors(index, size) {
    const row = Math.floor(index / size);
    const col = index % size;
    const neighbors = [];
    if (row > 0) neighbors.push(index - size);
    if (row < size - 1) neighbors.push(index + size);
    if (col > 0) neighbors.push(index - 1);
    if (col < size - 1) neighbors.push(index + 1);
    return neighbors;
  }

  function gridDistance(cells, size, start, goal) {
    const queue = [start];
    const distances = new Map([[start, 0]]);
    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];
      if (current === goal) return distances.get(current);
      for (const next of gridNeighbors(current, size)) {
        if (!cells[next] || distances.has(next)) continue;
        distances.set(next, distances.get(current) + 1);
        queue.push(next);
      }
    }
    return Infinity;
  }

  function generateHeatGrid(levelKey = "heat") {
    const level = GRID_LEVELS[levelKey] || GRID_LEVELS.heat;
    const size = level.size;
    const total = size * size;
    const start = (size - 1) * size;
    const goal = size - 1;
    const seed = randomSeed();
    const rng = rngFrom(seed);
    const targetBlocked = Math.floor(total * level.density);

    let cells = [];
    let par = Infinity;

    for (let attempt = 0; attempt < 80; attempt++) {
      cells = Array(total).fill(true);
      let placed = 0;
      let guard = 0;
      while (placed < targetBlocked && guard < 500) {
        guard++;
        const index = Math.floor(rng() * total);
        if (index === start || index === goal || !cells[index]) continue;
        cells[index] = false;
        placed++;
      }
      par = gridDistance(cells, size, start, goal);
      if (Number.isFinite(par)) break;
    }

    if (!Number.isFinite(par)) {
      cells = Array(total).fill(true);
      par = size * 2 - 2;
    }

    state.grid = {
      level: levelKey,
      size,
      cells,
      start,
      goal,
      player: start,
      path: new Set([start]),
      moves: 0,
      par,
      solved: false,
      seed,
      message: ""
    };
    renderGrid();
  }

  function renderGrid() {
    const grid = state.grid;
    if (!grid) return;

    const difficultyRail = $("#heatDifficulties");
    if (difficultyRail) {
      difficultyRail.innerHTML = Object.entries(GRID_LEVELS).map(([key, level]) => `
        <button class="chip" type="button" data-grid-level="${key}" aria-pressed="${grid.level === key}">${level.label}</button>
      `).join("");
    }

    const board = $("#heatGrid");
    if (board) {
      board.style.setProperty("--grid-size", grid.size);
      board.innerHTML = grid.cells.map((open, index) => {
        const classes = ["heat-cell"];
        if (!open) classes.push("is-blocked");
        else classes.push("is-open");
        if (grid.path.has(index)) classes.push("is-path");
        if (index === grid.player) classes.push("is-player", "is-move");
        if (index === grid.goal) classes.push("is-goal");
        if (!grid.solved && open && gridNeighbors(grid.player, grid.size).includes(index)) classes.push("is-move");

        let inner = "";
        if (!open) inner = "";
        else if (index === grid.player && index === grid.goal) inner = icon("flag", "icon cell-icon");
        else if (index === grid.player) inner = icon("target", "icon cell-icon");
        else if (index === grid.goal) inner = icon("flag", "icon cell-icon");

        const row = Math.floor(index / grid.size) + 1;
        const col = (index % grid.size) + 1;
        const label = !open
          ? `Patrol block, row ${row}, column ${col}`
          : index === grid.goal
            ? `Safehouse, row ${row}, column ${col}`
            : `Open street, row ${row}, column ${col}`;

        return `<button class="${classes.join(" ")}" type="button" data-cell="${index}" ${(!open || grid.solved) ? "disabled" : ""} aria-label="${escapeHTML(label)}">${inner}</button>`;
      }).join("");
    }

    const moves = $("#heatMoves");
    const par = $("#heatPar");
    const tries = $("#heatTries");
    if (moves) moves.textContent = grid.moves;
    if (par) par.textContent = grid.par;
    if (tries) tries.textContent = grid.solved ? "Cleared" : `Par ${grid.par}`;

    const status = $("#heatStatus");
    if (status) {
      if (grid.message) {
        status.innerHTML = grid.message;
      } else {
        status.innerHTML = `Move orthogonally to the <strong>safehouse</strong>. Patrols block the street. Arrow keys or WASD work too.`;
      }
    }
  }

  function moveGrid(index) {
    const grid = state.grid;
    if (!grid || grid.solved) return;
    if (!grid.cells[index]) return;
    if (!gridNeighbors(grid.player, grid.size).includes(index)) {
      grid.message = "That is not a legal move. The city has rules. Mostly.";
      renderGrid();
      return;
    }

    grid.player = index;
    grid.moves++;
    grid.path.add(index);
    sfx("move");

    if (index === grid.goal) {
      grid.solved = true;
      state.stats.gridSolves++;
      if (state.stats.gridBestPar === null || grid.moves < state.stats.gridBestPar) {
        state.stats.gridBestPar = grid.moves;
      }
      saveStats();
      if (grid.moves <= grid.par) awardBadge("ghost-run");
      updatePuzzleStats();
      grid.message = `Safehouse reached in <strong>${grid.moves}</strong> moves. Par was <strong>${grid.par}</strong>. ${grid.moves <= grid.par ? "Clean line." : "Still counts."}`;
      sfx("win");
      showToast(grid.moves <= grid.par ? "<strong>Ghost Run.</strong> Par beaten without a scratch." : "<strong>Safehouse reached.</strong> The paperwork can wait.");
    } else {
      grid.message = "";
    }

    renderGrid();
  }

  function moveGridDirection(direction) {
    const grid = state.grid;
    if (!grid || grid.solved) return;
    const size = grid.size;
    const row = Math.floor(grid.player / size);
    const col = grid.player % size;
    let next = null;
    if (direction === "up" && row > 0) next = grid.player - size;
    if (direction === "down" && row < size - 1) next = grid.player + size;
    if (direction === "left" && col > 0) next = grid.player - 1;
    if (direction === "right" && col < size - 1) next = grid.player + 1;
    if (next !== null) moveGrid(next);
  }

  function resetGridRoute() {
    const grid = state.grid;
    if (!grid) return;
    grid.player = grid.start;
    grid.path = new Set([grid.start]);
    grid.moves = 0;
    grid.solved = false;
    grid.message = "";
    renderGrid();
    sfx("click");
  }

  /* ---------------------------------------------------------------------
     PUZZLE VIEW
     --------------------------------------------------------------------- */
  function updatePuzzleStats() {
    const stats = state.stats;
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set("vaultSolveCount", stats.vaultSolves);
    set("gridSolveCount", stats.gridSolves);
    set("sideVaultSolves", stats.vaultSolves);
    set("sideGridSolves", stats.gridSolves);
    set("sideVaultStreak", stats.vaultStreak);
    set("sideGridBest", stats.gridBestPar === null ? "—" : `${stats.gridBestPar} moves`);
  }

  function switchPuzzleTab(tab) {
    if (tab !== "vault" && tab !== "grid") tab = "vault";
    state.puzzleTab = tab;
    $$("[data-puzzle-tab]").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.puzzleTab === tab));
    });
    $("#vaultPanel")?.classList.toggle("hidden", tab !== "vault");
    $("#gridPanel")?.classList.toggle("hidden", tab !== "grid");
    if (tab === "vault" && !state.vault) startVault();
    if (tab === "grid") {
      if (!state.grid) generateHeatGrid("heat");
      else renderGrid();
    }
    if (tab === "vault") renderVault();
    updatePuzzleStats();
    sfx("click");
  }

  function renderPuzzleTab() {
    $$("[data-puzzle-tab]").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.puzzleTab === state.puzzleTab));
    });
    $("#vaultPanel")?.classList.toggle("hidden", state.puzzleTab !== "vault");
    $("#gridPanel")?.classList.toggle("hidden", state.puzzleTab !== "grid");
    if (state.puzzleTab === "vault") {
      if (!state.vault) startVault();
      else renderVault();
    } else {
      if (!state.grid) generateHeatGrid("heat");
      else renderGrid();
    }
    updatePuzzleStats();
  }

  function initPuzzleEvents() {
    $$("[data-puzzle-tab]").forEach((button) => {
      button.addEventListener("click", () => switchPuzzleTab(button.dataset.puzzleTab));
    });

    $("#vaultKeypad")?.addEventListener("click", (event) => {
      const key = event.target.closest("[data-vault-key]");
      if (key) handleVaultKey(key.dataset.vaultKey);
    });
    $("#vaultSubmit")?.addEventListener("click", submitVault);
    $("#vaultNew")?.addEventListener("click", () => {
      startVault();
      sfx("click");
    });
    $("#vaultDaily")?.addEventListener("click", startDailyVault);

    $("#heatDifficulties")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-grid-level]");
      if (button) generateHeatGrid(button.dataset.gridLevel);
    });

    $("#heatGrid")?.addEventListener("click", (event) => {
      const cell = event.target.closest("[data-cell]");
      if (!cell || cell.disabled) return;
      moveGrid(Number(cell.dataset.cell));
    });

    $("#gridNew")?.addEventListener("click", () => {
      generateHeatGrid(state.grid?.level || "heat");
      sfx("click");
    });
    $("#gridReset")?.addEventListener("click", resetGridRoute);

    startVault();
    generateHeatGrid("heat");
    updatePuzzleStats();
  }

  /* ---------------------------------------------------------------------
     ERA ATLAS
     --------------------------------------------------------------------- */
  function leonidaMapHTML(activeId) {
    const data = atlas.gta6;
    const pins = data.locations.map((location) => {
      const active = location.id === activeId;
      const anchor = location.x > 520 ? "end" : "start";
      const dx = anchor === "end" ? -12 : 12;
      const dy = location.y > 390 ? -16 : -10;
      return `<g class="map-pin ${active ? "is-active" : ""}" data-atlas-loc="${location.id}" tabindex="0" role="button" aria-label="Open ${escapeHTML(location.name)}">
        <circle class="pin-ring" cx="${location.x}" cy="${location.y}" r="13"/>
        <circle class="pin-dot" cx="${location.x}" cy="${location.y}" r="4.5"/>
        <text class="pin-label" x="${location.x + dx}" y="${location.y + dy}" text-anchor="${anchor}">${escapeHTML(location.name).toUpperCase()}</text>
      </g>`;
    }).join("");

    return `<svg viewBox="0 0 640 440" role="group" aria-label="Interactive stylized, unofficial fan map of the state of Leonida">
      <defs>
        <pattern id="mapgrid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0v32" fill="none" stroke="currentColor" stroke-opacity=".06" stroke-width="1"/>
        </pattern>
        <radialGradient id="seaglow" cx="50%" cy="50%">
          <stop offset="0%" stop-color="var(--accent-2)" stop-opacity=".13"/>
          <stop offset="100%" stop-color="var(--accent-2)" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect class="map-water" width="640" height="440"/>
      <rect width="640" height="440" fill="url(#mapgrid)" color="var(--muted)"/>
      <ellipse cx="430" cy="300" rx="250" ry="180" fill="url(#seaglow)"/>
      <path class="map-land" d="M92 44 250 28l50 36 90-16 75 34 40 42 70 26-32 64 37 46-32 52-56 20-30 50-76 14-42-36-74 12-52-40-60 10-26-50-44-30 22-50-38-44 32-48Z"/>
      <path class="map-land-soft" d="M548 270c18 7 30 19 27 32-4 16-22 22-34 12-10-8-8-25 7-44Z"/>
      <ellipse class="map-land-soft" cx="424" cy="404" rx="14" ry="6"/>
      <ellipse class="map-land-soft" cx="450" cy="414" rx="10" ry="5"/>
      <ellipse class="map-land-soft" cx="402" cy="418" rx="8" ry="4"/>
      <ellipse class="map-lake" cx="280" cy="210" rx="38" ry="23"/>
      <path class="map-road" d="M482 322c-63-21-135-58-200-76M482 322c-23-51-63-99-124-142M142 288c53-4 110-31 160-58M176 146c36 34 76 55 124 64M274 210c35-19 72-35 124-52"/>
      <path class="map-road" d="M142 288c5 28 2 52 20 74M482 322c-12 27-25 50-43 74M303 286c39 7 84 21 132 44"/>
      <g opacity=".48" fill="var(--muted)" font-family="var(--font-mono)" font-size="7" letter-spacing=".18em">
        <text x="42" y="388">GULF</text>
        <text x="556" y="108">ATLANTIC</text>
      </g>
      <g class="atlas-compass" transform="translate(592 376)">
        <circle cx="0" cy="0" r="19" fill="none"/>
        <path d="M0-15 4-3 0 0-4-3Z" fill="var(--accent)" stroke="none"/>
        <path d="M0 15 4 3 0 0-4 3Z"/>
        <text x="0" y="-23" text-anchor="middle">N</text>
      </g>
      <text x="320" y="428" text-anchor="middle" fill="var(--muted)" font-family="var(--font-mono)" font-size="7" letter-spacing=".14em">STYLIZED FAN ATLAS · NOT TO SCALE</text>
      ${pins}
    </svg>`;
  }

  function eraPosterArt(era) {
    const wrapper = 'viewBox="0 0 640 300" preserveAspectRatio="xMidYMid slice" role="img"';
    if (era === "vicecity") {
      return `<svg ${wrapper} aria-label="Abstract pastel Vice City skyline">
        <rect width="640" height="300" fill="var(--surface-solid)"/>
        <circle cx="490" cy="180" r="105" fill="var(--accent-3)" opacity=".2"/>
        <g fill="var(--accent)" opacity=".48"><rect x="60" y="180" width="30" height="120"/><rect x="100" y="150" width="48" height="150"/><rect x="158" y="200" width="26" height="100"/><rect x="194" y="130" width="56" height="170"/><rect x="260" y="190" width="36" height="110"/><rect x="306" y="160" width="62" height="140"/><rect x="378" y="210" width="28" height="90"/><rect x="416" y="175" width="46" height="125"/></g>
        <g fill="var(--accent-2)" opacity=".25"><rect x="90" y="230" width="440" height="2"/><rect x="130" y="245" width="360" height="2"/><rect x="60" y="260" width="500" height="2"/></g>
        <g fill="var(--accent)" opacity=".7"><path d="M556 300c-4-58 6-112 30-160" fill="none" stroke="var(--accent)" stroke-width="5"/><path d="M586 140c-42-28-74-24-104-4 40-4 72 5 95 23Z"/><path d="M586 140c10-38 38-58 75-52-28 13-47 31-56 60Z"/></g>
        <g stroke="var(--accent-2)" stroke-opacity=".3"><path d="M0 300 220 205M640 300 420 205M0 270 260 205M640 270 380 205"/></g>
      </svg>`;
    }
    if (era === "sanandreas") {
      return `<svg ${wrapper} aria-label="Abstract golden-hour San Andreas landscape">
        <rect width="640" height="300" fill="var(--surface-solid)"/>
        <circle cx="460" cy="132" r="74" fill="var(--accent)" opacity=".26"/>
        <path d="M0 210c120-55 230-40 330 20s210 30 310-24v94H0Z" fill="var(--accent)" opacity=".13"/>
        <path d="M0 246c150-42 280-24 380 10s180 20 260-20v64H0Z" fill="var(--accent-2)" opacity=".12"/>
        <g fill="var(--accent-2)" opacity=".48"><path d="M100 300c-1-42 4-80 19-115" fill="none" stroke="var(--accent-2)" stroke-width="4"/><path d="M119 185c-30-21-55-18-78-2 28-4 51 4 66 17Z"/><path d="M119 185c7-30 27-46 56-44-21 10-35 24-42 46Z"/></g>
        <path d="M0 290c140-20 260-10 380 6s190 4 260-14" fill="none" stroke="var(--accent)" stroke-opacity=".3" stroke-width="2" stroke-dasharray="12 10"/>
        <g fill="var(--ink)" opacity=".18"><rect x="360" y="220" width="120" height="28" rx="3"/><rect x="380" y="205" width="70" height="18" rx="3"/></g>
      </svg>`;
    }
    if (era === "gta5") {
      return `<svg ${wrapper} aria-label="Abstract Los Santos coastline">
        <rect width="640" height="300" fill="var(--surface-solid)"/>
        <circle cx="500" cy="120" r="80" fill="var(--accent)" opacity=".22"/>
        <path d="M0 195c120-30 230-15 340 20s210 30 300-16v101H0Z" fill="var(--accent-2)" opacity=".1"/>
        <g fill="var(--accent)" opacity=".36"><rect x="70" y="170" width="24" height="130"/><rect x="102" y="145" width="50" height="155"/><rect x="160" y="190" width="30" height="110"/><rect x="198" y="155" width="72" height="145"/><rect x="280" y="205" width="26" height="95"/><rect x="315" y="175" width="60" height="125"/></g>
        <g fill="var(--accent-2)" opacity=".6"><path d="M560 300c-8-60 0-115 24-165" fill="none" stroke="var(--accent-2)" stroke-width="5"/><path d="M584 135c-46-30-82-24-112-2 43-4 78 6 102 26Z"/><path d="M584 135c8-42 36-65 76-66-29 16-48 39-58 68Z"/></g>
        <path d="M0 282c160-12 330 8 640-12" fill="none" stroke="var(--accent-3)" stroke-opacity=".16"/>
      </svg>`;
    }
    if (era === "gta4") {
      return `<svg ${wrapper} aria-label="Abstract rainy Liberty City skyline">
        <rect width="640" height="300" fill="var(--surface-solid)"/>
        <g fill="var(--accent-2)" opacity=".22"><rect x="20" y="130" width="52" height="170"/><rect x="82" y="100" width="38" height="200"/><rect x="130" y="160" width="66" height="140"/><rect x="206" y="85" width="44" height="215"/><rect x="260" y="140" width="72" height="160"/><rect x="342" y="110" width="46" height="190"/><rect x="398" y="165" width="64" height="135"/><rect x="472" y="95" width="52" height="205"/><rect x="534" y="150" width="86" height="150"/></g>
        <g stroke="var(--accent-3)" stroke-opacity=".3" stroke-width="1"><path class="rain" d="M100 20 90 90"/><path class="rain" d="M260 40 250 110"/><path class="rain" d="M430 10 420 80"/><path class="rain" d="M560 50 550 120"/><path class="rain" d="M180 70 170 140"/><path class="rain" d="M340 80 330 150"/><path class="rain" d="M510 100 500 170"/></g>
        <rect x="0" y="260" width="640" height="40" fill="var(--accent)" opacity=".06"/>
      </svg>`;
    }
    if (era === "warriors") {
      return `<svg ${wrapper} aria-label="Abstract 1979 New York subway map">
        <rect width="640" height="300" fill="var(--surface-solid)"/>
        <g fill="none" stroke-width="4" opacity=".55">
          <path class="train-line" d="M-20 70c140 0 160 80 300 80s150-70 380-70" stroke="var(--accent)"/>
          <path class="train-line" d="M-20 150c170 0 210-70 370-70s170 100 310 100" stroke="var(--accent-2)"/>
          <path class="train-line" d="M-20 230c130 0 200 50 340 50s190-60 340-60" stroke="var(--accent-3)"/>
        </g>
        <g fill="var(--accent-3)" opacity=".28"><circle cx="145" cy="105" r="4"/><circle cx="310" cy="150" r="4"/><circle cx="480" cy="80" r="4"/><circle cx="235" cy="232" r="4"/></g>
        <g transform="translate(90 195)" fill="var(--accent-3)" opacity=".42"><rect width="190" height="46" rx="4"/><rect x="14" y="9" width="18" height="12" fill="var(--surface-solid)"/><rect x="40" y="9" width="18" height="12" fill="var(--surface-solid)"/><rect x="66" y="9" width="18" height="12" fill="var(--surface-solid)"/><rect x="14" y="29" width="150" height="3"/></g>
        <path d="M0 270h640" stroke="var(--accent)" stroke-opacity=".3" stroke-width="2"/>
      </svg>`;
    }
    if (era === "reddead") {
      return `<svg ${wrapper} aria-label="Abstract frontier landscape">
        <rect width="640" height="300" fill="var(--surface-solid)"/>
        <circle cx="470" cy="110" r="66" fill="var(--accent-3)" opacity=".22"/>
        <path d="M0 210 120 100l80 72 70-52 100 83 70-60 110 82 90-60v135H0Z" fill="var(--accent)" opacity=".1"/>
        <path d="M0 246 150 175l100 45 115-55 100 58 90-40 85 34v83H0Z" fill="var(--accent-2)" opacity=".12"/>
        <g stroke="var(--ink)" stroke-opacity=".25" stroke-width="2" fill="none"><path d="M520 300v-80m0 20-24-24m24 44 24-30m-24 10-18-30m18 18 18-22"/></g>
        <g fill="var(--accent-3)" opacity=".18"><circle cx="100" cy="250" r="2"/><circle cx="200" cy="215" r="1.5"/><circle cx="330" cy="255" r="2"/><circle cx="430" cy="220" r="1.5"/><circle cx="570" cy="245" r="2"/></g>
      </svg>`;
    }
    return `<svg ${wrapper} aria-label="Abstract Bullworth Academy facade">
      <rect width="640" height="300" fill="var(--surface-solid)"/>
      <g fill="var(--accent-2)" opacity=".13"><path d="M180 300V120c0-58 45-96 100-96s100 38 100 96v180Z"/><path d="M240 300V140c0-40 25-66 60-66s60 26 60 66v160Z" fill="none" stroke="var(--accent-2)" stroke-opacity=".2"/></g>
      <g stroke="var(--accent-2)" stroke-opacity=".2"><path d="M340 60v240M280 70v230M240 120h160M240 190h160M240 250h160"/></g>
      <g fill="var(--accent)" opacity=".35"><rect x="70" y="230" width="100" height="70"/><rect x="410" y="215" width="140" height="85"/></g>
      <g fill="var(--accent-3)" opacity=".35"><circle cx="110" cy="90" r="3"/><circle cx="520" cy="70" r="2.5"/><circle cx="560" cy="140" r="2"/></g>
      <path d="M0 280h640" stroke="var(--accent-3)" stroke-opacity=".16"/>
    </svg>`;
  }

  function renderAtlas() {
    const container = $("#atlasContent");
    if (!container) return;
    const era = document.documentElement.dataset.era;
    const data = atlas[era] || atlas.gta6;
    const locations = data.locations;
    const selected = locations.find((location) => location.id === state.atlasSelected) || locations[0];
    if (selected) state.atlasSelected = selected.id;

    const eraBar = eraOrder.map((key) => `
      <button class="chip" type="button" data-atlas-era="${key}" aria-pressed="${key === era}">${escapeHTML(eras[key].short)} · ${escapeHTML(eras[key].name)}</button>
    `).join("");

    const mapPanel = era === "gta6"
      ? `<div class="atlas-map">${leonidaMapHTML(selected.id)}</div>`
      : `<div class="atlas-art">${eraPosterArt(era)}<span class="art-caption">Fan-made vector postcard · not official art</span></div>`;

    container.innerHTML = `
      <div class="atlas-era-bar" id="atlasEraBar" role="group" aria-label="Atlas era">${eraBar}</div>
      <div class="atlas-layout">
        <section class="panel atlas-map-panel" aria-label="${escapeHTML(data.title)}">
          <div class="atlas-map-head">
            <div>
              <h3>${escapeHTML(data.title)}</h3>
              <p>${escapeHTML(data.subtitle)}</p>
            </div>
            <span class="tag">${era === "gta6" ? "Custom SVG" : "District dossier"}</span>
          </div>
          ${mapPanel}
        </section>
        <aside class="panel atlas-detail">
          <span class="detail-kicker">${escapeHTML(eras[era].name)} // ${escapeHTML(selected.kind)}</span>
          <h3>${escapeHTML(selected.name)}</h3>
          <p>${escapeHTML(selected.note)}</p>
          <div class="detail-tags">
            <span class="tag">${escapeHTML(eras[era].year)}</span>
            <span class="tag">${escapeHTML(eras[era].station)}</span>
            <span class="tag">Fan atlas</span>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" data-atlas-start="${era}" style="margin-top:1rem">
            ${icon("play")} Start a ${escapeHTML(eras[era].short)} trivia run
          </button>
        </aside>
      </div>
      <div class="district-grid" id="atlasDistrictGrid">
        ${locations.map((location, index) => `
          <button class="district-card ${location.id === selected.id ? "is-active" : ""}" type="button" data-atlas-loc="${location.id}">
            <span class="district-index">${pad2(index + 1)}</span>
            <strong>${escapeHTML(location.name)}</strong>
            <small>${escapeHTML(location.kind)}</small>
          </button>
        `).join("")}
      </div>
    `;
  }

  function initAtlasEvents() {
    const container = $("#atlasContent");
    if (!container) return;
    container.addEventListener("click", (event) => {
      const eraButton = event.target.closest("[data-atlas-era]");
      if (eraButton) {
        state.atlasSelected = null;
        setEra(eraButton.dataset.atlasEra);
        renderAtlas();
        return;
      }
      const location = event.target.closest("[data-atlas-loc]");
      if (location) {
        state.atlasSelected = location.dataset.atlasLoc;
        renderAtlas();
        sfx("click");
        return;
      }
      const start = event.target.closest("[data-atlas-start]");
      if (start) {
        const era = start.dataset.atlasStart;
        state.triviaSetup.filter = era;
        state.triviaSetup.mode = "classic";
        startTrivia("classic", era);
      }
    });

    container.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const pin = event.target.closest(".map-pin[data-atlas-loc]");
      if (!pin) return;
      event.preventDefault();
      state.atlasSelected = pin.dataset.atlasLoc;
      renderAtlas();
      sfx("click");
    });
  }

  /* ---------------------------------------------------------------------
     FRANCHISE TIMELINE
     --------------------------------------------------------------------- */
  const TIMELINE_FILTERS = ["All", "GTA", "Red Dead", "Other"];

  function renderTimeline() {
    const filterRail = $("#timelineFilters");
    const track = $("#timelineTrack");
    if (!track) return;

    if (filterRail) {
      filterRail.innerHTML = TIMELINE_FILTERS.map((filter) => `
        <button class="chip" type="button" data-timeline-filter="${filter}" aria-pressed="${state.timelineFilter === filter}">${filter}</button>
      `).join("");
    }

    const items = timeline.filter((entry) => state.timelineFilter === "All" || entry.franchise === state.timelineFilter);
    if (!items.some((entry) => entry.id === state.timelineSelected)) {
      state.timelineSelected = items[0]?.id || null;
    }

    track.innerHTML = items.map((entry) => `
      <button class="timeline-entry ${entry.id === state.timelineSelected ? "is-active" : ""}" type="button" data-timeline="${entry.id}">
        <span class="t-year">${escapeHTML(entry.year)}</span>
        <span class="t-node"></span>
        <span class="t-title">${escapeHTML(entry.title)}</span>
        <span class="t-franchise">${escapeHTML(entry.franchise)}</span>
      </button>
    `).join("");

    const count = $("#timelineCount");
    if (count) count.textContent = timeline.length;
    renderTimelineDetail();
  }

  function renderTimelineDetail() {
    const detail = $("#timelineDetail");
    if (!detail) return;
    const entry = timeline.find((item) => item.id === state.timelineSelected) || timeline[timeline.length - 1];
    if (!entry) {
      detail.innerHTML = `<div class="empty-state">No milestones in that lane.</div>`;
      return;
    }
    const themeButton = entry.theme
      ? `<button class="btn btn-ghost btn-sm" type="button" data-timeline-tune="${entry.theme}">${icon("atlas")} Tune to ${escapeHTML(eras[entry.theme]?.name || "era")}</button>`
      : `<span class="tag">No era skin for this one</span>`;

    detail.innerHTML = `
      <div class="timeline-big-year">${escapeHTML(entry.year)}</div>
      <div class="timeline-copy">
        <span class="timeline-type">${escapeHTML(entry.franchise)} // Archive entry</span>
        <h3>${escapeHTML(entry.title)}</h3>
        <p>${escapeHTML(entry.blurb)}</p>
      </div>
      ${themeButton}
    `;
  }

  function initTimelineEvents() {
    $("#timelineFilters")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-timeline-filter]");
      if (!button) return;
      state.timelineFilter = button.dataset.timelineFilter;
      renderTimeline();
      sfx("click");
    });

    $("#timelineTrack")?.addEventListener("click", (event) => {
      const entry = event.target.closest("[data-timeline]");
      if (!entry) return;
      state.timelineSelected = entry.dataset.timeline;
      $$(".timeline-entry", $("#timelineTrack")).forEach((item) => {
        item.classList.toggle("is-active", item.dataset.timeline === state.timelineSelected);
      });
      renderTimelineDetail();
      sfx("click");
    });

    $("#timelineDetail")?.addEventListener("click", (event) => {
      const tune = event.target.closest("[data-timeline-tune]");
      if (!tune) return;
      setEra(tune.dataset.timelineTune);
      showToast(`<strong>Tuned.</strong> ${escapeHTML(eras[tune.dataset.timelineTune]?.name || "Era")} signal acquired.`);
    });
  }

  /* ---------------------------------------------------------------------
     CREW & HEIST SPLITTER
     --------------------------------------------------------------------- */
  function heistMembers() {
    return state.heist.members.slice(0, state.heist.count);
  }

  function heistMath() {
    const take = Math.max(0, Number(state.heist.take) || 0);
    const cost = Math.max(0, Number(state.heist.cost) || 0);
    const pool = Math.max(0, take - cost);
    const members = heistMembers();
    const totalWeight = members.reduce((sum, member) => sum + Math.max(1, Number(member.weight) || 1), 0) || 1;

    return {
      take,
      cost,
      pool,
      members: members.map((member, index) => {
        const weight = Math.max(1, Number(member.weight) || 1);
        const share = weight / totalWeight;
        return {
          ...member,
          index,
          weight,
          share,
          payout: pool * share,
          color: CREW_COLORS[index % CREW_COLORS.length]
        };
      })
    };
  }

  function renderHeist() {
    const takeInput = $("#heistTake");
    const costInput = $("#heistCost");
    if (takeInput) takeInput.value = state.heist.take;
    if (costInput) costInput.value = state.heist.cost;

    $$("[data-crew-count]").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.crewCount) === state.heist.count);
      button.setAttribute("aria-pressed", String(Number(button.dataset.crewCount) === state.heist.count));
    });

    const list = $("#crewList");
    if (list) {
      list.innerHTML = heistMembers().map((member, index) => `
        <div class="crew-row">
          <span class="crew-role">
            <span class="crew-color" style="--crew-color:${CREW_COLORS[index % CREW_COLORS.length]}"></span>
            <input class="crew-name" type="text" value="${escapeHTML(member.name)}" data-crew-name="${index}" aria-label="Crew member ${index + 1} name">
          </span>
          <span class="crew-percent" data-crew-percent="${index}">—</span>
          <input class="crew-weight" type="range" min="1" max="10" step="1" value="${member.weight}" data-crew-weight="${index}" aria-label="Share weight for ${escapeHTML(member.name)}">
          <span class="crew-payout" data-crew-payout="${index}">—</span>
        </div>
      `).join("");
    }

    updateHeistMath();
  }

  function updateHeistMath() {
    const math = heistMath();

    math.members.forEach((member) => {
      const percent = document.querySelector(`[data-crew-percent="${member.index}"]`);
      const payout = document.querySelector(`[data-crew-payout="${member.index}"]`);
      if (percent) percent.textContent = formatPercent(member.share);
      if (payout) payout.textContent = formatMoney(member.payout);
    });

    const bar = $("#splitBar");
    if (bar) {
      bar.innerHTML = math.members.map((member) => `
        <span class="split-segment" style="width:${member.share * 100}%;--segment-color:${member.color}" title="${escapeHTML(member.name)} — ${formatPercent(member.share)}"></span>
      `).join("");
    }

    const summary = $("#splitSummary");
    if (summary) {
      summary.innerHTML = `
        <div class="summary-box"><span>Total take</span><b>${formatMoney(math.take)}</b></div>
        <div class="summary-box"><span>Prep &amp; costs</span><b>${formatMoney(math.cost)}</b></div>
        <div class="summary-box"><span>Payout pool</span><b>${formatMoney(math.pool)}</b></div>
        ${math.members.map((member) => `
          <div class="summary-box">
            <span>${escapeHTML(member.name)} · ${formatPercent(member.share)}</span>
            <b>${formatMoney(member.payout)}</b>
          </div>
        `).join("")}
      `;
    }
  }

  function setHeistCount(count) {
    const next = Math.max(1, Math.min(4, Number(count) || 1));
    state.heist.count = next;
    state.heist.members.forEach((member, index) => {
      if (!member.name) member.name = CREW_NAMES[index] || `Crew ${index + 1}`;
      if (!member.role) member.role = CREW_ROLES[index] || "Specialist";
    });
    renderHeist();
    sfx("click");
  }

  function applyHeistPreset(preset) {
    const presets = {
      even: [1, 1, 1, 1],
      leader: [5, 2, 2, 1],
      specialist: [2, 4, 4, 1]
    };
    const weights = presets[preset];
    if (!weights) return;
    state.heist.members.forEach((member, index) => {
      member.weight = weights[index];
    });
    renderHeist();
    sfx("click");
  }

  function copyHeistSummary() {
    const math = heistMath();
    const lines = [
      `CHANNEL SURF // Crew split`,
      `Total take: ${formatMoney(math.take)}`,
      `Prep & costs: ${formatMoney(math.cost)}`,
      `Payout pool: ${formatMoney(math.pool)}`,
      "",
      ...math.members.map((member) => `• ${member.name} (${member.role}) — ${formatPercent(member.share)} — ${formatMoney(member.payout)}`),
      "",
      "Unofficial fan project. Not affiliated with Rockstar Games or Take-Two."
    ];
    copyText(lines.join("\n")).then((ok) => {
      showToast(ok ? "<strong>Crew split copied.</strong> Go find a getaway car." : "Couldn't access the clipboard here.");
    });
    sfx("click");
  }

  function initHeistEvents() {
    $("#heistTake")?.addEventListener("input", (event) => {
      state.heist.take = Math.max(0, Number(event.target.value) || 0);
      updateHeistMath();
    });
    $("#heistCost")?.addEventListener("input", (event) => {
      state.heist.cost = Math.max(0, Number(event.target.value) || 0);
      updateHeistMath();
    });

    $("#crewCountRow")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-crew-count]");
      if (button) setHeistCount(button.dataset.crewCount);
    });

    const presets = $(".preset-row");
    presets?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-crew-preset]");
      if (button) applyHeistPreset(button.dataset.crewPreset);
    });

    $("#crewList")?.addEventListener("input", (event) => {
      const weight = event.target.closest("[data-crew-weight]");
      if (weight) {
        const index = Number(weight.dataset.crewWeight);
        if (state.heist.members[index]) {
          state.heist.members[index].weight = Math.max(1, Math.min(10, Number(weight.value) || 1));
          updateHeistMath();
        }
        return;
      }
      const name = event.target.closest("[data-crew-name]");
      if (name) {
        const index = Number(name.dataset.crewName);
        if (state.heist.members[index]) state.heist.members[index].name = name.value || CREW_NAMES[index];
      }
    });

    $("#heistCopy")?.addEventListener("click", copyHeistSummary);
    $("#heistReset")?.addEventListener("click", () => {
      state.heist.take = 1250000;
      state.heist.cost = 150000;
      state.heist.count = 3;
      state.heist.members = [
        { name: "You", role: "Mastermind", weight: 4 },
        { name: "Wheelman", role: "Wheelman", weight: 3 },
        { name: "Hacker", role: "Hacker", weight: 2 },
        { name: "Muscle", role: "Muscle", weight: 1 }
      ];
      renderHeist();
      sfx("click");
    });
  }

  /* ---------------------------------------------------------------------
     ABOUT / LOCAL DATA
     --------------------------------------------------------------------- */
  function renderAboutStats() {
    const stats = state.stats;
    const best = Math.max(0, ...Object.values(stats.highScores).map((value) => Number(value) || 0));
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set("aboutRuns", stats.runs);
    set("aboutCorrect", stats.totalCorrect);
    set("aboutBadges", stats.badges.length);
    set("aboutBest", best || "—");
    updatePuzzleStats();
    updateStatsUI();
  }

  function renderAbout() {
    const box = $("#aboutDisclaimer");
    if (box) box.textContent = site.disclaimer;
    renderAboutStats();
    renderBadgeShelf();
    updatePuzzleStats();
  }

  function dossierSummary() {
    const stats = state.stats;
    const best = Math.max(0, ...Object.values(stats.highScores).map((value) => Number(value) || 0));
    const earned = badges.filter((badge) => stats.badges.includes(badge.id)).map((badge) => badge.name);
    return [
      "CHANNEL SURF // Local dossier",
      `Era tuned: ${eras[state.settings.era]?.name || "GTA VI"}`,
      `Daily streak: ${stats.dailyStreak} day(s)`,
      `Runs logged: ${stats.runs}`,
      `Correct answers: ${stats.totalCorrect}`,
      `Best streak: ${stats.bestStreak}`,
      `Best score: ${best || "—"}`,
      `Eras visited: ${stats.erasSeen.length} / ${eraOrder.length}`,
      `Badges: ${earned.length ? earned.join(", ") : "none yet"}`,
      "",
      "Fan project — not affiliated with Rockstar Games or Take-Two Interactive."
    ].join("\n");
  }

  function initAboutEvents() {
    $("#copySummary")?.addEventListener("click", () => {
      copyText(dossierSummary()).then((ok) => {
        showToast(ok ? "<strong>Dossier copied.</strong> Your misspent evening, summarized." : "Couldn't access the clipboard here.");
      });
      sfx("click");
    });

    $("#resetData")?.addEventListener("click", () => {
      const okay = window.confirm("Wipe all CHANNEL SURF progress in this browser? This clears scores, streaks, badges, and era visits. It cannot be undone.");
      if (!okay) return;
      try {
        localStorage.removeItem(STORAGE.settings);
        localStorage.removeItem(STORAGE.stats);
      } catch (error) {
        /* If storage is blocked, the in-memory reset still applies. */
      }
      state.settings = { ...DEFAULT_SETTINGS };
      state.stats = {
        ...DEFAULT_STATS,
        highScores: { ...DEFAULT_STATS.highScores },
        badges: [],
        erasSeen: []
      };
      state.vault = null;
      state.grid = null;
      state.trivia = null;
      setEra(DEFAULT_SETTINGS.era, { persist: false, flash: false, track: false, silent: true });
      trackEra(DEFAULT_SETTINGS.era);
      renderHome();
      renderTriviaSetup();
      renderHeist();
      renderBadgeShelf();
      renderAboutStats();
      updatePuzzleStats();
      showToast("<strong>Local data wiped.</strong> The city has forgotten you. For now.");
      sfx("click");
    });
  }

  /* ---------------------------------------------------------------------
     KEYBOARD CONTROLS
     --------------------------------------------------------------------- */
  function isTypingTarget(target) {
    if (!target) return false;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
  }

  function initKeyboard() {
    document.addEventListener("keydown", (event) => {
      const typing = isTypingTarget(event.target);
      const trivia = state.trivia && state.trivia.active ? state.trivia : null;

      if (event.key === "Escape" && trivia) {
        event.preventDefault();
        exitTrivia();
        return;
      }

      if (typing) return;

      if (trivia) {
        const number = Number(event.key);
        if (!trivia.feedback && number >= 1 && number <= 4) {
          event.preventDefault();
          handleTriviaAnswer(number - 1);
          return;
        }
        const letter = event.key.toLowerCase();
        const letterIndex = ["a", "b", "c", "d"].indexOf(letter);
        if (!trivia.feedback && letterIndex >= 0) {
          event.preventDefault();
          handleTriviaAnswer(letterIndex);
          return;
        }
        if (trivia.feedback && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          nextTrivia();
          return;
        }
      }

      if (state.currentView === "puzzles" && state.puzzleTab === "grid" && state.grid) {
        const map = {
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
          w: "up",
          s: "down",
          a: "left",
          d: "right"
        };
        const direction = map[event.key] || map[event.key.toLowerCase()];
        if (direction) {
          event.preventDefault();
          moveGridDirection(direction);
        }
      }
    });
  }

  /* ---------------------------------------------------------------------
     BOOT (deferred until the helpers above exist)
     --------------------------------------------------------------------- */
  window.addEventListener("DOMContentLoaded", init);
})();
