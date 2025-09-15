const express = require('express');
const { authMiddleware } = require('../auth');
const { generateMatchesForRoute } = require('../services/matching');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Compute matches for a route (quick)
router.get('/route/:id', authMiddleware, async (req,res) => {
  try {
    const routeId = req.params.id;
    const matches = await generateMatchesForRoute(routeId, 200, 10);
    res.json(matches);
  } catch (e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
});

// Request to create a match (initiate conversation)
router.post('/request', authMiddleware, async (req,res) => {
  const { routeA, routeB } = req.body; // routeA = initiator's route id
  if (!routeA || !routeB) return res.status(400).json({error: 'routeA & routeB required'});
  const id = uuidv4();
  await db.query('INSERT INTO matches (id, route_a, route_b, initiator_user, status) VALUES ($1,$2,$3,$4,$5)', [id, routeA, routeB, req.user.id, 'pending']);
  // you may emit socket.io event to the other participant (done in main socket code)
  res.json({ match_id: id });
});

module.exports = router;
