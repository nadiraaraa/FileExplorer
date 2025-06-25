const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

const BASE_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(bodyParser.json());

function getFolderContents(relativePath = '') {
  const absPath = path.join(BASE_DIR, relativePath);
  if (!fs.existsSync(absPath)) return [];

  const entries = fs.readdirSync(absPath);
  return entries.map(entry => {
    const fullPath = path.join(absPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      return {
        name: entry,
        type: 'folder',
        children: null
      };
    } else {
      return {
        name: entry,
        type: 'file',
        size: stat.size,
        createdAt: stat.birthtime.toISOString()
      };
    }
  });
}

// GET /api/folder?path=&sortBy=
app.get('/api/folder', (req, res) => {
  const folderPath = req.query.path || '';
  const sortBy = req.query.sortBy || 'name';

  try {
    let contents = getFolderContents(folderPath);

    contents.sort((a, b) => {
      const dirPriority = (a.type === 'folder') - (b.type === 'folder');
      if (dirPriority) return -dirPriority;

      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    });

    res.json(contents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/folder { path, name }
app.post('/api/folder', (req, res) => {
  const { path: folderPath, name } = req.body;
  const newFolderPath = path.join(BASE_DIR, folderPath, name);
  try {
    fs.mkdirSync(newFolderPath, { recursive: true });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/item { path }
app.delete('/api/item', (req, res) => {
  const { path: itemPath } = req.body;
  const absPath = path.join(BASE_DIR, itemPath);
  try {
    const stat = fs.statSync(absPath);
    if (stat.isDirectory()) {
      fs.rmdirSync(absPath, { recursive: true });
    } else {
      fs.unlinkSync(absPath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`File API server running on http://localhost:${PORT}`);
});
