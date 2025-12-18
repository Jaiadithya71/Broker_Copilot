// frontend/src/components/CommunicationTimeline.jsx

import React from 'react';

export default function CommunicationTimeline({ item }) {
  if (!item?.communications) {
    return <div style={{ color: 'var(--text-secondary)', fontSize: 13, padding: 20 }}>No communication history available</div>;
  }

  const { communications, primaryContact } = item;
  const { totalTouchpoints, emailCount, meetingCount, lastContactDate, recentEmails, recentMeetings } = communications;

  const daysSinceContact = lastContactDate
    ? Math.floor((new Date() - new Date(lastContactDate)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Condensed Summary Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <StatCell label="Emails" value={emailCount} color="var(--accent-primary)" />
        <StatCell label="Meetings" value={meetingCount} color="var(--accent-secondary)" />
        <StatCell label="Recency" value={daysSinceContact !== null ? `${daysSinceContact}d` : 'N/A'} color={daysSinceContact > 30 ? 'var(--danger)' : 'var(--success)'} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Unified Timeline Stack */}
        <div>
          <h5 style={{ margin: '0 0 10px', fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Activity</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentEmails?.slice(0, 2).map((email, i) => (
              <TimelineItem key={`e-${i}`} title={email.subject} subtitle={email.from} date={email.date} />
            ))}
            {recentMeetings?.slice(0, 2).map((meeting, i) => (
              <TimelineItem key={`m-${i}`} title={meeting.summary} subtitle="Meeting" date={new Date(meeting.date).toLocaleDateString()} />
            ))}
            {(!recentEmails?.length && !recentMeetings?.length) && <EmptyState text="No recent activity" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, color, icon }) {
  return (
    <div className="glass-card" style={{ padding: '8px 12px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
      <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {value}
      </div>
    </div>
  );
}

function TimelineItem({ title, subtitle, date, icon }) {
  return (
    <div className="glass-card" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', fontSize: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {title || 'Untitled'}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginLeft: 8 }}>{date}</div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{subtitle}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ padding: 10, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 10, border: '1px dashed var(--border-color)', borderRadius: 8 }}>{text}</div>;
}
