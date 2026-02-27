// Health check script for backend service
const http = require('http');

const PORT = process.env.PORT || 5000;

http.get(`http://localhost:${PORT}/api/auth`, (res) => {
  // 200 or 401 (Unauthorized) both indicate the server is running
  if (res.statusCode === 200 || res.statusCode === 401) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).on('error', () => {
  process.exit(1);
});
