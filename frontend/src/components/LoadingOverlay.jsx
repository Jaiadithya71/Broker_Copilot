import React from 'react';

export default function LoadingOverlay({ isLoading, isDisconnected, onRetry }) {
    // Scroll lock when active
    React.useEffect(() => {
        if (isLoading || isDisconnected) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isLoading, isDisconnected]);

    if (!isLoading && !isDisconnected) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 11, 20, 0.95)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            flexDirection: 'column',
            color: 'white',
            textAlign: 'center',
            padding: 20,
            userSelect: 'none',
            pointerEvents: 'auto'
        }}>
            {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        marginBottom: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Spinning ring */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            border: '3px solid rgba(59, 130, 246, 0.1)',
                            borderTop: '3px solid var(--accent-primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />

                        <div style={{
                            width: 60,
                            height: 60,
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            borderRadius: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            fontWeight: 900,
                            color: 'white',
                            boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)',
                            zIndex: 1
                        }} className="animate-pulse">
                            BC
                        </div>
                    </div>

                    <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Initializing Workspace</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 14, maxWidth: 300, lineHeight: 1.5 }}>
                        Synchronizing with HubSpot and Google to build your renewal strategy...
                    </p>

                    <div style={{
                        width: 200,
                        height: 4,
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 2,
                        marginTop: 24,
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: '40%',
                            background: 'var(--accent-primary)',
                            borderRadius: 2,
                            animation: 'shimmer 2s infinite'
                        }} />
                    </div>
                </div>
            ) : isDisconnected ? (
                <div style={{ maxWidth: 400 }}>
                    <div style={{
                        fontSize: 48,
                        marginBottom: 20,
                        background: 'linear-gradient(135deg, var(--danger), #ff7e7e)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800
                    }}>
                        Offline
                    </div>
                    <h2 style={{ fontSize: 24, marginBottom: 12 }}>Connection Lost</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
                        The backend service is currently unreachable. It might be restarting or experiencing an outage.
                    </p>
                    <button
                        onClick={onRetry}
                        className="btn btn-primary"
                        style={{ padding: '12px 32px' }}
                    >
                        Retry Connection
                    </button>
                </div>
            ) : null}

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}} />
        </div>
    );
}
