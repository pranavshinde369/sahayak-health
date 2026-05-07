import React from 'react';

const MicButton = ({ isListening, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        border: isListening
          ? '2px solid #4ade80'
          : '2px solid #374151',
        backgroundColor: isListening
          ? '#0f2418'
          : '#1f2937',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        transition: 'all 0.2s ease',
        flexShrink: 0,
        boxShadow: isListening
          ? '0 0 16px rgba(74,222,128,0.4)'
          : 'none',
        animation: isListening
          ? 'micPulse 1.2s ease infinite'
          : 'none'
      }}
      title={isListening ? 'Stop recording' : 'Speak in Marathi'}
    >
      {isListening ? '🔴' : '🎤'}

      <style>{`
        @keyframes micPulse {
          0%, 100% {
            box-shadow: 0 0 16px rgba(74,222,128,0.4);
          }
          50% {
            box-shadow: 0 0 28px rgba(74,222,128,0.8);
          }
        }
      `}</style>
    </button>
  );
};

export default MicButton;
