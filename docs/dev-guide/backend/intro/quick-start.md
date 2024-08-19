# 快速开始

## 环境准备

首先，您需要安装好对应的依赖环境，以及工具，如无特殊说明，均采用 `latest version`：

- [go](https://golang.org/dl/)
- [protoc](https://github.com/protocolbuffers/protobuf)
- [protoc-gen-go](https://github.com/protocolbuffers/protobuf-go)
- [protoc-gen-validate](https://github.com/envoyproxy/protoc-gen-validate)
- [buf](https://buf.build/)
- [go-kratos](https://go-kratos.dev/)
- [docker](https://docs.docker.com/get-docker/)
- [ent](https://entgo.io/)
- [wire](https://github.com/google/wire)

Golang 需要开启 Go Modules 功能，可以通过设置环境变量 `GO111MODULE=on` 来开启。

``` shell
go env -w GO111MODULE=on
```

开发 IDE 推荐使用 [GoLand](https://www.jetbrains.com/go/)，并安装好对应的插件 [Buf for Protocol Buffers](https://plugins.jetbrains.com/plugin/19147-buf-for-protocol-buffers)。

当然也可以使用你自己喜欢的编辑器。

## 数据准备

建议使用 `Docker` 来管理数据相关服务。

### PostgreSQL

sastoj 使用的数据库是 [PostgreSQL](https://www.postgresql.org/)，您需要安装好对应的数据库，并且创建好对应的数据库，默认为 `sastoj`。如果你有需要，可以修改 `conf` 目录下的配置文件。

如果你有修改数据库结构，可以使用 `ent` 工具来重新生成数据库操作代码。

``` shell
ent generate ./ent/schema
```

### Redis

sastoj 使用的缓存是 [Redis](https://redis.io/)，您需要安装好对应的缓存，并且配置好对应的地址，默认为 `localhost:6379`。

如果你的系统是 `Windows`，可以使用 `WSL` 来安装 `Redis`。

### RabbitMQ

sastoj 使用的消息队列是 [RabbitMQ](https://www.rabbitmq.com/)，您需要安装好对应的消息队列，并且配置好对应的地址，默认为 `localhost:5672`，默认密码均为 `sastoj`。

## 项目启动

``` shell
go run app/path/to/service/cmd/main.go -conf to/your/conf
```

## 常见问题

大部分问题可以在 [Go-Kratos 常见问题](https://go-kratos.dev/docs/intro/faq) 中找到解决方案。
