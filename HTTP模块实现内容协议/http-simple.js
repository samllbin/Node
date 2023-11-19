// http-consult.js
const http = require("http");
const url = require("url");
const responseData = {
  ID: "zhangsan",
  Name: "张三",
  RegisterDate: "2020年3月1日",
};

function toHTML(data) {
  return `
      <ul>
        <li><span>账号：</span><span>${data.ID}</span></li>
        <li><span>昵称：</span><span>${data.Name}</span></li>
        <li><span>注册时间：</span><span>${data.RegisterDate}</span></li>
      </ul>
    `;
}

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(`http://${req.headers.host}${req.url}`);
  if (pathname === "/") {
    const accept = req.headers.accept;
    if (req.method === "POST" || accept.indexOf("application/json") >= 0) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(responseData));
    } else {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(toHTML(responseData));
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>Not Found</h1>");
  }
});

server.on("clientError", (err, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

server.listen(8080, () => {
  console.log("opened server on", server.address());
});
// HTTP 的状态码表示 HTTP 请求的结果，它是一个三位数字，首位可能是 1、2、3、4、5。

// 首位是 1 表示中间状态，按照规范 POST 请求会先提交HEAD信息，如果服务器返回 100，才将数据信息提交。

// 首位是 2 表示请求结束，最常用的就是 200，表示正常返回。

// 首位是 3 表示被请求的资源被重定向，最常用的是 301、302、304。301 表示资源已经被永久移动到新的位置，302 表示资源被暂时移动到新的位置，304 表示资源被缓存，这是浏览器的缓存策略，在后续的课程中会有详细描述。

// 首位是 4 表示请求错误，最常用的是 400、403、404。400 是服务器无法理解和处理该请求；403 表示服务器理解请求，但客户端不具有获取该请求的权限，因此服务器拒绝响应；404 表示请求的资源不存在。

// 首位是 5 表示服务器自身存在问题，导致不能响应请求，常见的有 500、502、504。一般 500 表示服务器当前状态异常；502 表示作为网关的服务器无法从上游获取到有效数据（在后续课程中我们会解释这种状况）；504 表示请求的数据超时。
