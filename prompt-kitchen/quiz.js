/* ─── Ask the Chef: 4-question tool recommendation quiz ─────────
   Static and local: no fetches, no storage. One question at a time;
   the use-case + style pair selects the recommendation, with a style
   fallback before the default so the privacy path stays reachable.
------------------------------------------------------------------- */

'use strict';

const QUIZ_QUESTIONS = [
  {
    text: "What's your main use case?",
    options: [
      { icon: '✍️', label: 'Writing & editing', sub: 'emails, docs, content, editing', key: 'writing' },
      { icon: '💻', label: 'Coding & debugging', sub: 'code review, explaining errors, writing scripts', key: 'coding' },
      { icon: '🔍', label: 'Research & learning', sub: 'summarising, fact-checking, understanding new topics', key: 'research' },
      { icon: '🎨', label: 'Creative work', sub: 'brainstorming, storytelling, images, video', key: 'creative' },
    ],
  },
  {
    text: 'How do you prefer to work?',
    options: [
      { icon: '⚡', label: 'Quick answers', sub: 'I want fast, direct responses', key: 'fast' },
      { icon: '📄', label: 'Long documents', sub: 'I work with large files and need deep context', key: 'long' },
      { icon: '🌐', label: 'Current information', sub: 'I need up-to-date facts and sources', key: 'current' },
      { icon: '🔒', label: 'Privacy matters', sub: "I'd rather not send data to big tech", key: 'private' },
    ],
  },
  {
    text: "What's your budget?",
    options: [
      { icon: '🆓', label: 'Free only', sub: 'No subscriptions', key: 'free' },
      { icon: '💰', label: 'Up to $20/month', sub: 'One subscription is fine', key: 'paid' },
      { icon: '🏢', label: 'Team / business', sub: 'Multiple users, API access', key: 'business' },
    ],
  },
  {
    text: 'Your experience level?',
    options: [
      { icon: '🌱', label: 'Just starting out', sub: 'I want something easy and forgiving', key: 'beginner' },
      { icon: '🍳', label: 'Comfortable', sub: 'I know the basics, want to go deeper', key: 'intermediate' },
      { icon: '🔪', label: 'Power user', sub: 'I want full control and customisation', key: 'advanced' },
    ],
  },
];

const QUIZ_RECOMMENDATIONS = {
  'writing-long': {
    name: 'Claude',
    emoji: '🟠',
    url: 'https://claude.ai',
    reason: 'Claude handles long documents exceptionally well and produces nuanced, careful writing. Its 200K context window means it can read your entire document before responding.',
    also: ['ChatGPT for quick edits', 'Grammarly for grammar-only fixes'],
  },
  'writing-fast': {
    name: 'ChatGPT',
    emoji: '🟢',
    url: 'https://chat.openai.com',
    reason: 'ChatGPT is fast, versatile, and excellent for everyday writing tasks. It handles drafts, rewrites, and edits with minimal fuss.',
    also: ['Claude for longer documents', "Notion AI if you're already in Notion"],
  },
  coding: {
    name: 'Claude',
    emoji: '🟠',
    url: 'https://claude.ai',
    reason: 'Claude is consistently rated the best model for code. It explains errors clearly, follows complex refactoring instructions, and handles large codebases.',
    also: ['GitHub Copilot for in-editor completions', 'ChatGPT for quick scripts'],
  },
  'research-current': {
    name: 'Perplexity',
    emoji: '🟣',
    url: 'https://perplexity.ai',
    reason: 'Perplexity is built for research — it searches the web in real time and cites every source. Best tool for anything where recency and accuracy matter.',
    also: ['Claude for synthesising long reports', 'Gemini for Google-integrated research'],
  },
  research: {
    name: 'Claude',
    emoji: '🟠',
    url: 'https://claude.ai',
    reason: 'Claude excels at synthesising large amounts of information, maintaining nuance, and being honest about uncertainty. Ideal for deep research and summarisation.',
    also: ['Perplexity if you need current sources', 'NotebookLM for document libraries'],
  },
  creative: {
    name: 'ChatGPT',
    emoji: '🟢',
    url: 'https://chat.openai.com',
    reason: 'ChatGPT with DALL·E covers text and images in one place.',
    also: ['Midjourney for better image quality', 'Suno for music generation'],
  },
  private: {
    name: 'Ollama (local)',
    emoji: '⚫',
    url: 'https://ollama.ai',
    reason: 'Ollama lets you run open-source models (Llama, Mistral) entirely on your own machine. Nothing leaves your computer. Free, but requires some setup.',
    also: ['Mistral (privacy-focused EU company)', 'Claude for the most privacy-conscious hosted option'],
  },
  default: {
    name: 'ChatGPT',
    emoji: '🟢',
    url: 'https://chat.openai.com',
    reason: 'ChatGPT is the best all-rounder for most use cases. The free tier is generous, it handles almost any task, and the current models are genuinely impressive.',
    also: ['Claude for writing and long documents', 'Perplexity for current research'],
  },
};

