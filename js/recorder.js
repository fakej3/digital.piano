/* ===================================================
   InstrumentVerse — recorder.js
   Audio recorder using Web Audio API + MediaRecorder
   =================================================== */

const Recorder = (() => {
  let mediaRecorder  = null;
  let recordedChunks = [];
  let audioBlob      = null;
  let audioUrl       = null;
  let recording      = false;
  let startTime      = null;
  let timerInterval  = null;
  let rafId          = null;
  let analyserNode   = null;
  let micStream      = null;
  let initialized    = false;

  function build() {
    const wrap = document.getElementById('recorderWrap');
    if (!wrap || wrap.children.length > 0) return;

    wrap.innerHTML = `
      <div class="recorder-inner">
        <div class="recorder-viz">
          <canvas class="recorder-canvas" id="recorderCanvas"></canvas>
        </div>
        <div class="recorder-controls">
          <button class="rec-btn rec-btn-record" id="recRecordBtn">⏺ Record</button>
          <button class="rec-btn rec-btn-play" id="recPlayBtn" disabled>▶ Play</button>
          <button class="rec-btn rec-btn-clear" id="recClearBtn" disabled>✕ Clear</button>
          <button class="rec-btn rec-btn-download" id="recDownloadBtn" disabled>⬇ Save</button>
        </div>
        <div class="recorder-status">
          <div class="rec-dot" id="recDot"></div>
          <span id="recStatus">Ready to record</span>
          <span id="recTimer" style="margin-left:auto;font-family:monospace;font-weight:700;color:var(--text-muted)"></span>
        </div>
        <div style="margin-top:8px;font-size:0.78rem;color:var(--text-muted);">
          Records system audio via microphone. Play any instrument, then record.
        </div>
      </div>
    `;

    document.getElementById('recRecordBtn').addEventListener('click', toggleRecord);
    document.getElementById('recPlayBtn').addEventListener('click', playRecording);
    document.getElementById('recClearBtn').addEventListener('click', clearRecording);
    document.getElementById('recDownloadBtn').addEventListener('click', downloadRecording);

    drawIdle();
  }

  async function toggleRecord() {
    if (recording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }

  async function startRecording() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      mediaRecorder = new MediaRecorder(micStream, { mimeType });
      recordedChunks = [];

      mediaRecorder.addEventListener('dataavailable', e => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        audioBlob = new Blob(recordedChunks, { type: mimeType });
        audioUrl  = URL.createObjectURL(audioBlob);
        setStatus('Recording saved (' + UI.formatTime((Date.now() - startTime) / 1000) + ')', false);
        document.getElementById('recPlayBtn').disabled     = false;
        document.getElementById('recClearBtn').disabled    = false;
        document.getElementById('recDownloadBtn').disabled = false;
      });

      // Analyser for waveform vis — reuse shared AudioContext
      await audioEngine.init();
      analyserNode = audioEngine.ctx.createAnalyser();
      analyserNode.fftSize = 1024;
      const src = audioEngine.ctx.createMediaStreamSource(micStream);
      src.connect(analyserNode);

      mediaRecorder.start(100);
      recording  = true;
      startTime  = Date.now();

      setStatus('Recording…', true);
      document.getElementById('recRecordBtn').textContent  = '⏹ Stop';
      document.getElementById('recRecordBtn').classList.add('recording');

      startTimer();
      drawWaveform();

      Storage.addXP(10);
      UI.updateXPDisplay();
      UI.toast('Recording started…');
    } catch(e) {
      UI.toast('Microphone access denied', 'error');
    }
  }

  function stopRecording() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
    mediaRecorder.stop();
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    recording = false;
    stopTimer();
    cancelAnimationFrame(rafId);
    drawIdle();

    document.getElementById('recRecordBtn').textContent  = '⏺ Record';
    document.getElementById('recRecordBtn').classList.remove('recording');
  }

  function playRecording() {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play();
    setStatus('Playing…', false);
    audio.addEventListener('ended', () => setStatus('Playback complete', false));
  }

  function clearRecording() {
    stopRecording();
    recordedChunks = [];
    audioBlob = null;
    if (audioUrl) { URL.revokeObjectURL(audioUrl); audioUrl = null; }
    document.getElementById('recPlayBtn').disabled     = true;
    document.getElementById('recClearBtn').disabled    = true;
    document.getElementById('recDownloadBtn').disabled = true;
    setStatus('Ready to record', false);
    stopTimer();
    drawIdle();
  }

  function downloadRecording() {
    if (!audioBlob) return;
    const a = document.createElement('a');
    a.href     = audioUrl;
    a.download = 'instrumentverse-' + Date.now() + '.webm';
    a.click();
    UI.toast('Saved recording!');
  }

  function setStatus(msg, active) {
    const el  = document.getElementById('recStatus');
    const dot = document.getElementById('recDot');
    if (el)  el.textContent = msg;
    if (dot) dot.classList.toggle('active', active);
  }

  function startTimer() {
    const el = document.getElementById('recTimer');
    timerInterval = setInterval(() => {
      if (el) el.textContent = UI.formatTime((Date.now() - startTime) / 1000);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    const el = document.getElementById('recTimer');
    if (el) el.textContent = '';
  }

  function drawIdle() {
    const canvas = document.getElementById('recorderCanvas');
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth || 300;
    canvas.height = canvas.offsetHeight || 80;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'var(--border)';
    ctx.fillRect(0, canvas.height / 2 - 1, canvas.width, 2);
  }

  function drawWaveform() {
    if (!recording || !analyserNode) return;
    const canvas = document.getElementById('recorderCanvas');
    if (!canvas) return;

    canvas.width  = canvas.offsetWidth || 300;
    canvas.height = canvas.offsetHeight || 80;
    const ctx   = canvas.getContext('2d');
    const buf   = new Float32Array(analyserNode.fftSize);

    function frame() {
      if (!recording) return;
      analyserNode.getFloatTimeDomainData(buf);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#e64d8b';
      ctx.lineWidth   = 2;

      const sliceW = canvas.width / buf.length;
      let x = 0;
      for (let i = 0; i < buf.length; i++) {
        const y = (buf[i] * 0.5 + 0.5) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.stroke();
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    build();
  }

  function destroy() {
    if (recording) stopRecording();
    cancelAnimationFrame(rafId);
    stopTimer();
    initialized = false;
  }

  return { init, destroy };
})();
