const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');
const { snapRoute } = require('../services/mapbox');
const router = express.Router();

// Create route (commute)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { start, end, start_time, end_time, seats_available } = req.body;
    // start/end = { lat, lng }
    if (!start || !end) return res.status(400).json({error:'start and end required'});
    // Snap to roads via Mapbox (returns geojson LineString)
    const geojson = await snapRoute(start, end);
    // insert into PostGIS
    const sql = `
      INSERT INTO routes (id, user_id, start_geom, end_geom, route_geom, start_time, end_time, seats_available)
      VALUES ($1,$2, ST_SetSRID(ST_MakePoint($3,$4),4326), ST_SetSRID(ST_MakePoint($5,$6),4326), ST_SetSRID(ST_GeomFromGeoJSON($7),4326), $8, $9, $10)
      RETURNING id
    `;
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    const params = [
      id,
      req.user.id,
      start.lng, start.lat,
      end.lng, end.lat,
      JSON.stringify(geojson),
      start_time || null,
      end_time || null,
      seats_available || 1
    ];
    await db.query(sql, params);
    res.json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// get user's routes
router.get('/mine', authMiddleware, async (req,res) => {
  const r = await db.query('SELECT id, start_time, end_time, seats_available, active FROM routes WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
  res.json(r.rows);
});

module.exports = router;
