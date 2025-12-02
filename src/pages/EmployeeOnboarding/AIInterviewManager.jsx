import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosInstance from '../../security/axiosInstance';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  ShieldAlert,
  EyeOff,
  CameraOff,
  UserCheck,
  Smartphone,
  Eye,
  History,
  Keyboard,
  Radio,
  Wifi,
} from 'lucide-react';

// --- CONFIGURATION ---
const WEBSOCKET_URL = 'ws://localhost:8000/ws/candidate';
const STUN_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

// --- 1. HELPER: Dynamic Schema Generator ---
const generateYupSchema = (questions) => {
  const schemaFields = {};
  questions.forEach((field) => {
    let validator = yup.string();
    if (field.validation?.required) {
      validator = validator.required('This answer is required.');
    }
    if (field.validation?.minLength) {
      validator = validator.min(
        field.validation.minLength,
        `Please enter at least ${field.validation.minLength} characters.`
      );
    }
    schemaFields[field.id] = validator;
  });
  return yup.object().shape(schemaFields);
};

// --- 2. MAIN COMPONENT ---
export default function AiInterviewManager({ userId, jobRole, onComplete }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'active' | 'error'
  const [questions, setQuestions] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // API Call to Generate Questions
  const handleGenerate = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      // Send jobRole to backend to get relevant questions
      const response = await axiosInstance.post('/gap/analyze-gap', {
        job_role: jobRole,
      });

      const data = response.data;

      // Handle various response structures
      const questionsList =
        data.questions || data.screening_questions || data.critical_gaps;

      if (!questionsList || questionsList.length === 0) {
        throw new Error('Invalid response format: No questions found.');
      }

      setQuestions(questionsList);
      setStatus('active');
    } catch (error) {
      console.error('API Error:', error);
      let msg = 'Failed to generate assessment';
      if (error.response) {
        msg = error.response.data?.detail || error.response.statusText;
      } else if (error.request) {
        msg = 'No response from server. Please check your connection.';
      } else {
        msg = error.message;
      }

      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const handleFinalSubmit = async (answers) => {
    console.log('Submitting to Backend:', answers);
    if (onComplete) {
      onComplete();
    }
  };

  // --- RENDER LOGIC ---

  if (status === 'error') {
    return (
      <div className='flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl text-red-800'>
        <div className='flex items-center gap-2'>
          <AlertCircle className='w-5 h-5' />
          <span className='text-sm font-semibold'>{errorMessage}</span>
        </div>
        <button
          onClick={() => setStatus('idle')}
          className='text-sm underline hover:text-red-600'
        >
          Try Again
        </button>
      </div>
    );
  }

  if (status === 'active' && questions) {
    return (
      <ActiveForm
        questions={questions}
        onSubmit={handleFinalSubmit}
        userId={userId}
      />
    );
  }

  return (
    <div
      onClick={status === 'loading' ? undefined : handleGenerate}
      className={`
        relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${
          status === 'loading'
            ? 'border-amber-200 bg-amber-50 cursor-wait'
            : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md'
        }
      `}
    >
      {status === 'loading' ? (
        <>
          <Loader2 className='w-8 h-8 text-amber-500 animate-spin mb-3' />
          <p className='text-xs font-bold text-amber-600 uppercase tracking-wider'>
            AI is Analyzing {jobRole ? `"${jobRole}"` : 'Profile'}...
          </p>
        </>
      ) : (
        <>
          <div className='p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform'>
            <Sparkles className='w-6 h-6 text-blue-500' />
          </div>
          <p className='text-sm font-bold text-slate-600'>
            Start AI Interview Assessment
          </p>
          <p className='text-xs text-slate-400 mt-1 px-4 text-center'>
            Based on your role:{' '}
            <span className='font-medium text-slate-600'>
              {jobRole || 'General'}
            </span>
          </p>
        </>
      )}
    </div>
  );
}

