# API 限流器

对于部分重型 API，比如用户端的提交和自测，我们需要限制其访问频率，以免对服务器造成过大的压力，同时规避攻击行为。

为此，我们实现了一个简单的限流器，用于限制用户对于此类 API 的访问频率。由于这类接口的 QPS 限制较低，我们使用了一个非常简单的实现。

::: warning 注意
这个中间件必需在 [`auth`](./auth) 中间件之后使用，否则无法从 `context` 中获取到用户的信息，导致服务发生panic。
:::

## 使用参考

::: code-group

``` go [server.go]
package server

import (
    v1 "sastoj/api/sastoj/user/contest/service/v1" // [!code focus]
    "time"

    "github.com/google/wire"
)

// ProviderSet is server providers.
var ProviderSet = wire.NewSet(NewGRPCServer, NewHTTPServer)

var apiLimiter = map[string]time.Duration{ // [!code focus:4]
    v1.Contest_Submit_FullMethodName:   10 * time.Second,
    v1.Contest_SelfTest_FullMethodName: 5 * time.Second,
}
```

``` go [http.go]
package server

import (
    v1 "sastoj/api/sastoj/user/contest/service/v1" // [!code focus]
    "sastoj/app/user/contest/internal/conf"
    "sastoj/app/user/contest/internal/service"
    "sastoj/pkg/middleware/auth" // [!code focus:2]
    "sastoj/pkg/middleware/limiter"

    "github.com/go-kratos/kratos/v2/log"
    "github.com/go-kratos/kratos/v2/middleware/recovery"
    "github.com/go-kratos/kratos/v2/transport/http"
)

// NewHTTPServer new an HTTP server.
func NewHTTPServer(c *conf.Server, contest *service.ContestService, logger log.Logger) *http.Server {
    var opts = []http.ServerOption{
        http.Middleware(
            recovery.Recovery(),
            auth.Auth(c.JwtSecret, auth.UserGroup, nil), // [!code focus:2]
            limiter.ApiLimiterMiddleware(apiLimiter),
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
    v1 "sastoj/api/sastoj/user/contest/service/v1" // [!code focus]
    "sastoj/app/user/contest/internal/conf"
    "sastoj/app/user/contest/internal/service"
    "sastoj/pkg/middleware/auth" // [!code focus:2]
    "sastoj/pkg/middleware/limiter"

    "github.com/go-kratos/kratos/v2/log"
    "github.com/go-kratos/kratos/v2/middleware/recovery"
    "github.com/go-kratos/kratos/v2/transport/grpc"
)

// NewGRPCServer new a gRPC server.
func NewGRPCServer(c *conf.Server, contest *service.ContestService, logger log.Logger) *grpc.Server {
    var opts = []grpc.ServerOption{
        grpc.Middleware(
            recovery.Recovery(),
            auth.Auth(c.JwtSecret, auth.UserGroup, nil), // [!code focus:2]
            limiter.ApiLimiterMiddleware(apiLimiter),
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

:::

- `apiLimiter` 是一个 `map`，用于存储需要限流的 API 以及对应的限流时间。在这里，我们限制了用户多次提交和自测的时间间隔，分别为10秒和5秒。

## 实现

``` go [api_limiter.go]
package limiter

import (
    "context"
    "errors"
    "fmt"
    "sastoj/pkg/middleware/auth"
    "time"

    "github.com/go-kratos/kratos/v2/log"
    "github.com/go-kratos/kratos/v2/middleware"
    "github.com/go-kratos/kratos/v2/transport"
)

var blackList = map[int64]time.Time{}

func ApiLimiterMiddleware(apis map[string]time.Duration) middleware.Middleware {
    return func(handler middleware.Handler) middleware.Handler {
        return func(ctx context.Context, req interface{}) (interface{}, error) {
            trans, ok := transport.FromServerContext(ctx)
            if !ok {
                return nil, errors.New("no Method Found")
            }
            operation := trans.Operation()
            t, exists := apis[operation]
            if !exists {
                return handler(ctx, req)
            }
            userID := ctx.Value("userInfo").(*auth.Claims).UserID
            prevTime, exists := blackList[userID]
            log.Debug(fmt.Sprintf("userID: %d, prevTime: %v, exists: %v", userID, prevTime, exists))
            if exists && time.Now().Before(prevTime) {
                log.Warn(fmt.Sprintf("user %d who tried to %s, was blocked by Api Limiter", userID, operation))
                return nil, errors.New("rate Limit Exceeded")
            }
            blackList[userID] = time.Now().Add(t)
            log.Debug(fmt.Sprintf("user %d who tried to %s, was allowed by Api Limiter", userID, operation))
            return handler(ctx, req)
        }
    }
}
```

当用户访问被限流的 API 时，我们会检查用户是否在黑名单中，如果在黑名单中，且未到解封时间，则返回错误；否则，将用户被加入黑名单，并设置解封时间。

在这里，我们使用了一个 `map` 来存储用户的黑名单，`key` 为用户的 `userID`，`value` 为用户的解封时间。
