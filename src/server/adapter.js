const { Readable } = require("stream");
const { EventEmitter } = require("events");

function buildExpressRequest(method, urlPath, headers, bodyBuffer) {
  const req = new Readable();
  req._read = () => {};
  if (bodyBuffer && bodyBuffer.length) {
    req.push(bodyBuffer);
  }
  req.push(null);

  req.method = method;
  req.url = urlPath;
  req.headers = headers;
  req.httpVersion = "1.1";
  req.connection = {};
  req.socket = {};

  return req;
}

function buildExpressResponse() {
  const res = new EventEmitter();
  res.statusCode = 200;
  res._headers = {};
  res._chunks = [];

  res.setHeader = (name, value) => {
    res._headers[name.toLowerCase()] = value;
  };
  res.getHeader = (name) => res._headers[name.toLowerCase()];
  res.removeHeader = (name) => {
    delete res._headers[name.toLowerCase()];
  };
  res.write = (chunk) => {
    res._chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return true;
  };
  res.writeHead = (status, headers) => {
    res.statusCode = status;
    if (headers) {
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    }
  };
  res.end = (chunk) => {
    if (chunk) res.write(chunk);
    res.emit("finish");
  };

  return res;
}

async function runExpressApp(app, request, urlPath) {
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  let bodyBuffer = null;
  if (!["GET", "HEAD"].includes(request.method)) {
    const arrayBuffer = await request.arrayBuffer();
    bodyBuffer = Buffer.from(arrayBuffer);
  }

  const req = buildExpressRequest(request.method, urlPath, headers, bodyBuffer);
  const res = buildExpressResponse();

  await new Promise((resolve) => {
    res.on("finish", resolve);
    app(req, res);
  });

  const body = Buffer.concat(res._chunks);
  const responseHeaders = new Headers();
  Object.entries(res._headers).forEach(([key, value]) => {
    if (value !== undefined) responseHeaders.set(key, String(value));
  });

  return new Response(body, {
    status: res.statusCode,
    headers: responseHeaders,
  });
}

module.exports = { runExpressApp };
