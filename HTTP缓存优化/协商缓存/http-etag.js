const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const mime = require("mime");

const checksum = require("checksum");

const server = http.createServer((req, res) => {
  const srvUrl = url.parse(`http:${req.url}`);
  let pathe = srvUrl.path;
  if (pathe === "/") pathe = "/index.html";

  const resPath = path.resolve(__dirname, path.join("www", pathe));

  if (!fs.existsSync(resPath)) {
    res.writeHead(404, { "Content-Type": "text/html" });
    return res.end("<h1>404 Not Found</h1>");
  }

  checksum.file(resPath, (err, sum) => {
    const resStream = fs.createReadStream(resPath);
    sum = `"${sum}"`; // etag 要加双引号

    if (req.headers["if-none-match"] === sum) {
      res.writeHead(304, {
        "Content-Type": getMimeType(resPath),
        etag: sum,
      });
      res.end();
    } else {
      res.writeHead(200, {
        "Content-Type": mime.getType(resPath),
        etag: sum,
      });
      resStream.pipe(res);
    }
  });
});

server.on("clientError", (err, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

server.listen(8080, () => {
  console.log("opened server on", server.address());
});
