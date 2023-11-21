const Server = require("./拦截器/lib/index");

const app = new Server();

// 添加拦截切面
app.use(async ({ res }, next) => {
  res.setHeader("Content-Type", "text/html");
  res.body = "<h1>Hello world</h1>";
  await next();
});

app.listen({
  port: 9090,
  host: "0.0.0.0",
});
