const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

app.use(express.json());

// Serve static frontend files from project directory
app.use(express.static(__dirname));

function readAll() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeAll(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function validateRegistration(b) {
  const errors = [];
  function req(name) {
    if (!b[name] || String(b[name]).trim() === '') errors.push(`${name} is required`);
  }
  req('fullName');
  req('studentId');
  req('department');
  req('year');
  req('gender');

  if (b.email && !/^\S+@\S+\.\S+$/.test(b.email)) errors.push('email invalid');
  if (b.phone && !/^\+?[0-9\-\s]{7,15}$/.test(b.phone)) errors.push('phone invalid');
  return errors;
}

// List registrations
app.get('/api/registrations', (req, res) => {
  res.json(readAll());
});

// Create a registration
app.post('/api/register', (req, res) => {
  const body = req.body || {};
  const errors = validateRegistration(body);
  if (errors.length) return res.status(400).json({ errors });

  const list = readAll();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const record = {
    id,
    fullName: String(body.fullName).trim(),
    studentId: String(body.studentId).trim(),
    department: String(body.department).trim(),
    year: String(body.year).trim(),
    gender: String(body.gender).trim(),
    email: body.email ? String(body.email).trim() : '',
    phone: body.phone ? String(body.phone).trim() : '',
    membershipType: body.membershipType ? String(body.membershipType).trim() : 'Member',
    createdAt: new Date().toISOString(),
  };

  list.push(record);
  writeAll(list);
  res.status(201).json(record);
});

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
