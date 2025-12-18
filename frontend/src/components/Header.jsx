import Hubspot from '../assets/Hubspot';
import Google from '../assets/Google';

export default function Header({ broker, onLoginClick, onSync, syncing, connectors = [], syncStatus, dataSource }) {
  return (
    <header className="glass-card" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      marginBottom: 24,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      minHeight: 72
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 44,
          height: 44,
          background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12, // Reduced font for text logo
          fontWeight: 800,
          color: 'white',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
        }}>
          BC
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)', fontWeight: 700 }}>Broker Copilot</h2>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--success)' }}>●</span>
            Monitoring
          </div>
        </div>
      </div>

      {/* Unified Command Center Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        padding: '0 32px',
        flex: 1,
        justifyContent: 'center'
      }}>
        {/* Connector Badges */}
        <div style={{ display: 'flex', gap: 20, borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: 32 }}>
          {connectors.map((c, i) => {
            const isGoogle = c.name.toLowerCase().includes('google');
            const isHubspot = c.name.toLowerCase().includes('hubspot');
            const isConnected = c.status === 'connected';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isConnected ? 1 : 0.5 }}>
                {isGoogle ? (
                  <>
                    <Google size={16} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>G-SUITE</span>
                  </>
                ) : isHubspot ? (
                  <>
                    <Hubspot size={16} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>HUBSPOT</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 14 }}>📂</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name.toUpperCase()}</span>
                  </>
                )}
                {isConnected && (
                  <span style={{
                    fontSize: 9,
                    color: 'var(--success)',
                    fontWeight: 800,
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '1px 5px',
                    borderRadius: 3
                  }}>LIVE</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Sync Status */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {syncStatus?.lastSync && (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              LATEST SYNC: <strong style={{ color: 'var(--text-primary)', marginLeft: 4 }}>{new Date(syncStatus.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            SOURCE: <span style={{ color: dataSource === 'live' ? 'var(--success)' : 'var(--warning)', fontWeight: 800, marginLeft: 4 }}>{dataSource?.toUpperCase() || 'DEMO'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        {broker && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 1, letterSpacing: '0.05em' }}>Broker</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{broker}</div>
          </div>
        )}

        {!broker && (
          <button onClick={onLoginClick} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
            Sign in
          </button>
        )}

        <button
          onClick={onSync}
          disabled={syncing}
          className={`btn btn-primary ${syncing ? 'animate-pulse' : ''}`}
          style={{ padding: '10px 20px', fontSize: 13, borderRadius: 10 }}
        >
          {syncing ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>
    </header>
  );
}
