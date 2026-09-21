import http from 'http';

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      timeout: 1500
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ path, status: res.statusCode, data: data.slice(0, 100), headers: res.headers }));
    });
    req.on('error', (err) => resolve({ path, error: err.message }));
    req.end();
  });
}

const paths = ['/', '/api', '/api/server/status', '/api/sessions', '/dashboard', '/ping'];
for (const p of paths) {
  const res = await testEndpoint(p);
  console.log(JSON.stringify(res));
}
