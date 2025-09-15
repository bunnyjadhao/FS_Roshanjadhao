import React, { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import API from '../api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function ClickPoints({ onPoint, points }) {
  useMapEvents({
    click(e) {
      onPoint(e.latlng);
    }
  });
  return null;
}

export default function MapView({ token, onSelectRoute, user }){
  const [points,setPoints] = useState([]);
  const [routeGeo, setRouteGeo] = useState(null);
  const [matches, setMatches] = useState([]);

  async function createRouteOnServer(geojson, start, end) {
    const headers = { Authorization: `Bearer ${token}` };
    const r = await API.post('/commutes', {
      start: { lat: start.lat, lng: start.lng },
      end: { lat: end.lat, lng: end.lng },
      start_time: null,
      end_time: null,
      seats_available: 1
    }, { headers });
    return r.data.id;
  }

  async function onMapClick(latlng){
    setPoints(p => {
      const next = [...p, latlng];
      if (next.length > 2) next.shift(); // keep last two
      return next;
    });
  }

  useEffect(()=>{
    if (points.length === 2) {
      // call Mapbox via backend's commutes endpoint (server will call mapbox)
      async function createAndFetchMatches(){
        const headers = { Authorization: `Bearer ${token}` };
        const res = await API.post('/commutes', {
          start: { lat: points[0].lat, lng: points[0].lng },
          end: { lat: points[1].lat, lng: points[1].lng },
          seats_available: 1
        }, { headers });
        const routeId = res.data.id;
        // fetch matches
        const m = await API.get(`/matches/route/${routeId}`, { headers });
        setMatches(m.data);
        // expose selected route for chat
        onSelectRoute(routeId);
      }
      createAndFetchMatches().catch(console.error);
    }
  }, [points]);

  return (
    <MapContainer center={[12.9716,77.5946]} zoom={12} style={{height:'100vh'}}>
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
        id='mapbox/streets-v11'
        tileSize={512}
        zoomOffset={-1}
      />
      <ClickPoints onPoint={onMapClick} points={points}/>
      {points.map((p,i)=><Marker key={i} position={[p.lat,p.lng]} />)}
      {routeGeo && <Polyline positions={routeGeo.coordinates.map(c => [c[1], c[0]])} />}
      <div style={{position:'absolute', right:12, top:12, background:'#fff', padding:8}}>
        <h4>Matches</h4>
        {matches.length===0 && <div>No matches yet — click start and end on map to create route</div>}
        {matches.map(m => (
          <div key={m.route_id} style={{borderBottom:'1px solid #eee', padding:6}}>
            <div><strong>{m.route_id}</strong></div>
            <div>overlap: {(m.overlap_ratio*100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
    </MapContainer>
  );
}
