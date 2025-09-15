const axios = require('axios');
require('dotenv').config();

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

async function snapRoute(start, end) {
  // start/end are {lat, lng}
  // Mapbox Directions API expects lon,lat
  const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`;
  const params = {
    geometries: 'geojson',
    overview: 'full',
    access_token: MAPBOX_TOKEN
  };
  const r = await axios.get(url, { params });
  const data = r.data;
  if (!data.routes || !data.routes[0]) throw new Error('No route from Mapbox');
  return data.routes[0].geometry; // GeoJSON LineString
}

module.exports = { snapRoute };
