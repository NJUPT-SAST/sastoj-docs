# 评测中间件

为了支持多种评测机的接入，我们设计了评测中间件。评测中间件是一个独立的评测服务，它负责接收评测请求，将评测请求转发给评测机，然后将评测机的评测结果进行处理，并按照 `sastoj` 的格式返回给调用方并持久化。

## 测试点格式

目前 `sastoj` 的测试点格式为 [rsjudge-test-cases-schema](https://github.com/Jisu-Woniu/rsjudge-test-cases-schema) 中定义的格式。

## 评测机接入

所有的评测请求均存放在**消息队列**中，测试结果存放在 `Redis` 和**数据库**中，评测机接入需要监听消息队列，当有评测请求时，评测机需要从消息队列中获取评测请求，然后进行评测，并将评测结果返回。

### 消息队列

默认的提交 `Channel` 为 `submission`，默认的自测 `Channel` 为 `self-test`。评测机需要监听这两个 `Channel`。

### 缓存和持久化

评测机需要将评测结果存入缓存和数据库。数据库连接可以使用 `ent` 也可以使用其他 `ORM` 框架。

### API 回调

如果评测的 `Token` 字段不为空，评测机需要将评测结果回调给调用方。回调的 `Endpoint` 需要从 `Redis` 中获取，`Key` 为 `gateway:{UUID}`。

## 支持的评测机

- [`go-judge`](https://github.com/criyle/go-judge)：快速，简单，安全。
