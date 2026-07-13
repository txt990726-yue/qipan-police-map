const state = {
  token: sessionStorage.getItem("qipanPortableAdminToken") || "",
  active: "site",
  site: null,
  regions: null,
  personnel: null,
  dirty: {
    site: false,
    regions: false,
    personnel: false
  },
  filters: {
    regionsMap: "town",
    regionsSearch: "",
    personnelSearch: "",
    personnelLevel: "all",
    personnelPhone: "all",
    personnelPhoto: "all"
  },
  highlightId: ""
};

const titles = {
  site: "首页文案",
  regions: "辖区负责人",
  personnel: "组织架构人员"
};

const loginView = document.querySelector("#login-view");
const adminShell = document.querySelector("#admin-shell");
const loginForm = document.querySelector("#login-form");
const loginUsername = document.querySelector("#login-username");
const loginPassword = document.querySelector("#login-password");
const loginMessage = document.querySelector("#login-message");
const navItems = document.querySelectorAll(".nav-item");
const pageTitle = document.querySelector("#page-title");
const editor = document.querySelector("#editor");
const statusBar = document.querySelector("#status");
const saveButton = document.querySelector("#save-button");
const reloadButton = document.querySelector("#reload-button");
const logoutButton = document.querySelector("#logout-button");
const drawerLayer = document.querySelector("#drawer-layer");
const drawerMask = document.querySelector("#drawer-mask");
const drawer = document.querySelector("#drawer");

function setStatus(message, isError = false) {
  statusBar.textContent = message;
  statusBar.classList.toggle("is-error", Boolean(isError));
}

function setLoginMessage(message, isError = false) {
  loginMessage.textContent = message;
  loginMessage.classList.toggle("is-error", Boolean(isError));
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || `请求失败：${response.status}`);
  }
  return data;
}

