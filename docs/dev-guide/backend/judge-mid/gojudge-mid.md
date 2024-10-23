# Go-judge 中间件

::: tip
插件仍在开发中，代码实现可能发生较大变化，请以实际代码为准。
:::

## 简介

sastoj 通过 Go-judge 中间件提供了对 [`Go-judge`](https://github.com/criyle/go-judge) 评测机的支持。

Go-judge 中间件是搭建了 sastoj 和 Go-judge 服务直接的桥梁，将 sastoj 的提交和自测发送到 Go-judge 服务，通过分析 Go-judge
的回传对提交进行评分，并持久化数据。

## 题目类型

该评测机支持的题目类型为编程题。对应的题目类型信息如下：

| 题目类型 |      Slug Name       | Display Name |               Description               | Submission Channel Name | Self Test Channel Name |  Judge  |
|:----:|:--------------------:|:------------:|:---------------------------------------:|:-----------------------:|:----------------------:|:-------:|
| 编程题  | gojudge-classic-algo | Classic-Algo | Classic Algo Problem powered by Gojudge |   gojudge-submission    |   gojudge-self-test    | gojudge |

## 代码结构

``` plaintext
.
├── Dockerfile
├── Makefile
├── cmd
│   └── gojudge
│       ├── main.go
│       ├── wire.go
│       └── wire_gen.go
└── internal
    ├── biz
    │   ├── biz.go
    │   ├── gojudge.go
    │   ├── gojudge_test.go
    │   ├── loop.go
    │   ├── middleware.go
    │   ├── middleware_test.go
    │   ├── simple.go
    │   └── subtasks.go
    ├── conf
    │   ├── conf.pb.go
    │   └── conf.proto
    └── data
        ├── data.go
        ├── file.go
        └── language.go
```

## 配置文件结构

``` proto
syntax = "proto3";
package kratos.api;

option go_package = "gojudge/internal/conf;conf";

import "google/protobuf/duration.proto";

message Bootstrap {
  Data data = 1;
  JudgeMiddleware judge_middleware = 2;
}

message Data {
  string mq = 1;
  Database database = 2;
  Redis redis = 3;
  Load load = 4;
}

message Database {
  string driver = 1;
  string source = 2;
}

message Redis {
  string addr = 1;
  int32 db = 2;
}

message Load {
  string problem_cases_location = 1;
}

message JudgeMiddleware{
  string endpoint = 1;
  Language language = 2;
}

message Language{
  repeated string enable = 1;
  map<string, string> compile = 2;
  map<string, string> run = 3;
  map<string, string> source = 4;
  map<string, string> target = 5;
  map<string, LanguageConfig> exec_config = 6;
  message Env {
    repeated string env = 1;
  }
  map<string, Env> env = 7;
}

message LanguageConfig{
  ExecConfig compile = 1;
  ExecConfig run = 2;
}

message ExecConfig{
  uint64 proc_limit = 1;
  uint64 cpu_time_limit = 2;
  uint64 cpu_rate_limit = 3;
  uint64 clock_time_limit = 4;
  uint64 memory_limit = 5;
  int64 stdout_max_size = 6;
  int64 stderr_max_size = 7;
}
```

## 评测流程

1. 监听消息队列，接收提交消息。
2. 从消息中提取提交信息，包括提交 ID、题目 ID、语言、代码等。
3. 通过题目 ID 获取题目信息，包括题目的测试数据。
4. 根据评测类型（simple, subtasks）不同，调用不同的评测函数。
5. 从配置文件中获取对应语言的编译、运行、源文件、目标文件等信息。
6. 编译代码，运行代码，获取运行结果。
7. 根据运行结果，对提交进行评分。
8. 将评分结果持久化到数据库中，并同步缓存至 Redis 中。
9. 结束评测。

## 语言支持

Go-judge 中间件支持的语言 (编译器/编译优化) 有：

- C
- C++
- C++98
- C++11
- C++11(O2)
- C++14
- C++14(O2)
- C++17
- C++17(O2)
- Bash
- NodeJS
- Java
- Golang
- PHP
- Python3
- Ruby

已知问题：

- Java 语言目前仅支持直接使用 `java` 完成编译和运行，不支持先使用 `javac` 编译，再使用 `java` 运行。
- Pascel, Haskell, Rust 等语言无法正常获取输出，暂不支持。
