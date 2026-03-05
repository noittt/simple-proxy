const express = require('express');
const fetch = require('node-fetch');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

// Keep alive function
function keepAlive() {
  const url = `https://simple-proxy-bi0h.onrender.com`;
  https.get(url, (resp) => {
    console.log('🔄 Self-ping successful at', new Date().toLocaleTimeString());
  }).on('error', (err) => {
    console.log('❌ Self-ping failed:', err.message);
  });
}

// Ping every 10 minutes
setInterval(keepAlive, 10 * 60 * 1000);
keepAlive(); // Ping on startup

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Proxy</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        input { width: 400px; padding: 8px; }
        button { padding: 8px 15px; background: #0066cc; color: white; border: none; }
      </style>
    </head>
    <body>
      <h1>✅ Proxy Ready</h1>
      <p>Enter URL:</p>
      <input id="url" size="50" placeholder="example.com">
      <button onclick="go()">Go</button>
      
      <script>
        function go() {
          const url = document.getElementById('url').value;
          if (!url) return;
          
          let fullUrl = url;
          if (!url.startsWith('http')) {
            fullUrl = 'https://' + url;
          }
          
          window.location.href = '/proxy?url=' + encodeURIComponent(fullUrl);
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.send('No URL');
    
    console.log('Fetching:', targetUrl);
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const data = await response.text();
    res.send(data);
    
  } catch (error) {
    console.log('Error:', error.message);
    res.send('<h2>Error</h2><p>' + error.message + '</p><a href="/">Back</a>');
  }
});

// Catch-all route
app.get('*', (req, res) => {
  const possibleUrl = req.originalUrl.substring(1);
  if (possibleUrl.startsWith('http://') || possibleUrl.startsWith('https://')) {
    res.redirect('/proxy?url=' + encodeURIComponent(possibleUrl));
  } else {
    res.redirect('/');
  }
});

// FIXED: Listen on 0.0.0.0 so Render can detect the port
app.listen(PORT, '0.0.0.0', () => {
  console.log('Proxy running on port ' + PORT);
});
