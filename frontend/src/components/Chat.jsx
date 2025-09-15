import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import API from '../api';

export default function Chat({ token, user, routeId }) {
  const [socket, setSocket] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(()=> {
    const s = io('http://localhost:4000', { transports: ['websocket'] });
    setSocket(s);
    s.on('message', (m) => {
      setMessages(prev => [...prev, m]);
    });
    return ()=> s.disconnect();
  }, []);

  async function requestMatch(otherRouteId) {
    const headers = { Authorization: `Bearer ${token}` };
    const r = await API.post('/matches/request', { routeA: routeId, routeB: otherRouteId }, { headers });
    setMatchId(r.data.match_id);
    // join socket room
    socket.emit('join_match', { match_id: r.data.match_id, user_id: user.id });
  }

  async function loadMessages() {
    if (!matchId) return;
    const headers = { Authorization: `Bearer ${token}` };
    const r = await API.get(`/chat/${matchId}/messages`, { headers });
    setMessages(r.data);
  }

  useEffect(()=> { loadMessages(); }, [matchId]);

  function send() {
    if(!socket || !matchId) return alert('no match selected');
    socket.emit('send_message', { match_id: matchId, sender_user: user.id, content: text });
    setText('');
  }

  return <div>
    <h4>Chat</h4>
    {!matchId && <div>
      <p>Request a match by entering another route id:</p>
      <input id="other" placeholder="other route id" />
      <button onClick={()=> requestMatch(document.getElementById('other').value)}>Request Match</button>
    </div>}
    {matchId && <>
      <div style={{height:300, overflowY:'auto', border:'1px solid #ccc', padding:8}}>
        {messages.map((m,i)=> <div key={i}><b>{m.sender_user}</b>: {m.content}</div>)}
      </div>
      <input value={text} onChange={e=>setText(e.target.value)} />
      <button onClick={send}>Send</button>
    </>}
  </div>
}
