let maps = {
  town: {
    title: "镇区辖区",
    subtitle: "请选择社区",
    image: "assets/town-map.jpg",
    regions: [
      {
        id: "qipan",
        name: "棋盘社区",
        color: "teal",
        labels: [{ x: 71, y: 42 }],
        shapes: [
          "320,395 650,265 965,315 1105,350 1070,575 860,615 740,530 560,490",
          "1085,350 1265,390 1310,555 1260,730 1080,690",
          "1185,720 1330,690 1340,820 1190,850"
        ],
        director: {
          role: "社区主任",
          name: "待录入",
          phone: "待录入",
          area: "棋盘社区辖区",
          photo: ""
        }
      },
      {
        id: "wuzhu",
        name: "乌珠尔社区",
        color: "green",
        labels: [{ x: 37, y: 49 }],
        shapes: [
          "145,485 300,430 525,470 590,575 535,760 370,800 275,735",
          "585,455 795,560 760,690 585,650",
          "455,695 735,720 705,840 510,840"
        ],
        director: {
          role: "社区主任",
          name: "待录入",
          phone: "待录入",
          area: "乌珠尔社区辖区",
          photo: ""
        }
      },
      {
        id: "jingan",
        name: "靖安社区",
        color: "orange",
        labels: [{ x: 63, y: 56 }],
        shapes: [
          "790,600 1000,565 1110,650 1045,785 870,785",
          "1035,700 1315,745 1295,850 1110,870"
        ],
        director: {
          role: "社区主任",
          name: "待录入",
          phone: "待录入",
          area: "靖安社区辖区",
          photo: ""
        }
      },
      {
        id: "aili",
        name: "艾力社区",
        color: "blue",
        labels: [{ x: 50, y: 69 }],
        shapes: [
          "475,820 690,805 765,930 650,1010 500,960",
          "710,755 945,760 935,910 755,940"
        ],
        director: {
          role: "社区主任",
          name: "待录入",
          phone: "待录入",
          area: "艾力社区辖区",
          photo: ""
        }
      },
      {
        id: "qixiang",
        name: "棋祥社区",
        color: "purple",
        labels: [{ x: 57, y: 83 }],
        shapes: ["725,900 1040,880 1245,965 1185,1125 875,1155 735,1040"],
        director: {
          role: "社区主任",
          name: "待录入",
          phone: "待录入",
          area: "棋祥社区辖区",
          photo: ""
        }
      }
    ]
  },
  rural: {
    title: "农牧区辖区",
    subtitle: "请选择区域",
    image: "assets/rural-map.jpg",
    regions: [
      {
        id: "rural-all",
        name: "农牧区整体辖区",
        color: "red",
        labels: [{ x: 53, y: 42 }],
        shapes: [
          "305,425 505,310 645,215 905,210 1090,300 1510,395 1355,525 1120,505 965,670 990,1030 700,1070 545,985 405,1045 315,815"
        ],
        director: {
          role: "负责人",
          name: "待录入",
          phone: "待录入",
          area: "农牧区整体辖区",
          photo: ""
        }
      }
    ]
  }
};

const introView = document.querySelector("#intro-view");
const homeView = document.querySelector("#home-view");
const mapView = document.querySelector("#map-view");
const structureView = document.querySelector("#structure-view");
const activeMap = document.querySelector("#active-map");
const screenTitle = document.querySelector("#screen-title");
const mapSubtitle = document.querySelector("#map-subtitle");
const backButton = document.querySelector(".back-button");
const structureBackButton = document.querySelector(".structure-back-button");
const pageTargets = document.querySelectorAll("[data-page-target]");
const pageTabs = document.querySelectorAll(".page-tab[data-page-target]");
const pageNav = document.querySelector(".page-tabs");
const adminLink = document.querySelector(".page-tab--admin");
const fullscreenButtons = document.querySelectorAll(".fullscreen-button");
const hotspotShapes = document.querySelector("#hotspot-shapes");
const mapLabels = document.querySelector("#map-labels");
const regionButtons = document.querySelector("#region-buttons");
const pyramid = document.querySelector("#pyramid");
const directorPanel = document.querySelector("#director-panel");
const scrim = document.querySelector("#scrim");
const closeButton = document.querySelector(".close-button");
const panelMapName = document.querySelector("#panel-map-name");
const panelTitle = document.querySelector("#panel-title");
const directorCard = document.querySelector("#director-card");
const cardPreviewImages = document.querySelectorAll(".jurisdiction-card img");
const deferredBackdropImages = document.querySelectorAll(".backdrop-photo[data-src]");
const adminLoginPanel = document.querySelector("#admin-login-panel");
const adminLoginScrim = document.querySelector("#admin-login-scrim");
const adminLoginForm = document.querySelector("#admin-login-form");
const adminLoginClose = document.querySelector("#admin-login-close");
const adminLoginEmail = document.querySelector("#admin-login-email");
const adminLoginPassword = document.querySelector("#admin-login-password");
const adminLoginMessage = document.querySelector("#admin-login-message");

