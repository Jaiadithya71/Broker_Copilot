// frontend/src/components/QAPanel.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function QAPanel({ item }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim() || !item) return;
    setLoading(true);
    try {
      const { data } = await axios.post('/api/qa', {
        question: question.trim(),
        recordId: item.id
      });
      setAnswer(data);
    } catch (err) {
      setAnswer({ answer: 'Failed to get answer. Please try again.', confidence: 'low' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf === 'high') return 'var(--success)';
    if (conf === 'medium') return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Input Section */}
      <div className="glass-card" style={{ padding: 20, background: 'rgba(255,255,255,0.01)' }}>
        <h5 style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Ask Questions About This Renewal
        </h5>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., What's the premium amount?"
            disabled={!item || loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none'
            }}
          />
          <button
            onClick={handleAsk}
            disabled={!item || !question.trim() || loading}
            className="btn btn-primary"
            style={{ padding: '0 24px' }}
          >
            {loading ? '...' : 'Ask'}
          </button>
        </div>

        {!answer && item && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>Suggested queries:</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['What is the premium?', 'When does it expire?', 'Who is the carrier?', 'How many touchpoints?'].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    borderRadius: 6,
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Answer Display */}
      {answer && (
        <div className="glass-card" style={{ padding: 20, background: 'rgba(59, 130, 246, 0.05)', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}>
            {answer.answer}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-secondary)' }}>
            <span>
              Confidence: <strong style={{ color: getConfidenceColor(answer.confidence) }}>{answer.confidence?.toUpperCase()}</strong>
            </span>
            {answer.source && <span>Source: {answer.source.system}</span>}
          </div>
        </div>
      )}
    </div>
  );
}