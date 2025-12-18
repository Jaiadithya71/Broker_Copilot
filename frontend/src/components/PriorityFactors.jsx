// frontend/src/components/PriorityFactors.jsx
import React, { useState } from 'react';

function FactorBar({ label, score, weighted, description, icon }) {
    const barColor = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{score}%</div>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${score}%`, background: barColor, borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
                <span>{description}</span>
                <span style={{ fontWeight: 600 }}>+{weighted.toFixed(1)} pts</span>
            </div>
        </div >
    );
}

export default function PriorityFactors({ item, brief, isEmbedded = false }) {
    const breakdown = brief?._scoreBreakdown || item?._scoreBreakdown;

    if (!breakdown) return null;

    return (
        <div style={{ marginTop: isEmbedded ? 0 : 16 }}>
            <div className={isEmbedded ? "" : "glass-card"} style={{
                padding: '24px 20px',
                background: isEmbedded ? 'transparent' : 'rgba(15, 23, 42, 0.4)',
                border: isEmbedded ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 24,
                alignItems: 'start'
            }}>
                {/* Left Side: Summary Icons */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    paddingRight: 20,
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Urgency</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: breakdown.timeUrgency >= 80 ? 'var(--danger)' : 'var(--text-primary)' }}>
                            {breakdown.daysToExpiry}d
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Days</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Potential</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
                            ₹{(breakdown.dealAmount / 100000).toFixed(1)}L
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Value</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Engagement</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {breakdown.touchpoints || 0}pts
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Points</div>
                    </div>
                </div>

                {/* Right Side: Detailed Breakdown & Analysis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, paddingTop: 6 }}>Priority Factors</h4>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Score Total</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent-primary)', lineHeight: 1 }}>{item.priorityScore}</div>
                        </div>
                    </div>

                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Detailed Scoring Analysis</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 4 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Time Window</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{breakdown.timeUrgency}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 4 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Deal Magnitude</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{breakdown.dealValue}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 4 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Engagement Frequency</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{breakdown.engagement}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 4 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Pipeline Maturity</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{breakdown.dealStage}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 4 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Contact Data Quality</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{breakdown.contactQuality}%</span>
                        </div>
                    </div>

                    <div style={{
                        marginTop: 8,
                        padding: '8px 12px',
                        background: 'rgba(59, 130, 246, 0.05)',
                        borderRadius: 6,
                        fontSize: 9,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                    }}>
                        <strong style={{ color: 'var(--accent-primary)', fontSize: 8, textTransform: 'uppercase' }}>Methodology:</strong><br />
                        Priority is calculated by normalizing time urgency (40%), deal value (25%), touchpoint density (15%), sales stage (12%), and profile completeness (8%).
                    </div>
                </div>
            </div>
        </div>
    );
}
