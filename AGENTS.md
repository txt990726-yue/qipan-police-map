# AGENTS.md

## 项目说明

这是一个用于大厅触摸屏展示的静态网页项目，主题是“鄂托克旗公安局棋盘井第一派出所辖区警务信息互动屏”。

项目不依赖后端服务，主要由以下文件组成：

- `index.html`：页面结构。
- `styles.css`：16:9 大屏视觉样式。
- `app.js`：辖区、社区、主任信息、点击交互逻辑。
- `assets/town-map.jpg`：镇区辖区底图。
- `assets/rural-map.jpg`：农牧区辖区底图。

## 当前交互流程

1. 第一页选择辖区：镇区辖区 / 农牧区辖区。
2. 进入对应辖区页面后，选择社区或区域。
3. 点击后弹出该社区主任或区域负责人的信息。

## 设计要求

- 页面必须按 16:9 液晶大屏设计。
- 主要使用触摸屏操作，按钮需要足够大。
- 保持正式、清晰、适合公安大厅展示的视觉风格。
- 不要改成手机优先布局。
- 背景使用 `assets/backgrounds/` 中的警民服务照片，通过蒙版、暗角、网格和轮播形成氛围层，不要直接裸铺图片。

## 修改人员信息

人员信息在 `app.js` 顶部的 `maps` 对象里。

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
