const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { generateToken } = require('../auth');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

function normalizeUsername(u){
  return u.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
}

async function makeUniqueUsername(desired) {
  const base = normalizeUsername(desired || 'student');
  let candidate = base;
  let i = 0;
  while(true){
    const r = await db.query('SELECT 1 FROM users WHERE username = $1', [candidate]);
    if (r.rowCount === 0) return candidate;
    i++;
    candidate = `${base}${i}`;
  }
}

router.post('/register', async (req,res) => {
  const { email, password, desiredUsername } = req.body;
  if (!email || !password) return res.status(400).json({error:'email and password required'});
  const password_hash = await bcrypt.hash(password, 10);
  const username = await makeUniqueUsername(desiredUsername || email.split('@')[0]);
  const id = uuidv4();
  await db.query('INSERT INTO users (id, email, password_hash, username) VALUES ($1,$2,$3,$4)', [id, email, password_hash, username]);
  const token = generateToken({ id, email, username });
  res.json({ user: { id, email, username }, token });
});

router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({error:'email and password required'});
  const r = await db.query('SELECT id, password_hash, username FROM users WHERE email = $1', [email]);
  if (r.rowCount === 0) return res.status(400).json({error:'invalid credentials'});
  const row = r.rows[0];
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(400).json({error:'invalid credentials'});
  const token = generateToken({ id: row.id, email, username: row.username });
  res.json({ user: { id: row.id, email, username: row.username }, token });
});

module.exports = router;
