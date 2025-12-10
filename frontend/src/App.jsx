import React, {useEffect, useState} from 'react';
import axios from 'axios';

const computeScoreLocal=(item)=>{ const now=new Date(); const exp=new Date(item.expiryDate); const days=Math.max(1, Math.round((exp-now)/(1000*60*60*24))); const timeScore=Math.max(0,100-days); const premiumScore=Math.min(40, Math.round(item.premium/100000)); const touchpointScore=Math.min(20,(item.recentTouchpoints||0)*4); const raw=timeScore+premiumScore+touchpointScore; const value=Math.max(10, Math.min(99, raw)); return {value, breakdown:{timeScore,premiumScore,touchpointScore,daysToExpiry:days}} };

export default function App(){
  const [items,setItems]=useState([]); const [selected,setSelected]=useState(null); const [brief,setBrief]=useState(null); const [connectors,setConnectors]=useState([]); const [broker,setBroker]=useState(localStorage.getItem('broker')||''); const [showLogin,setShowLogin]=useState(!broker);

  useEffect(()=>{ load(); loadConnectors(); },[]);
  const load=async()=>{ try{ const r=await axios.get('/api/renewals'); setItems(r.data.items||[]); if(r.data.items && r.data.items.length) setSelected(r.data.items[0]); }catch(e){ alert('Failed to load backend. Start backend on :4000'); } };
  const loadConnectors=async()=>{ try{ const r=await axios.get('/api/connectors'); setConnectors(r.data.connectors||[]); }catch(e){} };
  useEffect(()=>{ if(!selected) return; axios.get(`/api/renewals/${selected.id}/brief`).then(r=>setBrief(r.data.brief)).catch(()=>{}); },[selected]);

  const saveBroker=(n)=>{ localStorage.setItem('broker',n); setBroker(n); setShowLogin(false); };

  return (<div style={{padding:20}}>
    <header style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <div><h2>Broker Renewal Copilot</h2><div style={{fontSize:12,color:'#9aa'}}>Connector-driven demo</div></div>
      <div>{broker? <div style={{fontSize:13}}>Prepared by <b>{broker}</b></div> : <button onClick={()=>setShowLogin(true)} className='btn'>Sign in</button>}</div>
    </header>

    <div style={{display:'flex', gap:16, marginTop:12}}>
      <aside style={{width:320, background:'#071127', padding:10, borderRadius:8}}>
        <h4 style={{margin:0}}>Pipeline</h4>
        {items.map(it=>(<div key={it.id} onClick={()=>setSelected(it)} style={{padding:8, border: selected && selected.id===it.id? '1px solid #2ecc71':'1px solid #123', marginTop:8, cursor:'pointer'}}>
          <div style={{fontWeight:600}}>{it.clientName}</div>
          <div style={{fontSize:12,color:'#9aa'}}>{it.productLine} · {it.expiryDate}</div>
          <div style={{marginTop:6}}>Priority: <b>{it.priorityScore}</b></div>
        </div>))}
      </aside>

      <main style={{flex:1}}>
        {selected? <div style={{background:'#071127', padding:12, borderRadius:8}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <div><h3 style={{margin:0}}>{selected.clientName}</h3><div style={{fontSize:13,color:'#9aa'}}>{selected.policyNumber} · {selected.carrier}</div></div>
            <div style={{textAlign:'right'}}><div>Expiry: {selected.expiryDate}</div><div>Premium: ₹{selected.premium.toLocaleString()}</div><div>Score: <b>{selected.priorityScore}</b></div></div>
          </div>

          <div style={{marginTop:12, display:'flex', gap:12}}>
            <div style={{flex:1}}>
              <h4 style={{margin:0}}>Summary</h4>
              <div style={{marginTop:6, color:'#cfe'}}>{brief? brief.summary: 'Loading brief...'}</div>
              <h5 style={{marginTop:12}}>Score breakdown</h5>
              <div style={{fontSize:13, color:'#9aa'}}>Time: {brief? brief._scoreBreakdown.timeScore:'-'} · Premium: {brief? brief._scoreBreakdown.premiumScore:'-'} · Touchpoints: {brief? brief._scoreBreakdown.touchpointScore:'-'}</div>
            </div>
            <div style={{width:300}}>
              <h4>Actions</h4>
              <ol>{brief && brief.keyActions? brief.keyActions.map((a,i)=>(<li key={i}>{a}</li>)): <li>Loading...</li>}</ol>
              <button onClick={()=>{ navigator.clipboard.writeText(brief? brief.outreachTemplate:''); alert('Copied'); }} className='btn' style={{marginTop:8}}>Copy Outreach</button>
              <button onClick={()=>{ const w=window.open(); w.document.write('<pre>'+JSON.stringify({selected,brief},null,2)+'</pre>'); w.print(); }} className='btn' style={{marginLeft:8}}>Print Brief</button>
            </div>
          </div>

          <div style={{marginTop:12}}>
            <h4>What-if simulator</h4>
            <Simulator item={selected} compute={computeScoreLocal} />
          </div>
        </div> : <div>Select a record</div>}
      </main>
    </div>

    <div style={{marginTop:12, display:'flex', gap:8}}>
      {connectors.map((c,i)=>(<div key={i} style={{padding:8, background:'#082', borderRadius:6}}>{c.name}<div style={{fontSize:11,color:'#9aa'}}>{c.status} · {new Date(c.lastSync).toLocaleString()}</div></div>))}
    </div>

    {showLogin && <Login onSave={saveBroker} />}
  </div>);
}

function Simulator({item, compute}){
  const [premium,setPremium]=useState(item.premium);
  const [touch,setTouch]=useState(item.recentTouchpoints||0);
  const [days,setDays]=useState(item._scoreBreakdown?.daysToExpiry||30);
  const simItem={...item, premium, recentTouchpoints:touch, expiryDate: new Date(Date.now()+days*24*60*60*1000).toISOString().split('T')[0]};
  const result=compute(simItem);
  return (<div style={{background:'#041022', padding:10, borderRadius:6}}>
    <div>Premium ₹{premium.toLocaleString()}</div>
    <input type='range' min='50000' max='2000000' value={premium} onChange={e=>setPremium(Number(e.target.value))} style={{width:'100%'}} />
    <div style={{marginTop:6}}>Touchpoints {touch}</div>
    <input type='range' min='0' max='10' value={touch} onChange={e=>setTouch(Number(e.target.value))} style={{width:'100%'}} />
    <div style={{marginTop:6}}>Days to expiry {days}</div>
    <input type='range' min='1' max='365' value={days} onChange={e=>setDays(Number(e.target.value))} style={{width:'100%'}} />
    <div style={{marginTop:8}}>Simulated score: <b>{result.value}</b></div>
  </div>);
}

function Login({onSave}){
  const [name,setName]=useState('');
  return (<div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center'}}>
    <div style={{background:'#071127', padding:16, borderRadius:8}}>
      <h4>Enter broker name</h4>
      <input value={name} onChange={e=>setName(e.target.value)} style={{padding:8, marginTop:8, width:240}} />
      <div style={{marginTop:8, textAlign:'right'}}><button onClick={()=>onSave(name||'Broker')} className='btn'>Save</button></div>
    </div>
  </div>);
}
