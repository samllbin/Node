const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const { Server, Router } = require("./lib/interceptor"); // 这里我们将server 和 router都规划到interceptor包中

const dbFile = path.resolve(__dirname, "../database/todolist.db"); // todolist.db是sqlite数据库文件
let db = null;

const app = new Server(); // 创建HTTP服务器
const router = new Router(); // 创建路由中间件

app.use(async ({ req }, next) => {
  console.log(`${req.method} ${req.url}`); // eslint-disable-line no-console
  await next();
});
app.use(async ({ cookies, res }, next) => {
  let id = cookies?.interceptor_js ? cookies.interceptor_js : undefined;
  console.log(id);
  if (!id) {
    id = Math.random().toString(36).slice(2);
  }
  console.log(id);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Set-Cookie",
    `interceptor_js=${id}; Path=/; Max-Age=${7 * 86400}`
  ); // 设置cookie的有效时长一周
  await next();
});
const param = require("./aspect/param");
app.use(param);

const cookie = require("./aspect/cookie");
app.use(cookie);

app.use(async (ctx, next) => {
  if (!db) {
    // 如果数据库连接未创建，就创建一个
    db = await open({
      filename: dbFile,
      driver: sqlite3.cached.Database,
    });
  }
  ctx.database = db; // 将db挂在ctx上下文对象的database属性上

  await next();
});
let users = {};
// app.use(
//   router.get("/", async ({ cookies, route, res }, next) => {
//     res.setHeader("Content-Type", "text/html;charset=utf-8");
//     let id = cookies?.interceptor_js;
//     if (id) {
//       users[id] = users[id] || 1;
//       users[id]++;
//       res.body = `<h1>你好，欢迎第${users[id]}次访问本站</h1>`;
//     } else {
//       id = Math.random().toString(36).slice(2);
//       console.log(id);
//       users[id] = 1;
//       res.body = "<h1>你好，新用户</h1>";
//     }
//     res.setHeader("Set-Cookie", `interceptor_js=${id}; Max-Age=86400`);
//     await next();
//   })
// );

/*
如果请求的路径是/list，则从todo表中获取所有任务数据
*/
async function checkLogin(ctx) {
  const { getSession } = require("./model/session");
  const userInfo = await getSession(ctx.database, ctx, "userInfo");
  ctx.userInfo = userInfo;
  return ctx.userInfo;
}

app.use(
  router.get("/list", async (ctx, next) => {
    const { database, res } = ctx;
    const userInfo = await checkLogin(ctx);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    if (userInfo) {
      const { getList } = require("./model/todolist");
      const result = await getList(database, userInfo);
      res.body = { data: result };
    } else {
      res.body = { err: "not login" };
    }
    await next();
  })
);

app.use(
  router.post("/add", async (ctx, next) => {
    const { database, params, res } = ctx;
    const userInfo = await checkLogin(ctx);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    if (userInfo) {
      const { addTask } = require("./model/todolist");
      const result = await addTask(database, userInfo, params);
      res.body = result;
      await next();
    } else {
      res.body = { err: "not login" };
    }
    await next();
  })
);

app.use(
  router.post("/login", async (ctx, next) => {
    const { database, params, res } = ctx;
    const { login } = require("./model/user");
    const result = await login(database, ctx, params);
    res.statusCode = 302;
    if (!result) {
      // 登录失败，跳转到login继续登录

      console.log("登录失败");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Location",
        "http://127.0.0.1:5500/HTTP/%E6%8C%81%E4%B9%85%E5%8C%96%E5%82%A8%E5%AD%98/www/login.html"
      );
    } else {
      res.setHeader(
        "Location",
        "file:///C:/Users/86150/Desktop/node%E5%90%8E%E7%AB%AF/HTTP/%E6%8C%81%E4%B9%85%E5%8C%96%E5%82%A8%E5%AD%98/www/login.html"
      );
      res.end();
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
