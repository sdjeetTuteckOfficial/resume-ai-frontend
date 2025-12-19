import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  VideoOff,
  Loader,
  Shield,
  AlertTriangle,
  Activity,
  XCircle,
  AlertOctagon,
} from 'lucide-react';

// --- CONFIGURATION ---
// Note: We don't include the token here yet, we append it dynamically
const SIGNALING_BASE_URL = 'ws://localhost:8000/ws/admin';
const STUN_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export default function AdminProctorView() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [adminSocketStatus, setAdminSocketStatus] = useState('disconnected');

  // --- REAL-TIME AI STATS ---
  const [violations, setViolations] = useState(0);
  const [lastAlert, setLastAlert] = useState(null);

  // --- REFS ---
  const ws = useRef(null);
  const peerConnection = useRef(null);
  const remoteVideoRef = useRef(null);
  const selectedUserRef = useRef(null);
  const iceCandidateQueue = useRef([]);

  // Sync ref with state
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // --- 1. CONNECT TO SIGNALING SERVER (WITH TOKEN) ---
  useEffect(() => {
    const connectAdminSocket = () => {
      // 1. Get Token from Local Storage
      const token = localStorage.getItem('token'); // Ensure this matches your login storage key

      if (!token) {
        console.error('❌ No authentication token found. Please log in.');
        setAdminSocketStatus('auth_failed');
        return;
      }

      // 2. Append Token to URL
      const wsUrl = `${SIGNALING_BASE_URL}?token=${token}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('✅ Admin Connected to Signaling Server');
        setAdminSocketStatus('connected');
      };

      ws.current.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'user-list-update') {
            setActiveUsers(message.users);
          } else if (message.type === 'signal') {
            const currentTarget = selectedUserRef.current;

            if (message.data.type === 'violation') {
              handleViolationEvent(message.sender, message.data, currentTarget);
            } else {
              handleSignalMessage(message.sender, message.data, currentTarget);
            }
          }
        } catch (err) {
          console.error('Error parsing websocket message:', err);
        }
      };

      ws.current.onclose = (event) => {
        console.log('❌ Admin Socket Disconnected', event.code, event.reason);
        if (event.code === 1008) {
          alert('Session Expired or Unauthorized. Please log in again.');
          setAdminSocketStatus('auth_failed');
        } else {
          setAdminSocketStatus('disconnected');
        }
      };
    };

    connectAdminSocket();

    return () => {
      if (ws.current) ws.current.close();
      if (peerConnection.current) peerConnection.current.close();
    };
  }, []);

  // --- 2. HANDLE VIOLATIONS ---
  const handleViolationEvent = (senderId, data, currentTarget) => {
    if (senderId === currentTarget) {
      setViolations((prev) => prev + 1);
      setLastAlert(data.message);

      setTimeout(() => setLastAlert(null), 3000);
    }
  };

  // --- 3. START MONITORING ---
  const startMonitoring = async (userId) => {
    if (selectedUser === userId) return;

    // UI Updates
    setSelectedUser(userId);
    setConnectionStatus('connecting');
    setViolations(0);
    setLastAlert(null);

    // Cleanup previous connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    iceCandidateQueue.current = [];

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    try {
      peerConnection.current = new RTCPeerConnection(STUN_SERVERS);

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          console.log('🎥 Video Stream Received');
          remoteVideoRef.current.srcObject = event.streams[0];
          setConnectionStatus('connected');
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal(userId, 'ice-candidate', event.candidate);
        }
      };

      peerConnection.current.onconnectionstatechange = () => {
        if (
          peerConnection.current.connectionState === 'failed' ||
          peerConnection.current.connectionState === 'disconnected'
        ) {
          setConnectionStatus('failed');
        }
      };

      // Initiate the handshake
      sendSignal(userId, 'request-offer', {});
    } catch (err) {
      console.error('Failed to create PeerConnection:', err);
      setConnectionStatus('failed');
    }
  };

  const handleSignalMessage = async (senderId, data, currentTarget) => {
    if (!peerConnection.current || senderId !== currentTarget) return;

    try {
      if (data.type === 'offer') {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(data)
        );

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        sendSignal(senderId, 'answer', answer);

        while (iceCandidateQueue.current.length > 0) {
          const candidate = iceCandidateQueue.current.shift();
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } else if (data.type === 'ice-candidate') {
        if (peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(data)
          );
        } else {
          iceCandidateQueue.current.push(data);
        }
      }
    } catch (err) {
      console.error('Signaling Error:', err);
    }
  };

  const sendSignal = (targetUserId, type, payload) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          targetUserId,
          payload: { type, ...payload },
        })
      );
    } else {
      console.warn('WebSocket not open. Cannot send signal.');
    }
  };

  const disconnectUser = () => {
    setSelectedUser(null);
    setConnectionStatus('idle');
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  return (
    <div className='flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden'>
      {/* SIDEBAR */}
      <div className='w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10'>
        <div className='p-6 border-b border-slate-100 bg-slate-50/50'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-slate-800'>
            <Shield className='w-6 h-6 text-blue-600' />
            Proctor Admin
          </h2>
          <div className='flex items-center gap-2 mt-2'>
            <div
              className={`w-2 h-2 rounded-full ${
                adminSocketStatus === 'connected'
                  ? 'bg-green-500'
                  : adminSocketStatus === 'auth_failed'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
            />
            <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
              System:{' '}
              {adminSocketStatus === 'auth_failed'
                ? 'Auth Failed'
                : adminSocketStatus}
            </p>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-2'>
          <div className='flex justify-between items-center px-2 mb-3'>
            <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
              Online Candidates
            </h3>
            <span className='bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full'>
              {activeUsers.length}
            </span>
          </div>
          {activeUsers.length === 0 && (
            <p className='text-sm text-slate-400 text-center py-4'>
              No candidates online
            </p>
          )}
          {activeUsers.map((userId) => (
            <button
              key={userId}
              onClick={() => startMonitoring(userId)}
              className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all border ${
                selectedUser === userId
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className='flex items-center gap-3 overflow-hidden'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedUser === userId ? 'bg-white/20' : 'bg-slate-100'
                  }`}
                >
                  <User className='w-4 h-4' />
                </div>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold truncate'>{userId}</p>
                  <p
                    className={`text-[10px] truncate ${
                      selectedUser === userId
                        ? 'text-blue-100'
                        : 'text-slate-400'
                    }`}
                  >
                    ID: #{userId.substring(0, 6)}
                  </p>
                </div>
              </div>
              {selectedUser === userId && (
                <Activity className='w-4 h-4 animate-pulse text-white' />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className='flex-1 p-6 flex flex-col h-screen overflow-hidden'>
        {selectedUser ? (
          <div className='flex-1 flex flex-col max-w-5xl mx-auto w-full'>
            <header className='mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200'>
              <div className='flex items-center gap-4'>
                <div className='w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center'>
                  <User className='w-5 h-5 text-slate-600' />
                </div>
                <div>
                  <h1 className='text-lg font-bold text-slate-800'>
                    {selectedUser}
                  </h1>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        connectionStatus === 'connected'
                          ? 'bg-green-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span className='text-xs text-slate-500 font-medium capitalize'>
                      Status: {connectionStatus}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={disconnectUser}
                className='text-sm text-red-600 hover:bg-red-50 font-bold px-4 py-2 rounded-lg border border-transparent hover:border-red-100 flex items-center gap-2'
              >
                <XCircle className='w-4 h-4' /> Disconnect
              </button>
            </header>

            <div className='flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl relative ring-1 ring-slate-900/5'>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className='w-full h-full object-contain'
              />

              {/* ALERT OVERLAY */}
              {lastAlert && (
                <div className='absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce flex items-center gap-2 z-50'>
                  <AlertOctagon className='w-5 h-5' />
                  <span className='font-bold'>{lastAlert}</span>
                </div>
              )}

              {connectionStatus === 'connecting' && (
                <div className='absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white z-20'>
                  <Loader className='w-10 h-10 animate-spin text-blue-500 mb-4' />
                  <p>Connecting Secure Tunnel...</p>
                </div>
              )}

              {connectionStatus === 'connected' && (
                <div className='absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 shadow-lg'>
                  <span className='w-1.5 h-1.5 bg-white rounded-full animate-pulse' />{' '}
                  LIVE FEED
                </div>
              )}
            </div>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='p-2 bg-green-50 rounded-lg'>
                    <Activity className='w-4 h-4 text-green-600' />
                  </div>
                  <h4 className='text-xs font-bold text-slate-500 uppercase'>
                    Stream Health
                  </h4>
                </div>
                <p className='text-lg font-bold text-slate-800'>
                  {connectionStatus === 'connected' ? 'Stable' : '-'}
                </p>
              </div>

              <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='p-2 bg-blue-50 rounded-lg'>
                    <Shield className='w-4 h-4 text-blue-600' />
                  </div>
                  <h4 className='text-xs font-bold text-slate-500 uppercase'>
                    AI Guardrails
                  </h4>
                </div>
                <p className='text-lg font-bold text-slate-800'>Active</p>
              </div>

              {/* DYNAMIC VIOLATION COUNTER */}
              <div
                className={`p-5 rounded-xl border shadow-sm transition-colors ${
                  violations > 0
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className='flex items-center gap-3 mb-2'>
                  <div
                    className={`p-2 rounded-lg ${
                      violations > 0 ? 'bg-red-100' : 'bg-amber-50'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        violations > 0 ? 'text-red-600' : 'text-amber-600'
                      }`}
                    />
                  </div>
                  <h4 className='text-xs font-bold text-slate-500 uppercase'>
                    Flags
                  </h4>
                </div>
                <div className='flex items-center gap-2'>
                  <span
                    className={`text-lg font-bold ${
                      violations > 0 ? 'text-red-600' : 'text-slate-800'
                    }`}
                  >
                    {violations}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      violations > 0
                        ? 'bg-red-200 text-red-800'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {violations > 0 ? 'Review Needed' : 'Clean'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200 m-4'>
            <div className='bg-slate-50 p-8 rounded-full mb-6'>
              <VideoOff className='w-16 h-16 text-slate-300' />
            </div>
            <h3 className='text-xl font-bold text-slate-700'>
              Proctoring Console Ready
            </h3>
            <p className='text-sm text-slate-500 mt-2'>
              Select a candidate from the sidebar to begin monitoring.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
