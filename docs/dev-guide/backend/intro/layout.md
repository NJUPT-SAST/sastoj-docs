# 项目结构

项目是基于 [Go-Kratos](https://go-kratos.dev/) 框架开发的，项目结构如下：

```plaintext
.
├── Dockerfile
├── LICENSE
├── Makefile
├── README.md
├── api
├── app
│   ├── admin
│   │   └── admin
│   ├── gojudge (deprecated)
│   ├── judge
│   │   └── gojudge
│   ├── rsjudge (future)
│   ├── public
│   │   └── auth
│   └── user
│       ├── contest
│       └── gateway
├── conf
├── data
│   └── cases
├── docker-compose.yml
├── ent
│   └── schema
├── go.mod
├── go.sum
├── openapi.yaml
└── pkg
    ├── error
    ├── middleware
    ├── mq
    └── util
```

- `api`：存放 API 定义文件, 项目使用 [protobuf](https://developers.google.com/protocol-buffers) 定义 API，使用 [buf](https://buf.build/) 生成代码，将来也会使用它管理所有 proto 文件。
- `app`：存放应用层代码，按照业务分包，使用 [kratos-layout](https://github.com/go-kratos/kratos-layout) 生成的基本结构。
- `conf`：存放 `example` 配置文件。
- `data`：存放数据文件，目前用于存放测试点文件。
- `ent`：存放 [ent](https://entgo.io/) 代码，用于数据库操作。
- `pkg`：存放公共代码，如错误码、中间件、消息队列以及工具。
- `Dockerfile`：项目 Docker 镜像构建文件。
- `docker-compose.yml`：项目 Docker Compose 配置文件。
- `Makefile`：项目 Makefile 文件，用于快速构建、运行项目。
- `go.mod`、`go.sum`：Go 项目依赖管理文件。
- `openapi.yaml`：OpenAPI 文档，之后将可能会移除。
