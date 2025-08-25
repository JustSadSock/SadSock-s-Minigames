/*
 * audio.js
 * Простенький движок чиптюн-музыки и звуковых эффектов
 * Сформирован в стиле старых 8-битных консолей.
 */
(function(){
  'use strict';

  /* -------------------- БАЗОВАЯ ИНИЦИАЛИЗАЦИЯ -------------------- */
  const Sound = {
    ctx: null,
    master: null,
    unlocked: false,
    init(){
      if(this.ctx) return;
      this.ctx = new (window.AudioContext||window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.3;
      this.master.connect(this.ctx.destination);
      const unlock = () => {
        if(this.unlocked) return;
        this.ctx.resume().then(()=>{
          this.unlocked = true;
          Music.play();
        });
      };
      window.addEventListener('pointerdown', unlock, {once:true,passive:true});
      window.addEventListener('keydown', unlock, {once:true});
    },
    fx(name){
      if(!this.unlocked) return;
      const fn = FX[name];
      if(fn) fn();
    },
    stop(){
      Music.stop();
    },
    start(){
      if(this.unlocked) Music.play();
    },
    setVolume(v){
      if(this.master) this.master.gain.value = v;
    },
    getVolume(){
      return this.master ? this.master.gain.value : 0;
    }
  };

  /* -------------------- ПОЛЕЗНЫЕ УТИЛИТЫ -------------------- */
  function osc(type, freq, t, dur, vol=0.2, slide){
    const o = Sound.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    if(slide){ o.frequency.linearRampToValueAtTime(slide, t+dur); }
    const g = Sound.ctx.createGain();
    g.gain.value = vol;
    o.connect(g).connect(Sound.master);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.start(t);
    o.stop(t+dur+0.05);
  }

  function noise(t, dur, vol=0.2){
    const buffer = Sound.ctx.createBuffer(1, Sound.ctx.sampleRate*dur, Sound.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<data.length;i++){ data[i] = Math.random()*2-1; }
    const src = Sound.ctx.createBufferSource();
    src.buffer = buffer;
    const g = Sound.ctx.createGain();
    g.gain.value = vol;
    src.connect(g).connect(Sound.master);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    src.start(t);
  }

  /* -------------------- ЗВУКОВЫЕ ЭФФЕКТЫ -------------------- */
  const FX = {
    move(){             // навигация
      const t = Sound.ctx.currentTime;
      osc('square', 620, t, 0.09, 0.15);
    },
    click(){            // кнопка
      const t = Sound.ctx.currentTime;
      osc('square', 440, t, 0.08, 0.18);
    },
    select(){           // подтверждение
      const t = Sound.ctx.currentTime;
      osc('square', 660, t, 0.12, 0.22);
      osc('triangle', 1320, t, 0.12, 0.08);
    },
    open(){             // открытие меню
      const t = Sound.ctx.currentTime;
      osc('triangle', 880, t, 0.16, 0.15, 660);
    },
    close(){            // закрытие меню
      const t = Sound.ctx.currentTime;
      osc('triangle', 660, t, 0.16, 0.15, 440);
    },
    error(){            // ошибка
      const t = Sound.ctx.currentTime;
      osc('square', 220, t, 0.25, 0.2);
      osc('square', 110, t+0.05, 0.3, 0.2);
    },
    coin(){            // монетка
      const t = Sound.ctx.currentTime;
      osc('square', 880, t, 0.12, 0.2);
      osc('triangle', 440, t+0.05, 0.08, 0.1);
    },
    start(){           // старт
      const t = Sound.ctx.currentTime;
      osc('square', 660, t, 0.15, 0.2);
      osc('square', 880, t+0.1, 0.1, 0.18);
    },
    option(){          // опции
      const t = Sound.ctx.currentTime;
      osc('triangle', 520, t, 0.12, 0.15);
    }
  };

  /* -------------------- НОТНАЯ ТАБЛИЦА -------------------- */
  const NOTES = {
    'C2':65.41,
    'C#2':69.30,
    'D2':73.42,
    'D#2':77.78,
    'E2':82.41,
    'F2':87.31,
    'F#2':92.50,
    'G2':98.00,
    'G#2':103.83,
    'A2':110.00,
    'A#2':116.54,
    'B2':123.47,
    'C3':130.81,
    'C#3':138.59,
    'D3':146.83,
    'D#3':155.56,
    'E3':164.81,
    'F3':174.61,
    'F#3':185.00,
    'G3':196.00,
    'G#3':207.65,
    'A3':220.00,
    'A#3':233.08,
    'B3':246.94,
    'C4':261.63,
    'C#4':277.18,
    'D4':293.66,
    'D#4':311.13,
    'E4':329.63,
    'F4':349.23,
    'F#4':369.99,
    'G4':392.00,
    'G#4':415.30,
    'A4':440.00,
    'A#4':466.16,
    'B4':493.88,
    'C5':523.25,
    'C#5':554.37,
    'D5':587.33,
    'D#5':622.25,
    'E5':659.25,
    'F5':698.46,
    'F#5':739.99,
    'G5':783.99,
    'G#5':830.61,
    'A5':880.00,
    'A#5':932.33,
    'B5':987.77,
    'C6':1046.50,
    'C#6':1108.73,
    'D6':1174.66,
    'D#6':1244.51,
    'E6':1318.51,
    'F6':1396.91,
    'F#6':1479.98,
    'G6':1567.98,
    'G#6':1661.22,
    'A6':1760.00,
    'A#6':1864.66,
    'B6':1975.53
  };

  /* -------------------- ИНСТРУМЕНТЫ -------------------- */
  function playPulse(note, t, dur){
    osc('square', NOTES[note], t, dur, 0.20);
  }
  function playTri(note, t, dur){
    osc('triangle', NOTES[note], t, dur, 0.18);
  }
  function playBass(note, t, dur){
    osc('square', NOTES[note]/2, t, dur, 0.25);
  }
  function playNoise(t, dur){
    noise(t, dur, 0.2);
  }

  const INST = {
    pulse: playPulse,
    tri: playTri,
    bass: playBass,
    noise: playNoise
  };

  /* -------------------- УПРАВЛЕНИЕ МУЗЫКОЙ -------------------- */
  const Music = {
    tempo: 112,
    step: 0,
    tracks: [],
    playing: false,
    timer: null,
    play(){
      if(this.playing) return;
      this.playing = true;
      const startTime = Sound.ctx.currentTime + 0.1;
      this.tracks.forEach(tr=>{
        scheduleTrack(tr, startTime);
      });
    },
    stop(){
      this.playing = false;
      if(this.timer){ clearTimeout(this.timer); this.timer=null; }
    }
  };

  function scheduleTrack(tr, start){
    const beat = 60/Music.tempo/4;
    let t = start;
    for(let i=0;i<tr.pattern.length;i++){
      const step = tr.pattern[i];
      if(step.note){
        const play = INST[tr.inst];
        play(step.note, t, beat*step.len);
      }
      t += beat*step.len;
    }
    if(Music.playing){
      Music.timer = setTimeout(()=>scheduleTrack(tr, t), (t - Sound.ctx.currentTime - 0.05)*1000);
    }
  }

  /* -------------------- ПАТТЕРНЫ МУЗЫКИ -------------------- */
  const melody = [
    {note:'C5',len:1},
    {note:'E5',len:1},
    {note:'G5',len:2},
    {note:'E5',len:1},
    {note:'C6',len:3},
    {note:'E5',len:1},
    {note:'D5',len:1},
    {note:'F5',len:2},
    {note:'D5',len:1},
    {note:'B5',len:3},
    {note:'G5',len:1},
    {note:'E5',len:1},
    {note:'C5',len:2},
    {note:'E5',len:1},
    {note:'G5',len:3},
    {note:'E5',len:1},
    {note:'D5',len:1},
    {note:'F5',len:2},
    {note:'A5',len:1},
    {note:'F5',len:3},
    {note:'D5',len:1},
    {note:'B4',len:1},
    {note:'G4',len:2},
    {note:'B4',len:1},
    {note:'D5',len:3},
    {note:'B4',len:1},
    {note:'A4',len:1},
    {note:'C5',len:2},
    {note:'A4',len:1},
    {note:'F5',len:3},
    {note:'E5',len:1},
    {note:'C5',len:1},
    {note:'G4',len:2},
    {note:'C5',len:1},
    {note:'E5',len:3},
    {note:'G5',len:1},
    {note:'E5',len:1},
    {note:'C5',len:2},
    {note:'E5',len:1},
    {note:'G5',len:3},
    {note:'F5',len:1},
    {note:'D5',len:1},
    {note:'B4',len:2},
    {note:'D5',len:1},
    {note:'F5',len:3},
    {note:'E5',len:1},
    {note:'C5',len:1},
    {note:'A4',len:2},
    {note:'C5',len:1},
    {note:'E5',len:3},
    {note:'D5',len:1},
    {note:'B4',len:1},
    {note:'G4',len:2},
    {note:'B4',len:1},
    {note:'D5',len:3},
    {note:'C5',len:1},
    {note:'A4',len:1},
    {note:'F4',len:2},
    {note:'A4',len:1},
    {note:'C5',len:3},
    {note:'B4',len:1},
    {note:'G4',len:1},
    {note:'E4',len:2},
    {note:'G4',len:1},
    {note:'B4',len:3},
    {note:'A4',len:1},
    {note:'F4',len:1},
    {note:'D4',len:2},
    {note:'F4',len:1},
    {note:'A4',len:3},
    {note:'G4',len:1},
    {note:'E4',len:1},
    {note:'C4',len:2},
    {note:'E4',len:1},
    {note:'G4',len:3},
    {note:'F4',len:1},
    {note:'D4',len:1},
    {note:'B3',len:2},
    {note:'D4',len:1},
    {note:'F4',len:3},
    {note:'E4',len:1},
    {note:'C4',len:1},
    {note:'A3',len:2},
    {note:'C4',len:1},
    {note:'E4',len:3},
    {note:'D4',len:1},
    {note:'B3',len:1},
    {note:'G3',len:2},
    {note:'B3',len:1},
    {note:'D4',len:3},
    {note:'C4',len:1},
    {note:'A3',len:1},
    {note:'F3',len:2},
    {note:'A3',len:1},
    {note:'C4',len:3},
    {note:'B3',len:1},
    {note:'G3',len:1},
    {note:'E3',len:2},
    {note:'G3',len:1},
    {note:'B3',len:3},
    {note:'A3',len:1},
    {note:'F3',len:1},
    {note:'D3',len:2},
    {note:'F3',len:1},
    {note:'A3',len:3},
    {note:'G3',len:1},
    {note:'E3',len:1},
    {note:'C3',len:2},
    {note:'E3',len:1},
    {note:'G3',len:3}
  ];
  const melodyB = [
    {note:'C4',len:1},
    {note:'E4',len:1},
    {note:'G4',len:2},
    {note:'E4',len:1},
    {note:'A4',len:1},
    {note:'G4',len:2},
    {note:'F4',len:1},
    {note:'E4',len:2},
    {note:'D4',len:1},
    {note:'F4',len:1},
    {note:'A4',len:2},
    {note:'F4',len:1},
    {note:'G4',len:1},
    {note:'E4',len:2},
    {note:'C4',len:1},
    {note:'G4',len:2},
    {note:'C4',len:1},
    {note:'E4',len:1},
    {note:'G4',len:2},
    {note:'E4',len:1},
    {note:'A4',len:1},
    {note:'G4',len:2},
    {note:'F4',len:1},
    {note:'E4',len:2},
    {note:'D4',len:1},
    {note:'F4',len:1},
    {note:'A4',len:2},
    {note:'F4',len:1},
    {note:'G4',len:1},
    {note:'E4',len:2},
    {note:'C4',len:1},
    {note:'G4',len:2},
    {note:'C4',len:1},
    {note:'E4',len:1},
    {note:'G4',len:2},
    {note:'E4',len:1},
    {note:'A4',len:1},
    {note:'G4',len:2},
    {note:'F4',len:1},
    {note:'E4',len:2},
    {note:'D4',len:1},
    {note:'F4',len:1},
    {note:'A4',len:2},
    {note:'F4',len:1},
    {note:'G4',len:1},
    {note:'E4',len:2},
    {note:'C4',len:1},
    {note:'G4',len:2},
    {note:'C4',len:1},
    {note:'E4',len:1},
    {note:'G4',len:2},
    {note:'E4',len:1},
    {note:'A4',len:1},
    {note:'G4',len:2},
    {note:'F4',len:1},
    {note:'E4',len:2},
    {note:'D4',len:1},
    {note:'F4',len:1},
    {note:'A4',len:2},
    {note:'F4',len:1},
    {note:'G4',len:1},
    {note:'E4',len:2},
    {note:'C4',len:1},
    {note:'G4',len:2}
  ];
  melody.push(...melodyB);

  const counter = [
    {note:'E6',len:1},
    {note:'G6',len:1},
    {note:'A6',len:2},
    {note:'G6',len:1},
    {note:'E6',len:1},
    {note:'C6',len:2},
    {note:'D6',len:1},
    {note:'F6',len:3},
    {note:'E6',len:1},
    {note:'C6',len:1},
    {note:'B5',len:2},
    {note:'G5',len:1},
    {note:'A5',len:1},
    {note:'E5',len:2},
    {note:'F5',len:1},
    {note:'D5',len:3}
  ];

  const bass = [
    {note:'C3',len:4},
    {note:'C3',len:4},
    {note:'F2',len:4},
    {note:'F2',len:4},
    {note:'G2',len:4},
    {note:'G2',len:4},
    {note:'E2',len:4},
    {note:'E2',len:4},
    {note:'A2',len:4},
    {note:'A2',len:4},
    {note:'D3',len:4},
    {note:'D3',len:4},
    {note:'G2',len:4},
    {note:'G2',len:4},
    {note:'C3',len:4},
    {note:'C3',len:4},
    {note:'F2',len:4},
    {note:'F2',len:4},
    {note:'G2',len:4},
    {note:'G2',len:4},
    {note:'E2',len:4},
    {note:'E2',len:4},
    {note:'A2',len:4},
    {note:'A2',len:4},
    {note:'D3',len:4},
    {note:'D3',len:4},
    {note:'G2',len:4},
    {note:'G2',len:4},
    {note:'C3',len:4},
    {note:'C3',len:4},
    {note:'F2',len:4},
    {note:'F2',len:4},
    {note:'G2',len:4},
    {note:'G2',len:4},
    {note:'E2',len:4},
    {note:'E2',len:4},
    {note:'A2',len:4},
    {note:'A2',len:4},
    {note:'D3',len:4},
    {note:'D3',len:4},
    {note:'G2',len:4},
    {note:'G2',len:4},
    {note:'C3',len:4},
    {note:'C3',len:4},
    {note:'F2',len:4},
    {note:'F2',len:4},
    {note:'G2',len:4},
    {note:'G2',len:4},
    {note:'E2',len:4},
    {note:'E2',len:4},
    {note:'A2',len:4},
    {note:'A2',len:4},
    {note:'D3',len:4},
    {note:'D3',len:4},
    {note:'G2',len:4},
    {note:'G2',len:4},
    {note:'C3',len:4},
    {note:'C3',len:4},
    {note:'F2',len:4},
    {note:'F2',len:4},
    {note:'G2',len:4},
    {note:'G2',len:4}
  ];

  const drum = [
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1},
    {note:null,len:1}
  ];

  for(let i=0;i<64;i++){
    drum.push({note:null,len:1});
  }

  Music.tracks = [
    {inst:'pulse', pattern:melody},
    {inst:'tri', pattern:counter},
    {inst:'bass', pattern:bass},
    {inst:'noise', pattern:drum}
  ];

  /* -------------------- ЭКСПОРТ -------------------- */
  window.Sound = Sound;
  Sound.init();
})();
