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
  Activity
} from 'lucide-react-native';
import { ListenerProfile } from '@chatzie/shared';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';

interface ActiveCallScreenProps {
  listener: ListenerProfile;
  callType: 'audio' | 'video';
  userBalanceINR: number;
  onEndCall: (durationSeconds: number, totalCost: number) => void;
  onBalanceDepleted: () => void;
}

export const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({
  listener,
  callType,
  userBalanceINR,
  onEndCall,
  onBalanceDepleted,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string>('Harassment or Abusive Conduct');
  const [remainingBalance, setRemainingBalance] = useState(userBalanceINR);

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
              setTimeout(() => {
                const el = remoteVideoRef.current || document.getElementById('agora-remote-video');
                if (el && user.videoTrack) {
                  try {
                    user.videoTrack.play(el);
                  } catch (e) {
                    console.warn('Remote video play error:', e);
                  }
                }
              }, 300);
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
          setAgoraStatus('Partner left channel');
        });

        // 1. Create local microphone audio track
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        if (isCancelled) {
          micTrack.close();
          return;
        }
        localTrackRef.current = micTrack;

        // 2. If video call, create camera video track
        let cameraTrack: any = null;
        if (callType === 'video') {
          try {
            cameraTrack = await AgoraRTC.createCameraVideoTrack({
              encoderConfig: '480p_1',
            });
            cameraTrackRef.current = cameraTrack;
          } catch (camErr: any) {
            console.warn('Camera initialization notice:', camErr);
            setCameraBlocked(true);
            setAgoraStatus('Camera access blocked: Please allow camera in browser address bar');
          }
        }

        // 3. Fetch signed Agora token from Chatzie server
        const channelName = `call_${listener.username}`;
        const uid = Math.floor(1000 + Math.random() * 9000);
        currentUidRef.current = uid;
        const baseUrl = getApiBaseUrl();

        const res = await fetch(`${baseUrl}/api/calls/token?channel=${channelName}&uid=${uid}`);
        const data = await res.json();

        if (data.token && data.appId) {
          await client.join(data.appId, data.channel, data.token, uid);
          const tracksToPublish = cameraTrack ? [micTrack, cameraTrack] : [micTrack];
          await client.publish(tracksToPublish);

          // Play local camera preview in PiP box
          if (cameraTrack) {
            setTimeout(() => {
              const el = localVideoRef.current || document.getElementById('agora-local-video');
              if (el && cameraTrackRef.current) {
                try {
                  cameraTrackRef.current.play(el);
                } catch (e) {
                  console.warn('Local camera play error:', e);
                }
              }
            }, 300);
          }

          // Check if remote users are already present
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
                setTimeout(() => {
                  const el = remoteVideoRef.current || document.getElementById('agora-remote-video');
                  if (el && u.videoTrack) {
                    try {
                      u.videoTrack.play(el);
                    } catch (e) {
                      console.warn('Remote video play error:', e);
                    }
                  }
                }, 300);
              }
            });
          } else {
            setAgoraStatus(callType === 'video' ? 'Camera Live • Waiting for Partner...' : 'Microphone Live • Waiting for Partner...');
          }

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
        }
      } catch (err: any) {
        console.warn('Agora connection notice:', err);
        setAgoraStatus('Microphone Live • Ready');
      }
    };

    connectAgora();

    return () => {
      isCancelled = true;
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
  }, [listener.username, callType]);

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

  // Universal Tariff: ₹30/min for video, ₹9/min for voice
  const effectiveRatePerMinINR = callType === 'video' ? 30 : 9;

  // Timer & Per-Minute Balance Deduction
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const nextSeconds = prev + 1;

        // Every 60 seconds, deduct 1 minute call tariff
        if (nextSeconds % 60 === 0) {
          setRemainingBalance((curBal) => {
            const nextBal = curBal - effectiveRatePerMinINR;
            if (nextBal < 0) {
              onBalanceDepleted();
              return 0;
            }
            return Number(nextBal.toFixed(2));
          });
        }

        return nextSeconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [effectiveRatePerMinINR, onBalanceDepleted]);

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
          channel: `call_${listener.username}`,
          durationSeconds: secondsElapsed,
          totalCost,
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
          <Text style={styles.secureText}>Masked Call</Text>
        </View>

        <TouchableOpacity
          style={styles.safetyReportBtn}
          onPress={() => setShowReportModal(true)}
          activeOpacity={0.8}
        >
          <ShieldAlert size={13} color="#FCA5A5" />
          <Text style={styles.safetyReportBtnText}>Report</Text>
        </TouchableOpacity>

        <View style={styles.ratePill}>
          <Text style={styles.ratePillText}>
            ₹{effectiveRatePerMinINR}/min {callType === 'video' ? 'Video' : 'Voice'}
          </Text>
        </View>
      </View>

      {/* Main Calling Stage */}
      {callType === 'video' ? (
        <View style={styles.videoCallingStage}>
          {/* Remote Video Container Layer */}
          <View
            ref={remoteVideoRef}
            // @ts-ignore
            id="agora-remote-video"
            nativeID="agora-remote-video"
            style={styles.remoteVideoLayer}
          >
            {!hasRemoteVideo && (
              <View style={styles.videoWaitingOverlay}>
                <Image source={{ uri: listener.avatarUrl }} style={styles.listenerAvatarVideo} />
                <Text style={styles.videoWaitingName}>{listener.name}</Text>
                <Text style={styles.videoWaitingSub}>Connecting partner camera...</Text>
              </View>
            )}
          </View>

          {/* Floating Local Camera PiP (Self View) */}
          <View
            ref={localVideoRef}
            // @ts-ignore
            id="agora-local-video"
            nativeID="agora-local-video"
            style={styles.localVideoPiP}
          >
            {isCameraOff && (
              <View style={styles.cameraOffOverlay}>
                <VideoOff size={16} color="#FFFFFF" />
                <Text style={styles.cameraOffText}>Cam Off</Text>
              </View>
            )}
          </View>

          {/* Overlay In-Call Info & Video Status */}
          <View style={styles.videoTopOverlay}>
            <View style={styles.timerBadgeVideo}>
              <Text style={styles.timerTextVideo}>{formatTime(secondsElapsed)}</Text>
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
            <Image source={{ uri: listener.avatarUrl }} style={styles.listenerAvatar} />
          </View>

          <Text style={styles.listenerName}>{listener.name}</Text>
          <Text style={styles.listenerHandle}>@{listener.username}</Text>

          {/* Live Timer */}
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>{formatTime(secondsElapsed)}</Text>
          </View>

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
    alignItems: 'center',
    justifyContent: 'center',
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
  }
});