let currentMap = null;
let currentPage = "intro";
let remotePersonnelData = null;
let deferredAssetsScheduled = false;

const nocobaseConfig = {
  enabled: false,
  collection: "qipanContents",
  ...(window.QIPAN_NOCOBASE_CONFIG || {})
};

const CONTENT_VERSION = "20260711";
const NOCOBASE_TIMEOUT_MS = 1800;
const NOCOBASE_CONTENT_CACHE_KEY = "qipanNocobaseContentCache";
const ADMIN_EMAIL_CACHE_KEY = "qipanAdminEmail";
const ADMIN_TOKEN_KEYS = ["qipanNocobaseToken", "qipan-content-admin-token", "qipan-personnel-admin-token"];

function shouldUseNocoBase() {
  return Boolean(
    nocobaseConfig.enabled &&
      nocobaseConfig.apiBase &&
      nocobaseConfig.email &&
      nocobaseConfig.password &&
      ["localhost", "127.0.0.1", ""].includes(window.location.hostname)
  );
}

function normalizePath(value) {
  if (!value || typeof value !== "string") {
    return value;
  }
  const path = value.trim();
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }
  if (/^\/?storage\//.test(path) && nocobaseConfig.apiBase) {
    const base = nocobaseConfig.apiBase.replace(/\/api\/?$/, "/");
    return new URL(path.replace(/^\/?/, "/"), base).href;
  }
  return path.replace(/^\/+/, "");
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value) {
    element.textContent = value;
  }
}

function configureAdminLink() {
  if (!adminLink) {
    return;
  }

  if (shouldUseNocoBase()) {
    const base = nocobaseConfig.apiBase.replace(/\/api\/?$/, "/");
    adminLink.href = new URL("dist/codex/content-admin.html?v=20260711-login", base).href;
    adminLink.title = "打开本机 NocoBase 内容后台";
    return;
  }

  adminLink.href = "https://app.pagescms.org";
  adminLink.title = "打开 Pages CMS 线上内容后台";
}

function setAdminLoginMessage(message, isError = false) {
  if (!adminLoginMessage) {
    return;
  }
  adminLoginMessage.textContent = message || "";
  adminLoginMessage.classList.toggle("is-error", Boolean(isError));
}

function openAdminLogin(event) {
  if (!shouldUseNocoBase()) {
    return;
  }
  event.preventDefault();
  closePanel();
  setAdminLoginMessage("");
  adminLoginPanel.hidden = false;
  adminLoginScrim.hidden = false;
  adminLoginEmail.value = sessionStorage.getItem(ADMIN_EMAIL_CACHE_KEY) || "";
  adminLoginPassword.value = "";
  window.setTimeout(() => (adminLoginEmail.value ? adminLoginPassword : adminLoginEmail).focus(), 40);
}

function closeAdminLogin() {
  if (!adminLoginPanel || adminLoginPanel.hidden) {
    return;
  }
  adminLoginPanel.hidden = true;
  adminLoginScrim.hidden = true;
  setAdminLoginMessage("");
  adminLoginPassword.value = "";
}

