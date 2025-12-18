// frontend/src/components/UpcomingEventsPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UpcomingEventsPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/auth/google/calendar', {
        params: { daysBack: 0, daysForward: 2 }
      });
      const allEvents = response.data.events || [];
      const now = new Date();
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      dayAfterTomorrow.setHours(23, 59, 59, 999);
      const filtered = allEvents.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= now && eventDate <= dayAfterTomorrow;
      });
      setEvents(filtered);
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const grouped = { today: [], tomorrow: [] };
    events.forEach(event => {
      const eventDateOnly = new Date(new Date(event.start).setHours(0, 0, 0, 0));
      if (eventDateOnly.getTime() === today.getTime()) grouped.today.push(event);
      else if (eventDateOnly.getTime() === tomorrow.getTime()) grouped.tomorrow.push(event);
    });
    return grouped;
  };

  const formatEventTime = (event) => {
    if (event.isAllDay) return 'All Day';
    return new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getEventIcon = (summary) => null;

  const grouped = groupEventsByDay();
  const totalEvents = events.length;

  if (collapsed) {
    return (
      <div className="glass-card" style={{ padding: '24px 0', width: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }} onClick={() => setCollapsed(false)}>EVENTS</span>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <h4 style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Next 48 Hours
          </h4>
          <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>
            {totalEvents}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={fetchUpcomingEvents} className="btn-secondary" style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)' }}>REFRESH</button>
          <button onClick={() => setCollapsed(true)} className="btn-secondary" style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)', marginLeft: 4 }}>HIDE</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-secondary)', fontSize: 11 }} className="animate-pulse">Loading schedule...</div>
      ) : totalEvents === 0 ? (
        <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-secondary)', fontSize: 11 }}>Clear schedule</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {grouped.today.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--accent-secondary)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Today</div>
              {grouped.today.map((event, idx) => (
                <EventCard key={idx} event={event} icon={getEventIcon(event.summary)} time={formatEventTime(event)} />
              ))}
            </div>
          )}
          {grouped.tomorrow.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Tomorrow</div>
              {grouped.tomorrow.map((event, idx) => (
                <EventCard key={idx} event={event} icon={getEventIcon(event.summary)} time={formatEventTime(event)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, icon, time }) {
  return (
    <div style={{
      padding: '8px 10px',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 6,
      border: '1px solid var(--border-color)',
      marginBottom: 4,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 6
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{event.summary}</div>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{event.location || 'No location'}</div>
        </div>
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>{time}</div>
    </div>
  );
}