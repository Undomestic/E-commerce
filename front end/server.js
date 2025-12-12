const express = require('express');
const path = require('path');
const app = express();

// Serve static files from frontend folder
app.use(express.static(__dirname));

// Serve static files from form folder
app.use(express.static(path.join(__dirname, '../form')));

// Fallback to home.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Fallback for any route to serve HTML files
app.get('/:page.html', (req, res) => {
  const filePath = path.join(__dirname, req.params.page + '.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      // Try form folder
      const formPath = path.join(__dirname, '../form', req.params.page + '.html');
      res.sendFile(formPath, (formErr) => {
        if (formErr) res.status(404).send('Page not found');
      });
    }
  });
});

const PORT = 5500;
app.listen(PORT, () => {
  console.log(`🚀 Frontend running on http://localhost:${PORT}`);
});
