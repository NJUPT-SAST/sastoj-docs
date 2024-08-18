# 认证中间件

::: tip 提示
此中间件仍然处于开发阶段，可能会有较大的改动。
:::

基于 `RBAC` 鉴权，实现了 `Kratos` 的 `Middleware` 接口，用于对请求进行认证，用于判断请求是否有访问对于 API 的权限。

::: warning 注意
不可用于判断用户是否有访问对应资源的权限，仅用于判断用户是否有访问对应 API 的权限。

如果需要对用户是否有访问对应资源的权限，需要在业务逻辑中进行判断。
:::

## 使用参考

``` go
import (
  "sastoj/pkg/middleware/auth"

  "github.com/golang-jwt/jwt/v5"
)

// NewHTTPServer new an HTTP server.
func NewHTTPServer(c *conf.Server, contest *service.ContestService, logger log.Logger) *http.Server {
    apiMap := map[string]string{
        "UpdateUser": "admin",
    }
    var opts = []http.ServerOption{
        http.Middleware(
            recovery.Recovery(),
            auth.Auth(func(token *jwt.Token) (interface{}, error) {
                return []byte(c.JwtSecret), nil
            }, apiMap),
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

- `apiMap`：API 与角色的映射关系，用于鉴权。
- `c.JwtSecret`: JWT 密钥，用于解析 JWT Token，在 `conf` 中声明。
