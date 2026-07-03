const form = document.querySelector("#admin-form");
const sectionNav = document.querySelector("#admin-section-nav");
const saveLocalButton = document.querySelector("#save-local");
const resetLocalButton = document.querySelector("#reset-local");
const exportButton = document.querySelector("#export-js");

let personnelData = loadData();

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function loadData() {
  try {
    const stored = localStorage.getItem("qipanPersonnelData");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return cloneData(window.DEFAULT_PERSONNEL_DATA);
}

function renderForm() {
  form.innerHTML = "";
  sectionNav.innerHTML = "";
  personnelData.organization.forEach((level, levelIndex) => {
    const navLink = document.createElement("a");
    navLink.href = `#admin-section-${level.id}`;
    navLink.innerHTML = `<span>${String(levelIndex + 1).padStart(2, "0")}</span>${level.title}`;
    sectionNav.appendChild(navLink);

    const section = document.createElement("section");
    section.className = "admin-section";
    section.id = `admin-section-${level.id}`;
    section.innerHTML = `<h2>${level.title}<span>${level.subtitle}</span></h2>`;

    level.positions.forEach((position, positionIndex) => {
      const card = document.createElement("article");
      card.className = "admin-person-card";
      card.innerHTML = `
        <div class="admin-card-head">
          <span>${String(positionIndex + 1).padStart(2, "0")}</span>
          <strong>${position.title || "岗位"}</strong>
        </div>
        <div class="admin-photo-preview">${position.photo ? `<img src="${position.photo}" alt="${position.name}照片" />` : "<span>照片</span>"}</div>
        <div class="admin-fields">
          <label>岗位<input data-field="title" data-level="${levelIndex}" data-position="${positionIndex}" value="${escapeAttr(position.title || "")}" /></label>
          <label>姓名<input data-field="name" data-level="${levelIndex}" data-position="${positionIndex}" value="${escapeAttr(position.name || "")}" /></label>
          <label>电话<input data-field="phone" data-level="${levelIndex}" data-position="${positionIndex}" value="${escapeAttr(position.phone || "")}" placeholder="待录入" /></label>
          <label>职责<textarea data-field="duty" data-level="${levelIndex}" data-position="${positionIndex}">${position.duty || ""}</textarea></label>
          <label>组员<textarea data-field="members" data-level="${levelIndex}" data-position="${positionIndex}" placeholder="多个姓名用顿号、逗号或换行分隔">${(position.members || []).join("、")}</textarea></label>
          <label class="admin-file-field">照片<input type="file" accept="image/*" data-field="photo" data-level="${levelIndex}" data-position="${positionIndex}" /></label>
        </div>
      `;
      section.appendChild(card);
    });

    form.appendChild(section);
  });
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function updateFromInput(input) {
  const level = personnelData.organization[Number(input.dataset.level)];
  const position = level.positions[Number(input.dataset.position)];
  const field = input.dataset.field;

  if (field === "members") {
    position.members = input.value
      .split(/[、,，\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
    return;
  }

  if (field !== "photo") {
    position[field] = input.value.trim();
  }
}

form.addEventListener("input", (event) => {
  const input = event.target.closest("[data-field]");
  if (input && input.type !== "file") {
    updateFromInput(input);
  }
});

form.addEventListener("change", (event) => {
  const input = event.target.closest('input[type="file"][data-field="photo"]');
  if (!input || !input.files?.[0]) {
    return;
  }

  const level = personnelData.organization[Number(input.dataset.level)];
  const position = level.positions[Number(input.dataset.position)];
  const reader = new FileReader();
  reader.onload = () => {
    position.photo = reader.result;
    renderForm();
  };
  reader.readAsDataURL(input.files[0]);
});

saveLocalButton.addEventListener("click", () => {
  localStorage.setItem("qipanPersonnelData", JSON.stringify(personnelData));
  alert("已保存到当前浏览器。回到大屏页面刷新即可预览。");
});

resetLocalButton.addEventListener("click", () => {
  if (!confirm("确定恢复默认数据吗？当前浏览器保存的修改会被清除。")) {
    return;
  }
  localStorage.removeItem("qipanPersonnelData");
  personnelData = cloneData(window.DEFAULT_PERSONNEL_DATA);
  renderForm();
});

exportButton.addEventListener("click", () => {
  const content = `window.DEFAULT_PERSONNEL_DATA = ${JSON.stringify(personnelData, null, 2)};\n`;
  const blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "personnel-data.js";
  link.click();
  URL.revokeObjectURL(url);
});

renderForm();
