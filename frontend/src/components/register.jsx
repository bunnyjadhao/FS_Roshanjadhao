import React, { useState } from 'react';
import API from '../api';

export default function Register({ onAuth }){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  async function submit(e){
    e.preventDefault();
    const r = await API.post('/auth/register', { email, password, desiredUsername: email.split('@')[0] });
    onAuth(r.data.user, r.data.token);
  }
  return <form onSubmit={submit}>
    <h4>Register</h4>
    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" /><br/>
    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password"/><br/>
    <button>Register</button>
  </form>
}
