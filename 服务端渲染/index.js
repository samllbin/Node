const Server = require("./拦截器/lib/index.js");
const Router = require("./动态路由/router.js");
const params = require("./aspect/params.js");
const handlebars = require("handlebars");
const fs = require("fs");
const {
  getCoronavirusByDate,
  getCoronavirusKeyIndex,
} = require("./module/mock.js");

let app = new Server();
let router = new Router();
app.use(({ req }, next) => {
  console.log(`${req.method}${req.url}`);
  next();
});

app.use(params);

app.use(
  router.get("/coronavirus/index", async ({ route, res }, next) => {
    const index = getCoronavirusKeyIndex();
    res.setHeader("Content-Type", "text/html");

    const templete = handlebars.compile(
      fs.readFileSync("./coronavirus_index.html", { encoding: "utf-8" })
    );
    const result = templete({ data: index });
    res.body = result;
    await next();
  })
);

app.use(
  router.get("/coronavirus/:date", async ({ params, route, res }, next) => {
    const data = getCoronavirusByDate(route.date);
    console.log(params.type);
    if (params.type === "json") {
      res.setHeader("Content-Type", "application/json");
      res.body = { data };
    } else {
      const templete = handlebars.compile(
        fs.readFileSync("./coronavirus_date.html", { encoding: "utf-8" })
      );
      const result = templete({ data });
      res.setHeader("Content-Type", "text/html");
      res.body = result;
    }
    await next();
  })
);
app.use(
  router.all(".*", async ({ params, req, res }, next) => {
    res.setHeader("Content-Type", "text/html");
    res.body = "<h1>Not Found</h1>";
    res.statusCode = 404;
    await next();
  })
);

app.listen({
  port: 9090,
  host: "0.0.0.0",
});
