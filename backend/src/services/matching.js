const db = require('../db');

async function generateMatchesForRoute(routeId, bufferMeters = 200, limit = 10) {
  // Use PostGIS functions to find overlaps using a buffer in meters (geography)
  const sql = `
  WITH sel AS (SELECT route_geom FROM routes WHERE id = $1 AND active = true)
  SELECT
    r.id,
    r.user_id,
    ST_Length(ST_Intersection(r.route_geom, ST_Buffer(sel.route_geom::geography, $2)::geometry)::geography) AS overlap_m,
    ST_Length(r.route_geom::geography) as route_len_m
  FROM routes r, sel
  WHERE r.id != $1
    AND r.active
    AND ST_Intersects(r.route_geom, ST_Buffer(sel.route_geom::geography, $2)::geometry)
  ORDER BY overlap_m DESC
  LIMIT $3;
  `;
  const res = await db.query(sql, [routeId, bufferMeters, limit]);
  // compute ratio etc
  return res.rows.map(r => ({
    route_id: r.id,
    user_id: r.user_id,
    overlap_m: parseFloat(r.overlap_m || 0),
    route_len_m: parseFloat(r.route_len_m || 0),
    overlap_ratio: r.route_len_m ? (parseFloat(r.overlap_m || 0) / parseFloat(r.route_len_m)) : 0
  }));
}

module.exports = { generateMatchesForRoute };