// --- 3. INTERNAL SUB-COMPONENT (The Form) ---
function ActiveForm({ questions, onSubmit, userId }) {
  // Violation Counters
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  // Webcam & Detection State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [webcamError, setWebcamError] = useState('');

  // WebRTC Refs
  const ws = useRef(null);
  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const lastViolationReport = useRef(0); // Throttle violations

  // AI Detection States
  const [isFaceDetected, setIsFaceDetected] = useState(true);
  const [isPhoneDetected, setIsPhoneDetected] = useState(false);
  const [gazeDirection, setGazeDirection] = useState('CENTER');
  const [debugStats, setDebugStats] = useState({ pitch: 0, yaw: 0, vRatio: 0 });
  const [modelLoaded, setModelLoaded] = useState(false);

  // Activity Tracking for Gaze Logic
  const lastActivityTime = useRef(Date.now());
  const lookingDownStart = useRef(null);

  // Model Refs
  const faceMeshModel = useRef(null);
  const objectModel = useRef(null);
  const detectionInterval = useRef(null);

  const yupSchema = useMemo(() => generateYupSchema(questions), [questions]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(yupSchema),
    mode: 'onBlur',
  });

  // --- VIOLATION REPORTER ---
  const reportViolation = (msg) => {
    // Throttle: Only send 1 violation every 2 seconds
    const now = Date.now();
    if (now - lastViolationReport.current < 2000) return;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('Reporting Violation:', msg);
      ws.current.send(
        JSON.stringify({
          target: 'admin',
          payload: { type: 'violation', message: msg },
        })
      );
      lastViolationReport.current = now;
    }
  };

  // --- 1. LOAD AI MODELS DYNAMICALLY ---
  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      if (window.faceLandmarksDetection && window.tf && window.cocoSsd) {
        initModel();
        return;
      }

      // Fallback timeout
      const timeoutId = setTimeout(() => {
        if (isMounted && !modelLoaded) {
          console.warn('AI Model load timed out. Switch to passive mode.');
          setModelLoaded(true);
        }
      }, 20000);

      try {
        const scripts = [
          'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core',
          'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter',
          'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl',
          'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd',
          'https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection@0.0.3',
        ];

        for (const src of scripts) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
          });
        }

        if (isMounted) await initModel();
        clearTimeout(timeoutId);
      } catch (err) {
        console.error('Failed to load AI models:', err);
        if (isMounted) setModelLoaded(true);
      }
    };

    const initModel = async () => {
      try {
        if (window.faceLandmarksDetection) {
          console.log('Loading Face Mesh...');
          const model = await window.faceLandmarksDetection.load(
            window.faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
          );
          if (isMounted) faceMeshModel.current = model;
        }

        if (window.cocoSsd) {
          console.log('Loading Object Model...');
          const model = await window.cocoSsd.load();
          if (isMounted) objectModel.current = model;
        }

        if (isMounted) {
          setModelLoaded(true);
          console.log('All Models Loaded');
        }
      } catch (e) {
        console.error('Model Init Error', e);
        if (isMounted) setModelLoaded(true);
      }
    };

    loadModels();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- 2. WEBCAM & WEBRTC CONNECTION ---
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: true,
        });

        localStreamRef.current = stream;
        handleStreamSuccess(stream);
        connectWebSocket();
      } catch (err) {
        console.warn('Standard webcam init failed, retrying...', err);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;
          handleStreamSuccess(stream);
          connectWebSocket();
        } catch (fallbackErr) {
          console.error('Webcam Error:', fallbackErr);
          setWebcamError('Camera access denied.');
        }
      }
    };

    const handleStreamSuccess = (stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          startDetection();
        };
      }
    };

    const connectWebSocket = () => {
      const uid = userId || 'current_user';
      ws.current = new WebSocket(`${WEBSOCKET_URL}/${uid}`);

      ws.current.onopen = () => {
        console.log(`Connected to Signaling Server as: ${uid}`);
        setIsStreaming(true);
      };

      ws.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'signal') {
          handleSignalMessage(message.data);
        }
      };

      ws.current.onclose = () => {
        console.log('Disconnected from signaling server');
        setIsStreaming(false);
      };
    };

    const handleSignalMessage = async (data) => {
      if (data.type === 'request-offer') {
        createPeerConnection();
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        sendSignal('offer', offer);
      } else if (data.type === 'answer') {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(data)
          );
        }
      } else if (data.type === 'ice-candidate') {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(data)
          );
        }
      }
    };

    const createPeerConnection = () => {
      if (peerConnection.current) return;
      peerConnection.current = new RTCPeerConnection(STUN_SERVERS);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, localStreamRef.current);
        });
      }

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) sendSignal('ice-candidate', event.candidate);
      };
    };

    const sendSignal = (type, payload) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            target: 'admin',
            payload: { type, ...payload },
          })
        );
      }
    };

    // --- AI DETECTION LOOP ---
    const startDetection = () => {
      detectionInterval.current = setInterval(async () => {
        const video = videoRef.current;
        if (video && video.readyState === 4) {
          try {
            if (faceMeshModel.current) {
              const predictions = await faceMeshModel.current.estimateFaces({
                input: video,
              });
              if (predictions.length > 0) {
                setIsFaceDetected(true);
                const keypoints = predictions[0].scaledMesh;
                detectGaze(keypoints);
                drawGaze(video, keypoints);
              } else {
                setIsFaceDetected(false);
                setGazeDirection('UNKNOWN');
                reportViolation('Face Not Visible');
              }
            }

            if (objectModel.current) {
              const objects = await objectModel.current.detect(video);
              const phone = objects.find((obj) => obj.class === 'cell phone');
              if (phone) {
                setIsPhoneDetected(true);
                reportViolation('Phone Detected');
              } else {
                setIsPhoneDetected(false);
              }
            }
          } catch (err) {
            // console.warn('Detection Error', err);
          }
        }
      }, 500);
    };

    // --- GAZE & DRAW ---
    const detectGaze = (keypoints) => {
      // 1. Calculate Pitch (Nodding Down)
      const forehead = keypoints[10];
      const noseTip = keypoints[1];
      const chin = keypoints[152];
      const upperFaceLen = Math.abs(noseTip[1] - forehead[1]);
      const lowerFaceLen = Math.abs(chin[1] - noseTip[1]);
      const pitchRatio = upperFaceLen > 0 ? lowerFaceLen / upperFaceLen : 1;

      // Debug stats for overlay
      setDebugStats({
        pitch: pitchRatio.toFixed(2),
        hRatio: 0,
        vRatio: 0,
      });

      let direction = 'CENTER';

      // 2. Logic: If Looking Down AND Not Typing
      if (pitchRatio < 0.85) {
        const timeSinceInput = Date.now() - lastActivityTime.current;
        const isTyping = timeSinceInput < 3000;

        if (!isTyping) {
          // User is looking down and NOT typing
          if (!lookingDownStart.current) {
            // Start the timer
            lookingDownStart.current = Date.now();
          } else {
            // Check duration
            const duration = Date.now() - lookingDownStart.current;
            if (duration > 10000) {
              // 10 Seconds Threshold
              direction = 'DOWN';
            }
          }
        } else {
          // User is typing, so looking down is allowed. Reset timer.
          lookingDownStart.current = null;
        }
      } else {
        // User is looking UP (Center). Reset timer.
        lookingDownStart.current = null;
      }

      setGazeDirection(direction);

      // 3. Report Violation
      if (direction === 'DOWN') {
        reportViolation(`User looking down for >10s`);
      }
    };

    const drawGaze = (video, keypoints) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) return;
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const leftIris = keypoints[473];
      const rightIris = keypoints[468];

      // Visual Feedback: Green normally, Red ONLY if violation triggered
      ctx.fillStyle = gazeDirection === 'DOWN' ? '#FF0000' : '#00FF00';

      [leftIris, rightIris].forEach((point) => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      const top = keypoints[10][1];
      const bottom = keypoints[152][1];
      const left = keypoints[234][0];
      const right = keypoints[454][0];
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(left, top, right - left, bottom - top);
    };

    startWebcam();

    return () => {
      if (detectionInterval.current) clearInterval(detectionInterval.current);
      if (ws.current) ws.current.close();
      if (peerConnection.current) peerConnection.current.close();
      if (localStreamRef.current)
        localStreamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, [modelLoaded, userId]);

  // --- 3. SECURITY & EVENT LISTENERS ---
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    const handleCopyCutPaste = (e) => {
      e.preventDefault();
      return false;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitchCount((prev) => prev + 1);
        reportViolation('Tab Switch Detected');
      }
    };

    const handleBlur = () => {
      setIsWindowFocused(false);
      reportViolation('Window Focus Lost');
    };

    const handleFocus = () => setIsWindowFocused(true);

    const handleKeyDown = (e) => {
      lastActivityTime.current = Date.now();
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('Screenshots are not allowed.');
        reportViolation('Screenshot Attempt');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className='relative animate-in fade-in slide-in-from-bottom-4 duration-500 select-none'>
      {/* --- FIXED WEBCAM FEED (PROCTOR VIEW) --- */}
      <div
        className={`fixed top-4 right-4 z-40 w-56 bg-slate-900 rounded-lg overflow-hidden shadow-xl border transition-colors ${
          !isFaceDetected || isPhoneDetected || gazeDirection === 'DOWN'
            ? 'border-red-500 ring-2 ring-red-500'
            : 'border-slate-700'
        }`}
      >
        <div className='relative aspect-video bg-black flex items-center justify-center'>
          {webcamError ? (
            <div className='text-red-500 text-xs text-center p-2 flex flex-col items-center'>
              <CameraOff className='w-6 h-6 mb-1' />
              {webcamError}
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className='w-full h-full object-cover transform scale-x-[-1]'
              />
              <canvas
                ref={canvasRef}
                className='absolute inset-0 w-full h-full transform scale-x-[-1]'
              />

              {/* Streaming Indicator */}
              {isStreaming ? (
                <div className='absolute top-2 right-2 flex items-center gap-1 bg-red-600/80 px-2 py-0.5 rounded text-[10px] text-white font-bold animate-pulse backdrop-blur-md'>
                  <Radio className='w-3 h-3' /> LIVE
                </div>
              ) : (
                <div className='absolute top-2 right-2 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded text-[10px] text-slate-400 backdrop-blur-md'>
                  <Wifi className='w-3 h-3' /> OFFLINE
                </div>
              )}

              {/* Status Overlays */}
              {faceMeshModel.current && (
                <div className='absolute top-2 left-2 flex flex-col gap-1 items-start'>
                  <div
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full backdrop-blur-sm ${
                      isFaceDetected ? 'bg-black/60' : 'bg-red-600/90'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isFaceDetected
                          ? 'bg-green-500'
                          : 'bg-white animate-pulse'
                      }`}
                    />
                    <span className='text-[10px] font-medium text-white tracking-wide'>
                      {isFaceDetected ? 'FACE OK' : 'NO FACE'}
                    </span>
                  </div>

                  {isFaceDetected && (
                    <div
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full backdrop-blur-sm ${
                        gazeDirection === 'CENTER'
                          ? 'bg-black/60'
                          : 'bg-amber-600/90'
                      }`}
                    >
                      {gazeDirection === 'CENTER' ? (
                        <Eye className='w-3 h-3 text-white' />
                      ) : (
                        <EyeOff className='w-3 h-3 text-white' />
                      )}
                      <span className='text-[10px] font-medium text-white tracking-wide'>
                        {gazeDirection === 'CENTER'
                          ? 'FOCUSED'
                          : `LOOKING ${gazeDirection}`}
                      </span>
                    </div>
                  )}

                  {isPhoneDetected && (
                    <div className='flex items-center gap-1.5 px-2 py-0.5 bg-red-600/90 rounded-full backdrop-blur-sm animate-pulse'>
                      <Smartphone className='w-3 h-3 text-white' />
                      <span className='text-[10px] font-medium text-white tracking-wide'>
                        PHONE
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {!modelLoaded && !webcamError && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                  <Loader2 className='w-6 h-6 text-white animate-spin' />
                  <span className='absolute mt-10 text-[10px] text-white/70'>
                    Loading AI Models...
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div
          className={`px-3 py-1.5 flex justify-between items-center text-[10px] transition-colors ${
            !isFaceDetected || isPhoneDetected || gazeDirection === 'DOWN'
              ? 'bg-red-900/50 text-red-200'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          <span className='font-medium'>
            {faceMeshModel.current || objectModel.current
              ? isPhoneDetected
                ? 'Mobile Detected!'
                : gazeDirection === 'DOWN'
                ? 'Look at Screen!'
                : 'Proctor Active'
              : 'Monitoring Active'}
          </span>
          {(faceMeshModel.current || objectModel.current) &&
            (isFaceDetected &&
            !isPhoneDetected &&
            gazeDirection === 'CENTER' ? (
              <UserCheck className='w-3 h-3 text-green-400' />
            ) : (
              <ShieldAlert className='w-3 h-3 text-red-400 animate-pulse' />
            ))}
        </div>
      </div>

      {/* --- PRIVACY BLUR OVERLAY --- */}
      {!isWindowFocused && (
        <div className='fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8'>
          <EyeOff className='w-16 h-16 text-slate-400 mb-4' />
          <h2 className='text-2xl font-bold text-slate-800 mb-2'>
            Exam Paused
          </h2>
          <p className='text-slate-600 max-w-md mb-8'>
            You switched tabs or lost focus. This event has been recorded.
          </p>
          <button
            onClick={() => setIsWindowFocused(true)}
            className='px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20'
          >
            Resume Assessment
          </button>
        </div>
      )}

      {/* --- VIOLATION DASHBOARD --- */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div className='p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3'>
          <div className='p-2 bg-green-100 rounded-full'>
            <CheckCircle2 className='w-5 h-5 text-green-700' />
          </div>
          <div>
            <h3 className='text-sm font-bold text-green-900'>
              Assessment Active
            </h3>
            <p className='text-xs text-green-700'>
              {questions.length} Questions
            </p>
          </div>
        </div>

        {tabSwitchCount > 0 && (
          <div className='p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-pulse'>
            <div className='p-2 bg-red-100 rounded-full'>
              <History className='w-5 h-5 text-red-700' />
            </div>
            <div>
              <h3 className='text-sm font-bold text-red-900'>
                Tab Switches Detected
              </h3>
              <p className='text-xs text-red-700 font-semibold'>
                Count: {tabSwitchCount} times
              </p>
            </div>
          </div>
        )}
      </div>

      {/* --- IMMEDIATE ALERT --- */}
      {(!isFaceDetected || isPhoneDetected || gazeDirection === 'DOWN') && (
        <div className='mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-3 text-red-800 animate-bounce'>
          <ShieldAlert className='w-5 h-5 flex-shrink-0' />
          <div className='text-xs font-bold'>
            ALERT:
            {!isFaceDetected && <span> Face not visible! </span>}
            {isPhoneDetected && <span> Mobile Phone detected! </span>}
            {gazeDirection === 'DOWN' && <span> Looking down/away! </span>}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {questions.map((field, index) => (
          <div
            key={field.id || index}
            className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300'
          >
            <label className='block text-sm font-semibold text-slate-800 mb-3 leading-relaxed'>
              <span className='text-slate-400 mr-2 font-mono'>
                {String(index + 1).padStart(2, '0')}.
              </span>
              {field.question}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                {...register(field.id)}
                rows={4}
                placeholder={field.placeholder || 'Type your answer...'}
                onPaste={(e) => e.preventDefault()}
                className={`w-full p-3 text-sm bg-slate-50 border rounded-lg outline-none transition-colors resize-y ${
                  errors[field.id]
                    ? 'border-red-300 focus:border-red-400 bg-red-50/20'
                    : 'border-slate-200 focus:border-blue-500'
                }`}
              />
            ) : field.type === 'radio' && field.options ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {field.options.map((option) => (
                  <label
                    key={option}
                    className='flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 transition-all'
                  >
                    <input
                      type='radio'
                      value={option}
                      {...register(field.id)}
                      className='w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-sm text-slate-700'>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type='text'
                {...register(field.id)}
                placeholder={field.placeholder}
                onPaste={(e) => e.preventDefault()}
                className={`w-full p-3 text-sm bg-slate-50 border rounded-lg outline-none transition-colors ${
                  errors[field.id]
                    ? 'border-red-300 focus:border-red-400 bg-red-50/20'
                    : 'border-slate-200 focus:border-blue-500'
                }`}
              />
            )}

            {errors[field.id] && (
              <div className='mt-2 flex items-center gap-1.5 text-red-500 text-xs font-medium animate-pulse'>
                <AlertCircle className='w-3.5 h-3.5' />
                <span>{errors[field.id]?.message}</span>
              </div>
            )}
          </div>
        ))}

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {isSubmitting ? (
            <Loader2 className='w-5 h-5 animate-spin' />
          ) : (
            <Send className='w-5 h-5' />
          )}
          Submit Assessment
        </button>
      </form>
    </div>
  );
}