function create(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function markDirty(section = state.active) {
  state.dirty[section] = true;
  setStatus("有未保存修改，请点击保存当前页。");
}

function clearDirty(section) {
  state.dirty[section] = false;
}

function isMissing(value) {
  const text = String(value || "").trim();
  return !text || text === "待录入" || text === "-";
}

function safeText(value, fallback = "") {
  return String(value ?? fallback);
}

function normalizeMembers(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/[、，,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePhotoPath(value) {
  return String(value || "").trim();
}

function normalizePerson(person = {}, fallback = {}) {
  return {
    role: safeText(person.role || fallback.role || person.title || fallback.title || ""),
    name: safeText(person.name || fallback.name || "待录入"),
    phone: safeText(person.phone || fallback.phone || ""),
    area: safeText(person.area || fallback.area || ""),
    duty: safeText(person.duty || fallback.duty || ""),
    photo: normalizePhotoPath(person.photo || fallback.photo || ""),
    members: normalizeMembers(person.members?.length ? person.members : fallback.members)
  };
}

function hasPersonContent(person) {
  return [
    person.role,
    person.name,
    person.phone,
    person.area,
    person.duty,
    person.photo,
    normalizeMembers(person.members).join("")
  ].some((value) => !isMissing(value));
}

function getRegionPeople(region = {}) {
  const fallback = region.director || {};
  const list = Array.isArray(region.directors) && region.directors.length ? region.directors : [fallback];
  return list.map((person) => normalizePerson(person, fallback));
}

function setRegionPeople(region, people) {
  const cleaned = people.map((person) => normalizePerson(person)).filter(hasPersonContent);
  if (!cleaned.length) {
    cleaned.push({
      role: "负责人",
      name: "待录入",
      phone: "",
      area: region.name || "",
      duty: "",
      photo: "",
      members: []
    });
  }
  region.directors = cleaned;
  region.director = { ...cleaned[0] };
}

function getPositionPeople(position = {}) {
  const fallback = {
    role: position.role || position.title,
    title: position.title,
    name: position.name,
    phone: position.phone,
    duty: position.duty,
    photo: position.photo,
    members: position.members
  };
  const list = Array.isArray(position.people) && position.people.length ? position.people : [fallback];
  return list.map((person) => normalizePerson(person, fallback));
}

function setPositionPeople(position, people) {
  const cleaned = people.map((person) => normalizePerson(person, { role: position.title })).filter(hasPersonContent);
  if (!cleaned.length) {
    cleaned.push({
      role: position.title || "岗位人员",
      name: "待录入",
      phone: "",
      area: "",
      duty: "",
      photo: "",
      members: []
    });
  }
  position.people = cleaned;
  const primary = cleaned[0];
  position.name = primary.name || "待录入";
  position.phone = primary.phone || "";
  position.photo = primary.photo || "";
  position.duty = primary.duty || "";
  position.members = normalizeMembers(primary.members);
}

function personNames(people) {
  const names = people.map((person) => person.name).filter((name) => !isMissing(name));
  if (!names.length) {
    return "待录入";
  }
  return names.slice(0, 3).join("、") + (names.length > 3 ? `等${names.length}人` : "");
}

function phoneSummary(people) {
  const phones = people.map((person) => person.phone).filter((phone) => !isMissing(phone));
  return phones.length ? phones.slice(0, 2).join("、") + (phones.length > 2 ? "..." : "") : "";
}

function photoSummary(people) {
  const uploaded = people.filter((person) => person.photo).length;
  return { uploaded, total: people.length || 1 };
}

function peopleSearchValues(people) {
  return people.map((person) => [
    person.role,
    person.name,
    person.phone,
    person.area,
    person.duty,
    normalizeMembers(person.members)
  ]);
}

function peopleEditor(initialPeople, options = {}) {
  const people = (initialPeople?.length ? initialPeople : [normalizePerson({}, options.defaultPerson)]).map((person) => ({
    ...normalizePerson(person, options.defaultPerson),
    members: normalizeMembers(person.members).join("、")
  }));
  const wrap = create("div", "people-editor");

  const addPerson = () => {
    people.push({
      role: options.defaultRole || options.defaultPerson?.role || "",
      name: "待录入",
      phone: "",
      area: options.defaultArea || "",
      duty: options.defaultDuty || "",
      photo: "",
      members: ""
    });
    render();
  };

  const removePerson = (index) => {
    if (people.length <= 1) {
      setStatus("至少保留 1 个人员信息。", true);
      return;
    }
    people.splice(index, 1);
    render();
  };

  function render() {
    wrap.innerHTML = "";
    const head = create("div", "people-editor-head");
    head.append(
      create("div", "", options.title || "人员信息"),
      lightButton(iconText("+", options.addText || "新增人员"), addPerson)
    );
    wrap.append(head);

    people.forEach((person, index) => {
      const card = create("section", "people-editor-card");
      const cardHead = create("div", "people-editor-card-head");
      cardHead.append(
        create("strong", "", `${String(index + 1).padStart(2, "0")} ${person.name || "待录入"}`),
        dangerButton("删除此人", () => removePerson(index), "compact-danger")
      );

      const grid = create("div", "people-editor-grid");
      grid.append(
        field("职务", person.role, (value) => (person.role = value), {
          dirty: false,
          placeholder: options.defaultRole || "例如：社区主任 / 组长"
        }),
        field("姓名", person.name, (value) => (person.name = value), { dirty: false }),
        field("电话", person.phone, (value) => (person.phone = value), { dirty: false }),
        field(options.areaLabel || "负责区域/职责", person[options.areaKey || "area"] || "", (value) => {
          person[options.areaKey || "area"] = value;
        }, { multiline: true, dirty: false })
      );

      if (options.showMembers) {
        grid.append(
          field("组员", person.members, (value) => (person.members = value), {
            multiline: true,
            dirty: false,
            placeholder: "多个姓名用顿号、逗号或换行分隔"
          })
        );
      }

      card.append(
        cardHead,
        grid,
        photoField("照片", person.photo, (value) => (person.photo = value), { dirty: false })
      );
      wrap.append(card);
    });
  }

  render();
  return {
    node: wrap,
    getPeople() {
      return people.map((person) => ({
        ...person,
        members: normalizeMembers(person.members)
      }));
    }
  };
}

function searchText(values) {
  return values
    .flat()
    .filter((value) => value !== undefined && value !== null)
    .join(" ")
    .toLowerCase();
}

function field(label, value, onInput, options = {}) {
  const wrap = create("label", `field ${options.className || ""}`.trim());
  wrap.append(create("span", "", label));

  let input;
  if (options.type === "select") {
    input = document.createElement("select");
    (options.options || []).forEach((item) => {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      input.append(option);
    });
  } else if (options.multiline) {
    input = document.createElement("textarea");
  } else {
    input = document.createElement("input");
    input.type = options.inputType || "text";
  }

  input.value = value || "";
  input.placeholder = options.placeholder || "";
  input.disabled = Boolean(options.disabled);
  input.addEventListener("input", () => {
    onInput(input.value);
    if (options.dirty !== false) {
      markDirty(options.section || state.active);
    }
  });
  input.addEventListener("change", () => {
    onInput(input.value);
    if (options.dirty !== false) {
      markDirty(options.section || state.active);
    }
  });
  wrap.append(input);
  return wrap;
}

function sectionTitle(title, action, eyebrow = "") {
  const head = create("div", "section-title");
  const text = create("div");
  if (eyebrow) {
    text.append(create("p", "section-eyebrow", eyebrow));
  }
  text.append(create("h2", "", title));
  head.append(text);
  if (action) {
    head.append(action);
  }
  return head;
}

function lightButton(text, onClick, className = "") {
  const button = create("button", `light-button ${className}`.trim(), text);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function primaryButton(text, onClick, className = "") {
  const button = create("button", `primary-button ${className}`.trim(), text);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function dangerButton(text, onClick, className = "") {
  const button = create("button", `danger-button ${className}`.trim(), text);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function iconText(icon, text) {
  return `${icon} ${text}`;
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function photoField(label, currentPath, onChange, options = {}) {
  const wrap = create("div", `field ${options.className || ""}`.trim());
  wrap.append(create("span", "", label));
  const row = create("div", "photo-row");
  const preview = create("div", "photo-preview");

  const setPreview = (path) => {
    preview.innerHTML = "";
    if (path) {
      const image = document.createElement("img");
      image.src = path;
      image.alt = "照片";
      preview.append(image);
    } else {
      preview.textContent = "照片";
    }
  };

  setPreview(currentPath);

  const controls = create("div", "list");
  const pathInput = document.createElement("input");
  pathInput.value = currentPath || "";
  pathInput.placeholder = "assets/photos/xxx.jpg";
  pathInput.addEventListener("input", () => {
    const next = pathInput.value.trim();
    onChange(next);
    setPreview(next);
    if (options.dirty !== false) {
      markDirty(options.section || state.active);
    }
  });

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.addEventListener("change", async () => {
    if (!fileInput.files?.[0]) {
      return;
    }
    try {
      setStatus("正在上传照片...");
      const dataUrl = await fileToDataUrl(fileInput.files[0]);
      const result = await api("/api/upload-photo", {
        method: "POST",
        body: JSON.stringify({ filename: fileInput.files[0].name, dataUrl })
      });
      pathInput.value = result.path;
      onChange(result.path);
      setPreview(result.path);
      setStatus("照片已上传。保存后前台即可显示。");
      if (options.dirty !== false) {
        markDirty(options.section || state.active);
      }
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  controls.append(pathInput, fileInput);
  row.append(preview, controls);
  wrap.append(row);
  return wrap;
}

function openDrawer(title, subtitle, body, footer) {
  drawer.innerHTML = "";
  const head = create("div", "drawer-head");
  const text = create("div");
  text.append(create("h2", "", title));
  if (subtitle) {
    text.append(create("p", "", subtitle));
  }
  const closeButton = lightButton("关闭", closeDrawer, "drawer-close");
  head.append(text, closeButton);

  const content = create("div", "drawer-body");
  content.append(body);

  const actions = create("div", "drawer-actions");
  if (Array.isArray(footer)) {
    actions.append(...footer);
  } else {
    actions.append(footer);
  }

  drawer.append(head, content, actions);
  drawerLayer.hidden = false;
  drawer.querySelector("input, textarea, select, button")?.focus();
}

function closeDrawer() {
  drawerLayer.hidden = true;
  drawer.innerHTML = "";
}

drawerMask.addEventListener("click", closeDrawer);

function renderSite() {
  const data = state.site;
  editor.innerHTML = "";
  editor.append(sectionTitle("第一页简介与大屏文案", null, "首页文案"));

  const intro = data.intro || (data.intro = {});
  const basicCard = create("div", "card form-card");
  basicCard.append(sectionTitle("基本文案"));
  const basicGrid = create("div", "grid");
  basicGrid.append(
    field("单位名称", intro.agency, (value) => (intro.agency = value)),
    field("大标题", intro.headline, (value) => (intro.headline = value)),
    field("小标题", intro.eyebrow, (value) => (intro.eyebrow = value)),
    field("简介标题", intro.title, (value) => (intro.title = value)),
    field("进入按钮文字", intro.nextButton, (value) => (intro.nextButton = value))
  );
  basicCard.append(basicGrid);
  editor.append(basicCard);

  const paragraphs = intro.paragraphs || (intro.paragraphs = []);
  const paragraphCard = create("div", "card form-card");
  paragraphCard.append(sectionTitle("简介段落", lightButton("新增段落", () => {
    paragraphs.push("");
    markDirty("site");
    renderSite();
  })));
  paragraphs.forEach((text, index) => {
    const row = create("div", "inline-editor-row");
    row.append(
      field(`段落 ${index + 1}`, text, (value) => (paragraphs[index] = value), { multiline: true }),
      dangerButton("删除", () => {
        paragraphs.splice(index, 1);
        markDirty("site");
        renderSite();
      })
    );
    paragraphCard.append(row);
  });
  editor.append(paragraphCard);

  const stats = intro.stats || (intro.stats = []);
  const statsCard = create("div", "card form-card");
  statsCard.append(sectionTitle("关键数据", lightButton("新增数据", () => {
    stats.push({ value: "", label: "" });
    markDirty("site");
    renderSite();
  })));
  stats.forEach((item, index) => {
    const row = create("div", "inline-editor-row inline-editor-row-3");
    row.append(
      field("数值", item.value, (value) => (item.value = value)),
      field("说明", item.label, (value) => (item.label = value)),
      dangerButton("删除", () => {
        stats.splice(index, 1);
        markDirty("site");
        renderSite();
      })
    );
    statsCard.append(row);
  });
  editor.append(statsCard);

  const area = data.area || (data.area = {});
  const structure = data.structure || (data.structure = {});
  const pageCard = create("div", "card form-card");
  pageCard.append(sectionTitle("页面入口文字"));
  const pageGrid = create("div", "grid");
  pageGrid.append(
    field("辖区页眉", area.kicker, (value) => (area.kicker = value)),
    field("辖区页标题", area.title, (value) => (area.title = value)),
    field("辖区页说明", area.description, (value) => (area.description = value), { multiline: true }),
    field("组织架构页眉", structure.kicker, (value) => (structure.kicker = value)),
    field("组织架构标题", structure.title, (value) => (structure.title = value)),
    field("组织架构说明", structure.description, (value) => (structure.description = value), { multiline: true })
  );
  pageCard.append(pageGrid);
  editor.append(pageCard, saveStrip("保存首页文案", () => saveActive()));
}

function renderRegions() {
  const data = state.regions;
  editor.innerHTML = "";
  const addActions = create("div", "actions-row");
  addActions.append(primaryButton(iconText("+", "保存辖区负责人"), () => saveActive()));
  editor.append(sectionTitle("镇区 / 农牧区与负责人", addActions, "辖区负责人"));

  const tabs = create("div", "segmented");
  [
    { key: "town", label: "镇区辖区" },
    { key: "rural", label: "农牧区辖区" }
  ].forEach((item) => {
    const button = create("button", item.key === state.filters.regionsMap ? "is-active" : "", item.label);
    button.type = "button";
    button.addEventListener("click", () => {
      state.filters.regionsMap = item.key;
      renderRegions();
    });
    tabs.append(button);
  });
  editor.append(tabs);

  const mapKey = state.filters.regionsMap;
  const map = data[mapKey] || (data[mapKey] = { title: "", subtitle: "", image: "", cardMeta: "", regions: [] });

  const meta = create("div", "card compact-card");
  meta.append(sectionTitle("入口卡片配置"));
  const metaGrid = create("div", "grid grid-4");
  metaGrid.append(
    field("入口标题", map.title, (value) => (map.title = value), { section: "regions" }),
    field("入口副标题", map.subtitle, (value) => (map.subtitle = value), { section: "regions" }),
    field("卡片说明", map.cardMeta, (value) => (map.cardMeta = value), { section: "regions" }),
    field("地图图片路径", map.image, (value) => (map.image = value), { section: "regions" })
  );
  meta.append(metaGrid);
  editor.append(meta);

  const toolbar = create("div", "toolbar-card");
  toolbar.append(
    quickInput("搜索社区、姓名、电话", state.filters.regionsSearch, (value) => {
      state.filters.regionsSearch = value;
      renderRegions();
    }),
    lightButton("重置", () => {
      state.filters.regionsSearch = "";
      renderRegions();
    })
  );
  editor.append(toolbar);

  const rows = (map.regions || []).filter((region) => {
    const people = getRegionPeople(region);
    const keyword = state.filters.regionsSearch.trim().toLowerCase();
    if (!keyword) {
      return true;
    }
    return searchText([region.name, peopleSearchValues(people)]).includes(keyword);
  });

  const table = tableCard(["区域名称", "负责人", "电话", "照片", "操作"]);
  rows.forEach((region) => {
    const people = getRegionPeople(region);
    const photos = photoSummary(people);
    const tr = create("tr");
    tr.append(
      cell(strongText(region.name || "未命名区域")),
      cell(strongText(`${personNames(people)}（${people.length}人）`)),
      cell(phoneSummary(people) || mutedText("待完善")),
      cell(statusPill(`${photos.uploaded}/${photos.total} 已传`, photos.uploaded ? "ok" : "warn")),
      actionCell([
        lightButton("编辑人员", () => openRegionDrawer(mapKey, region)),
      ])
    );
    table.querySelector("tbody").append(tr);
  });
  if (!rows.length) {
    table.querySelector("tbody").append(emptyRow(5, "没有匹配的辖区负责人。"));
  }
  editor.append(table);
}

function getPersonnelEntries() {
  const organization = state.personnel.organization || (state.personnel.organization = []);
  const entries = [];
  organization.forEach((level, levelIndex) => {
    const positions = level.positions || (level.positions = []);
    positions.forEach((position, positionIndex) => {
      entries.push({ level, levelIndex, position, positionIndex });
    });
  });
  return entries;
}

function renderPersonnel() {
  const data = state.personnel;
  const organization = data.organization || (data.organization = []);
  editor.innerHTML = "";

  const headerActions = create("div", "actions-row");
  headerActions.append(
    lightButton("编辑当前层级", () => {
      const level = resolveActiveLevel();
      if (level) {
        openLevelDrawer(level);
      }
    }),
    primaryButton(iconText("+", "新增岗位"), () => openPersonnelDrawer())
  );
  editor.append(sectionTitle("组织架构与岗位分工", headerActions, "组织架构人员"));

  const entries = getPersonnelEntries();
  const levelCount = organization.length;
  const allPeople = entries.flatMap((item) => getPositionPeople(item.position));
  const missingPhone = allPeople.filter((person) => isMissing(person.phone)).length;
  const memberCount = allPeople.reduce((sum, person) => sum + normalizeMembers(person.members).length, 0);
  const metrics = create("div", "metric-grid");
  [
    ["岗位总数", `${entries.length} 个`, "blue"],
    ["层级数量", `${levelCount} 个`, "green"],
    ["待完善电话", `${missingPhone} 个`, "orange"],
    ["组员数量", `${memberCount} 人`, "purple"]
  ].forEach(([label, value, tone]) => {
    const card = create("div", `metric-card ${tone}`);
    card.append(create("span", "", label), create("strong", "", value));
    metrics.append(card);
  });
  editor.append(metrics);

  const levelOptions = [
    { value: "all", label: "全部层级" },
    ...organization.map((level) => ({ value: level.id, label: level.title || "未命名层级" }))
  ];
  const toolbar = create("div", "toolbar-card toolbar-grid");
  toolbar.append(
    quickInput("搜索层级、岗位、姓名、电话、职责、组员", state.filters.personnelSearch, (value) => {
      state.filters.personnelSearch = value;
      renderPersonnel();
    }),
    quickSelect(state.filters.personnelLevel, levelOptions, (value) => {
      state.filters.personnelLevel = value;
      renderPersonnel();
    }),
    quickSelect(state.filters.personnelPhone, [
      { value: "all", label: "全部电话" },
      { value: "missing", label: "仅缺电话" },
      { value: "filled", label: "已填电话" }
    ], (value) => {
      state.filters.personnelPhone = value;
      renderPersonnel();
    }),
    quickSelect(state.filters.personnelPhoto, [
      { value: "all", label: "全部照片" },
      { value: "missing", label: "仅缺照片" },
      { value: "filled", label: "已传照片" }
    ], (value) => {
      state.filters.personnelPhoto = value;
      renderPersonnel();
    }),
    lightButton("重置", () => {
      state.filters.personnelSearch = "";
      state.filters.personnelLevel = "all";
      state.filters.personnelPhone = "all";
      state.filters.personnelPhoto = "all";
      renderPersonnel();
    })
  );
  editor.append(toolbar);

  const filtered = entries.filter((entry) => {
    const { level, position } = entry;
    const people = getPositionPeople(position);
    if (state.filters.personnelLevel !== "all" && level.id !== state.filters.personnelLevel) {
      return false;
    }
    if (state.filters.personnelPhone === "missing" && !people.some((person) => isMissing(person.phone))) {
      return false;
    }
    if (state.filters.personnelPhone === "filled" && !people.every((person) => !isMissing(person.phone))) {
      return false;
    }
    if (state.filters.personnelPhoto === "missing" && !people.some((person) => !person.photo)) {
      return false;
    }
    if (state.filters.personnelPhoto === "filled" && !people.every((person) => person.photo)) {
      return false;
    }
    const keyword = state.filters.personnelSearch.trim().toLowerCase();
    if (!keyword) {
      return true;
    }
    return searchText([
      level.title,
      level.subtitle,
      position.title,
      peopleSearchValues(people)
    ]).includes(keyword);
  });

  const table = tableCard(["序号", "层级", "岗位", "姓名", "电话", "照片", "操作"]);
  filtered.forEach((entry, index) => {
    const { level, position } = entry;
    const people = getPositionPeople(position);
    const photos = photoSummary(people);
    const tr = create("tr");
    if (state.highlightId && position.id === state.highlightId) {
      tr.classList.add("is-highlight");
    }
    tr.append(
      cell(String(index + 1), "index-cell"),
      cell(statusPill(level.title || "未命名层级", "level")),
      cell(position.title || "未命名岗位"),
      cell(strongText(`${personNames(people)}（${people.length}人）`)),
      cell(phoneSummary(people) || mutedText("待完善")),
      cell(statusPill(`${photos.uploaded}/${photos.total} 已传`, photos.uploaded ? "ok" : "warn")),
      actionCell([
        lightButton("编辑人员", () => openPersonnelDrawer(entry)),
        dangerButton("删除", () => deletePersonnel(entry))
      ])
    );
    table.querySelector("tbody").append(tr);
  });
  if (!filtered.length) {
    table.querySelector("tbody").append(emptyRow(7, "没有匹配的岗位人员。"));
  }
  editor.append(table);
}

function tableCard(headers) {
  const wrap = create("div", "table-card");
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    tr.append(th);
  });
  thead.append(tr);
  table.append(thead, document.createElement("tbody"));
  wrap.append(table);
  return wrap;
}

function cell(content, className = "") {
  const td = document.createElement("td");
  if (className) {
    td.className = className;
  }
  if (content instanceof Node) {
    td.append(content);
  } else {
    td.textContent = content || "";
  }
  return td;
}

function actionCell(buttons) {
  const wrap = create("div", "table-actions");
  buttons.forEach((button) => wrap.append(button));
  return cell(wrap);
}

function emptyRow(colspan, text) {
  const tr = create("tr");
  const td = cell(text, "empty-cell");
  td.colSpan = colspan;
  tr.append(td);
  return tr;
}

function strongText(text) {
  return create("strong", "strong-text", text);
}

function mutedText(text) {
  return create("span", "muted-text", text);
}

function statusPill(text, tone = "level") {
  return create("span", `status-pill ${tone}`, text);
}

function quickInput(placeholder, value, onInput) {
  const input = document.createElement("input");
  input.className = "quick-control quick-input";
  input.placeholder = placeholder;
  input.value = value || "";
  input.addEventListener("input", () => onInput(input.value));
  return input;
}

function quickSelect(value, options, onChange) {
  const select = document.createElement("select");
  select.className = "quick-control";
  options.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    select.append(option);
  });
  select.value = value;
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

function saveStrip(text, onClick) {
  const strip = create("div", "save-strip");
  strip.append(
    create("span", "", "保存后刷新大屏即可看到最新内容。"),
    primaryButton(text, () => onClick().catch((error) => setStatus(error.message, true)))
  );
  return strip;
}

function resolveActiveLevel() {
  const organization = state.personnel.organization || [];
  if (state.filters.personnelLevel !== "all") {
    return organization.find((level) => level.id === state.filters.personnelLevel) || organization[0];
  }
  return organization[0];
}

function openLevelDrawer(level) {
  const draft = {
    title: level.title || "",
    subtitle: level.subtitle || "",
    tone: level.tone || ""
  };
  const form = create("div", "drawer-form");
  form.append(
    field("层级标题", draft.title, (value) => (draft.title = value), { dirty: false }),
    field("层级说明", draft.subtitle, (value) => (draft.subtitle = value), { dirty: false }),
    field("色彩标识", draft.tone, (value) => (draft.tone = value), { dirty: false })
  );
  openDrawer("编辑层级", "修改后会同步影响前台组织架构标题。", form, [
    lightButton("取消", closeDrawer),
    primaryButton("保存层级", async () => {
      level.title = draft.title;
      level.subtitle = draft.subtitle;
      level.tone = draft.tone;
      await saveSection("personnel", "层级已保存。");
      closeDrawer();
      renderPersonnel();
    })
  ]);
}

function openPersonnelDrawer(entry) {
  const organization = state.personnel.organization || [];
  const isEdit = Boolean(entry);
  const currentLevelId = entry?.level?.id || (state.filters.personnelLevel !== "all" ? state.filters.personnelLevel : organization[0]?.id || "");
  const draft = {
    id: entry?.position?.id || `position-${Date.now()}`,
    levelId: currentLevelId,
    title: entry?.position?.title || ""
  };
  const peopleForm = peopleEditor(getPositionPeople(entry?.position || { title: draft.title }), {
    title: "岗位人员",
    addText: "新增人员",
    defaultRole: draft.title,
    defaultPerson: { role: draft.title, duty: entry?.position?.duty || "" },
    areaLabel: "岗位职责",
    areaKey: "duty",
    showMembers: true
  });
  const form = create("div", "drawer-form");
  form.append(
    field("所属层级", draft.levelId, (value) => (draft.levelId = value), {
      type: "select",
      dirty: false,
      options: organization.map((level) => ({ value: level.id, label: level.title || "未命名层级" }))
    }),
    field("岗位名称", draft.title, (value) => (draft.title = value), {
      dirty: false,
      placeholder: "例如：案件办理一组 / 乌珠尔社区"
    }),
    peopleForm.node
  );

  openDrawer(isEdit ? "编辑岗位人员" : "新增岗位人员", "保存后会立即写入本机数据，不用再滑到页面顶部。", form, [
    lightButton("取消", closeDrawer),
    primaryButton(isEdit ? "保存修改" : "新增并保存", async () => {
      const targetLevel = organization.find((level) => level.id === draft.levelId) || organization[0];
      if (!targetLevel) {
        setStatus("请先在 personnel.json 中保留至少一个层级。", true);
        return;
      }

      const nextPosition = {
        id: draft.id,
        title: draft.title || "未命名岗位"
      };
      setPositionPeople(nextPosition, peopleForm.getPeople().map((person) => ({
        ...person,
        role: person.role || draft.title || "岗位人员"
      })));

      if (isEdit) {
        const sourceLevel = entry.level;
        if (sourceLevel.id === targetLevel.id) {
          sourceLevel.positions[entry.positionIndex] = nextPosition;
        } else {
          sourceLevel.positions.splice(entry.positionIndex, 1);
          targetLevel.positions = targetLevel.positions || [];
          targetLevel.positions.push(nextPosition);
        }
      } else {
        targetLevel.positions = targetLevel.positions || [];
        targetLevel.positions.push(nextPosition);
      }

      state.filters.personnelLevel = targetLevel.id;
      state.highlightId = nextPosition.id;
      await saveSection("personnel", isEdit ? "岗位人员已保存。" : "新岗位已保存，并已定位到当前层级。");
      closeDrawer();
      renderPersonnel();
    })
  ]);
}

async function deletePersonnel(entry) {
  const label = `${entry.position.title || "岗位"} / ${entry.position.name || "待录入"}`;
  if (!confirm(`确定删除 ${label} 吗？`)) {
    return;
  }
  entry.level.positions.splice(entry.positionIndex, 1);
  await saveSection("personnel", "岗位已删除并保存。");
  renderPersonnel();
}

function openRegionDrawer(mapKey, region) {
  const draft = {
    name: region.name || ""
  };
  const peopleForm = peopleEditor(getRegionPeople(region), {
    title: "负责人信息",
    addText: "新增负责人",
    defaultRole: mapKey === "town" ? "社区主任" : "负责人",
    defaultArea: region.name || "",
    defaultPerson: {
      role: mapKey === "town" ? "社区主任" : "负责人",
      area: region.name || ""
    },
    areaLabel: "负责区域",
    areaKey: "area"
  });
  const form = create("div", "drawer-form");
  form.append(
    field("区域名称", draft.name, (value) => (draft.name = value), { dirty: false }),
    peopleForm.node
  );
  openDrawer("编辑辖区负责人", mapKey === "town" ? "镇区社区负责人信息" : "农牧区负责人信息", form, [
    lightButton("取消", closeDrawer),
    primaryButton("保存负责人", async () => {
      region.name = draft.name;
      setRegionPeople(region, peopleForm.getPeople().map((person) => ({
        ...person,
        role: person.role || (mapKey === "town" ? "社区主任" : "负责人"),
        area: person.area || draft.name
      })));
      await saveSection("regions", "辖区负责人已保存。");
      closeDrawer();
      renderRegions();
    })
  ]);
}

async function saveSection(section, message) {
  setStatus("正在保存...");
  await api(`/api/content/${section}`, {
    method: "PUT",
    body: JSON.stringify({ data: state[section] })
  });
  clearDirty(section);
  setStatus(message || "保存成功。请刷新大屏查看最新效果。");
}

function render() {
  pageTitle.textContent = titles[state.active];
  navItems.forEach((item) => item.classList.toggle("is-active", item.dataset.section === state.active));
  if (state.active === "site") {
    renderSite();
  } else if (state.active === "regions") {
    renderRegions();
  } else {
    renderPersonnel();
  }
}

async function loadAll() {
  setStatus("正在读取本机数据...");
  const [site, regions, personnel] = await Promise.all([
    api("/api/content/site"),
    api("/api/content/regions"),
    api("/api/content/personnel")
  ]);
  state.site = site.data;
  state.regions = regions.data;
  state.personnel = personnel.data;
  state.dirty.site = false;
  state.dirty.regions = false;
  state.dirty.personnel = false;
  setStatus("数据已读取。可以搜索、筛选、打开抽屉编辑。");
  render();
}

async function saveActive() {
  await saveSection(state.active, "保存成功。请刷新大屏查看最新效果。");
}

async function logout() {
  try {
    if (state.token) {
      await api("/api/logout", { method: "POST", body: JSON.stringify({}) });
    }
  } catch {}
  state.token = "";
  sessionStorage.removeItem("qipanPortableAdminToken");
  loginUsername.value = "";
  loginPassword.value = "";
  setLoginMessage("");
  adminShell.hidden = true;
  loginView.hidden = false;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoginMessage("正在验证...");
  try {
    const result = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({
        username: loginUsername.value.trim(),
        password: loginPassword.value
      })
    });
    state.token = result.token;
    sessionStorage.setItem("qipanPortableAdminToken", state.token);
    loginView.hidden = true;
    adminShell.hidden = false;
    await loadAll();
  } catch (error) {
    setLoginMessage(error.message, true);
    loginPassword.value = "";
    loginPassword.focus();
  }
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    state.active = item.dataset.section;
    render();
  });
});

saveButton.addEventListener("click", () => {
  saveActive().catch((error) => setStatus(error.message, true));
});

reloadButton.addEventListener("click", () => {
  loadAll().catch((error) => setStatus(error.message, true));
});

logoutButton.addEventListener("click", () => {
  logout();
});

if (state.token) {
  loginView.hidden = true;
  adminShell.hidden = false;
  loadAll().catch(() => {
    sessionStorage.removeItem("qipanPortableAdminToken");
    state.token = "";
    adminShell.hidden = true;
    loginView.hidden = false;
  });
}

window.addEventListener("pageshow", () => {
  if (!state.token) {
    loginUsername.value = "";
    loginPassword.value = "";
  }
});
