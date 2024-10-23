# FreshCup 中间件

## 简介

sastoj 通过 FreshCup 中间件提供了对 `单选题、多选题、简答题` 的支持

## 题目类型

该评测机支持的题目类型为选择题、填空题。对应的题目类型信息如下：

| 题目类型 |        Slug Name         |  Display Name   |                 Description                 | Submission Channel Name | Self Test Channel Name |  Judge   |
|:----:|:------------------------:|:---------------:|:-------------------------------------------:|:-----------------------:|:----------------------:|:--------:|
| 单选题  |  freshcup-single-choice  |  Single-Choice  |  Single Choice Problem powered by Freshcup  |   freshcup-submission   |   freshcup-self-test   | freshcup |
| 多选题  | freshcup-multiple-choice | Multiple-Choice | Multiple Choice Problem powered by Freshcup |   freshcup-submission   |   freshcup-self-test   | freshcup |
| 简答题  |  freshcup-short-answer   |  Short-Answer   |  Short Answer Problem powered by Freshcup   |   freshcup-submission   |   freshcup-self-test   | freshcup |

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
    "D": "选项D"
  },
  "size": "4"
}
```
