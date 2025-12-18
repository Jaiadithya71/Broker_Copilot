// frontend/src/components/ActionPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MeetingScheduler from './MeetingScheduler';

export default function ActionPanel({ brief, item }) {
  const [sending, setSending] = useState(false);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [editableSubject, setEditableSubject] = useState('');
  const [editableBody, setEditableBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientMode, setRecipientMode] = useState('automatic');
  const [attachBrief, setAttachBrief] = useState(true);

  useEffect(() => {
    if (brief?.outreachTemplate && item) {
      const template = typeof brief.outreachTemplate === 'string'
        ? brief.outreachTemplate
        : JSON.stringify(brief.outreachTemplate);

      const subjectMatch = template.match(/Subject:\s*(.+)/);
      const subject = subjectMatch
        ? subjectMatch[1].trim()
        : `${item.clientName} - Renewal Discussion`;

      const body = template.replace(/Subject:.*?\n\n?/, '');

      setEditableSubject(subject);
      setEditableBody(body);

      if (item.primaryContact?.email) {
        setRecipientEmail(item.primaryContact.email);
      } else {
        const fallback = `${item.primaryContactName?.toLowerCase().replace(/\s+/g, '') || 'client'}@${item.clientName?.toLowerCase().replace(/\s+/g, '') || 'example'}.com`;
        setRecipientEmail(fallback);
      }
    }
  }, [brief, item]);

  const copyTemplate = () => {
    const fullTemplate = `Subject: ${editableSubject}\n\n${editableBody}`;
    navigator.clipboard.writeText(fullTemplate);
    alert('Outreach email copied to clipboard!');
  };

  const printBrief = () => {
    if (!item?.id) return;
    const url = `/api/renewals/${item.id}/pdf`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.clientName}_brief.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendEmail = async () => {
    if (!editableSubject || !editableBody || !recipientEmail) {
      alert('Please fill in all fields (recipient, subject, and body)');
      return;
    }
    setSending(true);
    try {
      const htmlBody = editableBody
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      const response = await axios.post('/api/send-email', {
        to: recipientEmail,
        subject: editableSubject,
        body: editableBody,
        htmlBody: htmlBody,
        renewalId: item.id,
        attachBrief: attachBrief,
        briefData: attachBrief ? { ...brief, item } : null
      });

      if (response.data.success) {
        alert(`Email sent successfully to ${recipientEmail}!`);
        setShowEmailEditor(false);
      } else throw new Error(response.data.error);
    } catch (err) {
      alert(`Failed to send: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: 16 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Recommended Actions</h4>

      {brief?.keyActions ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {brief.keyActions.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.35 }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{i + 1}.</span>
              <span>{a}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 16 }}>Formulating plan...</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={() => brief && setShowEmailEditor(true)}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', height: 40 }}
          disabled={!brief}
        >
          Send Outreach
        </button>

        <button
          onClick={() => setShowMeetingScheduler(true)}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', height: 40 }}
          disabled={!item}
        >
          Schedule Meeting
        </button>

        <div style={{ height: 1, background: 'var(--border-color)', margin: '2px 0' }}></div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={copyTemplate}
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '8px 4px' }}
            disabled={!brief}
          >
            Copy Text
          </button>

          <button
            onClick={printBrief}
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '8px 4px' }}
            disabled={!brief}
          >
            PDF Report
          </button>
        </div>
      </div>

      {showEmailEditor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ padding: 24, width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}>Compose Outreach</h3>
              <button onClick={() => setShowEmailEditor(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>RECIPIENT</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button onClick={() => setRecipientMode('automatic')} className={`btn ${recipientMode === 'automatic' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontSize: 12 }}>Auto</button>
                  <button onClick={() => setRecipientMode('manual')} className={`btn ${recipientMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontSize: 12 }}>Manual</button>
                </div>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  disabled={recipientMode === 'automatic'}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 8 }}>
                <input type="checkbox" checked={attachBrief} onChange={(e) => setAttachBrief(e.target.checked)} style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 13 }}>Attach Analysis PDF</span>
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>SUBJECT</label>
                <input
                  type="text"
                  value={editableSubject}
                  onChange={(e) => setEditableSubject(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>MESSAGE</label>
                <textarea
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  rows={10}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button onClick={() => setShowEmailEditor(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={sendEmail} disabled={sending} className="btn btn-primary">
                  {sending ? 'Sending...' : 'Send Outreach'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMeetingScheduler && <MeetingScheduler item={item} onClose={() => setShowMeetingScheduler(false)} />}
    </div>
  );
}