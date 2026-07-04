# NocoBase 试用说明

这个目录用于本地试用 NocoBase，不影响当前 GitHub Pages 大屏项目。

## 当前电脑状态

当前电脑没有安装 Docker，所以暂时不能直接运行 NocoBase。

NocoBase 官方推荐的快速试用方式是 Docker。安装 Docker Desktop 后，在本目录执行：

```powershell
Copy-Item docker-compose.sample.txt docker-compose.yml
docker compose up -d
```

启动后访问：

```text
http://localhost:13000
```

NocoBase 初始账号通常为：

```text
admin@nocobase.com
```

初始密码通常为：

```text
admin123
```

## 建议试用的数据表

如果 NocoBase 跑起来，建议先建这些数据表：

- 派出所简介：标题、正文段落、关键数据。
- 辖区信息：镇区辖区、农牧区辖区、地图、说明。
- 社区负责人：社区名称、姓名、电话、职务、负责区域、照片。
- 组织架构：层级、岗位、姓名、电话、职责、组员、照片。

确认后台体验可接受后，再决定是否把大屏前台改为读取 NocoBase API。

## 注意

这个试用服务需要长期运行，才可以作为正式后台使用。

如果仍然只部署在 GitHub Pages，不运行 NocoBase 服务，大屏前台不会自动连接这个后台。
