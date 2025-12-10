import express from "express";
import cors from "cors";
import { renewals } from "./src/sampleData.js";
const app = express();
const PORT = process.env.PORT||4000;
app.use(cors()); app.use(express.json());

function computeScore(item){
  const now=new Date(); const exp=new Date(item.expiryDate);
  const days=Math.max(1, Math.round((exp-now)/(1000*60*60*24)));
  const timeScore=Math.max(0,100-days);
  const premiumScore=Math.min(40, Math.round(item.premium/100000));
  const touchpointScore=Math.min(20,(item.recentTouchpoints||0)*4);
  const raw=timeScore+premiumScore+touchpointScore;
  const bounded=Math.max(10, Math.min(99, raw));
  return { value: bounded, breakdown:{ timeScore, premiumScore, touchpointScore, daysToExpiry: days } };
}

function withScores(list){ return list.map(i=>({...i, priorityScore: computeScore(i).value, _scoreBreakdown: computeScore(i).breakdown})).sort((a,b)=>b.priorityScore-a.priorityScore); }

app.get("/api/renewals",(req,res)=>res.json({items: withScores(renewals)}));
app.get("/api/renewals/:id",(req,res)=>{ const it=withScores(renewals).find(r=>r.id===req.params.id); if(!it) return res.status(404).json({error:"not found"}); res.json({item:it}); });
app.get("/api/renewals/:id/brief",(req,res)=>{ const item=renewals.find(r=>r.id===req.params.id); if(!item) return res.status(404).json({error:"not found"}); const s=computeScore(item); const brief={ summary:`Client ${item.clientName} policy ${item.policyNumber} with ${item.carrier} expires ${item.expiryDate}.`, riskNotes:[ s.breakdown.daysToExpiry<=30? 'Renewal inside 30 days':'Renewal further out', item.recentTouchpoints===0? 'No recent touchpoints': item.recentTouchpoints+' touchpoints' ], keyActions:['Confirm exposures','Check claims','Align pricing'], outreachTemplate:`Subject: ${item.clientName} – renewal\n\nHi ${item.primaryContactName},\nYour policy is due ${item.expiryDate}...`, confidence: s.value>=80?'high': s.value>=60?'medium':'low', sources:[{type:'CRM', system:item.sourceSystem, recordId:item.crmRecordId}] , _scoreBreakdown: s.breakdown }; res.json({brief}); });

app.get("/api/connectors",(req,res)=>{
  const now=new Date(); const min=(m)=>new Date(now.getTime()-m*60000).toISOString();
  res.json({connectors:[{name:'HubSpot CRM', status:'connected', lastSync:min(12)},{name:'Outlook Email', status:'connected', lastSync:min(18)},{name:'Policy Storage', status:'connected', lastSync:min(65)}]});
});
app.post("/api/simulate-sync",(req,res)=>res.json({result:'triggered', at:new Date().toISOString()}));

app.post("/api/qa",(req,res)=>{
  const {question, recordId}=req.body||{};
  if(!question) return res.json({answer:'Ask a question', confidence:'low'});
  const item = recordId? renewals.find(r=>r.id===recordId): null;
  if(!item) return res.json({answer:`There are ${renewals.length} records. Select one.`, confidence:'medium'});
  const q=question.toLowerCase(); const parts=[];
  if(q.includes('premium')) parts.push(`Premium: ${item.premium} INR`);
  if(q.includes('expiry')||q.includes('renewal')) parts.push(`Expiry: ${item.expiryDate}`);
  if(q.includes('carrier')) parts.push(`Carrier: ${item.carrier}`);
  if(parts.length===0) parts.push('I can answer about premium, expiry, carrier, status.');
  res.json({answer: parts.join(' '), confidence:'medium', source:{system:item.sourceSystem, crmRecordId:item.crmRecordId}});
});

app.get("/",(req,res)=>res.send("running"));
app.listen(PORT,()=>console.log('listening',PORT));
