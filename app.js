const maps = {
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

let currentMap = null;
let currentPage = "intro";

function getPersonnelData() {
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
  const photo = person.photo
    ? `<img src="${person.photo}" alt="${person.name || person.title}照片" />`
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
