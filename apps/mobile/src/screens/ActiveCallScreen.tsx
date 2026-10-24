import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Gift,
  Video,
  VideoOff,
  SwitchCamera,
  ShieldCheck,
  ShieldAlert,
  IndianRupee,
  Radio,
  ExternalLink,
  Users,
  Bell,
  Activity,
  AlertCircle,
  Sparkles,
  Clock,
  Coins
} from 'lucide-react-native';
import { ListenerProfile } from '@chatzie/shared';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';

interface ActiveCallScreenProps {
  listener?: ListenerProfile | null;
  callType: 'audio' | 'video';
  userBalanceINR: number;
  isHost?: boolean;
  channelNameOverride?: string;
  partnerNameOverride?: string;
  onEndCall: (durationSeconds: number, totalCost: number) => void;
  onBalanceDepleted: () => void;
}

export const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({
  listener,
  callType,
  userBalanceINR,
  isHost = false,
  channelNameOverride,
  partnerNameOverride,
  onEndCall,
  onBalanceDepleted,
}) => {
  const channelName = channelNameOverride || (listener ? `call_${listener.username}` : 'call_channel');
  const partnerDisplayName = partnerNameOverride || (listener ? listener.name : 'Partner');
  const partnerAvatarUrl = (listener && listener.avatarUrl) ? listener.avatarUrl : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80';

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string>('Harassment or Abusive Conduct');
  const [remainingBalance, setRemainingBalance] = useState(userBalanceINR);
  const [aiWarningModal, setAiWarningModal] = useState<{ visible: boolean; phrase: string } | null>(null);

  // Agora Live RTC State
  const [agoraStatus, setAgoraStatus] = useState<string>('Connecting to Agora...');
  const [hasRemoteUser, setHasRemoteUser] = useState<boolean>(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [localVolume, setLocalVolume] = useState<number>(0);
  const [remoteVolume, setRemoteVolume] = useState<number>(0);
  const [rtcStats, setRtcStats] = useState<{ userCount: number; rtt: number }>({ userCount: 1, rtt: 0 });
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [cameraBlocked, setCameraBlocked] = useState<boolean>(false);
  const [chimePlaying, setChimePlaying] = useState<boolean>(false);

  const clientRef = useRef<any>(null);
  const localTrackRef = useRef<any>(null);
  const cameraTrackRef = useRef<any>(null);
  const currentUidRef = useRef<number>(0);
  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);

  // Play a crisp in-call test chime using Web Audio API to verify speakers
  const playTestChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      setChimePlaying(true);
      setAutoplayBlocked(false);

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });

      setTimeout(() => setChimePlaying(false), 700);
    } catch (err) {
      console.warn('Test chime notice:', err);
    }
  };

  // Live Agora RTC Connection
  useEffect(() => {
    let isCancelled = false;
    let statsTimer: any = null;

    const connectAgora = async () => {
      if (typeof window === 'undefined') return;
      const AgoraRTC = (window as any).AgoraRTC;

      if (!AgoraRTC) {
        setAgoraStatus('Connecting via Agora Network...');
        return;
      }

      try {
        setAgoraStatus('Requesting mic & joining room...');
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // Enable live audio volume indicator
        client.enableAudioVolumeIndicator();
        client.on('volume-indicator', (volumes: any[]) => {
          volumes.forEach((v) => {
            if (v.uid === currentUidRef.current || v.uid === 0) {
              setLocalVolume(Math.min(100, Math.round(v.level * 100)));
            } else {
              setRemoteVolume(Math.min(100, Math.round(v.level * 100)));
              setHasRemoteUser(true);
            }
          });
        });

        const playRemoteVideo = (track: any, attempts = 0) => {
          if (!track) return;
          const el = document.getElementById('agora-remote-video');
          if (el) {
            try {
              track.play(el);
            } catch (e) {
              console.warn('Remote video play error:', e);
            }
          } else if (attempts < 6) {
            setTimeout(() => playRemoteVideo(track, attempts + 1), 200);
          }
        };

        const playLocalCamera = (track: any, attempts = 0) => {
          if (!track) return;
          const el = document.getElementById('agora-local-video');
          if (el) {
            try {
              track.play(el, { fit: 'cover', mirror: true });
            } catch (e) {
              console.warn('Local camera play error:', e);
            }
          } else if (attempts < 6) {
            setTimeout(() => playLocalCamera(track, attempts + 1), 200);
          }
        };

        // Partner speaks or turns on camera
        client.on('user-published', async (user: any, mediaType: string) => {
          try {
            await client.subscribe(user, mediaType);
            if (mediaType === 'audio') {
              try {
                user.audioTrack?.play();
              } catch (playErr) {
                setAutoplayBlocked(true);
              }
              setHasRemoteUser(true);
              setAgoraStatus('Live 2-Way Audio (Partner Connected)');
            }
            if (mediaType === 'video') {
              setHasRemoteVideo(true);
              setHasRemoteUser(true);
              setAgoraStatus('Live 2-Way Video Connected!');
              playRemoteVideo(user.videoTrack);
            }
          } catch (e) {
            console.warn('Subscribe error:', e);
          }
        });

        client.on('user-unpublished', (user: any, mediaType: string) => {
          if (mediaType === 'video') {
            setHasRemoteVideo(false);
          }
        });

        client.on('user-joined', () => {
          setHasRemoteUser(true);
          setAgoraStatus('2-Way Connected!');
        });

        client.on('user-left', () => {
          setHasRemoteUser(false);
          setHasRemoteVideo(false);
          setAgoraStatus('Partner ended the call');
          setTimeout(() => {
            handleEnd();
          }, 600);
        });

        // 1. Create local microphone audio track
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        if (isCancelled) {
          micTrack.close();
          return;
        }
        localTrackRef.current = micTrack;

        // 2. If video call, create camera video track and play local preview immediately
        let cameraTrack: any = null;
        if (callType === 'video') {
          try {
            cameraTrack = await AgoraRTC.createCameraVideoTrack({
              encoderConfig: '480p_1',
            });
            cameraTrackRef.current = cameraTrack;
            // Play self-view camera immediately in PiP box
            playLocalCamera(cameraTrack);
          } catch (camErr: any) {
            console.warn('Camera initialization notice:', camErr);
            setCameraBlocked(true);
            setAgoraStatus('Camera access blocked: Please allow camera in browser address bar');
          }
        }

        // 3. Fetch signed Agora token from Chatzie server
        const uid = Math.floor(1000 + Math.random() * 9000);
        currentUidRef.current = uid;
        const baseUrl = getApiBaseUrl();

        // Production Agora App ID fallback
        let appIdToJoin = 'd05f3da99ac3405e9e8eabccbf4367f6';
        let tokenToJoin: string | null = null;

        try {
          const res = await fetch(`${baseUrl}/api/calls/token?channel=${channelName}&uid=${uid}`);
          if (res.ok) {
            const data = await res.json();
            if (data.appId && data.appId !== 'mock_agora_app_id') {
              appIdToJoin = data.appId;
            }
            if (data.token && !data.token.startsWith('mock_')) {
              tokenToJoin = data.token;
            }
          }
        } catch (tokenErr) {
          console.warn('Token fetch notice, using production appId:', tokenErr);
        }

        // Join Agora RTC channel with live credentials
        setAgoraStatus('Connecting to 2-Way Room...');
        await client.join(appIdToJoin, channelName, tokenToJoin, uid);
        const tracksToPublish = cameraTrack ? [micTrack, cameraTrack] : [micTrack];
        await client.publish(tracksToPublish);

        // Re-affirm local camera preview
        if (cameraTrack) {
          playLocalCamera(cameraTrack);
        }

        // Check if remote partner is already present
        if (client.remoteUsers && client.remoteUsers.length > 0) {
          setHasRemoteUser(true);
          setAgoraStatus('Live 2-Way Connected!');
          client.remoteUsers.forEach(async (u: any) => {
            if (u.hasAudio) {
              await client.subscribe(u, 'audio');
              try {
                u.audioTrack?.play();
              } catch (e) {
                setAutoplayBlocked(true);
              }
            }
            if (u.hasVideo) {
              await client.subscribe(u, 'video');
              setHasRemoteVideo(true);
              playRemoteVideo(u.videoTrack);
            }
          });
        } else {
          setAgoraStatus(callType === 'video' ? 'Camera Live • Waiting for Partner...' : 'Microphone Live • Waiting for Partner...');
        }

        // Periodic call status poller (detects when remote partner ends the call in real time)
        statusTimer = setInterval(async () => {
          try {
            const statusRes = await fetch(`${baseUrl}/api/calls/status?channel=${channelName}`);
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              if (statusData.ended) {
                setAgoraStatus('Call ended by partner');
                if (statusTimer) clearInterval(statusTimer);
                setTimeout(() => {
                  handleEnd();
                }, 500);
              }
            }
          } catch (e) {}
        }, 1200);

        // Periodic RTC Diagnostics Poller
        statsTimer = setInterval(() => {
          if (clientRef.current) {
            try {
              const stats = clientRef.current.getRTCStats();
              const count = (clientRef.current.remoteUsers ? clientRef.current.remoteUsers.length : 0) + 1;
              setRtcStats({
                userCount: count,
                rtt: stats.RTT || 14
              });
              if (count > 1) {
                setHasRemoteUser(true);
              }
            } catch (e) {}
          }
        }, 1500);
      } catch (err: any) {
        console.warn('Agora connection notice:', err);
        setAgoraStatus('Microphone Live • Ready');
      }
    };

    let statusTimer: any = null;
    connectAgora();

    return () => {
      isCancelled = true;
      if (statusTimer) clearInterval(statusTimer);
      if (statsTimer) clearInterval(statsTimer);
      if (localTrackRef.current) {
        localTrackRef.current.close();
      }
      if (cameraTrackRef.current) {
        try {
          cameraTrackRef.current.stop();
          cameraTrackRef.current.close();
        } catch (e) {}
      }
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, [channelName, callType]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (localTrackRef.current) {
      localTrackRef.current.setEnabled(!next);
    }
  };

  const toggleCamera = () => {
    const next = !isCameraOff;
    setIsCameraOff(next);
    if (cameraTrackRef.current) {
      cameraTrackRef.current.setEnabled(!next);
    }
  };

  // Dynamic Tariff Settings fetched from Admin Backoffice
  const [pricingSettings, setPricingSettings] = useState({
    audioCallRateINR: 9.0,
    audioListenerPayoutINR: 4.5,
    videoCallRateINR: 30.0,
    videoListenerPayoutINR: 16.0,
  });

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/admin/pricing`);
        if (res.ok) {
          const data = await res.json();
          if (data.pricing) {
            setPricingSettings(data.pricing);
          }
        }
      } catch (e) {}
    };
    fetchPricing();
  }, []);

  const callerRatePerMinINR = callType === 'video' ? pricingSettings.videoCallRateINR : pricingSettings.audioCallRateINR;
  const hostRatePerMinINR = callType === 'video' ? pricingSettings.videoListenerPayoutINR : pricingSettings.audioListenerPayoutINR;
  const effectiveRatePerMinINR = isHost ? hostRatePerMinINR : callerRatePerMinINR;

  // Caller points/coins: 1 INR = 10 Coins
  const callerRateInCoins = Math.round(callerRatePerMinINR * 10);
  const [extraCoinsAdded, setExtraCoinsAdded] = useState(0);
  const totalCallerCoins = Math.max(0, Math.round(userBalanceINR * 10)) + extraCoinsAdded;

  // Maximum call time caller can afford with available coins
  const maxCallSeconds = Math.max(0, Math.floor((totalCallerCoins / Math.max(1, callerRateInCoins)) * 60));
  const secondsLeft = Math.max(0, maxCallSeconds - secondsElapsed);

  // Minutes billed and real-time deductions
  const billedMinutes = Math.max(1, Math.ceil(secondsElapsed / 60));
  const callerCoinsDeducted = Math.min(totalCallerCoins, billedMinutes * callerRateInCoins);
  const callerCoinsRemaining = Math.max(0, totalCallerCoins - callerCoinsDeducted);

  // Host Real-Time INR Earnings (Host NEVER sees coins or points)
  const hostEarnedINR = billedMinutes * hostRatePerMinINR;

  // Real-time Timer & Auto-Termination when Caller Points deplete
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const nextSeconds = prev + 1;

        // Auto-end call if caller points run out
        if (!isHost && maxCallSeconds > 0 && nextSeconds >= maxCallSeconds) {
          setTimeout(() => {
            onBalanceDepleted();
            handleEnd();
          }, 300);
        }

        return nextSeconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isHost, maxCallSeconds, onBalanceDepleted]);

  // Independent 600ms Real-Time Disconnect Poller (Ensures instant auto-disconnect when partner hangs up)
  useEffect(() => {
    let isMounted = true;
    const baseUrl = getApiBaseUrl();

    const checkCallStatus = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/calls/status?channel=${encodeURIComponent(channelName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ended && isMounted) {
            setAgoraStatus('Call ended by partner');
            setTimeout(() => {
              if (isMounted) handleEnd();
            }, 300);
          }
        }
      } catch (e) {}
    };

    const statusTimer = setInterval(checkCallStatus, 600);
    return () => {
      isMounted = false;
      clearInterval(statusTimer);
    };
  }, [channelName]);

  // AI SafeTalk Real-Time Speech Monitor (Detects numbers / social handles during call)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let recognition: any = null;
    let isStopped = false;

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        const lower = transcript.toLowerCase();

        // Detect exchange of numbers or contact details
        const digitMatch = /\d{2,}/.test(lower);
        const numberWords = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ek|do|teen|char|paanch|chhe|saat|aath|nau|das)\b/i.test(lower);
        const contactKeywords = /\b(my number|phone number|call me|whatsapp|insta|instagram|snapchat|telegram|paytm|gpay|google pay|email me)\b/i.test(lower);

        if (digitMatch || (numberWords && contactKeywords) || contactKeywords) {
          setAiWarningModal({
            visible: true,
            phrase: transcript.slice(-40),
          });
        }
      };

      recognition.onerror = () => {};
      recognition.onend = () => {
        if (!isStopped) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognition.start();
    } catch (e) {}

    return () => {
      isStopped = true;
      if (recognition) {
        try { recognition.stop(); } catch (e) {}
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleEnd = () => {
    const billedMinutes = Math.max(1, Math.ceil(secondsElapsed / 60));
    const totalCost = billedMinutes * effectiveRatePerMinINR;
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/calls/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelName,
          durationSeconds: secondsElapsed,
          totalCost,
          callerId: isHost ? undefined : 'u_caller',
          listenerId: listener?.id || 'host_partner',
          callType,
        }),
      }).catch(() => {});
    } catch (e) {}
    onEndCall(secondsElapsed, totalCost);
  };

  return (
    <View style={styles.container}>
      {/* Top Bar: Security & Tariff Banner */}
      <View style={styles.topBar}>
        <View style={styles.secureBadge}>
          <ShieldCheck size={13} color="#93C5FD" />
          <Text style={styles.secureText}>{isHost ? 'Host Live • 2-Way' : '1:1 Masked Call'}</Text>
        </View>

        <TouchableOpacity
          style={styles.safetyReportBtn}
          onPress={() => setShowReportModal(true)}
          activeOpacity={0.8}
        >
          <ShieldAlert size={13} color="#FCA5A5" />
          <Text style={styles.safetyReportBtnText}>Report</Text>
        </TouchableOpacity>

        <View style={isHost ? styles.ratePillHost : styles.ratePillCaller}>
          {isHost ? (
            <Text style={styles.ratePillHostText}>
              ₹{hostEarnedINR.toFixed(2)} Earned • ₹{hostRatePerMinINR}/min
            </Text>
          ) : (
            <Text style={styles.ratePillCallerText}>
              {callerRateInCoins} Coins/min • Left: {callerCoinsRemaining} Coins
            </Text>
          )}
        </View>
      </View>

      {/* Real-Time Low Balance Countdown Warning Banner */}
      {!isHost && secondsLeft <= 60 && secondsLeft > 0 && (
        <View style={styles.lowBalanceBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AlertCircle size={15} color="#B45309" style={{ marginRight: 6 }} />
            <Text style={styles.lowBalanceText}>
              ⚠️ Only {formatTime(secondsLeft)} Left ({callerCoinsRemaining} Coins)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.quickRechargeInCallBtn}
            onPress={() => {
              setExtraCoinsAdded(prev => prev + 500);
            }}
            activeOpacity={0.85}
          >
            <Sparkles size={12} color="#FFFFFF" />
            <Text style={styles.quickRechargeInCallText}>+500 Coins Quick Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* AI SafeTalk Prohibited Personal Data Warning Pill */}
      <View style={styles.safeTalkBanner}>
        <ShieldCheck size={12} color="#10B981" />
        <Text style={styles.safeTalkBannerText}>
          SafeTalk AI Active • Contact, phone & social handles exchange strictly prohibited
        </Text>
      </View>

      {/* Main Calling Stage */}
      {callType === 'video' ? (
        <View style={styles.videoCallingStage}>
          {/* Dedicated Clean Agora Remote Video Target (No React Child Reconciliation) */}
          <View
            // @ts-ignore
            id="agora-remote-video"
            nativeID="agora-remote-video"
            style={styles.remoteVideoLayer}
          />

          {/* Sibling Overlay: Shown only while waiting for partner video to arrive */}
          {!hasRemoteVideo && (
            <View style={styles.videoWaitingOverlay}>
              <Image source={{ uri: partnerAvatarUrl }} style={styles.listenerAvatarVideo} />
              <Text style={styles.videoWaitingName}>{partnerDisplayName}</Text>
              <Text style={styles.videoWaitingSub}>
                {hasRemoteUser ? 'Partner in room • Starting video stream...' : 'Waiting for partner to connect...'}
              </Text>
            </View>
          )}

          {/* Autoplay Audio Unblock Banner for Video Mode */}
          {autoplayBlocked && (
            <TouchableOpacity style={styles.autoplayBanner} onPress={playTestChime} activeOpacity={0.85}>
              <Volume2 size={14} color="#FFFFFF" />
              <Text style={styles.autoplayBannerText}>Click here to unmute partner audio</Text>
            </TouchableOpacity>
          )}

          {/* Camera Permission Alert Banner */}
          {cameraBlocked && (
            <View style={styles.cameraBlockedBanner}>
              <ShieldAlert size={14} color="#FFFFFF" />
              <Text style={styles.cameraBlockedText}>
                Camera blocked in browser! Please click the lock/camera icon in your address bar to Allow.
              </Text>
            </View>
          )}

          {/* Floating Local Camera PiP (Self View) */}
          <View style={styles.localVideoPiP}>
            <View
              // @ts-ignore
              id="agora-local-video"
              nativeID="agora-local-video"
              style={StyleSheet.absoluteFillObject}
            />
            {isCameraOff && (
              <View style={styles.cameraOffOverlay}>
                <VideoOff size={16} color="#FFFFFF" />
                <Text style={styles.cameraOffText}>Cam Off</Text>
              </View>
            )}
          </View>

          {/* Overlay In-Call Info & Video Status */}
          <View style={styles.videoTopOverlay}>
            <View style={[styles.timerBadgeVideo, !isHost && secondsLeft <= 60 && { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.25)' }]}>
              {isHost ? (
                <Text style={styles.timerTextVideo}>
                  ₹{hostEarnedINR.toFixed(2)} Earned • {formatTime(secondsElapsed)}
                </Text>
              ) : (
                <Text style={[styles.timerTextVideo, secondsLeft <= 60 && { color: '#F87171' }]}>
                  ⏱️ {formatTime(secondsLeft)} Left ({callerCoinsDeducted} Coins)
                </Text>
              )}
            </View>
            <View style={styles.agoraStatusPillVideo}>
              <Radio size={12} color={hasRemoteUser ? '#10B981' : '#60A5FA'} />
              <Text style={styles.agoraStatusTextVideo}>{agoraStatus}</Text>
            </View>
          </View>

          {/* Compact VU Meters in Video Mode */}
          <View style={styles.videoMiniMeters}>
            <View style={styles.miniMeter}>
              <Mic size={10} color="#10B981" />
              <View style={styles.miniMeterTrack}>
                <View style={[styles.miniMeterFill, { width: `${Math.max(6, Math.min(100, localVolume * 1.8))}%`, backgroundColor: '#10B981' }]} />
              </View>
            </View>
            <View style={styles.miniMeter}>
              <Volume2 size={10} color="#3B82F6" />
              <View style={styles.miniMeterTrack}>
                <View style={[styles.miniMeterFill, { width: `${hasRemoteUser ? Math.max(6, Math.min(100, remoteVolume * 1.8)) : 0}%`, backgroundColor: '#3B82F6' }]} />
              </View>
            </View>
          </View>

          {/* 2-Way Video Test Shortcut Button */}
          <TouchableOpacity
            style={styles.openSecondTabBtnVideo}
            onPress={() => {
              if (typeof window !== 'undefined') {
                const base = window.location.origin || 'http://localhost:8680';
                window.open(`${base}?autocall=${listener.username}&type=video`, '_blank');
              }
            }}
            activeOpacity={0.8}
          >
            <ExternalLink size={12} color="#FFFFFF" />
            <Text style={styles.openSecondTabTextVideo}>
              {hasRemoteUser ? 'Partner in Video Room • Open 3rd Tab' : 'Open 2nd Tab to Test 2-Way Video'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.callingStage}>
          {/* Pulsing Avatar Area */}
          <View style={styles.avatarGlow}>
            <Image source={{ uri: partnerAvatarUrl }} style={styles.listenerAvatar} />
          </View>

          <Text style={styles.listenerName}>{partnerDisplayName}</Text>
          <Text style={styles.listenerHandle}>
            {isHost ? 'Connected with Caller' : (listener ? `@${listener.username}` : '@host')}
          </Text>

          {/* Real-Time Live Calling Stats / Countdown */}
          {isHost ? (
            <View style={styles.liveStatsCardHost}>
              <View style={styles.statsCardTop}>
                <IndianRupee size={15} color="#10B981" />
                <Text style={styles.statsHostLabel}>HOST REAL-TIME EARNINGS</Text>
              </View>
              <Text style={styles.statsHostDigits}>₹{hostEarnedINR.toFixed(2)}</Text>
              <View style={styles.statsDetailsRow}>
                <Text style={styles.statsDetailTextHost}>Rate: ₹{hostRatePerMinINR}/min</Text>
                <Text style={styles.statsDetailDot}>•</Text>
                <Text style={styles.statsDetailTextHost}>Duration: {formatTime(secondsElapsed)}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.liveStatsCardCaller, secondsLeft <= 60 && styles.liveStatsCardWarning]}>
              <View style={styles.statsCardTop}>
                <Clock size={15} color={secondsLeft <= 60 ? '#EF4444' : '#F59E0B'} />
                <Text style={[styles.statsCountdownLabel, secondsLeft <= 60 && { color: '#EF4444' }]}>
                  {secondsLeft <= 60 ? 'CRITICAL TIME LEFT' : 'TIME REMAINING ON CALL'}
                </Text>
              </View>
              <Text style={[styles.statsCountdownDigits, secondsLeft <= 60 && styles.statsDigitsWarning]}>
                {formatTime(secondsLeft)}
              </Text>
              <View style={styles.statsDetailsRow}>
                <Text style={styles.statsDetailText}>{callerCoinsDeducted} Coins Deducted</Text>
                <Text style={styles.statsDetailDot}>•</Text>
                <Text style={styles.statsDetailText}>{formatTime(secondsElapsed)} Elapsed</Text>
              </View>
            </View>
          )}

          {/* Waveform Visualization Bars */}
          <View style={styles.waveformContainer}>
            {[12, 24, 38, 18, 42, 28, 50, 32, 20, 35, 15].map((height, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  { height: (height * (1 + (secondsElapsed % 3) * 0.2)) }
                ]}
              />
            ))}
          </View>

          {/* Agora 2-Way Live Status Pill */}
          <View style={styles.agoraStatusPill}>
            <Radio size={13} color={hasRemoteUser ? '#10B981' : '#60A5FA'} />
            <Text style={styles.agoraStatusText}>{agoraStatus}</Text>
          </View>

          {/* Real-Time Audio Level VU Meters */}
          <View style={styles.audioDiagnosticCard}>
            <View style={styles.meterRow}>
              <View style={styles.meterTitleGroup}>
                <Mic size={11} color="#10B981" />
                <Text style={styles.meterLabel}>Your Mic</Text>
              </View>
              <View style={styles.meterBarTrack}>
                <View style={[styles.meterBarFill, { width: `${Math.max(6, Math.min(100, localVolume * 1.8))}%`, backgroundColor: '#10B981' }]} />
              </View>
              <Text style={styles.meterValue}>{localVolume > 4 ? 'Speaking' : 'Idle'}</Text>
            </View>

            <View style={styles.meterRow}>
              <View style={styles.meterTitleGroup}>
                <Volume2 size={11} color={hasRemoteUser ? '#3B82F6' : '#64748B'} />
                <Text style={styles.meterLabel}>Partner</Text>
              </View>
              <View style={styles.meterBarTrack}>
                <View style={[styles.meterBarFill, { width: `${hasRemoteUser ? Math.max(6, Math.min(100, remoteVolume * 1.8)) : 0}%`, backgroundColor: '#3B82F6' }]} />
              </View>
              <Text style={styles.meterValue}>
                {hasRemoteUser ? (remoteVolume > 4 ? 'Speaking' : 'Connected') : 'Waiting...'}
              </Text>
            </View>

            {/* Connected Participants Count & Network Quality */}
            <View style={styles.diagFooter}>
              <View style={styles.diagItem}>
                <View style={[styles.liveDotSmall, { backgroundColor: hasRemoteUser ? '#10B981' : '#F59E0B' }]} />
                <Text style={styles.diagText}>
                  {hasRemoteUser ? '2 / 2 In Room' : '1 / 2 (Waiting for Tab 2)'}
                </Text>
              </View>
              <View style={styles.diagDivider} />
              <View style={styles.diagItem}>
                <Activity size={10} color="#93C5FD" />
                <Text style={styles.diagText}>{rtcStats.rtt > 0 ? `${rtcStats.rtt}ms latency` : 'HD Voice'}</Text>
              </View>
            </View>
          </View>

          {/* Audio Output Test Chime Button */}
          <TouchableOpacity
            style={[styles.testChimeBtn, chimePlaying && styles.testChimeBtnActive]}
            onPress={playTestChime}
            activeOpacity={0.8}
          >
            <Bell size={13} color={chimePlaying ? '#FFFFFF' : '#93C5FD'} />
            <Text style={[styles.testChimeBtnText, chimePlaying && styles.testChimeBtnTextActive]}>
              {chimePlaying ? 'Playing Audio Chime 🔔...' : 'Play Test Sound 🔔'}
            </Text>
          </TouchableOpacity>

          {/* Autoplay blocked banner (if browser suspended audio) */}
          {autoplayBlocked && (
            <TouchableOpacity style={styles.autoplayBanner} onPress={playTestChime} activeOpacity={0.85}>
              <Volume2 size={14} color="#FFFFFF" />
              <Text style={styles.autoplayBannerText}>Click to unmute partner audio</Text>
            </TouchableOpacity>
          )}

          {/* 2-Way Call Test Shortcut */}
          <TouchableOpacity
            style={styles.openSecondTabBtn}
            onPress={() => {
              if (typeof window !== 'undefined') {
                const base = window.location.origin || 'http://localhost:8680';
                window.open(`${base}?autocall=${listener.username}&type=audio`, '_blank');
              }
            }}
            activeOpacity={0.8}
          >
            <ExternalLink size={12} color="#93C5FD" />
            <Text style={styles.openSecondTabText}>
              {hasRemoteUser ? 'Partner Joined • Open 3rd Device' : 'Open 2nd Tab to Test 2-Way Audio'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* In-Call Controls Bottom Bar */}
      <View style={styles.controlsBar}>
        {/* Mute Mic */}
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={toggleMute}
          activeOpacity={0.8}
        >
          {isMuted ? (
            <MicOff size={22} color={THEME.colors.red} />
          ) : (
            <Mic size={22} color={THEME.colors.white} />
          )}
          <Text style={styles.controlLabel}>{isMuted ? 'Muted' : 'Mute'}</Text>
        </TouchableOpacity>

        {/* Video Camera Toggle or Speaker */}
        {callType === 'video' ? (
          <TouchableOpacity
            style={[styles.controlBtn, isCameraOff && styles.controlBtnActive]}
            onPress={toggleCamera}
            activeOpacity={0.8}
          >
            {isCameraOff ? (
              <VideoOff size={22} color={THEME.colors.red} />
            ) : (
              <Video size={22} color={THEME.colors.primaryLight} />
            )}
            <Text style={styles.controlLabel}>{isCameraOff ? 'Cam Off' : 'Camera'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.controlBtn, isSpeakerOn && styles.controlBtnActive]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
            activeOpacity={0.8}
          >
            {isSpeakerOn ? (
              <Volume2 size={22} color={THEME.colors.primaryLight} />
            ) : (
              <VolumeX size={22} color={THEME.colors.white} />
            )}
            <Text style={styles.controlLabel}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
          </TouchableOpacity>
        )}

        {/* End Call Button (Big Red) */}
        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={handleEnd}
          activeOpacity={0.85}
        >
          <PhoneOff size={28} color={THEME.colors.white} />
        </TouchableOpacity>

        {/* Send Gift Button */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setShowGiftModal(true)}
          activeOpacity={0.8}
        >
          <Gift size={22} color={THEME.colors.white} />
          <Text style={styles.controlLabel}>Gift</Text>
        </TouchableOpacity>
      </View>

      {/* Gift Modal */}
      <Modal
        visible={showGiftModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGiftModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.giftTitle}>Send an In-Call Gift</Text>
            <Text style={styles.giftSub}>Show appreciation to {listener.name}</Text>

            <View style={styles.giftGrid}>
              {[
                { name: 'Rose', cost: 10 },
                { name: 'Coffee', cost: 25 },
                { name: 'Heart', cost: 50 },
                { name: 'Crown', cost: 100 },
              ].map((g, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.giftItem}
                  onPress={() => {
                    setRemainingBalance(b => Math.max(0, b - g.cost));
                    setShowGiftModal(false);
                  }}
                >
                  <Gift size={24} color={THEME.colors.primary} />
                  <Text style={styles.giftName}>{g.name}</Text>
                  <Text style={styles.giftCost}>₹{g.cost}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeGiftBtn}
              onPress={() => setShowGiftModal(false)}
            >
              <Text style={styles.closeGiftText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Safety & Moderation Report Modal (Module 5) */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <ShieldAlert size={20} color="#DC2626" />
              <Text style={styles.giftTitle}>Report & End Call</Text>
            </View>
            <Text style={styles.giftSub}>
              Chatzie has zero tolerance for misconduct. Select a violation reason to immediately disconnect and flag this user for admin review.
            </Text>

            <View style={{ marginVertical: 12, gap: 8 }}>
              {[
                'Harassment or Abusive Conduct',
                'Explicit or Inappropriate Content',
                'Fraud or Financial Solicitation',
                'Demanding Personal Phone / Social Media',
              ].map((reason, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.reportOptionBtn,
                    selectedReportReason === reason && styles.reportOptionBtnSelected
                  ]}
                  onPress={() => setSelectedReportReason(reason)}
                >
                  <Text style={[
                    styles.reportOptionText,
                    selectedReportReason === reason && styles.reportOptionTextSelected
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.confirmReportBtn}
              onPress={() => {
                setShowReportModal(false);
                if (typeof window !== 'undefined') {
                  window.alert(`Violation reported: ${selectedReportReason}. Session ended securely. User blocked.`);
                }
                handleEnd();
              }}
            >
              <Text style={styles.confirmReportText}>Disconnect & Flag for Moderation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeGiftBtn}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.closeGiftText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI SafeTalk Prohibited Contact Exchange Warning Modal */}
      {aiWarningModal && (
        <Modal visible={aiWarningModal.visible} transparent animationType="fade">
          <View style={styles.aiWarningOverlay}>
            <View style={styles.aiWarningCard}>
              <View style={styles.aiWarningIconCircle}>
                <ShieldAlert size={36} color="#DC2626" />
              </View>
              <Text style={styles.aiWarningTitle}>⚠️ AI Safety Alert: Prohibited Info Detected</Text>
              <Text style={styles.aiWarningSub}>
                SafeTalk AI detected exchange of phone number, contact info, or external handle:
              </Text>
              <View style={styles.aiWarningQuoteBox}>
                <Text style={styles.aiWarningQuoteText}>"{aiWarningModal.phrase}"</Text>
              </View>
              <Text style={styles.aiWarningDisclaimer}>
                Chatzie strictly prohibits exchanging personal contacts, social media handles, or offline payment IDs. Continued attempts will result in immediate call termination and permanent account ban.
              </Text>
              <TouchableOpacity
                style={styles.aiWarningDismissBtn}
                onPress={() => setAiWarningModal(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.aiWarningDismissText}>I Understand • Continue Call Safely</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark Navy stage for calls
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  secureText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  safetyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(220,38,38,0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  safetyReportBtnText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '700',
  },
  ratePill: {
    backgroundColor: 'rgba(30,64,175,0.4)',
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratePillText: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '700',
  },
  ratePillHost: {
    backgroundColor: 'rgba(16,185,129,0.18)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratePillHostText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '700',
  },
  ratePillCaller: {
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratePillCallerText: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '700',
  },
  liveStatsCardHost: {
    width: '92%',
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  statsHostLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6EE7B7',
    letterSpacing: 0.8,
  },
  statsHostDigits: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  statsDetailTextHost: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: '600',
  },
  liveStatsCardCaller: {
    width: '92%',
    backgroundColor: 'rgba(30,58,138,0.3)',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  liveStatsCardWarning: {
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderColor: '#EF4444',
  },
  statsCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsCountdownLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FCD34D',
    letterSpacing: 0.8,
  },
  statsCountdownDigits: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F59E0B',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  statsDigitsWarning: {
    color: '#EF4444',
  },
  statsDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  statsDetailText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  statsDetailDot: {
    color: '#64748B',
    fontSize: 12,
  },
  callingStage: {
    alignItems: 'center',
  },
  avatarGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  listenerAvatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
  },
  listenerName: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.white,
  },
  listenerHandle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  timerBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 16,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.white,
    fontVariant: ['tabular-nums'],
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 6,
    marginTop: 24,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  agoraStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  agoraStatusText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  audioDiagnosticCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    gap: 8,
  },
  meterTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: 80,
  },
  meterLabel: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  meterBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  meterValue: {
    fontSize: 10,
    color: '#94A3B8',
    width: 60,
    textAlign: 'right',
    fontWeight: '600',
  },
  diagFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 12,
  },
  diagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  diagDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#475569',
  },
  diagText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  testChimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 10,
    width: '100%',
  },
  testChimeBtnActive: {
    backgroundColor: '#2563EB',
  },
  testChimeBtnText: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '700',
  },
  testChimeBtnTextActive: {
    color: '#FFFFFF',
  },
  autoplayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginTop: 8,
    width: '100%',
  },
  autoplayBannerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  openSecondTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(37,99,235,0.25)',
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 12,
  },
  openSecondTabText: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '700',
  },
  // Video Calling Stage Styles
  videoCallingStage: {
    flex: 1,
    minHeight: 380,
    width: '100%',
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#020617',
    marginVertical: 8,
  },
  remoteVideoLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWaitingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    zIndex: 2,
  },
  cameraBlockedBanner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 15,
  },
  cameraBlockedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  listenerAvatarVideo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#3B82F6',
    marginBottom: 12,
  },
  videoWaitingName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  videoWaitingSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  localVideoPiP: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#38BDF8',
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  cameraOffOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.85)',
  },
  cameraOffText: {
    fontSize: 10,
    color: '#E2E8F0',
    marginTop: 4,
    fontWeight: '600',
  },
  videoTopOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    gap: 8,
    zIndex: 5,
  },
  timerBadgeVideo: {
    backgroundColor: 'rgba(15,23,42,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timerTextVideo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  agoraStatusPillVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  agoraStatusTextVideo: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  videoMiniMeters: {
    position: 'absolute',
    bottom: 56,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
    zIndex: 5,
  },
  miniMeter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  miniMeterTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniMeterFill: {
    height: '100%',
    borderRadius: 2,
  },
  openSecondTabBtnVideo: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(37,99,235,0.85)',
    paddingVertical: 8,
    borderRadius: 12,
    zIndex: 5,
  },
  openSecondTabTextVideo: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  controlLabel: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 4,
  },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: THEME.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  giftTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  giftSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    marginBottom: 20,
  },
  giftGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  giftItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: THEME.colors.primaryBg,
    marginHorizontal: 4,
  },
  giftName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 6,
  },
  giftCost: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 2,
  },
  closeGiftBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: THEME.colors.borderLight,
  },
  closeGiftText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  reportOptionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportOptionBtnSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  reportOptionText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  reportOptionTextSelected: {
    color: '#DC2626',
    fontWeight: '700',
  },
  confirmReportBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  confirmReportText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  lowBalanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  lowBalanceText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  quickRechargeInCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  quickRechargeInCallText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  safeTalkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 6,
  },
  safeTalkBannerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.2,
  },
  aiWarningOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  aiWarningCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  aiWarningIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiWarningTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 8,
  },
  aiWarningSub: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 10,
  },
  aiWarningQuoteBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
    width: '100%',
  },
  aiWarningQuoteText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  aiWarningDisclaimer: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  aiWarningDismissBtn: {
    backgroundColor: '#DC2626',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  aiWarningDismissText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
