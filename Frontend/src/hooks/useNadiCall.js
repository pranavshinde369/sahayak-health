import { useState, useRef, useCallback } from 'react';
import { Conversation } from '@11labs/client';

export const useNadiCall = () => {
  const [callStatus, setCallStatus] = useState('idle');
  const [agentMessage, setAgentMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const conversationRef = useRef(null);
  const timerRef = useRef(null);

  const startCall = useCallback(async (callData) => {
    try {
      setCallStatus('connecting');
      setAgentMessage('');
      setCallDuration(0);

      const res = await fetch(
        'http://localhost:8000/api/nadi/start-call',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            village: callData.village,
            symptoms: callData.symptoms || []
          })
        }
      );

      const data = await res.json();
      if (!data.signed_url) throw new Error('No signed URL returned');

      const conversation = await Conversation.startSession({
        signedUrl: data.signed_url,

        onConnect: () => {
          setCallStatus('connected');
          timerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
          }, 1000);
        },

        onMessage: ({ message, source }) => {
          if (source === 'ai') setAgentMessage(message);
        },

        onModeChange: ({ mode }) => {
          setIsSpeaking(mode === 'speaking');
        },

        onDisconnect: () => {
          setCallStatus('ended');
          clearInterval(timerRef.current);
        },

        onError: () => {
          setCallStatus('error');
          clearInterval(timerRef.current);
        }
      });

      conversationRef.current = conversation;

    } catch (err) {
      console.error(err);
      setCallStatus('error');
    }
  }, []);

  const endCall = useCallback(async () => {
    clearInterval(timerRef.current);
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
    setCallStatus('idle');
    setAgentMessage('');
    setCallDuration(0);
    setIsSpeaking(false);
  }, []);

  const formatDuration = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    callStatus,
    agentMessage,
    isSpeaking,
    callDuration,
    formatDuration,
    startCall,
    endCall
  };
};
