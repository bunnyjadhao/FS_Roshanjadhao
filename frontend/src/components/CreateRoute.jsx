import React, { useState } from 'react';
import API from '../api';

export default function CreateRoute({ token }){
  const [startLat,setStartLat]=useState('');
  const [startLng,setStartLng]=useState('');
  const [endLat,setEndLat]=useState('');
  const [endLng,setEndLng]=useState('');
  async function submit(e){
    e.preventDefault();
    const headers = { Authorization: `Bearer ${token}` };
    const r = await API.post('/commutes', {
      start: { lat: parseFloat(startLat), lng: parseFloat(startLng) },
      end: { lat: parseFloat(endLat), lng: parseFloat(endLng) },
      seats_available: 1
    }, { headers });
    alert('Route created: ' + r.data.id);
  }
  return <form onSubmit={submit}>
    <h4>Create Route</h4>
    <div>Start: <input value={startLat} onChange={e=>setStartLat(e.target.value)} placeholder="lat" /> <input value={startLng} onChange={e=>setStartLng(e.target.value)} placeholder="lng" /></div>
    <div>End: <input value={endLat} onChange={e=>setEndLat(e.target.value)} placeholder="lat" /> <input value={endLng} onChange={e=>setEndLng(e.target.value)} placeholder="lng" /></div>
    <button>Create</button>
  </form>
}
