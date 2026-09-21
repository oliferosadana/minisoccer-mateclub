import http from 'http';

function checkEndpoint(path) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3005,
      path: path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ path, status: res.statusCode, data: data.slice(0, 150) }));
    });
    req.on('error', err => resolve({ path, error: err.message }));
    req.end();
  });
}

console.log('--- Testing Live WAHA Server on Port 3005 ---');
const statusRes = await checkEndpoint('/api/server/status');
console.log('Status:', JSON.stringify(statusRes));

const sessionRes = await checkEndpoint('/api/sessions/default');
console.log('Session:', JSON.stringify(sessionRes));

const qrRes = await checkEndpoint('/api/default/auth/qr?format=json');
console.log('QR JSON:', JSON.stringify(qrRes));