async function signInForAdmin(email, password) {
  const response = await fetch(`${nocobaseConfig.apiBase}auth:signIn`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  const result = await response.json().catch(() => ({}));
  const token = result?.data?.token;
  if (!response.ok || !token) {
    throw new Error(result?.errors?.[0]?.message || result?.message || "账号或密码不正确");
  }
  ADMIN_TOKEN_KEYS.forEach((key) => sessionStorage.setItem(key, token));
  sessionStorage.setItem(ADMIN_EMAIL_CACHE_KEY, email);
  return token;
}

async function handleAdminLoginSubmit(event) {
  event.preventDefault();
  if (!shouldUseNocoBase()) {
    return;
  }
  const submitButton = adminLoginForm.querySelector("button[type='submit']");
  const email = adminLoginEmail.value.trim();
  const password = adminLoginPassword.value;
  submitButton.disabled = true;
  setAdminLoginMessage("正在验证管理员身份...");
  try {
    await signInForAdmin(email, password);
    setAdminLoginMessage("登录成功，正在进入后台...");
    window.location.href = adminLink.href;
  } catch (error) {
    setAdminLoginMessage(error.message || "登录失败，请检查账号密码", true);
    adminLoginPassword.focus();
  } finally {
    submitButton.disabled = false;
  }
}

function runWhenIdle(callback, timeout = 1200) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }
  window.setTimeout(callback, Math.min(timeout, 800));
}

function hydrateImage(image, nextSrc = image?.dataset.src) {
  const src = normalizePath(nextSrc);
  if (!image || !src || image.dataset.loadedSrc === src) {
    return;
  }

  image.classList.remove("is-loaded");
  image.addEventListener(
    "load",
    () => {
      image.dataset.loadedSrc = src;
      image.classList.add("is-loaded");
    },
    { once: true }
  );
  image.dataset.src = src;
  image.src = src;
}

function setDeferredImage(image, src) {
  const nextSrc = normalizePath(src);
  if (!image || !nextSrc) {
    return;
  }
  image.dataset.src = nextSrc;
  if (image.dataset.loadedSrc && image.dataset.loadedSrc !== nextSrc) {
    hydrateImage(image, nextSrc);
  }
}

function hydrateCardPreviewImages() {
  cardPreviewImages.forEach((image) => hydrateImage(image));
}

function scheduleDeferredAssets() {
  if (deferredAssetsScheduled) {
    return;
  }
  deferredAssetsScheduled = true;
  runWhenIdle(() => {
    deferredBackdropImages.forEach((image) => hydrateImage(image));
    hydrateCardPreviewImages();
  });
}

function renderStats(containerSelector, stats = []) {
  const container = document.querySelector(containerSelector);
  if (!container || !stats.length) {
    return;
  }
  container.innerHTML = "";
  stats.forEach((item) => {
    const stat = document.createElement("span");
    const value = document.createElement("strong");
    value.textContent = item.value;
    stat.append(value, item.label);
    container.appendChild(stat);
  });
}

