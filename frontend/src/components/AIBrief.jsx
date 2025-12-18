// frontend/src/components/AIBrief.jsx

import React, { useState } from 'react';

// Strategy Summary

export default function AIBrief({ brief, item }) {
  if (!brief) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700 }}>AI</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Synthesizing renewal strategy...</div>
      </div>
    );
  }

  if (brief.error) {
    return (
      <div style={{ padding: 16, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
        {brief.error}
      </div>
    );
  }

  const breakdown = brief._scoreBreakdown || item?._scoreBreakdown;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Strategy Summary */}
      <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '14px 18px', borderRadius: 12, borderLeft: '4px solid var(--accent-primary)' }}>
        <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-primary)', fontStyle: 'italic' }}>
          "{brief.summary}"
        </div>
      </div>

      {/* Suggested Deal Type Callout */}
      {brief.suggestedProductLine && brief.suggestedProductLine !== item.productLine && (
        <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderColor: 'rgba(167, 139, 250, 0.3)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa' }}>AI</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Classification Correction</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{brief.suggestedProductLine}</div>
          </div>
        </div>
      )}

      {/* Risk Notes Section - Consolidated into a single block */}
      <div>
        <h5 style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Critical Observations</h5>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}>
          {brief.riskNotes?.map((note, i) => {
            const citationMatch = note.match(/\((H\d+|E\d+|M\d+)(?:,\s*(H\d+|E\d+|M\d+))*\)\.?$/);
            const cleanNote = citationMatch ? note.substring(0, note.lastIndexOf('(')).trim() : note;
            const citations = citationMatch ? citationMatch[0].replace(/[().]/g, '').split(',').map(s => s.trim()) : [];

            return (
              <div key={i} style={{
                padding: '12px 16px',
                borderBottom: i === brief.riskNotes.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {cleanNote}
                    {citations.length > 0 && (
                      <span style={{ marginLeft: 12, display: 'inline-flex', gap: 4, verticalAlign: 'middle' }}>
                        {citations.map(c => {
                          const type = c[0];
                          const label = type === 'H' ? 'CRM' : type === 'E' ? 'GMAIL' : 'MEET';
                          const color = type === 'H' ? 'var(--warning)' : type === 'E' ? 'var(--accent-primary)' : 'var(--accent-secondary)';
                          return (
                            <span key={c} title={`${label} Reference`} style={{
                              fontSize: 8,
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: 3,
                              background: `${color}15`,
                              color: color,
                              border: `1px solid ${color}33`,
                              textTransform: 'uppercase',
                              whiteSpace: 'nowrap'
                            }}>
                              {c}
                            </span>
                          );
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}