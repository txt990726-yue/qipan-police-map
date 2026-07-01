# 互动大屏使用说明

## 当前流程

1. 第一页选择辖区：镇区辖区 / 农牧区辖区。
2. 进入对应辖区后，在右侧选择社区或区域，也可以直接点击地图上的热区。
3. 弹出该社区主任或区域负责人的信息卡。

页面按照 16:9 大屏设计，会自动适配常见液晶屏分辨率。

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

## 添加照片

1. 在 `assets` 里新建 `photos` 文件夹。
2. 把照片放进 `assets/photos`。
3. 在 `app.js` 里填写照片路径，例如：

```js
photo: "assets/photos/zhangsan.jpg"
```

## 当前区域

- 镇区辖区：棋盘社区、乌珠尔社区、靖安社区、艾力社区、棋祥社区。
- 农牧区辖区：农牧区整体辖区。
