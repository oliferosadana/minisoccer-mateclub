import https from 'https';

async function testRemote(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = https.request({
        hostname: u.hostname,
        path: '/api/sessions',
        method: 'GET',
        timeout: 4000
      }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ url, status: res.statusCode, data: data.slice(0, 100) }));
      });
      req.on('error', e => resolve({ url, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ url, error: 'timeout' }); });
      req.end();
    } catch (e) {
      resolve({ url, error: e.message });
    }
  });
}

const urls = [
  'https://waha.masondo.dev',
  'https://wa.masondo.dev',
  'https://whatsapp.masondo.dev',
  'https://gopay.masondo.dev'
];

for (const u of urls) {
  const r = await testRemote(u);
  console.log(JSON.stringify(r));
}
