// Add this to your index.js - self-pinging mechanism
const https = require('https');

// Function to ping itself
function keepAlive() {
  const url = `https://simple-proxy-bi0h.onrender.com`;
  
  https.get(url, (resp) => {
    console.log('🔄 Self-ping successful at', new Date().toLocaleTimeString());
  }).on('error', (err) => {
    console.log('❌ Self-ping failed:', err.message);
  });
}

// Ping every 10 minutes (600,000 ms)
setInterval(keepAlive, 10 * 60 * 1000);

// Also ping on startup
keepAlive();
