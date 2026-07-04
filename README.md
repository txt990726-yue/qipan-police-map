# 互动大屏使用说明

## 当前流程

1. 第一页为派出所简介，完整展示客户提供的简介文字和关键数据。
2. 第二页为辖区图，选择镇区辖区 / 农牧区辖区。
3. 进入对应辖区后，在右侧选择社区或区域，也可以直接点击地图上的热区。
4. 弹出该社区主任或区域负责人的信息卡。
5. 第三页为组织架构与岗位分工金字塔。
6. 点击金字塔中的任一岗位，弹出该岗位人员、职责、电话和组员信息。

页面按照 16:9 大屏设计，适合大厅液晶触摸屏全屏展示。

## 背景设计

页面底层使用 5 张警民服务照片作为氛围背景，素材位于：

```text
assets/backgrounds/
```

背景不是直接裸露展示，而是叠加了深蓝蒙版、暗角、细网格和轻微轮播，让文字、按钮、地图保持清晰。

## 第一页简介

第一页单独展示棋盘井第一派出所简介，内容提炼自 `棋盘井第一派出所简介.wps`。

简介区域采用半透明展板设计，包含基础介绍、关键数据和工作定位摘要。

## 后台界面

后台维护页已改为左侧岗位分组、右侧编辑卡片的管理台布局，适合客户后续逐项录入。

## Pages CMS 轻量后台

项目已新增 Pages CMS 配置文件：

```text
.pages.yml
```

可编辑数据拆分到：

```text
content/site.json
content/regions.json
content/personnel.json
```

推荐正式维护使用 Pages CMS：

```text
https://app.pagescms.org
```

登录 GitHub 后选择本仓库，即可编辑简介、辖区负责人、组织架构人员，并上传人员照片到 `assets/photos/`。

本地的 `admin.html` 仍保留为快速预览工具：它会优先读取 `content/personnel.json`，保存到本机浏览器后可在当前电脑预览；导出文件名为 `personnel.json`，需要替换 `content/personnel.json` 后再同步线上。

## 打开方式

推荐用 Edge 或 Chrome 打开。

- 双击 `index.html`。
- 点击右上角“全屏”，或按 `F11` 进入浏览器全屏。

如果双击打开时浏览器限制本地文件，可以在项目目录运行：

```powershell
python -m http.server 5178 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:5178/index.html
```

## 替换主任信息

信息在 `app.js` 顶部的 `maps` 数据里。每个社区都有一个 `director`：

```js
director: {
  role: "社区主任",
  name: "张三",
  phone: "13800000000",
  area: "棋盘社区辖区",
  photo: "assets/photos/zhangsan.jpg"
}
```

没有照片时保持：

```js
photo: ""
```

## 组织架构与人员后台

组织架构数据位于：

```text
personnel-data.js
```

本地快速维护页位于：

```text
admin.html
```

本地快速维护页可以录入岗位、姓名、电话、职责、组员和照片。照片可以在后台选择本地图片，保存到当前浏览器后，大屏页面刷新即可预览。

注意：这是 GitHub Pages 静态网页，不是真正带服务器的后台。本地维护页保存的数据只保存在当前电脑浏览器里。如果要让线上所有人都看到修改，推荐使用 Pages CMS；或导出 `personnel.json` 后替换 `content/personnel.json` 并同步到 GitHub。

如果后续改成本地大厅电脑使用，也可以把真实照片放到：

```text
assets/photos/
```

然后在 `personnel-data.js` 中填写相对路径，例如：

```js
photo: "assets/photos/zhangsan.jpg"
```

## 当前线上地址

```text
https://txt990726-yue.github.io/qipan-police-map/
```
