# AGENTS.md

## 项目说明

这是一个用于大厅触摸屏展示的静态网页项目，主题是“鄂托克旗公安局棋盘井第一派出所辖区警务信息互动屏”。

项目不依赖后端服务，主要由以下文件组成：

- `index.html`：页面结构。
- `styles.css`：16:9 大屏视觉样式。
- `app.js`：辖区、社区、主任信息、组织架构、点击交互逻辑。
- `content/site.json`：简介、页面标题、关键数据等可编辑文案。
- `content/regions.json`：辖区和社区负责人可编辑数据。
- `content/personnel.json`：岗位分工金字塔的可编辑人员结构数据。
- `personnel-data.js`：岗位分工金字塔的兜底人员结构数据。
- `admin.html` / `admin.js`：静态维护页，可本机维护人员信息并导出数据文件。
- `.pages.yml`：Pages CMS 配置，推荐作为正式轻量后台使用。
- `nocobase-trial/`：NocoBase 试用配置，不影响当前静态大屏。
- `assets/town-map.jpg`：镇区辖区底图。
- `assets/rural-map.jpg`：农牧区辖区底图。
- `assets/backgrounds/`：首页和大屏背景氛围图。
- `assets/photos/`：后续可放人员照片。

## 当前交互流程

1. 第一页展示派出所简介和关键数据。
2. 第二页展示辖区图入口：镇区辖区 / 农牧区辖区。
3. 进入对应辖区页面后，选择社区或区域。
4. 点击后弹出该社区主任或区域负责人的信息。
5. 第三页展示组织架构与岗位分工金字塔。
6. 点击金字塔中的岗位后，弹出岗位负责人、职责、电话、组员和照片信息。

## 设计要求

- 页面必须按 16:9 液晶大屏设计。
- 主要使用触摸屏操作，按钮需要足够大。
- 保持正式、清晰、适合公安大厅展示的视觉风格。
- 不要改成手机优先布局。
- 背景使用 `assets/backgrounds/` 中的警民服务照片，通过蒙版、暗角、网格和轮播形成氛围层，不要直接裸铺图片。
- 组织架构页应保持“分层金字塔”的表达，不要改成普通列表。
- 大屏主流程保持三页翻页逻辑，不要把简介、辖区图和金字塔再次混在同一页。

## 修改社区主任信息

社区主任正式维护数据在 `content/regions.json` 中。`app.js` 顶部的 `maps` 对象只作为兜底数据和地图热区坐标，不要优先修改。

每个社区使用 `director` 字段：

```js
director: {
  role: "社区主任",
  name: "待录入",
  phone: "待录入",
  area: "棋盘社区辖区",
  photo: ""
}
```

如果有照片，放在 `assets/photos/` 目录，并填写相对路径，例如：

```js
photo: "assets/photos/zhangsan.jpg"
```

## 修改组织架构信息

组织架构正式维护数据在 `content/personnel.json` 中。`personnel-data.js` 只作为兜底数据。

也可以打开 `admin.html` 在当前浏览器中维护。维护页支持：

- 岗位名称
- 姓名
- 电话
- 职责
- 组员
- 照片

注意：`admin.html` 是静态维护页，不是真正带账号和数据库的后台。保存只会写入当前浏览器的 `localStorage`，适合本机预览。若要同步到线上，需要导出 `personnel.json`，替换 `content/personnel.json` 并上传到 GitHub。

## Pages CMS 维护规则

推荐客户正式维护时使用 Pages CMS：

```text
https://app.pagescms.org
```

Pages CMS 会读取 `.pages.yml`，可直接编辑 `content/*.json` 并上传图片到 `assets/photos/`。

后续改文字、社区负责人、组织架构人员和照片时，优先改 `content/*.json`，不要直接改 HTML 或 JS 里的兜底内容。

## NocoBase 试用规则

NocoBase 试用配置位于：

```text
nocobase-trial/
```

当前电脑没有 Docker，不能直接运行 NocoBase。安装 Docker Desktop 后，可以在 `nocobase-trial/` 中执行：

```powershell
docker compose up -d
```

在用户确认采用 NocoBase 前，不要把前台大屏改成强依赖 NocoBase API。

## 部署信息

当前已经部署到 GitHub Pages：

```text
https://txt990726-yue.github.io/qipan-police-map/
```

GitHub 仓库：

```text
https://github.com/txt990726-yue/qipan-police-map
```

## 注意事项

当前仓库是公开仓库。后续如果填入真实姓名、手机号、照片，需要先确认这些信息是否可以公开到互联网。

如果只是大厅屏内部使用，更建议后续部署在本地电脑或单位内网。
