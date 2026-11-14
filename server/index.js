// Graceful environment variable loading
try {
  await import('dotenv/config');
} catch {
  // Uses system/container process.env
}
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'speedus_super_secret_jwt_key_2026';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// In-Memory / File-backed Database Store
const DATA_FILE = path.join(__dirname, 'speedus_db.json');

let db = {
  users: [],
  leaderboards: [
    { name: 'Apex_Ghost', car: 'Apex Horizon GT', trackTime: '1:12.45', earnings: 1450000 },
    { name: 'Vortex_Racer', car: 'Phantom Nemesis V12', trackTime: '1:14.20', earnings: 980000 },
    { name: 'Drift_King_99', car: 'Cyclone R-Spec', trackTime: '1:16.88', earnings: 620000 },
    { name: 'Jordan Stone', car: 'Crown Cruiser Cab', trackTime: '1:24.10', earnings: 35000 }
  ]
};

// Load saved DB if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    db = JSON.parse(raw);
  } catch (e) {
    console.error('Error loading db file, starting fresh', e);
  }
}

function saveDB() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving db file', e);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    game: 'SPEED US',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Authentication: Register
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const existing = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: `user_${Date.now()}`,
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    saveData: null
  };

  db.users.push(newUser);
  saveDB();

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, {
    expiresIn: '7d'
  });

  res.json({
    message: 'User registered successfully',
    token,
    user: { id: newUser.id, username: newUser.username }
  });
});

// Authentication: Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find((u) => u.username.toLowerCase() === (username || '').toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '7d'
  });

  res.json({
    message: 'Logged in successfully',
    token,
    user: { id: user.id, username: user.username },
    saveData: user.saveData
  });
});

// Cloud Save Sync
app.post('/api/player/save', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing auth header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.saveData = req.body.saveData;
    saveDB();

    res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (e) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

// Leaderboards
app.get('/api/leaderboards', (req, res) => {
  res.json({ leaderboards: db.leaderboards });
});

// ----------------------------------------------------
// PRODUCTION FRONTEND SERVING (client/dist)
// ----------------------------------------------------
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[SPEED US Backend] Serving static frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 for unmatched API requests
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`[SPEED US Backend] Server running on http://localhost:${PORT}`);
  console.log(`[SPEED US Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
});
