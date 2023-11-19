const net = require("net");

// function responseData(str) {
//   return `HTTP/1.1 200 OK
// Connection: keep-alive
// Date: ${new Date()}
// Content-Length: ${str.length}
// Content-Type: text/html

// ${str}`;
// }

// const server = net
//   .createServer((socket) => {
//     socket.on("data", (data) => {
//       if (/^GET \/ HTTP/.test(data)) {
//         socket.write(responseData("<h1>Hello world</h1>"));
//       }
//       console.log(`DATA:\n\n${data}`);
//     });

//     socket.on("close", () => {
//       console.log("connection closed, goodbye!\n\n\n");
//     });
//   })
//   .on("error", (err) => {
//     // handle errors here
//     throw err;
//   });

// server.listen(
//   {
//     host: "0.0.0.0",
//     port: 8080,
//   },
//   () => {
//     console.log("opened server on", server.address());
//   }
// );

// 第一行HTTP/1.1 200 OK表示这是一个 HTTP 协议的返回内容，版本是1.1，200 是状态码表示请求成功完成，OK 是状态码对应的描述符。

// 第二行开始一直到空行前面，和请求的报文一样是键/值形式的字符串，表示 HTTP 响应头。HTTP 协议规定：HTTP 响应头要带上Content-Type和Content-Length。其中，Content-Type指定了响应的类型。这里设置为text/html，告诉浏览器这个返回内容是一段 HTML，要去解析其中的 HTML 标签。Content-Length指定了响应内容中HTTP Body的字符数。浏览器读到Content-Length指定的字符数后，就会认为响应的内容已经传输完成。

// 除了这两个HTTP响应头字段之外，我们还发送了另外两个响应头字段，一个Connection字段，内容是keep-alive，告诉浏览器可以不断开 TCP 连接，直到网页关闭。这是 HTTP/1.1 中支持的机制，在同一个会话期间能够复用 TCP 连接，以免每次请求的时候都要创建一个新的 TCP 连接，那样会比较耗性能。

// 另外，我们发送了一个Date字段，用来存放服务器响应请求的日期时间。这个可以提供给页面，方便页面获取服务器时间，对于一些时间依赖的应用（比如秒杀购物）比较有用。

// 响应头之后是一个空行，这个也是HTTP Header和HTTP Body的分隔，然后是实际的响应内容。在这个例子中，我们发送的是一段 HTML 片段，内容是<h1>Hello World</h1>。

function responseData(str, status = 200, desc = "OK") {
  return `HTTP/1.1 ${status} ${desc}
Connection: keep-alive
Date: ${new Date()}
Content-Length: ${str.length}
Content-Type: text/html

${str}`;
}

const server = net
  .createServer((socket) => {
    socket.on("data", (data) => {
      const matched = data.toString("utf-8").match(/^GET ([/\w]+) HTTP/);
      console.log(matched);
      if (matched) {
        const path = matched[1];
        if (path === "/") {
          //如果路径是'/'，返回hello world、状态是200
          socket.write(responseData("<h1>Hello world</h1>"));
        } else {
          // 否则返回404状态
          socket.write(responseData("<h1>Not Found</h1>", 404, "NOT FOUND"));
        }
      }
      console.log(`DATA:\n\n${data}`);
    });

    socket.on("close", () => {
      console.log("connection closed, goodbye!\n\n\n");
    });
  })
  .on("error", (err) => {
    // handle errors here
    throw err;
  });

server.listen(
  {
    host: "0.0.0.0",
    port: 8080,
  },
  () => {
    console.log("opened server on", server.address());
  }
);
