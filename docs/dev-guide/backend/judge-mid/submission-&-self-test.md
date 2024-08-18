# 提交和自测

提交和自测是 SASTOJ 中最重要的部分之一。

## 提交流程

我们的提交和自测的流程是一个很有意思的设计，涉及消息队列、负载均衡、API 回调、缓存与持久化等等。

```mermaid
sequenceDiagram
title: Process of Submission & SelfTest
box Exam
participant User
participant Gateway
end
box SAST
participant Judge-middleware
participant Judge
end
activate User
User ->>+ Gateway: submission
Gateway ->>+ Judge-middleware: submission & callback token by rabbitMQ
Gateway ->>- User: submission uuid
User --)+ Gateway: submission uuid (polling)
alt is gojudge
Judge-middleware ->>+ Judge: code & cases
else is rsjudge
Judge-middleware ->>+ Judge: code & case version
opt
Judge ->> Judge-middleware: case version
Judge-middleware ->> Judge: cases
end
end
Judge--) Judge-middleware: status
Judge-middleware ->> Gateway: submission status
Gateway --) User: submission details
Judge --)- Judge-middleware: case results
Judge-middleware ->>- Gateway: submission result
Gateway --)- User: submission details
deactivate User
```

当网关或者 `user/contest` 接收到提交请求后，会生成一个临时的 `UUID`，作为这个提交的标识符。这个 `UUID` 会进入缓存，但是不会存入数据库。当评测中间价从**消息队列**中获得到提交后，会将其存入数据库，并在 Redis 中存入 `UUID -> submission`。注意，这个时候 `submission` 已经获取到了 `submission_id`。此外，`callback` 函数中，也需要用到 UUID 作为标识符。

## Redis 存储

我们会将提交存入 Redis，以便于 `user` 端可以通过 `UUID` 获取到提交结果。

Key: `submission:{userID}:{UUID}`

Value: `{submission}`

其中 `submission` 是 `pkg/mq` 中定义的 `Submission` 结构体。当然，这个结构体会被序列化为 JSON 字符串，所以开发者也可以定义自己的结构体，只需要能够兼容原结构体即可，当然，直接使用原结构体会是更好的选择。

## 提交状态

SASTOJ 的评测状态有以下几种：

|序号|含义|
|---|---|
|0|无效|
|1|通过|
|2|编译错误|
|3|答案错误|
|4|格式错误|
|5|运行错误|
|6|时间超限|
|7|内存超限|
|8|输出超限|
|9|等待中|

当评测中间件收到提交后，会将状态设置为 `9`，表示等待中。当评测完成后，会将状态设置为对应的状态。
