// frontend/src/components/RenewalPipeline.jsx
import React, { useState, useMemo } from 'react';

export default function RenewalPipeline({ items, selected, onSelect }) {
  // State for filters
  const [filters, setFilters] = useState({
    expiryWindow: 'all',
    priority: 'all'
  });

  // Extract unique values for filter dropdowns
  const filterOptions = useMemo(() => ({}), []);

  // Filter items based on selected filters
  const filteredItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.filter(item => {
      // Filter by expiry window
      if (filters.expiryWindow !== 'all') {
        if (!item.expiryDate) return false;
        
        const expiryDate = new Date(item.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);
        
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch(filters.expiryWindow) {
          case 'expired':
            if (diffDays >= 0) return false;
            break;
          case '30days':
            if (diffDays < 0 || diffDays > 30) return false;
            break;
          case '90days':
            if (diffDays <= 30 || diffDays > 90) return false;
            break;
          case '180days':
            if (diffDays <= 90 || diffDays > 180) return false;
            break;
          case 'future':
            if (diffDays <= 180) return false;
            break;
          default:
            break;
        }
      }

      // Filter by priority
      if (filters.priority !== 'all') {
        const priorityMap = {
          high: 70,
          medium: 40,
          low: 0
        };
        
        const minScore = priorityMap[filters.priority] || 0;
        const maxScore = filters.priority === 'high' ? 100 : (filters.priority === 'medium' ? 69 : 39);
        
        if (item.priorityScore < minScore || item.priorityScore > maxScore) {
          return false;
        }
      }

      return true;
    });
  }, [items, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Helper function to get color based on status
  const getStatusColor = (status) => {
    if (!status) return '#94a3b8';
    switch(status.toLowerCase()) {
      case 'pre-renewal review':
        return '#3b82f6'; // Blue
      case 'pricing discussion':
        return '#8b5cf6'; // Purple
      case 'quote comparison':
        return '#ec4899'; // Pink
      case 'renewed':
        return '#10b981'; // Green
      default:
        return '#94a3b8'; // Gray
    }
  };

  // Generate a meaningful policy name based on client and policy details
  const getPolicyName = (item) => {
    // If we have a client name, use that with a suffix
    if (item.clientName) {
      return `${item.clientName}'s Policy`;
    }
    
    // If we have a policy number, clean it up and use it
    if (item.policyNumber) {
      // Remove any auto-generated ID patterns (like SCR- or POL- prefixes with hashes)
      const cleanPolicyNumber = item.policyNumber.replace(/^(SCR|POL)-?[a-f0-9]+-?/i, '');
      return cleanPolicyNumber ? `Policy #${cleanPolicyNumber}` : 'Insurance Policy';
    }
    
    // If we have a specific product line (not General Insurance), use that
    if (item.productLine && item.productLine !== 'General Insurance') {
      return item.productLine;
    }
    
    // Fallback to a generic name if we don't have much info
    return 'Insurance Policy';
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'No expiry date';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expDate = new Date(expiryDate);
    expDate.setHours(0, 0, 0, 0);
    
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Expired ${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 30) return `Expires in ${diffDays} days`;
    if (diffDays <= 90) return `Expires in ${Math.ceil(diffDays/30)} months`;
    return `Expires in ${Math.ceil(diffDays/365 * 10)/10} years`;
  };

  const [collapsed, setCollapsed] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState({});

  const toggleDetails = (itemId) => {
    setDetailsExpanded(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (collapsed) {
    return (
      <div style={{
        width: 320,
        background: '#071127',
        padding: 12,
        borderRadius: 8,
        border: '1px solid #1e293b'
      }}>
        <div
          onClick={() => setCollapsed(false)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📋</span>
            <h4 style={{ margin: 0, fontSize: 14 }}>Pipeline</h4>
            <span style={{
              background: '#3b82f6',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 'bold'
            }}>
              {items.length}
            </span>
          </div>
          <button style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: 18,
            cursor: 'pointer',
            padding: 0
          }}>
            ▼
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside style={{
      width: 320,
      background: '#071127',
      padding: 10,
      borderRadius: 8,
      border: '1px solid #1e293b',
      maxHeight: 'calc(100vh - 250px)',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'sticky',
        top: 0,
        background: '#071127',
        padding: '12px 0',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📋</span>
            <h4 style={{ margin: 0 }}>Pipeline ({filteredItems.length}/{items.length})</h4>
          </div>
          
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8', marginLeft: 2 }}>Expiry Date</label>
              <select
                value={filters.expiryWindow}
                onChange={(e) => handleFilterChange('expiryWindow', e.target.value)}
                style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  width: '100%',
                  height: 40
                }}
              >
                <option value="all">All Expiry Dates</option>
                <option value="expired">⚠️ Expired</option>
                <option value="30days">🔴 0-30 Days</option>
                <option value="90days">🟡 31-90 Days</option>
                <option value="180days">🟢 91-180 Days</option>
                <option value="future">🔵 180+ Days</option>
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8', marginLeft: 2 }}>Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  width: '100%',
                  height: 40
                }}
              >
                <option value="all">All Priorities</option>
                <option value="high">High (70-100)</option>
                <option value="medium">Medium (40-69)</option>
                <option value="low">Low (0-39)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              const allExpanded = Object.keys(detailsExpanded).length === items.length 
                && Object.values(detailsExpanded).every(v => v);
              
              const newState = {};
              items.forEach(item => {
                newState[item.id] = !allExpanded;
              });
              setDetailsExpanded(newState);
            }}
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              color: '#94a3b8',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: 600
            }}
            title="Expand/Collapse All"
          >
            {Object.values(detailsExpanded).some(v => v) ? '▲ All' : '▼ All'}
          </button>
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: 18,
              cursor: 'pointer',
              padding: 0
            }}
            title="Collapse Panel"
          >
            ▲
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center', color: '#9aa' }}>
          {items.length === 0 ? (
            'No renewals. Click "Sync Data" to load.'
          ) : (
            'No renewals match the selected filters.'
          )}
        </div>
      ) : (
        filteredItems.map(item => {
          const isExpanded = detailsExpanded[item.id];
          const isSelected = selected?.id === item.id;

          return (
            <div
              key={item.id}
              style={{
                padding: 8,
                border: isSelected ? '1px solid #2ecc71' : '1px solid #1e293b',
                marginTop: 8,
                borderRadius: 6,
                background: isSelected ? '#041a14' : '#041022',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header - Always Visible */}
              <div
                onClick={() => onSelect(item)}
                style={{ marginBottom: isExpanded ? 8 : 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      color: '#e2e8f0', 
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }} title={item.clientName || 'Unnamed Client'}>
                      {item.clientName || 'Unnamed Client'}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 6, 
                      marginTop: 4,
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: 11,
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#60a5fa',
                        padding: '2px 6px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }} title={getPolicyName(item)}>
                        {getPolicyName(item)}
                      </span>
                      {item.policyNumber && (
                        <span style={{
                          fontSize: 11,
                          color: '#94a3b8',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '120px',
                          display: 'inline-block'
                        }} title={`Policy: ${item.policyNumber}`}>
                          {item.policyNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: item.expiryDate ? '#60a5fa' : '#94a3b8',
                    background: 'rgba(30, 41, 59, 0.5)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    marginLeft: 8,
                    flexShrink: 0
                  }} title={item.expiryDate ? `Expiry Date: ${item.expiryDate}` : 'No expiry date set'}>
                    {getExpiryStatus(item.expiryDate)}
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 4, 
                  marginTop: 4 
                }}>
                  {item.owner && (
                    <div style={{
                      fontSize: 11,
                      color: '#60a5fa',
                      background: 'rgba(30, 41, 59, 0.5)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }} title={`Owner: ${item.owner}`}>
                      👤 {item.owner}
                    </div>
                  )}
                  {item.status && item.status !== 'Discovery' && (
                    <div style={{
                      fontSize: 11,
                      color: getStatusColor(item.status),
                      background: `${getStatusColor(item.status)}20`,
                      padding: '2px 6px',
                      borderRadius: 4,
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }} title={`Status: ${item.status}`}>
                      {item.status}
                    </div>
                  )}
                </div>
              </div>

              {/* Priority Score Badge */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 6
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: item.priorityScore >= 70 ? '#ef444415' : '#f59e0b15',
                  border: `1px solid ${item.priorityScore >= 70 ? '#ef4444' : '#f59e0b'}`,
                  padding: '3px 8px',
                  borderRadius: 4
                }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Priority:</span>
                  <span style={{
                    fontWeight: 'bold',
                    fontSize: 13,
                    color: item.priorityScore >= 70 ? '#ef4444' : '#f59e0b'
                  }}>
                    {item.priorityScore}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDetails(item.id);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#94a3b8',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {isExpanded ? '▲ Less' : '▼ More'}
                </button>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: '1px solid #1e293b',
                  fontSize: 12,
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                  animation: 'slideDown 0.2s ease-out'
                }}>
                  <style>
                    {`
                      @keyframes slideDown {
                        from {
                          opacity: 0;
                          max-height: 0;
                          transform: translateY(-5px);
                        }
                        to {
                          opacity: 1;
                          max-height: 500px;
                          transform: translateY(0);
                        }
                      }
                    `}
                  </style>
                  
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>Policy:</span>{' '}
                    <span style={{ color: '#e2e8f0' }}>{item.policyNumber}</span>
                  </div>
                  
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>Carrier:</span>{' '}
                    <span style={{ color: '#e2e8f0' }}>{item.carrier}</span>
                  </div>
                  
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>Expiry:</span>{' '}
                    <span style={{ color: '#e2e8f0' }}>{item.expiryDate || 'Not set'}</span>
                  </div>
                  
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>Premium:</span>{' '}
                    <span style={{ color: '#10b981', fontWeight: 600 }}>
                      ₹{item.premium?.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>Stage:</span>{' '}
                    <span style={{ color: '#e2e8f0' }}>{item.status}</span>
                  </div>

                  {item.communications && (
                    <div style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px solid #1e293b'
                    }}>
                      <div style={{ color: '#64748b', marginBottom: 4, fontSize: 11 }}>
                        Communications
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div>
                          <span style={{ color: '#60a5fa' }}>
                            {item.communications.emailCount || 0}
                          </span>
                          <span style={{ color: '#64748b', fontSize: 11 }}> emails</span>
                        </div>
                        <div>
                          <span style={{ color: '#a78bfa' }}>
                            {item.communications.meetingCount || 0}
                          </span>
                          <span style={{ color: '#64748b', fontSize: 11 }}> meetings</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.primaryContact?.email && (
                    <div style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px solid #1e293b'
                    }}>
                      <div style={{ color: '#64748b', marginBottom: 2, fontSize: 11 }}>
                        Contact
                      </div>
                      <div style={{ color: '#e2e8f0' }}>
                        {item.primaryContact.name}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 11 }}>
                        {item.primaryContact.email}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </aside>
  );
}