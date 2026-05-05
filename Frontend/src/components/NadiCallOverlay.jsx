import React, { useEffect, useState } from 'react';

const SoundWave = ({ active }) => {
  const [heights, setHeights] = useState([8, 8, 8, 8, 8]);

  useEffect(() => {
    if (!active) {
      setHeights([8, 8, 8, 8, 8]);
      return;
    }
    const interval = setInterval(() => {
      setHeights([
        Math.random() * 40 + 8,
        Math.random() * 40 + 8,
        Math.random() * 40 + 8,
        Math.random() * 40 + 8,
        Math.random() * 40 + 8,
      ]);
    }, 150);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: 5, height: 60
    }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 5,
          height: h,
          backgroundColor: active ? '#4ade80' : '#374151',
          borderRadius: 3,
          transition: 'height 0.15s ease'
        }} />
      ))}
    </div>
  );
};

const NadiCallOverlay = ({
  callData,
  callStatus,
  agentMessage,
  callDuration,
  isSpeaking,
  formatDuration,
  onEndCall
}) => {
  if (callStatus === 'idle') return null;

  const statusLabel = {
    connecting: { text: 'Connecting...', color: '#facc15' },
    connected:  { text: 'LIVE',          color: '#ef4444' },
    ended:      { text: 'Call Ended',    color: '#6b7280' },
    error:      { text: 'Failed',        color: '#ef4444' },
  }[callStatus] || { text: '', color: '#fff' };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.97)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '48px 24px 40px',
      color: '#fff'
    }}>

      {/* STATUS BADGE */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <div style={{
          width: 10, height: 10,
          borderRadius: '50%',
          backgroundColor: statusLabel.color,
          boxShadow: `0 0 8px ${statusLabel.color}`,
          animation: callStatus === 'connected'
            ? 'blink 1s infinite' : 'none'
        }} />
        <span style={{
          fontSize: 13, fontWeight: 700,
          letterSpacing: 3,
          color: statusLabel.color
        }}>
          {statusLabel.text}
        </span>
      </div>

      {/* CENTER CONTENT */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 28, flex: 1,
        justifyContent: 'center'
      }}>

        {/* AGENT AVATAR */}
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          backgroundColor: '#0f2418',
          border: `2px solid ${isSpeaking ? '#4ade80' : '#1f2937'}`,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 36,
          boxShadow: isSpeaking
            ? '0 0 20px rgba(74,222,128,0.4)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          🤖
        </div>

        {/* AGENT NAME */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 20, fontWeight: 700, marginBottom: 4
          }}>
            Sahayak Agent
          </div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            {callData?.village} Village
          </div>
        </div>

        {/* SOUND WAVE */}
        <SoundWave active={isSpeaking} />

        {/* AGENT MESSAGE */}
        {agentMessage ? (
          <div style={{
            backgroundColor: '#0f2418',
            border: '1px solid #166534',
            borderRadius: 16,
            padding: '14px 18px',
            maxWidth: 300,
            fontSize: 14,
            lineHeight: 1.6,
            color: '#d1fae5',
            textAlign: 'center'
          }}>
            {agentMessage}
          </div>
        ) : callStatus === 'connected' ? (
          <div style={{ color: '#4b5563', fontSize: 14 }}>
            {isSpeaking ? 'Agent speaking...' : 'Listening...'}
          </div>
        ) : null}

        {/* SYMPTOMS */}
        {callData?.symptoms?.length > 0 && (
          <div style={{
            display: 'flex', gap: 8,
            flexWrap: 'wrap', justifyContent: 'center'
          }}>
            {callData.symptoms.map((s, i) => (
              <span key={i} style={{
                backgroundColor: '#1a2a1a',
                border: '1px solid #166534',
                borderRadius: 20,
                padding: '3px 12px',
                fontSize: 12,
                color: '#4ade80'
              }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* TIMER */}
        {callStatus === 'connected' && (
          <div style={{
            fontSize: 36, fontWeight: 700,
            fontFamily: 'monospace',
            color: '#9ca3af'
          }}>
            {formatDuration(callDuration)}
          </div>
        )}
      </div>

      {/* END CALL BUTTON */}
      <button
        onClick={onEndCall}
        style={{
          width: 68, height: 68,
          borderRadius: '50%',
          backgroundColor: '#dc2626',
          border: 'none',
          cursor: 'pointer',
          fontSize: 26,
          color: '#fff',
          boxShadow: '0 0 24px rgba(220,38,38,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        📵
      </button>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default NadiCallOverlay;
