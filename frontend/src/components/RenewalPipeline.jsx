import React, { useState } from 'react';

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
        color: 'var(--text-secondary)',
        fontSize: 12,
        padding: '8px 10px',
        width: '100%',
        outline: 'none',
        cursor: 'pointer',
        fontWeight: 500
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} style={{ background: '#0f172a' }}>{opt.label}</option>
      ))}
    </select>
  );
}

export default function RenewalPipeline({ items, selected, onSelect, onRefresh }) {
  const [collapsed, setCollapsed] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState({});

  // Filter state
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const toggleDetails = (itemId) => {
    setDetailsExpanded(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getDaysDiff = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date - now;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredItems = items.filter(item => {
    if (expiryFilter !== 'all') {
      const days = getDaysDiff(item.expiryDate);
      if (days === null) return false;
      if (expiryFilter === '30' && days > 30) return false;
      if (expiryFilter === '90' && days > 90) return false;
      if (expiryFilter === '180' && days > 180) return false;
    }
    if (priorityFilter !== 'all') {
      const score = item.priorityScore || 0;
      if (priorityFilter === 'high' && score < 70) return false;
      if (priorityFilter === 'medium' && (score < 40 || score > 69)) return false;
      if (priorityFilter === 'low' && score > 39) return false;
    }
    if (ownerFilter !== 'all' && item.specialist !== ownerFilter) return false;
    if (typeFilter !== 'all' && item.productLine !== typeFilter) return false;
    return true;
  });

  const uniqueOwners = Array.from(new Set(items.map(i => i.specialist).filter(Boolean))).sort();
  const uniqueTypes = Array.from(new Set(items.map(i => i.productLine).filter(Boolean))).sort();

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Expired ${Math.abs(diffDays)}d ago`, type: 'danger' };
    if (diffDays === 0) return { text: 'Expires today', type: 'warning' };
    if (diffDays <= 30) return { text: `In ${diffDays} days`, type: 'warning' };
    return { text: `In ${diffDays} days`, type: 'success' };
  };

  if (collapsed) {
    return (
      <div className="glass-card" style={{ padding: '24px 0', width: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'fit-content' }}>
        <span style={{ fontSize: 14, cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }} onClick={() => setCollapsed(false)}>PIPELINE</span>
      </div>
    );
  }

  return (
    <aside className="glass-card" style={{
      width: '100%',
      padding: '12px 10px',
      maxHeight: 680,
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxSizing: 'border-box',
      overflow: 'hidden' // Container itself won't scroll
    }}>
      <div style={{
        position: 'sticky',
        top: -16,
        background: 'rgba(15, 23, 42, 0.98)',
        backdropFilter: 'blur(10px)',
        padding: '0 0 8px 0',
        zIndex: 10,
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h4 style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pipeline
            </h4>
            <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>
              {filteredItems.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onRefresh} className="btn-secondary" style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)' }}>REFRESH</button>
            <button onClick={() => setCollapsed(true)} className="btn-secondary" style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)', marginLeft: 4 }}>HIDE</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 4 }}>
          <FilterSelect value={expiryFilter} onChange={setExpiryFilter} options={[{ value: 'all', label: 'Expiry' }, { value: '30', label: '30d' }, { value: '90', label: '90d' }, { value: '180', label: '180d' }]} />
          <FilterSelect value={priorityFilter} onChange={setPriorityFilter} options={[{ value: 'all', label: 'Priority' }, { value: 'high', label: '70+' }, { value: 'medium', label: '40-69' }, { value: 'low', label: '0-39' }]} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <FilterSelect value={ownerFilter} onChange={setOwnerFilter} options={[{ value: 'all', label: 'Owners' }, ...uniqueOwners.map(o => ({ value: o, label: o }))]} />
          <FilterSelect value={typeFilter} onChange={setTypeFilter} options={[{ value: 'all', label: 'Types' }, ...uniqueTypes.map(t => ({ value: t, label: t }))]} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
        {filteredItems.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
            No matches
          </div>
        ) : (
          filteredItems.map(item => {
            const relTime = getRelativeTime(item.expiryDate);
            const isSelected = selected?.id === item.id;
            const isUrgent = relTime?.type === 'danger' || relTime?.type === 'warning';

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="glass-card"
                style={{
                  padding: 12,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isSelected ? '0 10px 20px -5px rgba(0,0,0,0.5)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>{item.dealName}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{item.companyName}</div>
                  </div>
                  {relTime && (
                    <div style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: relTime.type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : relTime.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: relTime.type === 'danger' ? 'var(--danger)' : relTime.type === 'warning' ? 'var(--warning)' : 'var(--success)',
                      whiteSpace: 'nowrap'
                    }}>
                      {relTime.text}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.productLine}</div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: item.priorityScore >= 70 ? 'var(--danger)' : 'var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--text-secondary)' }}>SCORING</span>
                    {item.priorityScore}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: 4 }}>
                    {item.specialist || 'Unassigned'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: 4 }}>
                    ₹{item.premium?.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}