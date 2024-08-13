# 简介

SAST Online Judge 是 SAST 自主研发的、拥有自主知识产权的在线评测系统

## 背景和目标

这个项目诞生于 NOJ 已死、Hydro 触发学校网络封控的时期，为了来年能够顺利举办 “程序设计竞赛”，我们开始了名为 “FCOJ”（Freshcup Online Judge）的企划，后更名为 “SASTOJ”。

## 概览

一个微服务架构

``` mermaid
flowchart RL
    subgraph Data
        direction BT
        Redis
        PostgreSQL
        RabbitMQ
        System-I/O
    end
    subgraph Service
    direction RL
    subgraph Backend
        direction BT
        Admin
        User
        Judge-Server
        MQ-Comusmer
    end
    subgraph Middleware
        direction BT
        subgraph Judge-Cluster
            direction BT
            Go-Judge
            RsJudge
            Remote-Judge
        end
        subgraph Future
            direction BT
            Metrics
            Grafana
        end
    end
    end
    subgraph Gateway
        direction BT
        Rate-Limiter
        Cache
        MQ-Producer
        Frontend
        Resources
    end
```

## 在线演示

[SASTOJ Online](https://acm.sast.fun)
