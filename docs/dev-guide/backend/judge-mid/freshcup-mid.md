# FreshCup 中间件

## 简介

sastoj 通过 FreshCup 中间件提供了对 `单选题、多选题、简答题` 的支持

## 题目类型

该评测机支持的题目类型为选择题、填空题。对应的题目类型信息如下：

``` json
// 单选题
{
    // 题目类型的简化名称
    "slug_name": "freshcup-single-choice",
    // 显示名
    "display_name": "Single-Choice",
    // 题目类型描述
    "description": "Single Choice Problem powered by Freshcup",
    // 在消息队列中的提交通道名称
    "submission_channel_name": "freshcup-submission",
    // 在消息队列中的自测通道名称
    "self_test_channel_name": "freshcup-self-test",
    // 评测机名称
    "judge": "freshcup"
}
// 多选题
{
    "slug_name": "freshcup-multiple-choice",
    "display_name": "Multiple-Choice",
    "description": "Multiple Choice Problem powered by Freshcup",
    "submission_channel_name": "freshcup-submission",
    "self_test_channel_name": "freshcup-self-test",
    "judge": "freshcup"
}
// 填空题
{
    "slug_name": "freshcup-short-answer",
    "display_name": "Short-Answer",
    "description": "Short Answer Problem powered by Freshcup",
    "submission_channel_name": "freshcup-submission",
    "self_test_channel_name": "freshcup-self-test",
    "judge": "freshcup"
}
```

## 代码结构

``` plaintext
.
├── Dockerfile
├── Makefile
├── cmd
│   └── freshcup
│       ├── main.go
│       ├── wire.go
│       └── wire_gen.go
└── internal
    ├── biz
    │   ├── biz.go
    │   ├── submission.go
    ├── conf
    │   ├── conf.pb.go
    │   └── conf.proto
    ├── data
    │   ├── data.go
    │   └── submission.go
    ├── server
    │   ├── server.go
    │   └── submission.go
    └── service
        ├── service.go
        └── submission.go
        
```

## 评测流程

1. 监听消息队列，接收提交消息。
2. 从消息中提取提交信息，包括提交 ID、题目 ID、提交内容等。
3. 通过题目 ID 获取题目信息，包括题目的测试数据。
4. 根据题目类型（单选、多选、填空）不同，决定立即评分还是等待手动评分。
5. 若题目为选择题，根据答案对提交进行评分。
6. 将评分结果持久化到数据库中，并同步缓存至 Redis 中。
7. 结束评测。

## 元数据

题目元数据包括题目选项等信息

以下是选择题的元数据示例：

```json
{
  "options": {
    "A": "选项A",
    "B": "选项B",
    "C": "选项C",
    "D": "选项D",
    ......
    // 更多选项
  },
  "size": "4"
  // 选项数量
}
```