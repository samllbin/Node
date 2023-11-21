const Server = require("../拦截器/lib/index");
const Router = require("./router");

const app = new Server();
const router = new Router();

app.listen({
  port: 9090,
  host: "0.0.0.0",
});

app.use(
  router.all("/test/:course/:lecture", async ({ route, res }, next) => {
    res.setHeader("Content-Type", "application/json");
    res.body = route;
    await next();
  })
);

app.use(
  router.all(".*", async ({ req, res }, next) => {
    res.setHeader("Content-Type", "text/html");
    res.body = "<h1>Hello world</h1>";
    await next();
  })
);
