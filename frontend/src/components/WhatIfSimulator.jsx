import React, { useState, useEffect, useMemo } from 'react';

export default function WhatIfSimulator({ item, compute }) {

  /* ------------------ STATE ------------------ */
  const [expiryDays, setExpiryDays] = useState(30);
  const [premium, setPremium] = useState(500000);
  const [touchpoints, setTouchpoints] = useState(0);
  const [dealStage, setDealStage] = useState('Discovery');

  /* ------------------ SYNC STATE WITH ITEM ------------------ */
  useEffect(() => {
    if (!item) return;

    // Expiry days calculation
    if (item.expiryDate) {
      const today = new Date();
      const expiry = new Date(item.expiryDate);
      setExpiryDays(
        Math.max(
          0,
          Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
        )
      );
    } else {
      setExpiryDays(30);
    }

    setPremium(item.premium || 500000);
    setTouchpoints(item.communications?.totalTouchpoints || 0);
    setDealStage(item.status || 'Discovery');

  }, [item]);

  /* ------------------ HELPERS ------------------ */
  const simulateExpiryDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const formatNumber = (num) => {
    if (num >= 10000000) return '₹' + (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return '₹' + (num / 1000).toFixed(0) + 'K';
    return '₹' + num.toLocaleString();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#ef4444';
    if (score >= 65) return '#f59e0b';
    if (score >= 45) return '#3b82f6';
    return '#6b7280';
  };

  /* ------------------ SIMULATED ITEM ------------------ */
  const simItem = useMemo(() => ({
    ...item,
    expiryDate: simulateExpiryDate(expiryDays),
    premium: premium,
    coveragePremium: premium,
    status: dealStage,
    communications: {
      ...item?.communications,
      totalTouchpoints: touchpoints,
      emailCount: Math.floor(touchpoints * 0.6),
      meetingCount: Math.floor(touchpoints * 0.4),
    }
  }), [item, expiryDays, premium, touchpoints, dealStage]);

  const result = useMemo(() => compute(simItem), [compute, simItem]);

  const dealStages = [
    'Discovery',
    'Pre-Renewal Review',
    'Pricing Discussion',
    'Quote Comparison',
    'Renewed'
  ];

  /* ------------------ UI ------------------ */
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.4)',
      padding: 12,
      borderRadius: 8,
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>

      {/* Days to Expiry */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600 }}>Expiry</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{expiryDays}d</span>
        </div>
        <input
          type="range"
          min="0"
          max="120"
          value={expiryDays}
          onChange={e => setExpiryDays(Number(e.target.value))}
          style={{ width: '100%', height: 4, cursor: 'pointer' }}
        />
      </div>

      {/* Premium */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600 }}>Premium</span>
          <span style={{ color: 'var(--success)', fontWeight: 700 }}>{formatNumber(premium)}</span>
        </div>
        <input
          type="range"
          min="50000"
          max="10000000"
          step="50000"
          value={premium}
          onChange={e => setPremium(Number(e.target.value))}
          style={{ width: '100%', height: 4, cursor: 'pointer' }}
        />
      </div>

      {/* Touchpoints */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600 }}>Activity</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{touchpoints} pts</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={touchpoints}
          onChange={e => setTouchpoints(Number(e.target.value))}
          style={{ width: '100%', height: 4, cursor: 'pointer' }}
        />
      </div>

      {/* Deal Stage */}
      <div style={{ marginBottom: 12 }}>
        <select
          value={dealStage}
          onChange={e => setDealStage(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 6,
            color: 'var(--text-primary)',
            fontSize: 12,
            outline: 'none'
          }}
        >
          {dealStages.map(stage => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
      </div>

      {/* Compact Score Results */}
      <div style={{
        marginTop: 16,
        padding: '12px 16px',
        background: 'rgba(59, 130, 246, 0.08)',
        borderRadius: 8,
        border: '1px solid rgba(59, 130, 246, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Simulated Score</div>
          <div style={{
            fontSize: 24,
            fontWeight: 800,
            color: getScoreColor(result.value),
            lineHeight: 1,
            marginTop: 2
          }}>
            {result.value.toFixed(1)}
          </div>
        </div>

        {result.breakdown && (
          <div style={{
            fontSize: 9,
            color: 'var(--text-secondary)',
            textAlign: 'right',
            lineHeight: 1.3,
            opacity: 0.8
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 8px' }}>
              <span>Urgency:</span> <span style={{ color: 'var(--text-primary)' }}>{result.breakdown.timeUrgency}</span>
              <span>Value:</span> <span style={{ color: 'var(--text-primary)' }}>{result.breakdown.dealValue}</span>
              <span>Engage:</span> <span style={{ color: 'var(--text-primary)' }}>{result.breakdown.engagement}</span>
              <span>Stage:</span> <span style={{ color: 'var(--text-primary)' }}>{result.breakdown.dealStage}</span>
              <span>Quality:</span> <span style={{ color: 'var(--text-primary)' }}>{result.breakdown.contactQuality}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
