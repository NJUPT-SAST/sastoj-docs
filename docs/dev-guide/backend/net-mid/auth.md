# 认证

基于 `RBAC` 鉴权，实现了 `Kratos` 的 `Middleware` 接口，用于对请求进行认证，用于判断请求是否有访问对于 API 的权限。

::: warning 注意
不可用于判断用户是否有访问对应资源的权限，仅用于判断用户是否有访问对应 API 的权限。
如果需要对用户是否有访问对应资源的权限，需要在业务逻辑中进行判断。
:::

## 使用参考

::: code-group

``` go [auth.go]
func Auth(secret string, defaultRule string, customApiMap map[string]string) middleware.Middleware {
  // ...
}
```

``` go [server.go]
package server

import (
    v1 "sastoj/api/sastoj/admin/contest/service/v1"
    "sastoj/pkg/middleware/auth" // [!code focus]

    "github.com/google/wire"
)

// ProviderSet is server providers.
var ProviderSet = wire.NewSet(NewGRPCServer, NewHTTPServer, NewCronWorker)

// apiMap is a map of method to group for auth middleware. // [!code focus:5]
var apiMap = map[string]string{
    v1.Contest_GetContest_FullMethodName:  auth.UserGroup,
    v1.OperationContestListContest: auth.UserGroup,
}
```

``` go [http.go]
package server

import (
    v1 "sastoj/api/sastoj/admin/contest/service/v1"
    "sastoj/app/admin/contest/internal/conf"
    "sastoj/app/admin/contest/internal/service"
    "sastoj/pkg/middleware/auth" // [!code focus]

    "github.com/go-kratos/kratos/v2/log"
    "github.com/go-kratos/kratos/v2/middleware/recovery"
    "github.com/go-kratos/kratos/v2/transport/http"
)

// NewHTTPServer new an HTTP server.
func NewHTTPServer(c *conf.Server, contest *service.ContestService, logger log.Logger) *http.Server {
    var opts = []http.ServerOption{
        http.Middleware(
            recovery.Recovery(),
            auth.Auth(c.JwtSecret, auth.AdminGroup, apiMap), // [!code focus]
        ),
    }
    if c.Http.Network != "" {
        opts = append(opts, http.Network(c.Http.Network))
    }
    if c.Http.Addr != "" {
        opts = append(opts, http.Address(c.Http.Addr))
    }
    if c.Http.Timeout != nil {
        opts = append(opts, http.Timeout(c.Http.Timeout.AsDuration()))
    }
    srv := http.NewServer(opts...)
    v1.RegisterContestHTTPServer(srv, contest)
    return srv
}
```

``` go [grpc.go]
package server

import (
    v1 "sastoj/api/sastoj/admin/contest/service/v1"
    "sastoj/app/admin/contest/internal/conf"
    "sastoj/app/admin/contest/internal/service"
    "sastoj/pkg/middleware/auth" // [!code focus]

    "github.com/go-kratos/kratos/v2/log"
    "github.com/go-kratos/kratos/v2/middleware/recovery"
    "github.com/go-kratos/kratos/v2/middleware/validate"
    "github.com/go-kratos/kratos/v2/transport/grpc"
)

// NewGRPCServer new a gRPC server.
func NewGRPCServer(c *conf.Server, contest *service.ContestService, logger log.Logger) *grpc.Server {
    var opts = []grpc.ServerOption{
        grpc.Middleware(
            validate.Validator(),
            recovery.Recovery(),
            auth.Auth(c.JwtSecret, auth.AdminGroup, apiMap), // [!code focus]
        ),
    }
    if c.Grpc.Network != "" {
        opts = append(opts, grpc.Network(c.Grpc.Network))
    }
    if c.Grpc.Addr != "" {
        opts = append(opts, grpc.Address(c.Grpc.Addr))
    }
    if c.Grpc.Timeout != nil {
        opts = append(opts, grpc.Timeout(c.Grpc.Timeout.AsDuration()))
    }
    srv := grpc.NewServer(opts...)
    v1.RegisterContestServer(srv, contest)
    return srv
}
```

- `secret`: JWT 密钥，用于解析 JWT Token，在 `conf` 中声明。
- `defaultRule`: 默认的角色。
- `customApiMap`：自定义的 API 规则，用于匹配对应的 API 与角色，优先级高于 `defaultRule`。其中，`key` 为 `api` 目录下的**proto文件**生成的 `FullMethodName` 或 `Operation` 常量，`value` 为 `auth` 中的 `GroupName` 常量，包括 `PublicGroup`, `UserGroup` 和 `AdminGroup`。

## 对比 Kratos Auth 中间件

Kratos 默认的 Auth 中间件仅可以判断请求头中是否有 `Authorization` 字段，而无法指定其他字段（例如我们正在使用的 `Token`），且只能判断是否有 Token 以及它的有效性，无法根据 Claim 判断用户角色，也无法根据 API 的不同对请求进行阻断或者放行，同时调用和配置较为繁琐。

为此，我们开发了 sastoj 的 Auth 中间件，将使用过程中繁琐且重复的代码封装在中间件中，仅暴露必需的参数，简化开发过程。