async function loadJson(path) {
  try {
    const response = await fetch(`${path}?v=${CONTENT_VERSION}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

async function requestNocoBase(path, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), NOCOBASE_TIMEOUT_MS);
  try {
    const response = await fetch(`${nocobaseConfig.apiBase}${path}`, {
      ...options,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    if (!response.ok) {
      throw new Error(`NocoBase request failed: ${response.status}`);
    }
    return response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

async function getNocoBaseToken() {
  const cached = sessionStorage.getItem("qipanNocobaseToken");
  if (cached) {
    return cached;
  }

  const result = await requestNocoBase("auth:signIn", {
    method: "POST",
    body: JSON.stringify({
      email: nocobaseConfig.email,
      password: nocobaseConfig.password
    })
  });
  const token = result?.data?.token;
  if (!token) {
    throw new Error("NocoBase token missing");
  }
  sessionStorage.setItem("qipanNocobaseToken", token);
  return token;
}

async function loadNocoBaseContent() {
  if (!shouldUseNocoBase()) {
    return null;
  }

  try {
    const token = await getNocoBaseToken();
    const result = await requestNocoBase(`${nocobaseConfig.collection}:list?pageSize=50&sort=id`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Role": "root"
      }
    });
    const content = {};
    (result?.data || []).forEach((record) => {
      if (!record.slug || !record.payload) {
        return;
      }
      try {
        content[record.slug] = JSON.parse(record.payload);
      } catch {}
    });
    if (content.site || content.regions || content.personnel) {
      return content;
    }
  } catch (error) {
    sessionStorage.removeItem("qipanNocobaseToken");
    console.warn("NocoBase content unavailable, falling back to JSON files.", error);
  }

  return null;
}

function applySiteContent(site) {
  if (!site) {
    return;
  }

  setText("#intro-agency", site.intro?.agency);
  setText("#intro-headline", site.intro?.headline);
  setText("#intro-eyebrow", site.intro?.eyebrow);
  setText("#intro-title", site.intro?.title);
  setText("#intro-next-button", site.intro?.nextButton);

  const paragraphs = document.querySelector("#intro-paragraphs");
  if (paragraphs && Array.isArray(site.intro?.paragraphs) && site.intro.paragraphs.length) {
    paragraphs.innerHTML = "";
    site.intro.paragraphs.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      paragraphs.appendChild(paragraph);
    });
  }
  renderStats("#intro-stats", site.intro?.stats);

  setText("#area-kicker", site.area?.kicker);
  setText("#area-title", site.area?.title);
  setText("#area-description", site.area?.description);

  setText("#structure-kicker", site.structure?.kicker);
  setText("#structure-title", site.structure?.title);
  setText("#structure-eyebrow", site.structure?.eyebrow);
  setText("#structure-heading", site.structure?.heading);
  setText("#structure-description", site.structure?.description);
  renderStats("#structure-stats", site.structure?.stats);
}

function applyRegionContent(regionContent) {
  if (!regionContent) {
    return;
  }

  Object.entries(regionContent).forEach(([mapId, editableMap]) => {
    const map = maps[mapId];
    if (!map) {
      return;
    }

    map.title = editableMap.title || map.title;
    map.subtitle = editableMap.subtitle || map.subtitle;
    map.image = normalizePath(editableMap.image) || map.image;

    const editableRegions = Array.isArray(editableMap.regions) ? editableMap.regions : [];
    editableRegions.forEach((editableRegion) => {
      const region = map.regions.find((item) => item.id === editableRegion.id);
      if (!region) {
        return;
      }
      region.name = editableRegion.name || region.name;
      region.director = {
        ...region.director,
        ...editableRegion.director,
        photo: normalizePath(editableRegion.director?.photo || region.director.photo)
      };
    });

    const card = document.querySelector(`[data-map="${mapId}"]`);
    if (card) {
      const title = card.querySelector(".card-title");
      const meta = card.querySelector(".card-meta");
      const image = card.querySelector("img");
      if (title) {
        title.textContent = map.title;
      }
      if (meta && editableMap.cardMeta) {
        meta.textContent = editableMap.cardMeta;
      }
      if (image) {
        setDeferredImage(image, map.image);
        image.alt = `${map.title}图预览`;
      }
    }
  });
}

async function loadStaticContent() {
  const [site, regions, personnel] = await Promise.all([
    loadJson("content/site.json"),
    loadJson("content/regions.json"),
    loadJson("content/personnel.json")
  ]);
  return { site, regions, personnel };
}

function readCachedNocoBaseContent() {
  try {
    const stored = localStorage.getItem(NOCOBASE_CONTENT_CACHE_KEY);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored);
    return parsed?.content || null;
  } catch {
    return null;
  }
}

function cacheNocoBaseContent(content) {
  try {
    localStorage.setItem(
      NOCOBASE_CONTENT_CACHE_KEY,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        content
      })
    );
  } catch {}
}

function applyEditableContentBundle(content, source) {
  if (!content) {
    return;
  }
  document.documentElement.dataset.contentSource = source;
  applySiteContent(content.site);
  applyRegionContent(content.regions);
  if (content.personnel?.organization) {
    remotePersonnelData = content.personnel;
    if (!structureView.hidden) {
      renderPyramid();
    }
  }
}

async function syncNocoBaseContent() {
  const nocobaseContent = await loadNocoBaseContent();
  if (!nocobaseContent) {
    return;
  }
  cacheNocoBaseContent(nocobaseContent);
  applyEditableContentBundle(nocobaseContent, "nocobase");
}

async function loadEditableContent() {
  const cachedContent = shouldUseNocoBase() ? readCachedNocoBaseContent() : null;
  if (cachedContent) {
    applyEditableContentBundle(cachedContent, "cache");
  } else {
    applyEditableContentBundle(await loadStaticContent(), "json");
  }

  scheduleDeferredAssets();

  if (shouldUseNocoBase()) {
    syncNocoBaseContent();
  }
}

function getPersonnelData() {
  if (remotePersonnelData) {
    return remotePersonnelData;
  }
  try {
    const stored = localStorage.getItem("qipanPersonnelData");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return window.DEFAULT_PERSONNEL_DATA;
}

function setActiveTab(page) {
  currentPage = page;
  pageTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.pageTarget === page);
  });
}

function showIntro() {
  currentMap = null;
  introView.hidden = false;
  homeView.hidden = true;
  mapView.hidden = true;
  structureView.hidden = true;
  pageNav.hidden = false;
  setActiveTab("intro");
  closePanel();
}

function showHome() {
  currentMap = null;
  introView.hidden = true;
  homeView.hidden = false;
  mapView.hidden = true;
  structureView.hidden = true;
  pageNav.hidden = false;
  setActiveTab("area");
  hydrateCardPreviewImages();
  closePanel();
}

function showMap(mapId) {
  currentMap = maps[mapId];
  introView.hidden = true;
  homeView.hidden = true;
  mapView.hidden = false;
  structureView.hidden = true;
  pageNav.hidden = true;
  setActiveTab("area");
  screenTitle.textContent = currentMap.title;
  mapSubtitle.textContent = currentMap.subtitle;
  activeMap.src = currentMap.image;
  activeMap.alt = `${currentMap.title}示意图`;
  renderRegions();
  closePanel();
}

function showStructure() {
  introView.hidden = true;
  homeView.hidden = true;
  mapView.hidden = true;
  structureView.hidden = false;
  pageNav.hidden = false;
  setActiveTab("structure");
  renderPyramid();
  closePanel();
}

function showPage(page) {
  if (page === "intro") {
    showIntro();
    return;
  }
  if (page === "structure") {
    showStructure();
    return;
  }
  showHome();
}

function renderRegions() {
  hotspotShapes.innerHTML = "";
  mapLabels.innerHTML = "";
  regionButtons.innerHTML = "";

  currentMap.regions.forEach((region, index) => {
    region.shapes.forEach((points) => {
      const shape = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      shape.setAttribute("points", points);
      shape.setAttribute("class", "hotspot");
      shape.setAttribute("tabindex", "0");
      shape.setAttribute("role", "button");
      shape.setAttribute("aria-label", region.name);
      shape.dataset.regionId = region.id;
      shape.addEventListener("click", () => openMapRegion(region.id));
      shape.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openMapRegion(region.id);
        }
      });
      hotspotShapes.appendChild(shape);
    });

    region.labels.forEach((label) => {
      const badge = document.createElement("div");
      badge.className = `region-label region-label--${region.color}`;
      badge.textContent = region.name;
      badge.style.left = `${label.x}%`;
      badge.style.top = `${label.y}%`;
      mapLabels.appendChild(badge);
    });

    const button = document.createElement("button");
    button.className = "region-button";
    button.type = "button";
    button.dataset.regionId = region.id;
    button.innerHTML = `${region.name}<span>${String(index + 1).padStart(2, "0")} / 点击查看主任信息</span>`;
    button.addEventListener("click", () => openMapRegion(region.id));
    regionButtons.appendChild(button);
  });
}

function renderPyramid() {
  const data = getPersonnelData();
  pyramid.innerHTML = "";

  data.organization.forEach((level, levelIndex) => {
    const levelEl = document.createElement("section");
    levelEl.className = `pyramid-level pyramid-level--${level.tone}`;
    levelEl.style.setProperty("--level-index", levelIndex);

    const header = document.createElement("div");
    header.className = "pyramid-level__header";
    header.innerHTML = `<span>${level.subtitle}</span><strong>${level.title}</strong>`;
    levelEl.appendChild(header);

    const positions = document.createElement("div");
    positions.className = "pyramid-positions";

    level.positions.forEach((position) => {
      const button = document.createElement("button");
      button.className = "position-node";
      button.type = "button";
      button.dataset.positionId = position.id;
      button.innerHTML = `
        <span>${position.title}</span>
        <strong>${position.name || "待录入"}</strong>
      `;
      button.addEventListener("click", () => openPosition(level, position));
      positions.appendChild(button);
    });

    levelEl.appendChild(positions);
    pyramid.appendChild(levelEl);
  });
}

function openMapRegion(regionId) {
  const region = currentMap.regions.find((item) => item.id === regionId);
  const director = region.director;

  document.querySelectorAll(".hotspot").forEach((shape) => {
    shape.classList.toggle("is-active", shape.dataset.regionId === regionId);
  });
  document.querySelectorAll(".region-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.regionId === regionId);
  });

  panelMapName.textContent = currentMap.title;
  panelTitle.textContent = region.name;
  directorCard.innerHTML = renderPersonCard(director, { areaLabel: "负责区域", area: director.area });
  directorPanel.hidden = false;
  scrim.hidden = false;
}

function openPosition(level, position) {
  document.querySelectorAll(".position-node").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.positionId === position.id);
  });

  panelMapName.textContent = level.title;
  panelTitle.textContent = position.title;
  directorCard.innerHTML = renderPersonCard(position, {
    areaLabel: "岗位职责",
    area: position.duty,
    members: position.members
  });
  directorPanel.hidden = false;
  scrim.hidden = false;
}

function renderPersonCard(person, options = {}) {
  const photoUrl = normalizePath(person.photo);
  const photo = photoUrl
    ? `<img src="${photoUrl}" alt="${person.name || person.title}照片" />`
    : `<span>照片</span>`;
  const phone = person.phone || "待录入";
  const name = person.name || "待录入";
  const duty = options.area || person.duty || person.area || "待录入";
  const members = options.members?.length
    ? `<div><dt>组员</dt><dd>${options.members.join("、")}</dd></div>`
    : "";

  return `
    <div class="director-photo">${photo}</div>
    <div class="director-info">
      <h3>${name}</h3>
      <dl class="info-list">
        <div><dt>职务</dt><dd>${person.role || person.title || "待录入"}</dd></div>
        <div><dt>电话</dt><dd>${phone}</dd></div>
        <div><dt>${options.areaLabel || "负责区域"}</dt><dd>${duty}</dd></div>
        ${members}
      </dl>
    </div>
  `;
}

function closePanel() {
  directorPanel.hidden = true;
  scrim.hidden = true;
  document.querySelectorAll(".hotspot").forEach((shape) => shape.classList.remove("is-active"));
  document.querySelectorAll(".region-button").forEach((button) => button.classList.remove("is-active"));
  document.querySelectorAll(".position-node").forEach((button) => button.classList.remove("is-active"));
}

homeView.addEventListener("click", (event) => {
  const card = event.target.closest("[data-map]");
  if (card) {
    showMap(card.dataset.map);
  }
});

pageTargets.forEach((target) => {
  target.addEventListener("click", (event) => {
    const page = event.currentTarget.dataset.pageTarget;
    if (page) {
      showPage(page);
    }
  });
});

backButton.addEventListener("click", showHome);
structureBackButton.addEventListener("click", showHome);
closeButton.addEventListener("click", closePanel);
scrim.addEventListener("click", closePanel);
adminLink.addEventListener("click", openAdminLogin);
adminLoginForm.addEventListener("submit", handleAdminLoginSubmit);
adminLoginClose.addEventListener("click", closeAdminLogin);
adminLoginScrim.addEventListener("click", closeAdminLogin);

fullscreenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      return;
    }
    document.exitFullscreen?.();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!directorPanel.hidden) {
      closePanel();
      return;
    }
    if (!adminLoginPanel.hidden) {
      closeAdminLogin();
      return;
    }
    if (!introView.hidden) {
      return;
    }
    if (!homeView.hidden) {
      showIntro();
      return;
    }
    showHome();
  }
});

configureAdminLink();
loadEditableContent();
