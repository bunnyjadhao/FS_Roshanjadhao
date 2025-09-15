import React, { useState } from 'react';
import API from '../api';

export default function Login({ onAuth }){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  async function submit(e){
    e.preventDefault();
    const r = await API.post('/auth/login', { email, password });
    onAuth(r.data.user, r.data.token);
  }
  return <form onSubmit={submit}>
    <h4>Login</h4>
    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" /><br/>
    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password"/><br/>
    <button>Login</button>
  </form>
}
