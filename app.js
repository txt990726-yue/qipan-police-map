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

const homeView = document.querySelector("#home-view");
const mapView = document.querySelector("#map-view");
const activeMap = document.querySelector("#active-map");
const screenTitle = document.querySelector("#screen-title");
const mapSubtitle = document.querySelector("#map-subtitle");
const backButton = document.querySelector(".back-button");
const fullscreenButtons = document.querySelectorAll(".fullscreen-button");
const hotspotShapes = document.querySelector("#hotspot-shapes");
const mapLabels = document.querySelector("#map-labels");
const regionButtons = document.querySelector("#region-buttons");
const directorPanel = document.querySelector("#director-panel");
const scrim = document.querySelector("#scrim");
const closeButton = document.querySelector(".close-button");
const panelMapName = document.querySelector("#panel-map-name");
const panelTitle = document.querySelector("#panel-title");
const directorCard = document.querySelector("#director-card");

let currentMap = null;

function showHome() {
  currentMap = null;
  homeView.hidden = false;
  mapView.hidden = true;
  closePanel();
}

function showMap(mapId) {
  currentMap = maps[mapId];
  homeView.hidden = true;
  mapView.hidden = false;
  screenTitle.textContent = currentMap.title;
  mapSubtitle.textContent = currentMap.subtitle;
  activeMap.src = currentMap.image;
  activeMap.alt = `${currentMap.title}示意图`;
  renderRegions();
  closePanel();
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
      shape.addEventListener("click", () => openRegion(region.id));
      shape.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openRegion(region.id);
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
    button.addEventListener("click", () => openRegion(region.id));
    regionButtons.appendChild(button);
  });
}

function openRegion(regionId) {
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
  directorCard.innerHTML = renderDirector(director);
  directorPanel.hidden = false;
  scrim.hidden = false;
}

function renderDirector(person) {
  const photo = person.photo
    ? `<img src="${person.photo}" alt="${person.name}照片" />`
    : `<span>照片</span>`;

  return `
    <div class="director-photo">${photo}</div>
    <div class="director-info">
      <h3>${person.name}</h3>
      <dl class="info-list">
        <div><dt>职务</dt><dd>${person.role}</dd></div>
        <div><dt>电话</dt><dd>${person.phone}</dd></div>
        <div><dt>负责区域</dt><dd>${person.area}</dd></div>
      </dl>
    </div>
  `;
}

function closePanel() {
  directorPanel.hidden = true;
  scrim.hidden = true;
  document.querySelectorAll(".hotspot").forEach((shape) => shape.classList.remove("is-active"));
  document.querySelectorAll(".region-button").forEach((button) => button.classList.remove("is-active"));
}

homeView.addEventListener("click", (event) => {
  const card = event.target.closest("[data-map]");
  if (card) {
    showMap(card.dataset.map);
  }
});

backButton.addEventListener("click", showHome);
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
    if (currentMap) {
      showHome();
    }
  }
});
