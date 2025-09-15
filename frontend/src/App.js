import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import MapView from './components/MapView';
import CreateRoute from './components/CreateRoute';
import Chat from './components/Chat';

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  if(!token) {
    return <div style={{padding:20}}>
      <h2>Student Commute Optimizer (MVP)</h2>
      <Register onAuth={(u,t)=>{ setUser(u); setToken(t); localStorage.setItem('token',t); localStorage.setItem('user', JSON.stringify(u)); }} />
      <hr />
      <Login onAuth={(u,t)=>{ setUser(u); setToken(t); localStorage.setItem('token',t); localStorage.setItem('user', JSON.stringify(u)); }} />
    </div>
  }
  return (
    <div style={{display:'flex', height:'100vh'}}>
      <div style={{flex:1}}>
        <MapView token={token} onSelectRoute={setSelectedRouteId} user={user}/>
      </div>
      <div style={{width:360, borderLeft:'1px solid #ddd', padding:12}}>
        <h3>Actions</h3>
        <CreateRoute token={token} />
        <hr />
        {selectedRouteId && <Chat token={token} user={user} routeId={selectedRouteId} />}
      </div>
    </div>
  );
}