let quizAnswers = [];

function quizEscape(str) {
  return String(str).replace(/[&<>'"]/g, (tag) => {
    const chars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return chars[tag] || tag;
  });
}

function recommendTool(answers) {
  const key = `${answers[0]}-${answers[1]}`;
  return QUIZ_RECOMMENDATIONS[key]
    || QUIZ_RECOMMENDATIONS[answers[0]]
    || QUIZ_RECOMMENDATIONS[answers[1]]
    || QUIZ_RECOMMENDATIONS.default;
}

function renderQuizSteps() {
  const steps = document.querySelectorAll('#quiz-steps .pk-quiz-step');
  const done = quizAnswers.length >= QUIZ_QUESTIONS.length;
  steps.forEach((step, i) => {
    step.classList.toggle('done', done || i < quizAnswers.length);
    step.classList.toggle('active', !done && i === quizAnswers.length);
  });
}

function renderQuizResult(body, rec) {
  const also = (rec.also || []).length
    ? `<p class="pk-quiz-result__also-label">Also worth trying</p>
       <ul class="pk-quiz-result__also">${rec.also.map((item) => `<li>${quizEscape(item)}</li>`).join('')}</ul>`
    : '';
  body.innerHTML = `
    <div class="pk-quiz-result">
      <div class="pk-quiz-result__emoji">${quizEscape(rec.emoji)}</div>
      <p class="pk-quiz-result__label">The Chef recommends</p>
      <h3>${quizEscape(rec.name)}</h3>
      <p class="pk-quiz-result__reason">${quizEscape(rec.reason)}</p>
      ${also}
      <div class="pk-quiz-result__actions">
        <a class="btn btn--amber" href="${quizEscape(rec.url)}" target="_blank" rel="noopener">Try ${quizEscape(rec.name)} →</a>
        <button class="btn btn--outline" type="button" id="quiz-retake">Retake quiz</button>
      </div>
    </div>`;
  document.getElementById('quiz-retake').addEventListener('click', () => {
    quizAnswers = [];
    renderQuiz();
  });
}

function renderQuizQuestion(body, index) {
  const question = QUIZ_QUESTIONS[index];
  body.innerHTML = `
    <div class="pk-quiz-question">
      <h3>${quizEscape(question.text)}</h3>
      <div class="pk-quiz-options">
        ${question.options.map((opt) => `
          <button type="button" class="pk-quiz-option" data-key="${quizEscape(opt.key)}">
            <span class="pk-quiz-option__icon" aria-hidden="true">${quizEscape(opt.icon)}</span>
            <span class="pk-quiz-option__text">
              <strong>${quizEscape(opt.label)}</strong>
              <small>${quizEscape(opt.sub)}</small>
            </span>
          </button>`).join('')}
      </div>
    </div>`;
  body.querySelectorAll('.pk-quiz-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      quizAnswers[index] = btn.dataset.key;
      renderQuiz();
    });
  });
}

function renderQuiz() {
  const body = document.getElementById('quiz-body');
  if (!body) return;
  renderQuizSteps();
  if (quizAnswers.length >= QUIZ_QUESTIONS.length) {
    renderQuizResult(body, recommendTool(quizAnswers));
  } else {
    renderQuizQuestion(body, quizAnswers.length);
  }
}

renderQuiz();
