const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const mime = require("mime");

const zlib = require("zlib");

const server = http.createServer((req, res) => {
  let filePath = path.resolve(
    __dirname,
    path.join("www", url.fileURLToPath(`file:/${req.url}`))
  );

  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const isDir = stats.isDirectory();

    if (isDir) {
      filePath = path.join(filePath, "index.html");
    }

    if (!isDir || fs.existsSync(filePath)) {
      const timeStamp = req.headers["if-modified-since"];
      const stats = fs.statSync(filePath);
      const { ext } = path.parse(filePath);
      console.log(ext);
      let status = 200;
      if (timeStamp && Number(timeStamp) === stats.mtimeMs) {
        // 如果timeStamp和stats.mtimeMS相等，说明文件内容没有修改
        status = 304;
      }
      const mimeType = mime.getType(ext);
      const responseHeaders = {
        "Content-Type": mimeType,
        "Cache-Control": "max-age=86400", // 缓存一天
        "Last-Modified": stats.mtimeMs,
      };
      const acceptEncoding = req.headers["accept-encoding"];
      const compress = acceptEncoding && /^(text|application)\//.test(mimeType);
      if (compress) {
        // 返回客户端支持的一种压缩方式
        acceptEncoding.split(/\s*,\s*/).some((encoding) => {
          if (encoding === "gzip") {
            responseHeaders["Content-Encoding"] = "gzip";
            return true;
          }
          if (encoding === "deflate") {
            responseHeaders["Content-Encoding"] = "deflate";
            return true;
          }
          if (encoding === "br") {
            responseHeaders["Content-Encoding"] = "br";
            return true;
          }
          return false;
        });
      }
      const compressionEncoding = responseHeaders["Content-Encoding"]; // 获取选中的压缩方式
      res.writeHead(status, responseHeaders);
      if (status === 200) {
        const fileStream = fs.createReadStream(filePath);
        if (compress && compressionEncoding) {
          let comp;

          // 使用指定的压缩方式压缩文件
          if (compressionEncoding === "gzip") {
            comp = zlib.createGzip();
          } else if (compressionEncoding === "deflate") {
            comp = zlib.createDeflate();
          } else {
            comp = zlib.createBrotliCompress();
          }
          fileStream.pipe(comp).pipe(res);
        } else {
          fileStream.pipe(res);
        }
      } else {
        res.end();
      }
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

//index.html 页面是直接通过浏览器地址栏访问的。根据浏览器的标准，通过地址栏访问、以及强制刷新网页的时候，
// HTTP 请求头自动会带上Cache-Control: no-cache和Pragma: no-cache的信息。只要有这两个请求头之一，
// 浏览器就会忽略响应头中的Cache-Control字段。

// 注意，这并不是说网页不会被缓存，而是 资源被访问的方式 （比如直接通过地址栏）会导致服务器返回给浏览器响应头中
// 的Cache-Control信息被忽略。如果这个网页是通过 iframe 加载的，那么这个网页就可能被浏览器缓存。
