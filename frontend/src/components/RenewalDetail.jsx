// frontend/src/components/RenewalDetail.jsx

import React, { useState } from 'react';
import AIBrief from './AIBrief';
import ActionPanel from './ActionPanel';
import WhatIfSimulator from './WhatIfSimulator';
import QAPanel from './QAPanel';
import CommunicationTimeline from './CommunicationTimeline';
import PriorityFactors from './PriorityFactors';

export default function RenewalDetail({ item, brief, computeScore }) {
  const [activeTab, setActiveTab] = useState('strategy'); // 'strategy', 'assistant', 'history'

  if (!item) {
    return (
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 140px)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16 }}>PDF</div>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Select a renewal to view strategy</h3>
        </div>
      </main>
    );
  }

  const { clientName, policyNumber, carrier, expiryDate, premium, priorityScore, priorityLabel } = item;

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--danger)';
    if (score >= 65) return 'var(--warning)';
    if (score >= 45) return 'var(--accent-primary)';
    return 'var(--text-secondary)';
  };

  const tabs = [
    { id: 'strategy', label: 'AI Strategy' },
    { id: 'assistant', label: 'Assistant' },
    { id: 'history', label: 'History' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'strategy':
        return (
          <section className="glass-card" style={{ padding: 24, animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>AI Renewal Strategy</h2>
            </div>
            <AIBrief brief={brief} item={item} />
          </section>
        );
      case 'assistant':
        return (
          <section className="glass-card" style={{ padding: 24, animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Knowledge Assistant</h2>
            </div>
            <QAPanel item={item} />
          </section>
        );
      case 'history':
        return (
          <section className="glass-card" style={{ padding: 24, animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Contact History</h2>
            </div>
            <CommunicationTimeline item={item} />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Top Profile Card */}
      <section className="glass-card" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 24, color: 'var(--text-primary)' }}>{clientName}</h1>
              <span style={{
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-primary)',
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700
              }}>
                {item.productLine}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
              <span>ID: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{policyNumber}</strong></span>
              <span>•</span>
              <span>Carrier: <strong style={{ color: 'var(--text-primary)' }}>{carrier}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>Annual Premium</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>₹{premium?.toLocaleString()}</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'var(--border-color)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>Renewal Score</div>
              <div style={{
                fontSize: 24,
                fontWeight: 800,
                color: getScoreColor(priorityScore),
                lineHeight: 1
              }}>
                {priorityScore}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: getScoreColor(priorityScore) }}>{priorityLabel || 'UNRATED'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout Grid: 1 Content | 1 Tools Column */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 576px', // Use minmax(0, 1fr) to prevent overflow
        gap: 20, // Tighter gap
        width: '100%',
        alignItems: 'start'
      }}>
        {/* Main Content (Strategy/History/QA) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: 4,
            background: 'rgba(0, 0, 0, 0.2)',
            padding: 4,
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            alignSelf: 'flex-start',
            marginBottom: 8
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px', // Slightly tighter padding
                  border: 'none',
                  borderRadius: 8,
                  background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                  fontSize: 12, // Tighter font
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {renderTabContent()}
          </div>
        </div>

        {/* Tools Sidebar Area - Management Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 300px',
          gap: 16, // Tighter gap
          alignItems: 'start',
          position: 'sticky',
          top: 16,
          alignSelf: 'flex-start'
        }}>
          {/* Action Panel Column */}
          <ActionPanel brief={brief} item={item} />

          {/* What-If Column */}
          <section className="glass-card" style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                Analysis
              </h3>
            </div>
            <WhatIfSimulator item={item} compute={computeScore} />
          </section>

          {/* Priority Factors - Spanning the full tools area width */}
          <div style={{ gridColumn: '1 / span 2', marginTop: -8 }}>
            <PriorityFactors brief={brief} item={item} isEmbedded={false} />
          </div>
        </div>
      </div>
    </main>
  );
}