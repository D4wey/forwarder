const http = require('http');
const httpProxy = require('http-proxy');
let requests = {};
const proxy = httpProxy.createProxyServer({});

const mapping = {
  'playtopus.net': { target: 'http://localhost:500', rate_limit: 50 },
  'ddos-guard.dns.central-eu.playtopus.net': { target: 'http://localhost:2096', rate_limit: 2 },
  'example.com': { target: 'http://localhost:8080', rate_limit: 10 },
};

const server = http.createServer((req, res) => {
  const { host, 'user-agent': userAgent } = req.headers;

  if (host && mapping.hasOwnProperty(host)) {
    const { target, rate_limit } = mapping[host];
    const userKey = `${host}-${userAgent}`;

    if (!requests[userKey]) {
      requests[userKey] = {
        count: 0,
        timestamp: Math.floor(Date.now() / 1000),
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const { count, timestamp } = requests[userKey];

    if (now === timestamp) {
      if (count >= rate_limit) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
      }
    } else {
      requests[userKey] = {
        count: 0,
        timestamp: now,
      };
    }

    requests[userKey].count++;
    proxy.web(req, res, { target });
  } else {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Forbidden');
  }
});

server.listen(80, () => {
  console.log('Reverse proxy server listening on port 80');
});