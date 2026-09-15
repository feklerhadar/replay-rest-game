(() => {
  const STORAGE_KEY = 'replay-game-progress';
  const stageLimit = 12;
  const state = { stages: [], currentIndex: 0, completed: [], score: 0, attempts: {} };
  const $ = (selector) => document.querySelector(selector);

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      state.currentIndex = Number.isInteger(saved.currentStage) ? saved.currentStage : 0;
      state.completed = Array.isArray(saved.completed) ? saved.completed : [];
      state.score = Number.isFinite(saved.score) ? saved.score : 0;
      state.attempts = saved.attempts && typeof saved.attempts === 'object' ? saved.attempts : {};
    } catch (_) { /* Start fresh if storage is unavailable or malformed. */ }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStage: state.currentIndex, completed: state.completed, score: state.score, attempts: state.attempts }));
  }

  function currentStage() { return state.stages[state.currentIndex]; }
  function stageId() { return currentStage() && currentStage().id; }
  function isCompleted(id) { return state.completed.includes(id); }

  function updateProgress() {
    const total = state.stages.length || stageLimit;
    const id = stageId();
    $('#stage-count').textContent = `Stage ${state.currentIndex + 1} of ${total}`;
    $('#score').textContent = state.score;
    $('#attempts').textContent = state.attempts[id] || 0;
    $('#progress-bar').style.width = `${state.completed.length / total * 100}%`;
    $('#previous-stage').disabled = state.currentIndex === 0;
    $('#next-stage').disabled = state.currentIndex >= state.stages.length - 1 || !isCompleted(id);
    $('#completion-note').textContent = isCompleted(id) ? 'Completed stage: revisit it to practise again.' : 'Complete stages to unlock your score.';
  }

  function renderStage() {
    const stage = currentStage();
    if (!stage) return;
    $('#challenge-title').textContent = stage.title;
    $('#challenge-scenario').textContent = stage.scenario;
    $('#hint-text').textContent = stage.hint;
    $('#hint-text').hidden = true;
    $('#hint-button').textContent = 'Show hint';
    $('#hint-button').setAttribute('aria-expanded', 'false');
    $('#response-status').className = 'status-pill status-idle';
    $('#response-status').textContent = 'Waiting';
    $('#response-code').textContent = '—';
    $('#response-status-text').textContent = 'Send a request to inspect the response.';
    $('#response-content').textContent = 'Your server response will appear here.';
    $('#game-feedback').hidden = true;
    updateProgress();
  }

  function makeParameterRow(type) {
    const row = document.createElement('div');
    row.className = 'parameter-row';
    row.innerHTML = `<input type="text" data-param-key placeholder="${type === 'route' ? 'id' : 'key'}" aria-label="${type} parameter name" autocomplete="off"><input type="text" data-param-value placeholder="value" aria-label="${type} parameter value" autocomplete="off"><button class="remove-row" type="button" aria-label="Remove ${type} parameter">×</button>`;
    row.querySelector('.remove-row').addEventListener('click', () => { row.remove(); updatePreview(); });
    row.querySelectorAll('input').forEach((input) => input.addEventListener('input', updatePreview));
    return row;
  }

  function addParameter(type) { $(`#${type}-params`).append(makeParameterRow(type)); updatePreview(); }

  function readParameters(type) {
    return [...document.querySelectorAll(`#${type}-params .parameter-row`)].reduce((values, row) => {
      const key = row.querySelector('[data-param-key]').value.trim();
      const value = row.querySelector('[data-param-value]').value;
      if (key) values[key] = value;
      return values;
    }, {});
  }

  function buildRequest() {
    const method = $('#http-method').value;
    let path = $('#request-path').value.trim() || '/';
    const route = readParameters('route');
    Object.entries(route).forEach(([key, value]) => { path = path.replaceAll(`:${key}`, encodeURIComponent(value)); });
    const query = new URLSearchParams();
    Object.entries(readParameters('query')).forEach(([key, value]) => query.append(key, value));
    const queryString = query.toString();
    const url = `${path}${queryString ? `?${queryString}` : ''}`;
    const bodyText = $('#request-body').value.trim();
    let body;
    if (bodyText) body = JSON.parse(bodyText);
    return { method, url, body, bodyText };
  }

  function updatePreview() {
    const method = $('#http-method').value;
    $('#method-badge').textContent = method;
    try {
      const request = buildRequest();
      const bodyLine = request.bodyText ? `\nContent-Type: application/json\n\n${JSON.stringify(request.body, null, 2)}` : '';
      $('#request-preview').textContent = `${request.method} ${request.url}${bodyLine}`;
      $('#input-error').hidden = true;
    } catch (_) {
      $('#request-preview').textContent = `${method} ${$('#request-path').value.trim() || '/'}`;
    }
  }

  async function readResponse(response) {
    const text = await response.text();
    if (!text) return 'Empty response body (HTTP 204 or no content).';
    try { return JSON.stringify(JSON.parse(text), null, 2); } catch (_) { return text; }
  }

  function showResponse(response, content) {
    const status = $('#response-status');
    $('#response-code').textContent = response.status;
    $('#response-status-text').textContent = response.statusText || 'No status text';
    $('#response-content').textContent = content;
    status.textContent = response.ok ? 'Received' : 'HTTP error';
    status.className = `status-pill ${response.ok ? 'status-success' : 'status-error'}`;
  }

  function showFeedback(message, success) {
    const feedback = $('#game-feedback');
    feedback.hidden = false;
    feedback.className = `game-feedback ${success ? 'success' : 'error'}`;
    feedback.textContent = message;
  }

  async function sendRequest(event) {
    event.preventDefault();
    $('#input-error').hidden = true;
    let request;
    try { request = buildRequest(); } catch (_) {
      $('#input-error').textContent = 'Input format error: request body must contain valid JSON.';
      $('#input-error').hidden = false;
      return;
    }
    const id = stageId();
    state.attempts[id] = (state.attempts[id] || 0) + 1;
    saveProgress();
    updateProgress();
    const headers = { 'X-Stage-Id': String(id) };
    if (request.bodyText) headers['Content-Type'] = 'application/json';
    try {
      const response = await fetch(request.url, { method: request.method, headers, body: request.bodyText || undefined });
      const content = await readResponse(response);
      showResponse(response, content);
      const valid = response.headers.get('X-Game-Stage-Valid') === 'true';
      if (valid) {
        if (!isCompleted(id)) {
          state.completed.push(id);
          const attempt = state.attempts[id];
          state.score += attempt === 1 ? 100 : attempt === 2 ? 80 : attempt === 3 ? 60 : 40;
          saveProgress();
          updateProgress();
          showFeedback(`Stage complete. You earned ${attempt === 1 ? 100 : attempt === 2 ? 80 : attempt === 3 ? 60 : 40} points.`, true);
        } else showFeedback('Stage complete again. Your score is already recorded for this stage.', true);
      } else showFeedback('Not solved yet. Read the response and adjust your request.', false);
    } catch (_) {
      $('#response-status').textContent = 'Network error';
      $('#response-status').className = 'status-pill status-error';
      $('#response-code').textContent = '—';
      $('#response-status-text').textContent = 'The server could not be reached.';
      $('#response-content').textContent = 'No response received.';
      showFeedback('Network error. Check that the server is running and try again.', false);
    }
  }

  async function loadStages() {
    try {
      const response = await fetch('/api/game/stages');
      if (!response.ok) throw new Error('Stages unavailable');
      const payload = await response.json();
      state.stages = Array.isArray(payload.stages) ? payload.stages : [];
      if (!state.stages.length) throw new Error('No stages');
      state.currentIndex = Math.min(Math.max(state.currentIndex, 0), state.stages.length - 1);
      renderStage();
    } catch (_) {
      $('#challenge-title').textContent = 'Stages are taking a breather';
      $('#challenge-scenario').textContent = 'The public stage list could not be loaded. Start the game server and refresh this page.';
      $('#hint-button').disabled = true;
    }
  }

  function resetProgress() {
    if (!window.confirm('Reset your score, attempts, and completed stages?')) return;
    state.currentIndex = 0; state.completed = []; state.score = 0; state.attempts = {};
    saveProgress(); renderStage();
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    $('#request-form').addEventListener('submit', sendRequest);
    $('#http-method').addEventListener('change', updatePreview);
    $('#request-path').addEventListener('input', updatePreview);
    $('#request-body').addEventListener('input', updatePreview);
    document.querySelectorAll('[data-add-parameter]').forEach((button) => button.addEventListener('click', () => addParameter(button.dataset.addParameter)));
    $('#hint-button').addEventListener('click', () => { const hint = $('#hint-text'); const visible = !hint.hidden; hint.hidden = visible; $('#hint-button').textContent = visible ? 'Show hint' : 'Hide hint'; $('#hint-button').setAttribute('aria-expanded', String(!visible)); });
    $('#previous-stage').addEventListener('click', () => { if (state.currentIndex > 0) { state.currentIndex -= 1; saveProgress(); renderStage(); } });
    $('#next-stage').addEventListener('click', () => {
      if (!isCompleted(stageId()) || state.currentIndex >= state.stages.length - 1) return;
      state.currentIndex += 1;
      saveProgress();
      renderStage();
    });
    $('#reset-progress').addEventListener('click', resetProgress);
    addParameter('route');
    loadStages();
    updatePreview();
  });
})();
