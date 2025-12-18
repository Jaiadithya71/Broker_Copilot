import React from 'react';

export default function ConnectionModal({
    isOpen,
    services = [], // Array of { id, title, description, icon, actionLabel, onAction, loading }
    onSkip,
    title = "Bridge Your Workflow",
    description = "Connect your core tools to unlock real-time intelligence and automated monitoring."
}) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 18, 0.9)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: services.length > 1 ? 840 : 420,
                padding: '0 24px',
                textAlign: 'center',
                position: 'relative'
            }}>
                {/* Header Section */}
                <div style={{ marginBottom: 48 }}>
                    <h1 style={{
                        margin: '0 0 16px',
                        fontSize: 32,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em'
                    }}>
                        {title}
                    </h1>
                    <p style={{
                        margin: '0 auto',
                        fontSize: 16,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        maxWidth: 600
                    }}>
                        {description}
                    </p>
                </div>

                {/* Services Grid (Parallel) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: services.length > 1 ? 'repeat(auto-fit, minmax(340px, 1fr))' : '1fr',
                    gap: 24,
                    marginBottom: 40
                }}>
                    {services.map((svc) => (
                        <div key={svc.id} className="glass-card" style={{
                            padding: '40px 32px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            transition: 'transform 0.3s ease, border-color 0.3s ease',
                        }}>
                            <div style={{
                                width: 64,
                                height: 64,
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 32,
                                marginBottom: 20,
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                animation: svc.loading ? 'pulse 1.5s infinite' : 'none'
                            }}>
                                {svc.icon}
                            </div>
                            <h3 style={{ margin: '0 0 10px', fontSize: 18, color: 'var(--text-primary)' }}>{svc.title}</h3>
                            <p style={{
                                margin: '0 0 24px',
                                fontSize: 13,
                                color: 'var(--text-secondary)',
                                lineHeight: 1.5,
                                height: 60 // Fixed height for alignment
                            }}>
                                {svc.description}
                            </p>

                            <button
                                onClick={svc.onAction}
                                disabled={svc.loading || svc.status === 'connected'}
                                className={`btn ${svc.status === 'connected' ? 'btn-secondary' : 'btn-primary'}`}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: 14,
                                    width: '100%',
                                    justifyContent: 'center',
                                    cursor: svc.status === 'connected' ? 'default' : 'pointer'
                                }}
                            >
                                {svc.status === 'connected' ? (
                                    <span style={{ color: 'var(--success)' }}>Connected</span>
                                ) : (
                                    svc.loading ? 'Connecting...' : svc.actionLabel
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onSkip}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '12px 24px',
                        borderRadius: 30,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                        e.target.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.05)';
                        e.target.style.color = 'var(--text-secondary)';
                    }}
                >
                    Continue to Dashboard (Demo Mode)
                </button>

                {/* Global Animations */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.7; transform: scale(0.95); }
                    }
                `}} />
            </div>
        </div>
    );
}
