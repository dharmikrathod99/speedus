/**
 * SPEED US: Advanced Web Audio Procedural Synthesizer
 * Generates realistic dynamic engine audio, turbo flutter, tire skids, horns,
 * backfire pops, crash impacts, UI effects, and dynamic radio music stations.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Master Gain Nodes
  private masterGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Engine Audio Nodes
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineDistortion: WaveShaperNode | null = null;
  private isEngineRunning = false;

  // Skid Audio Nodes
  private skidGain: GainNode | null = null;
  private skidFilter: BiquadFilterNode | null = null;
  private skidSource: AudioBufferSourceNode | null = null;

  // Horn Nodes
  private hornOsc1: OscillatorNode | null = null;
  private hornOsc2: OscillatorNode | null = null;
  private hornGain: GainNode | null = null;

  // Radio Music Sequencer
  private radioPlaying = false;
  private radioStation: string = 'Night Drive FM';
  private radioInterval: number | null = null;
  private radioStep = 0;

  constructor() {
    // Lazy init on first user touch/click/key
  }

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Engine Bus
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.engineGain.connect(this.masterGain);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.isInitialized = true;
      this.setupEngineSynth();
      this.setupSkidSynth();
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private makeDistortionCurve(amount = 20): Float32Array {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private setupEngineSynth() {
    if (!this.ctx || !this.engineGain) return;

    // Filter
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    // Distortion for aggressive exhaust rumble
    this.engineDistortion = this.ctx.createWaveShaper();
    this.engineDistortion.curve = this.makeDistortionCurve(18) as any;
    this.engineDistortion.oversample = '4x';

    // Primary Oscillator (Cylinders)
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);

    // Harmonic Oscillator
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.setValueAtTime(90, this.ctx.currentTime);

    // Deep Sub-Bass Rumble
    this.engineSubOsc = this.ctx.createOscillator();
    this.engineSubOsc.type = 'sine';
    this.engineSubOsc.frequency.setValueAtTime(22.5, this.ctx.currentTime);

    // Connect chain: Oscs -> Distortion -> Filter -> EngineGain
    this.engineOsc1.connect(this.engineDistortion);
    this.engineOsc2.connect(this.engineDistortion);
    this.engineSubOsc.connect(this.engineFilter);

    this.engineDistortion.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
    this.engineSubOsc.start();

    // Start silent until vehicle runs
    this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
  }

  private setupSkidSynth() {
    if (!this.ctx || !this.sfxGain) return;

    // Noise buffer for tire friction
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.skidSource = this.ctx.createBufferSource();
    this.skidSource.buffer = noiseBuffer;
    this.skidSource.loop = true;

    this.skidFilter = this.ctx.createBiquadFilter();
    this.skidFilter.type = 'bandpass';
    this.skidFilter.frequency.setValueAtTime(950, this.ctx.currentTime);
    this.skidFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.skidGain = this.ctx.createGain();
    this.skidGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.skidSource.connect(this.skidFilter);
    this.skidFilter.connect(this.skidGain);
    this.skidGain.connect(this.sfxGain);

    this.skidSource.start();
  }

  /**
   * Update engine pitch & volume based on RPM (800 - 8500) and throttle (0 - 1)
   */
  public updateEngine(rpm: number, throttle: number, isDriving: boolean) {
    if (!this.ctx || !this.engineFilter || !this.engineOsc1 || !this.engineOsc2 || !this.engineSubOsc || !this.engineGain) return;

    if (!isDriving) {
      if (this.isEngineRunning) {
        this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        this.isEngineRunning = false;
      }
      return;
    }

    this.isEngineRunning = true;
    const now = this.ctx.currentTime;

    // Base cylinder firing frequency
    // At 800 RPM (idle): ~35 Hz, at 8000 RPM (redline): ~260 Hz
    const normalizedRPM = Math.max(800, Math.min(8500, rpm));
    const baseFreq = 30 + (normalizedRPM / 8500) * 230;

    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.05);
    this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.05);

    // Filter opens up as throttle is applied
    const filterCutoff = 350 + (normalizedRPM / 8500) * 1800 + throttle * 1200;
    this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.08);

    // Target volume: louder with high throttle and high RPM
    const targetVolume = 0.25 + throttle * 0.35 + (normalizedRPM / 8500) * 0.2;
    this.engineGain.gain.setTargetAtTime(targetVolume, now, 0.05);
  }

  /**
   * Update tire screech volume based on lateral slip / drift
   */
  public updateSkid(slipIntensity: number) {
    if (!this.ctx || !this.skidGain) return;
    const intensity = Math.max(0, Math.min(1, slipIntensity));
    this.skidGain.gain.setTargetAtTime(intensity * 0.55, this.ctx.currentTime, 0.06);
  }

  /**
   * Exhaust backfire / crackle sound
   */
  public triggerBackfire() {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  /**
   * Turbo blowoff valve flutter
   */
  public triggerTurboFlutter() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(now + 0.38);
  }

  /**
   * Nitro Boost sound
   */
  public triggerNitroSound(active: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    if (active) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(650, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.42);
    }
  }

  /**
   * Car Horn (Dual tone F4 + A4)
   */
  public startHorn() {
    if (!this.ctx || !this.sfxGain || this.hornGain) return;

    this.hornGain = this.ctx.createGain();
    this.hornGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    this.hornOsc1 = this.ctx.createOscillator();
    this.hornOsc1.type = 'sawtooth';
    this.hornOsc1.frequency.setValueAtTime(349.23, this.ctx.currentTime); // F4

    this.hornOsc2 = this.ctx.createOscillator();
    this.hornOsc2.type = 'sawtooth';
    this.hornOsc2.frequency.setValueAtTime(440.0, this.ctx.currentTime); // A4

    this.hornOsc1.connect(this.hornGain);
    this.hornOsc2.connect(this.hornGain);
    this.hornGain.connect(this.sfxGain);

    this.hornOsc1.start();
    this.hornOsc2.start();
  }

  public stopHorn() {
    if (!this.ctx || !this.hornGain) return;
    this.hornGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    setTimeout(() => {
      this.hornOsc1?.stop();
      this.hornOsc2?.stop();
      this.hornOsc1?.disconnect();
      this.hornOsc2?.disconnect();
      this.hornGain?.disconnect();
      this.hornOsc1 = null;
      this.hornOsc2 = null;
      this.hornGain = null;
    }, 80);
  }

  /**
   * Short NPC car horn honk / alert beep
   */
  public playHonk() {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const hornGain = this.ctx.createGain();
      hornGain.gain.setValueAtTime(0.25, now);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(349.23, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(440.0, now);

      osc1.connect(hornGain);
      osc2.connect(hornGain);
      hornGain.connect(this.sfxGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch {
      // AudioContext error handling
    }
  }

  /**
   * Impact / Crash sound
   */
  public playCollisionSound(intensity = 1) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.25);

    gain.gain.setValueAtTime(Math.min(0.8, 0.3 * intensity), now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(now + 0.3);
  }

  /**
   * UI Sounds: Click, Cash register, Mission success
   */
  public playUiClick() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(now + 0.06);
  }

  public playCashRegister() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [987.77, 1318.51, 1567.98].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.2);
    });
  }

  public playMissionSuccess() {
    if (!this.ctx || !this.sfxGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.3, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }

  public playDoorSound() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Heavy wooden door latch & resonance
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.18);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playEatDrinkSound() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Restorative refreshing double chime
    [659.25, 880.0, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.25, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.09 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.28);
    });
  }

  public playHealChime() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.3, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.38);
    });
  }

  public playEquipArmorSound() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Procedural Radio Stations: Night Drive FM (Retrowave Synth), Cyberpunk Pulse, Sunset Lo-Fi
   */
  public setRadioStation(station: string, playing: boolean) {
    this.radioStation = station;
    this.radioPlaying = playing;

    if (this.radioInterval) {
      window.clearInterval(this.radioInterval);
      this.radioInterval = null;
    }

    if (!playing || station === 'Off') {
      return;
    }

    // 120 BPM = 125ms per 16th note
    this.radioStep = 0;
    this.radioInterval = window.setInterval(() => {
      this.tickRadioSequencer();
    }, 125);
  }

  private tickRadioSequencer() {
    if (!this.ctx || !this.musicGain || !this.radioPlaying) return;
    const now = this.ctx.currentTime;
    const step16 = this.radioStep % 16;
    const step32 = this.radioStep % 32;

    if (this.radioStation === 'Night Drive FM') {
      // 80s Synthwave Bassline (A minor / F / G / E)
      const bassRoots = [110, 110, 110, 110, 87.31, 87.31, 98, 82.4]; // A2, F2, G2, E2
      const rootIndex = Math.floor(step32 / 4) % bassRoots.length;
      const rootFreq = bassRoots[rootIndex];

      // Bass note every 8th note
      if (step16 % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(rootFreq, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.24);
      }

      // Arpeggiated high lead synth on 16th notes
      const arpHarmonics = [1, 1.25, 1.5, 1.875];
      const arpFreq = rootFreq * 4 * arpHarmonics[step16 % 4];
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = 'sine';
      leadOsc.frequency.setValueAtTime(arpFreq, now);
      leadGain.gain.setValueAtTime(0.12, now);
      leadGain.gain.exponentialRampToValueAtTime(0.005, now + 0.1);
      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);
      leadOsc.start(now);
      leadOsc.stop(now + 0.11);

      // Kick drum on beats 0, 4, 8, 12
      if (step16 % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(150, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.2);
      }
    } else if (this.radioStation === 'Cyberpunk Pulse') {
      // Dark electro aggressive pulse
      if (step16 % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(55, now); // A1
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.14);
      }
    }

    this.radioStep++;
  }

  public setVolumes(master: number, engine: number, sfx: number, music: number) {
    if (!this.ctx) return;
    if (this.masterGain) this.masterGain.gain.setValueAtTime(master, this.ctx.currentTime);
    if (this.engineGain) this.engineGain.gain.setValueAtTime(engine, this.ctx.currentTime);
    if (this.sfxGain) this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
    if (this.musicGain) this.musicGain.gain.setValueAtTime(music, this.ctx.currentTime);
  }

  /**
   * Whoosh sound of punch swing in the air
   */
  public playPunchSwing() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * Heavy punch / melee impact thud
   */
  public playPunchHit() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Crisp pistol gunshot blast
   */
  public playGunshot() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Noise burst / muzzle explosion
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(2200, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);

    // 2. Low-end crack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Flesh impact when player is hit by NPC
   */
  public playPlayerHit() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.16);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  /**
   * NPC defeated / knockdown groan & thud
   */
  public playNpcDefeated() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.28);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Character jump swoosh audio stinger
   */
  public playJump() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Iconic GTA V "WASTED" ominous heartbeat and sub-bass drop
   */
  public playWastedSound() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sub-bass heavy impact boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(24, now + 1.2);

    subGain.gain.setValueAtTime(0.85, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 2.1);

    // Heartbeat thumps
    [0.15, 0.45, 0.85, 1.35].forEach((t) => {
      if (!this.ctx) return;
      const hbOsc = this.ctx.createOscillator();
      const hbGain = this.ctx.createGain();
      hbOsc.type = 'triangle';
      hbOsc.frequency.setValueAtTime(65, now + t);
      hbOsc.frequency.exponentialRampToValueAtTime(30, now + t + 0.12);
      hbGain.gain.setValueAtTime(0.6, now + t);
      hbGain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.16);
      hbOsc.connect(hbGain);
      hbGain.connect(this.sfxGain!);
      hbOsc.start(now + t);
      hbOsc.stop(now + t + 0.18);
    });
  }

  /**
   * Quick police siren alert chirp
   */
  public playSirenStinger() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.14);
    osc.frequency.linearRampToValueAtTime(600, now + 0.28);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /**
   * Police dispatch radio chirp (suspect lost / code 4 call-off)
   */
  public playRadioCallOff() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1320, now + 0.08);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }
}

export const soundSystem = new SoundSystem();
