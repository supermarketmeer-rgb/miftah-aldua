import Peer, { MediaConnection } from 'peerjs';

export type LiveVoiceStatus = 'idle' | 'initializing' | 'waiting' | 'connecting' | 'connected' | 'error';

export interface LiveVoiceState {
  status: LiveVoiceStatus;
  isHost: boolean;
  roomId: string;
  isMuted: boolean;
  isRemoteMuted: boolean;
  isLocalSpeaking: boolean;
  isRemoteSpeaking: boolean;
  localVolume: number; // 0 to 100
  remoteVolume: number; // 0 to 100
  remoteConnected: boolean;
  errorMessage?: string;
}

type LiveVoiceListener = (state: LiveVoiceState) => void;

class LiveVoiceEngine {
  private peer: Peer | null = null;
  private currentCall: MediaConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private remoteAudioElement: HTMLAudioElement | null = null;

  private localAudioContext: AudioContext | null = null;
  private localAnalyser: AnalyserNode | null = null;
  private remoteAudioContext: AudioContext | null = null;
  private remoteAnalyser: AnalyserNode | null = null;
  private volumeCheckInterval: any = null;

  private listeners: Set<LiveVoiceListener> = new Set();

  private state: LiveVoiceState = {
    status: 'idle',
    isHost: false,
    roomId: '',
    isMuted: false,
    isRemoteMuted: false,
    isLocalSpeaking: false,
    isRemoteSpeaking: false,
    localVolume: 0,
    remoteVolume: 0,
    remoteConnected: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.remoteAudioElement = new Audio();
      this.remoteAudioElement.autoplay = true;
      // Allow playback in background / webview
      (this.remoteAudioElement as any).playsInline = true;
    }
  }

  public subscribe(listener: LiveVoiceListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l({ ...this.state }));
  }

  /**
   * Generates a unique, friendly room ID
   */
  public generateRoomId(prefix: string = 'miftah'): string {
    const randomHex = Math.random().toString(36).substring(2, 8);
    const cleanPrefix = prefix.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'room';
    return `${cleanPrefix}-${randomHex}`;
  }

  /**
   * Starts a room as the Host / First Reciter
   */
  public async startRoom(roomId?: string): Promise<string> {
    const finalRoomId = roomId || this.generateRoomId();
    this.state = {
      ...this.state,
      status: 'initializing',
      isHost: true,
      roomId: finalRoomId,
      errorMessage: undefined,
      remoteConnected: false
    };
    this.notify();

    try {
      await this.acquireLocalAudio();

      // Initialize Peer with the unique room ID as its Peer ID
      this.peer = new Peer(finalRoomId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', () => {
        this.state.status = 'waiting';
        this.notify();
      });

      // Handle incoming connection when the second party joins
      this.peer.on('call', (incomingCall) => {
        this.currentCall = incomingCall;
        this.state.status = 'connecting';
        this.notify();

        // Answer incoming call with local audio stream
        incomingCall.answer(this.localStream!);

        incomingCall.on('stream', (remoteAudioStream) => {
          this.handleRemoteStream(remoteAudioStream);
        });

        incomingCall.on('close', () => {
          this.handleRemoteDisconnected();
        });

        incomingCall.on('error', (err) => {
          this.state.errorMessage = 'حدث خطأ في الاتصال: ' + err.message;
          this.notify();
        });
      });

      this.peer.on('error', (err) => {
        // If ID is already taken, generate new ID
        if (err.type === 'unavailable-id') {
          const fallbackId = this.generateRoomId();
          this.leaveRoom();
          this.startRoom(fallbackId);
          return;
        }
        this.state.status = 'error';
        this.state.errorMessage = 'تعذر إنشاء الغرفة الصوتية: ' + (err.message || err.type);
        this.notify();
      });

      return finalRoomId;
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err.name === 'NotAllowedError'
        ? 'يرجى السماح للتطبيق باستخدام المايكروفون لبدء القراءة الصوتية.'
        : 'فشل تشغيل المايكروفون: ' + (err.message || 'خطأ غير معروف');
      this.notify();
      throw err;
    }
  }

  /**
   * Joins an existing room as a Participant / Listener
   */
  public async joinRoom(roomId: string): Promise<void> {
    if (!roomId) throw new Error('رمز الغرفة غير صالح');

    this.state = {
      ...this.state,
      status: 'initializing',
      isHost: false,
      roomId,
      errorMessage: undefined,
      remoteConnected: false
    };
    this.notify();

    try {
      await this.acquireLocalAudio();

      // Generate a distinct participant peer ID
      const participantId = `part-${this.generateRoomId()}`;
      this.peer = new Peer(participantId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', () => {
        this.state.status = 'connecting';
        this.notify();

        // Call the Host peer
        const call = this.peer!.call(roomId, this.localStream!);
        this.currentCall = call;

        call.on('stream', (remoteAudioStream) => {
          this.handleRemoteStream(remoteAudioStream);
        });

        call.on('close', () => {
          this.handleRemoteDisconnected();
        });

        call.on('error', (err) => {
          this.state.errorMessage = 'انقطع الاتصال بالطرف الآخر: ' + err.message;
          this.notify();
        });
      });

      this.peer.on('error', (err) => {
        this.state.status = 'error';
        this.state.errorMessage = err.type === 'peer-unavailable'
          ? 'الغرفة الصوتية غير متاحة حالياً أو انتهت الجلسة.'
          : 'تعذر الانضمام للغرفة الصوتية: ' + err.message;
        this.notify();
      });
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err.name === 'NotAllowedError'
        ? 'يرجى السماح للتطبيق باستخدام المايكروفون للاتصال.'
        : 'فشل تشغيل المايكروفون: ' + (err.message || 'خطأ غير معروف');
      this.notify();
      throw err;
    }
  }

  /**
   * Acquires local microphone audio stream with echo cancellation and noise suppression
   */
  private async acquireLocalAudio(): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    });

    this.localStream = stream;
    this.setupLocalVolumeAnalyser(stream);
    return stream;
  }

  /**
   * Handles incoming remote audio stream and routes to speaker
   */
  private handleRemoteStream(stream: MediaStream) {
    this.remoteStream = stream;
    if (this.remoteAudioElement) {
      this.remoteAudioElement.srcObject = stream;
      this.remoteAudioElement.play().catch(() => {
        // User interaction might be needed on mobile browsers
      });
    }

    this.setupRemoteVolumeAnalyser(stream);

    this.state.status = 'connected';
    this.state.remoteConnected = true;
    this.notify();
  }

  private handleRemoteDisconnected() {
    this.state.remoteConnected = false;
    this.state.isRemoteSpeaking = false;
    this.state.remoteVolume = 0;
    if (this.state.isHost) {
      this.state.status = 'waiting';
    } else {
      this.state.status = 'idle';
    }
    this.notify();
  }

  /**
   * Sets up audio visualizer analyser for local microphone
   */
  private setupLocalVolumeAnalyser(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.localAudioContext = new AudioCtx();
      const source = this.localAudioContext.createMediaStreamSource(stream);
      this.localAnalyser = this.localAudioContext.createAnalyser();
      this.localAnalyser.fftSize = 64;
      source.connect(this.localAnalyser);

      this.startVolumeMonitoring();
    } catch {
      // AudioContext not supported
    }
  }

  /**
   * Sets up audio visualizer analyser for remote participant
   */
  private setupRemoteVolumeAnalyser(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.remoteAudioContext = new AudioCtx();
      const source = this.remoteAudioContext.createMediaStreamSource(stream);
      this.remoteAnalyser = this.remoteAudioContext.createAnalyser();
      this.remoteAnalyser.fftSize = 64;
      source.connect(this.remoteAnalyser);
    } catch {
      // AudioContext not supported
    }
  }

  /**
   * Periodic volume level calculation for wave animations
   */
  private startVolumeMonitoring() {
    if (this.volumeCheckInterval) return;

    const dataArrayLocal = new Uint8Array(32);
    const dataArrayRemote = new Uint8Array(32);

    this.volumeCheckInterval = setInterval(() => {
      let localAvg = 0;
      let remoteAvg = 0;

      if (this.localAnalyser && !this.state.isMuted) {
        this.localAnalyser.getByteFrequencyData(dataArrayLocal);
        const sum = dataArrayLocal.reduce((acc, v) => acc + v, 0);
        localAvg = Math.min(100, Math.round((sum / dataArrayLocal.length) * 1.5));
      }

      if (this.remoteAnalyser && this.state.remoteConnected) {
        this.remoteAnalyser.getByteFrequencyData(dataArrayRemote);
        const sum = dataArrayRemote.reduce((acc, v) => acc + v, 0);
        remoteAvg = Math.min(100, Math.round((sum / dataArrayRemote.length) * 1.5));
      }

      const isLocalSpeaking = localAvg > 15;
      const isRemoteSpeaking = remoteAvg > 15;

      if (
        isLocalSpeaking !== this.state.isLocalSpeaking ||
        isRemoteSpeaking !== this.state.isRemoteSpeaking ||
        Math.abs(localAvg - this.state.localVolume) > 10 ||
        Math.abs(remoteAvg - this.state.remoteVolume) > 10
      ) {
        this.state.localVolume = localAvg;
        this.state.remoteVolume = remoteAvg;
        this.state.isLocalSpeaking = isLocalSpeaking;
        this.state.isRemoteSpeaking = isRemoteSpeaking;
        this.notify();
      }
    }, 150);
  }

  /**
   * Toggles microphone mute state
   */
  public toggleMute(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.state.isMuted = !audioTrack.enabled;
      if (this.state.isMuted) {
        this.state.isLocalSpeaking = false;
        this.state.localVolume = 0;
      }
      this.notify();
      return this.state.isMuted;
    }
    return false;
  }

  /**
   * Disconnects and leaves the live room cleanly
   */
  public leaveRoom() {
    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval);
      this.volumeCheckInterval = null;
    }

    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteAudioElement) {
      this.remoteAudioElement.srcObject = null;
    }

    if (this.localAudioContext) {
      this.localAudioContext.close().catch(() => {});
      this.localAudioContext = null;
    }

    if (this.remoteAudioContext) {
      this.remoteAudioContext.close().catch(() => {});
      this.remoteAudioContext = null;
    }

    this.state = {
      status: 'idle',
      isHost: false,
      roomId: '',
      isMuted: false,
      isRemoteMuted: false,
      isLocalSpeaking: false,
      isRemoteSpeaking: false,
      localVolume: 0,
      remoteVolume: 0,
      remoteConnected: false,
      errorMessage: undefined,
    };
    this.notify();
  }
}

export const liveVoiceEngine = new LiveVoiceEngine();
