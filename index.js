const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

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
    
    // Fix relative links in the page
    let fixedData = data.replace(/href="\//g, 'href="/proxy?url=' + targetUrl + '/');
    fixedData = fixedData.replace(/src="\//g, 'src="/proxy?url=' + targetUrl + '/');
    
    res.send(fixedData);
    
  } catch (error) {
    console.log('Error:', error.message);
    res.send('<h2>Error</h2><p>' + error.message + '</p><a href="/">Back</a>');
  }
});

// NEW: Catch-all route to handle any path
app.get('*', (req, res) => {
  const possibleUrl = req.originalUrl.substring(1); // Remove leading /
  
  if (possibleUrl.startsWith('http://') || possibleUrl.startsWith('https://')) {
    res.redirect('/proxy?url=' + encodeURIComponent(possibleUrl));
  } else {
    res.redirect('/');
  }
});

app.listen(PORT, () => {
  console.log('Proxy running on port ' + PORT);
});
