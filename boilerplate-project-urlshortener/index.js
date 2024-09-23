require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));  // Middleware to parse POST requests

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urls = [];

// Handle POST requests to shorten URLs
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  const urlRegex = /^https?:\/\/(www\.)?.+/;

  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const hostname = originalUrl.replace(/^https?:\/\//, '').split('/')[0];

  dns.lookup(hostname, (err, address) => {
    if (err || !address) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = urls.length + 1;
    urls.push({ original_url: originalUrl, short_url: shortUrl });

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Handle GET requests to redirect to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url, 10);
  const urlEntry = urls.find(entry => entry.short_url === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
