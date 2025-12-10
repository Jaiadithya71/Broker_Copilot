// src/components/ConnectorStatusBar.jsx

import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:4000';

export default function ConnectorStatusBar({ connectors, syncStatus, dataSource, onConnectionUpdate }) {
  const [loading, setLoading] = useState(false);
  
  // 1. Local state to handle optimistic updates immediately
  const [localConnectors, setLocalConnectors] = useState(connectors);

  // 2. Sync local state whenever parent props change (e.g. after a real reload)
  useEffect(() => {
    setLocalConnectors(connectors);
  }, [connectors]);

  // --- Handlers ---

  const handleGoogleConnect = () => {
    console.debug('🔐 Google Connection initiated:', {
      timestamp: new Date().toISOString(),
      redirectUrl: `${API_BASE}/auth/google`
    });
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleHubSpotConnect = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/test/hubspot`);
      const data = await res.json();
      
      console.log('✅ HubSpot Connection Result:', data);

      if (data.success) {
        // 3. OPTIMISTIC UPDATE: Force the UI to green immediately
        setLocalConnectors(prev => prev.map(c => 
          c.name.toLowerCase().includes('hubspot') 
            ? { ...c, status: 'connected' } 
            : c
        ));

        // Notify parent to refresh data in background
        if (onConnectionUpdate) {
          onConnectionUpdate();
        }
        
        alert('HubSpot connection successful!');
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('❌ HubSpot connection failed:', err);
      alert(`HubSpot connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Configuration ---
  const getConnectorConfig = (name) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('google')) {
      return {
        handler: handleGoogleConnect,
        btnColor: '#3498db',
        btnLabel: 'Connect Google'
      };
    }
    
    if (lowerName.includes('hubspot')) {
      return {
        handler: handleHubSpotConnect,
        btnColor: '#ff7a59',
        btnLabel: 'Connect HubSpot'
      };
    }

    return null;
  };

  // --- Render Helpers ---
  const getStatusStyle = (status) => ({
    background: status === 'connected' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
    border: `1px solid ${status === 'connected' ? '#2ecc71' : '#e74c3c'}`,
    color: status === 'connected' ? '#2ecc71' : '#e74c3c'
  });

  return (
    <div style={{ marginBottom: 16, padding: 16, background: '#071127', borderRadius: 8, border: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Use localConnectors instead of connectors prop directly */}
        {localConnectors.map((c, i) => {
          const config = getConnectorConfig(c.name);
          const isConnected = c.status === 'connected';
          const style = getStatusStyle(c.status);

          return (
            <div
              key={i}
              style={{
                ...style,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: isConnected ? '#2ecc71' : '#e74c3c',
                boxShadow: isConnected ? '0 0 5px #2ecc71' : 'none'
              }} />
              
              <span>{c.name}</span>

              {!isConnected && config && (
                <button
                  onClick={config.handler}
                  disabled={loading}
                  style={{
                    marginLeft: 8,
                    padding: '4px 10px',
                    background: config.btnColor,
                    border: 'none',
                    color: 'white',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading && config.btnLabel.includes('HubSpot') ? '...' : 'Connect'}
                </button>
              )}
            </div>
          );
        })}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {syncStatus?.lastSync && (
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Last sync: <span style={{ color: '#e2e8f0' }}>{new Date(syncStatus.lastSync).toLocaleString()}</span>
            </div>
          )}
          
          <div style={{ fontSize: 11, color: '#64748b' }}>
             {syncStatus?.recordCount || 0} records · Source: {' '}
             <span style={{ color: dataSource === 'live' ? '#2ecc71' : '#f39c12' }}>
                {dataSource ? dataSource.toUpperCase() : 'UNKNOWN'}
             </span>
          </div>
        </div>

      </div>
    </div>
  );
}