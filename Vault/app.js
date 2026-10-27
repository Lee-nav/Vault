// Starter decks, pets, and storage keys used on first launch.

const STORAGE_KEYS = {
  DECKS: 'vault_decks_v2',
  PETS: 'vault_pets_v2',
  ACTIVE_PET: 'vault_active_pet_v2',
  TREATS: 'vault_treats_v2',
  STREAK: 'vault_streak_v2',
  SOUND: 'vault_sound_enabled_v2'
};

const DEFAULT_TUTORIAL_DECKS = [
  {
    id: 'deck_tutorial_1',
    title: 'Tutorial 1: Vault Basics & Creation',
    description: 'Learn how flashcard testing, active recall, and spaced repetition improve long-term retention.',
    isTutorial: true,
    cards: [
      {
        id: 'c1',
        question: 'What is active recall in learning?',
        answer: 'Testing your memory by retrieving information rather than passive reading.'
      },
      {
        id: 'c2',
        question: 'How do you reveal the hidden side of a card in Vault?',
        answer: 'Click the card or press the spacebar to flip it in 3D.'
      },
      {
        id: 'c3',
        question: 'What does the JSON Export button in the top bar do?',
        answer: 'Downloads a complete offline backup of all your decks and pet progress.'
      }
    ],
    createdAt: Date.now(),
    lastStudied: null
  },
  {
    id: 'deck_tutorial_2',
    title: 'Tutorial 2: Daily Streaks & Habit',
    description: 'Discover how daily study streaks work and why consistency beats cramming.',
    isTutorial: true,
    cards: [
      {
        id: 'c4',
        question: 'How does your daily study streak increase in Vault?',
        answer: 'By completing at least one study session on consecutive calendar days.'
      },
      {
        id: 'c5',
        question: 'Does finishing multiple cards in the same day add multiple streak days?',
        answer: 'No, streaks advance day-by-day to encourage healthy daily study habits.'
      },
      {
        id: 'c6',
        question: 'What happens if you miss studying for a day?',
        answer: 'Your streak resets back to 1 on your next study day.'
      }
    ],
    createdAt: Date.now(),
    lastStudied: null
  },
  {
    id: 'deck_tutorial_3',
    title: 'Tutorial 3: Pets & 5-Tier Evolutions',
    description: 'Earn treats, level up companion pets, and unlock mysterious locked evolution tiers.',
    isTutorial: true,
    cards: [
      {
        id: 'c7',
        question: 'How do you earn treats for your companion pets?',
        answer: 'Complete study sessions and review flashcard decks.'
      },
      {
        id: 'c8',
        question: 'At what milestone levels do pets evolve into their 5 tiers?',
        answer: 'Levels 1, 5, 10, 15, and 20.'
      },
      {
        id: 'c9',
        question: 'How are locked future evolutions displayed before you reach them?',
        answer: 'As shaded silhouette outlines until you reach the required level.'
      }
    ],
    createdAt: Date.now(),
    lastStudied: null
  }
];

const DEFAULT_PETS = [
  {
    id: 'ember',
    name: 'Ember the Fox',
    type: 'fire',
    level: 1,
    xp: 0,
    color: '#f97316',
    stages: ['Baby Cub', 'Swift Scout', 'Flame Champion', 'Inferno Master', 'Ascended Phoenix-Fox']
  },
  {
    id: 'aqua',
    name: 'Aqua the Axolotl',
    type: 'water',
    level: 1,
    xp: 0,
    color: '#06b6d4',
    stages: ['Puddle Larva', 'Stream Scout', 'Tide Guardian', 'Abyssal Master', 'Ascended Leviathan']
  },
  {
    id: 'terra',
    name: 'Terra the Turtle',
    type: 'earth',
    level: 1,
    xp: 0,
    color: '#10b981',
    stages: ['Hatchling', 'Moss Scout', 'Granite Guardian', 'Gaia Master', 'Ascended Titan']
  },
  {
    id: 'zephyr',
    name: 'Zephyr the Falcon',
    type: 'air',
    level: 1,
    xp: 0,
    color: '#8b5cf6',
    stages: ['Fledgling', 'Breeze Scout', 'Gale Falcon', 'Tempest Master', 'Ascended Sky-Lord']
  }
];

// Loads saved app data and keeps it in sync with local storage.

class Store {
  constructor() {
    this.decks = this.load(STORAGE_KEYS.DECKS, DEFAULT_TUTORIAL_DECKS);
    this.pets = this.load(STORAGE_KEYS.PETS, DEFAULT_PETS);
    this.activePetId = this.load(STORAGE_KEYS.ACTIVE_PET, 'ember');
    this.treats = this.load(STORAGE_KEYS.TREATS, 3);
    this.streak = this.load(STORAGE_KEYS.STREAK, { count: 1, lastDate: '' });
    this.soundEnabled = this.load(STORAGE_KEYS.SOUND, true);
  }

  load(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(this.decks));
      localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(this.pets));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PET, JSON.stringify(this.activePetId));
      localStorage.setItem(STORAGE_KEYS.TREATS, JSON.stringify(this.treats));
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(this.streak));
      localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(this.soundEnabled));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  getActivePet() {
    return this.pets.find(p => p.id === this.activePetId) || this.pets[0];
  }

  recordStudyCompletion() {
    const today = new Date().toISOString().slice(0, 10);
    if (!this.streak.lastDate) {
      this.streak.count = 1;
      this.streak.lastDate = today;
    } else if (this.streak.lastDate !== today) {
      const last = new Date(this.streak.lastDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        this.streak.count += 1;
      } else if (diffDays > 1) {
        this.streak.count = 1;
      }
      this.streak.lastDate = today;
    }
    this.treats += 1;
    this.save();
  }
}

const store = new Store();

// Plays short tones for study results and pet level-ups.

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, delay = 0, gainVal = 0.15) {
    if (!store.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (err) {
        console.warn('Audio tone error', err);
      }
    }, delay * 1000);
  }

  correct() {
    this.playTone(523.25, 'sine', 0.25, 0, 0.18);      // C5
    this.playTone(659.25, 'sine', 0.3, 0.08, 0.16);     // E5
    this.playTone(783.99, 'triangle', 0.45, 0.16, 0.2); // G5
  }

  close() {
    this.playTone(659.25, 'sine', 0.25, 0, 0.14);      // E5
    this.playTone(987.77, 'sine', 0.35, 0.12, 0.14);    // B5
  }

  wrong() {
    this.playTone(329.63, 'sawtooth', 0.2, 0, 0.08);   // E4
    this.playTone(220.00, 'sawtooth', 0.35, 0.1, 0.1); // A3
  }

  levelUp() {
    this.playTone(523.25, 'triangle', 0.2, 0, 0.15);
    this.playTone(659.25, 'triangle', 0.2, 0.1, 0.15);
    this.playTone(783.99, 'triangle', 0.25, 0.2, 0.18);
    this.playTone(1046.5, 'sine', 0.5, 0.3, 0.22);
  }
}

const sound = new SoundEngine();

// Compares typed answers with the expected answer.

function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function evaluateSimilarity(userInput, expectedAnswer) {
  const cleanInput = userInput.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
  const cleanExpected = expectedAnswer.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');

  if (!cleanInput) {
    return { status: 'wrong', message: 'No answer provided.' };
  }

  if (cleanInput === cleanExpected) {
    return { status: 'correct', message: 'Spot on! Exactly correct.' };
  }

  const distance = levenshteinDistance(cleanInput, cleanExpected);
  const maxLen = Math.max(cleanInput.length, cleanExpected.length);

  if (cleanExpected.length <= 4) {
    return {
      status: 'wrong',
      message: `Incorrect. The exact answer is "${expectedAnswer}".`
    };
  }

  if (distance === 1) {
    return {
      status: 'close',
      message: `Very close! Minor single typo. Expected: "${expectedAnswer}".`
    };
  }

  const inputWords = cleanInput.split(/\s+/).filter(Boolean);
  const expectedWords = cleanExpected.split(/\s+/).filter(Boolean);

  if (expectedWords.length >= 3) {
    const matchedCount = inputWords.filter(w => expectedWords.includes(w)).length;
    const wordRatio = matchedCount / expectedWords.length;
    const similarity = 1 - distance / maxLen;

    if (similarity >= 0.88 || wordRatio >= 0.85) {
      return {
        status: 'close',
        message: `Almost there! Core concepts matched. Expected: "${expectedAnswer}".`
      };
    }
  }

  return {
    status: 'wrong',
    message: `Not quite. Expected: "${expectedAnswer}".`
  };
}

// Builds the pet SVG for its type and evolution stage.

function renderPetSvg(type, tierIndex) {
  const size = 56;
  const colors = {
    fire: ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
    water: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
    earth: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
    air: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
  };
  const c = (colors[type] || colors.fire)[tierIndex];

  if (type === 'fire') {
    if (tierIndex === 0) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${c}">
        <circle cx="12" cy="13" r="7" opacity="0.9"/>
        <polygon points="6,9 9,3 11,8" />
        <polygon points="18,9 15,3 13,8" />
        <circle cx="10" cy="12" r="1" fill="#fff"/>
        <circle cx="14" cy="12" r="1" fill="#fff"/>
        <polygon points="12,14 11,15.5 13,15.5" fill="#1e293b"/>
      </svg>`;
    } else if (tierIndex === 1) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${c}">
        <circle cx="12" cy="13" r="8"/>
        <polygon points="5,8 8,1 11,7" />
        <polygon points="19,8 16,1 13,7" />
        <circle cx="9.5" cy="12" r="1.2" fill="#fff"/>
        <circle cx="14.5" cy="12" r="1.2" fill="#fff"/>
        <path d="M12,14 L10.5,16 L13.5,16 Z" fill="#1e293b"/>
        <path d="M4,17 Q2,12 5,10" stroke="${c}" stroke-width="2" fill="none"/>
      </svg>`;
    } else if (tierIndex === 2) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${c}">
        <path d="M12,2 L15,8 L21,9 L16.5,14 L18,20 L12,17 L6,20 L7.5,14 L3,9 L9,8 Z" opacity="0.95"/>
        <circle cx="10" cy="11" r="1.2" fill="#fff"/>
        <circle cx="14" cy="11" r="1.2" fill="#fff"/>
        <circle cx="12" cy="14" r="1" fill="#1e293b"/>
      </svg>`;
    } else if (tierIndex === 3) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${c}">
        <polygon points="12,1 15,6 20,4 18,10 23,12 18,14 20,20 15,18 12,23 9,18 4,20 6,14 1,12 6,10 4,4 9,6"/>
        <circle cx="10" cy="11" r="1.3" fill="#fff"/>
        <circle cx="14" cy="11" r="1.3" fill="#fff"/>
      </svg>`;
    } else {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${c}">
        <circle cx="12" cy="12" r="11" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="3,2"/>
        <polygon points="12,2 16,9 23,12 16,15 12,22 8,15 1,12 8,9"/>
        <circle cx="12" cy="12" r="4" fill="#ffffff" opacity="0.9"/>
      </svg>`;
    }
  }

  const rad = 7 + tierIndex;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${c}">
    <circle cx="12" cy="12" r="${rad}" opacity="0.9"/>
    <circle cx="9.5" cy="10" r="1.2" fill="#fff"/>
    <circle cx="14.5" cy="10" r="1.2" fill="#fff"/>
    ${tierIndex >= 2 ? `<polygon points="12,1 14,5 10,5" fill="${c}"/>` : ''}
    ${tierIndex >= 4 ? `<circle cx="12" cy="12" r="11" fill="none" stroke="${c}" stroke-width="1.5"/>` : ''}
  </svg>`;
}

// Shows the selected screen and refreshes its content.

function showView(viewId) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  const targetView = document.getElementById(`view-${viewId}`);
  const targetNav = document.getElementById(`nav-${viewId}`);
  const targetMobNav = document.getElementById(`mob-nav-${viewId}`);

  if (targetView) targetView.classList.add('active');
  if (targetNav) targetNav.classList.add('active');
  if (targetMobNav) targetMobNav.classList.add('active');

  closeMobileDrawer();

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewId === 'landing') renderLanding();
  if (viewId === 'vault') renderVault();
  if (viewId === 'study') prepareStudyScreen();
  if (viewId === 'pets') renderPets();
}

function toggleMobileDrawer() {
  const drawer = document.getElementById('mobile-action-drawer');
  drawer.classList.toggle('open');
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-action-drawer');
  if (drawer) drawer.classList.remove('open');
}

function showToast(msg) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Updates the home page stats and tutorial decks.

function renderLanding() {
  const totalDecks = store.decks.length;
  const totalCards = store.decks.reduce((acc, d) => acc + d.cards.length, 0);
  const activePet = store.getActivePet();

  document.getElementById('stat-total-decks').textContent = totalDecks;
  document.getElementById('stat-total-cards').textContent = totalCards;
  document.getElementById('stat-day-streak').textContent = `${store.streak.count} ${store.streak.count === 1 ? 'Day' : 'Days'}`;
  document.getElementById('stat-active-pet-lvl').textContent = `Level ${activePet.level}`;

  const tutorialContainer = document.getElementById('tutorial-decks-list');
  const tutorials = store.decks.filter(d => d.isTutorial);

  tutorialContainer.innerHTML = tutorials.map(deck => `
    <div class="deck-card" data-deck-id="${deck.id}">
      <div class="deck-card-top">
        <h3 class="deck-title" title="${deck.title}">${deck.title}</h3>
        <p class="deck-desc">${deck.description}</p>
        <div class="metadata-line">
          <span>${deck.cards.length} cards</span>
          <span class="metadata-separator">·</span>
          <span>Tutorial</span>
        </div>
      </div>
      <div class="deck-card-bottom">
        <button type="button" class="btn-primary btn-study-direct" data-deck-id="${deck.id}">
          Study Tutorial
        </button>
      </div>
    </div>
  `).join('');

  tutorialContainer.querySelectorAll('.btn-study-direct').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const deckId = btn.getAttribute('data-deck-id');
      startStudyForDeck(deckId);
    });
  });
}

// Filters and displays decks with study, edit, and delete actions.

function renderVault() {
  const listContainer = document.getElementById('user-decks-list');
  const searchTerm = (document.getElementById('deck-search-input')?.value || '').toLowerCase().trim();

  const filtered = store.decks.filter(d => {
    return d.title.toLowerCase().includes(searchTerm) || d.description.toLowerCase().includes(searchTerm);
  });

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem 1rem; text-align: center; color: var(--text-muted); background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius);">
        <p style="margin-bottom: 1.25rem;">No flashcard decks found.</p>
        <button type="button" class="btn-primary btn-large" id="btn-create-first-deck">Create a Deck</button>
      </div>
    `;
    document.getElementById('btn-create-first-deck')?.addEventListener('click', openCreateDeckModal);
    return;
  }

  listContainer.innerHTML = filtered.map(deck => `
    <div class="deck-card" data-deck-id="${deck.id}">
      <div class="deck-card-top">
        <h3 class="deck-title" title="${deck.title}">${deck.title}</h3>
        <p class="deck-desc">${deck.description || 'No description provided.'}</p>
        <div class="metadata-line">
          <span>${deck.cards.length} cards</span>
          <span class="metadata-separator">·</span>
          <span>${deck.isTutorial ? 'Tutorial' : 'Local Deck'}</span>
        </div>
      </div>
      <div class="deck-card-bottom">
        <button type="button" class="btn-primary btn-study-direct" data-deck-id="${deck.id}">
          Study
        </button>
        <div class="deck-actions-group">
          <button type="button" class="action-icon-btn btn-edit-deck" data-deck-id="${deck.id}" title="Edit Deck" aria-label="Edit Deck">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          <button type="button" class="action-icon-btn btn-delete-deck" data-deck-id="${deck.id}" title="Delete Deck" aria-label="Delete Deck">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  listContainer.querySelectorAll('.btn-study-direct').forEach(btn => {
    btn.addEventListener('click', () => startStudyForDeck(btn.getAttribute('data-deck-id')));
  });

  listContainer.querySelectorAll('.btn-edit-deck').forEach(btn => {
    btn.addEventListener('click', () => openEditDeckModal(btn.getAttribute('data-deck-id')));
  });

  listContainer.querySelectorAll('.btn-delete-deck').forEach(btn => {
    btn.addEventListener('click', () => openDeleteDeckModal(btn.getAttribute('data-deck-id')));
  });
}

// Runs a study session and tracks card progress and answers.

let activeSession = {
  deckId: null,
  deckTitle: '',
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  reviewedCount: 0,
  xpEarned: 0
};

function prepareStudyScreen() {
  const selectScreen = document.getElementById('study-select-screen');
  const stageScreen = document.getElementById('study-stage-screen');
  const summaryScreen = document.getElementById('study-summary-screen');
  const picker = document.getElementById('study-deck-picker');

  selectScreen.style.display = 'flex';
  stageScreen.style.display = 'none';
  summaryScreen.style.display = 'none';

  picker.innerHTML = store.decks.map(deck => `
    <option value="${deck.id}">${deck.title} (${deck.cards.length} cards)</option>
  `).join('');
}

function startStudyForDeck(deckId) {
  const deck = store.decks.find(d => d.id === deckId);
  if (!deck || deck.cards.length === 0) {
    showToast('This deck has no flashcards yet.');
    return;
  }

  activeSession = {
    deckId: deck.id,
    deckTitle: deck.title,
    cards: [...deck.cards],
    currentIndex: 0,
    isFlipped: false,
    reviewedCount: 0,
    xpEarned: 0
  };

  showView('study');

  document.getElementById('study-select-screen').style.display = 'none';
  document.getElementById('study-summary-screen').style.display = 'none';
  document.getElementById('study-stage-screen').style.display = 'block';

  renderCurrentCard();
}

function renderCurrentCard() {
  const card = activeSession.cards[activeSession.currentIndex];
  if (!card) {
    finishStudySession();
    return;
  }

  activeSession.isFlipped = false;
  const flashcardEl = document.getElementById('active-flashcard');
  flashcardEl.classList.remove('is-flipped');

  document.getElementById('study-current-deck-name').textContent = activeSession.deckTitle;
  document.getElementById('study-card-counter').textContent = `Card ${activeSession.currentIndex + 1} of ${activeSession.cards.length}`;

  const pct = ((activeSession.currentIndex) / activeSession.cards.length) * 100;
  document.getElementById('study-progress-bar').style.width = `${pct}%`;

  document.getElementById('card-question-text').textContent = card.question;
  document.getElementById('card-answer-text').textContent = card.answer;

  const inputEl = document.getElementById('recall-answer-input');
  inputEl.value = '';
  inputEl.focus();

  const banner = document.getElementById('similarity-result-banner');
  banner.style.display = 'none';
}

function flipCard() {
  activeSession.isFlipped = !activeSession.isFlipped;
  const flashcardEl = document.getElementById('active-flashcard');
  if (activeSession.isFlipped) {
    flashcardEl.classList.add('is-flipped');
  } else {
    flashcardEl.classList.remove('is-flipped');
  }
}

function checkCurrentAnswer() {
  const card = activeSession.cards[activeSession.currentIndex];
  if (!card) return;

  const input = document.getElementById('recall-answer-input').value;
  const evalResult = evaluateSimilarity(input, card.answer);

  const banner = document.getElementById('similarity-result-banner');
  const title = document.getElementById('similarity-result-title');
  const detail = document.getElementById('similarity-result-detail');

  banner.className = `similarity-banner ${evalResult.status}`;
  banner.style.display = 'flex';

  if (evalResult.status === 'correct') {
    title.textContent = 'Correct!';
    detail.textContent = evalResult.message;
    sound.correct();
    if (!activeSession.isFlipped) flipCard();
  } else if (evalResult.status === 'close') {
    title.textContent = 'Close Answer';
    detail.textContent = evalResult.message;
    sound.close();
    if (!activeSession.isFlipped) flipCard();
  } else {
    title.textContent = 'Incorrect';
    detail.textContent = evalResult.message;
    sound.wrong();
  }
}

function rateCard(xp) {
  activeSession.reviewedCount += 1;
  activeSession.xpEarned += xp;

  addPetXp(xp);

  activeSession.currentIndex += 1;
  if (activeSession.currentIndex < activeSession.cards.length) {
    renderCurrentCard();
  } else {
    finishStudySession();
  }
}

function finishStudySession() {
  document.getElementById('study-stage-screen').style.display = 'none';
  const summaryScreen = document.getElementById('study-summary-screen');
  summaryScreen.style.display = 'flex';

  document.getElementById('summary-cards-count').textContent = activeSession.reviewedCount;
  document.getElementById('summary-xp-earned').textContent = `+${activeSession.xpEarned}`;
  document.getElementById('summary-treats-earned').textContent = '+1';

  store.recordStudyCompletion();
  sound.levelUp();
}

// Updates pet levels, treats, and evolution displays.

function addPetXp(amount) {
  const pet = store.getActivePet();
  pet.xp += amount;
  const xpNeeded = pet.level * 100;

  if (pet.xp >= xpNeeded && pet.level < 25) {
    pet.level += 1;
    pet.xp -= xpNeeded;
    showToast(`Level Up! ${pet.name} reached Level ${pet.level}!`);
    sound.levelUp();
  }
  store.save();
}

function feedActivePet() {
  if (store.treats <= 0) {
    showToast('No treats available! Complete flashcard study sessions to earn more.');
    return;
  }

  store.treats -= 1;
  addPetXp(25);
  renderPets();
  sound.correct();
  showToast('Fed 1 treat! +25 Companion XP');
}

function renderPets() {
  const pet = store.getActivePet();
  document.getElementById('pet-treats-count').textContent = store.treats;

  let currentTierIndex = 0;
  if (pet.level >= 20) currentTierIndex = 4;
  else if (pet.level >= 15) currentTierIndex = 3;
  else if (pet.level >= 10) currentTierIndex = 2;
  else if (pet.level >= 5) currentTierIndex = 1;

  document.getElementById('pet-hero-avatar').innerHTML = renderPetSvg(pet.type, currentTierIndex);
  document.getElementById('pet-hero-name').textContent = pet.name;
  document.getElementById('pet-hero-stage').textContent = `Stage ${currentTierIndex + 1}: ${pet.stages[currentTierIndex]}`;
  document.getElementById('pet-hero-level').textContent = `Level ${pet.level}`;

  const xpNeeded = pet.level * 100;
  document.getElementById('pet-hero-xp-label').textContent = `${pet.xp} / ${xpNeeded} XP`;
  const xpPct = Math.min(100, Math.round((pet.xp / xpNeeded) * 100));
  document.getElementById('pet-hero-xp-bar').style.width = `${xpPct}%`;

  const stageMilestones = [1, 5, 10, 15, 20];
  const trackEl = document.getElementById('pet-evolutions-track');

  trackEl.innerHTML = pet.stages.map((stageName, idx) => {
    const isUnlocked = pet.level >= stageMilestones[idx];
    return `
      <div class="evolution-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="evolution-sprite-slot">
          ${renderPetSvg(pet.type, idx)}
        </div>
        <div class="evolution-name">${isUnlocked ? stageName : '???'}</div>
        <div class="evolution-badge">
          ${isUnlocked ? 'Unlocked' : `Unlocks at Lv ${stageMilestones[idx]}`}
        </div>
      </div>
    `;
  }).join('');

  const selectorEl = document.getElementById('pet-selector-grid');
  selectorEl.innerHTML = store.pets.map(p => {
    const isActive = p.id === store.activePetId;
    return `
      <div class="pet-select-card ${isActive ? 'active' : ''}" data-pet-id="${p.id}">
        <div style="width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
          ${renderPetSvg(p.type, 0)}
        </div>
        <div>
          <div style="font-weight:700; font-size:0.9rem;">${p.name}</div>
          <div class="metadata-line">
            <span>Level ${p.level}</span>
            <span class="metadata-separator">·</span>
            <span style="text-transform: capitalize;">${p.type}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  selectorEl.querySelectorAll('.pet-select-card').forEach(card => {
    card.addEventListener('click', () => {
      store.activePetId = card.getAttribute('data-pet-id');
      store.save();
      renderPets();
    });
  });
}

// Creates and saves decks from the editor form.

function openCreateDeckModal() {
  document.getElementById('modal-deck-title').textContent = 'Create New Deck';
  document.getElementById('edit-deck-id').value = '';
  document.getElementById('deck-input-title').value = '';
  document.getElementById('deck-input-desc').value = '';

  const cardsContainer = document.getElementById('cards-editor-container');
  cardsContainer.innerHTML = '';
  addCardEditorRow('', '');
  addCardEditorRow('', '');

  document.getElementById('modal-deck').classList.add('open');
  closeMobileDrawer();
}

function openEditDeckModal(deckId) {
  const deck = store.decks.find(d => d.id === deckId);
  if (!deck) return;

  document.getElementById('modal-deck-title').textContent = 'Edit Deck';
  document.getElementById('edit-deck-id').value = deck.id;
  document.getElementById('deck-input-title').value = deck.title;
  document.getElementById('deck-input-desc').value = deck.description || '';

  const cardsContainer = document.getElementById('cards-editor-container');
  cardsContainer.innerHTML = '';
  deck.cards.forEach(c => addCardEditorRow(c.question, c.answer));

  document.getElementById('modal-deck').classList.add('open');
}

function addCardEditorRow(q = '', a = '') {
  const container = document.getElementById('cards-editor-container');
  const row = document.createElement('div');
  row.className = 'card-edit-row';
  row.innerHTML = `
    <input type="text" class="text-input card-edit-q" placeholder="Question prompt" value="${q.replace(/"/g, '&quot;')}" required />
    <input type="text" class="text-input card-edit-a" placeholder="Expected answer" value="${a.replace(/"/g, '&quot;')}" required />
    <button type="button" class="action-icon-btn btn-remove-card-row" title="Remove" style="width:36px; height:36px;">✕</button>
  `;
  row.querySelector('.btn-remove-card-row').addEventListener('click', () => {
    row.remove();
    updateEditorCount();
  });
  container.appendChild(row);
  updateEditorCount();
}

function updateEditorCount() {
  const count = document.querySelectorAll('.card-edit-row').length;
  document.getElementById('editor-card-count').textContent = count;
}

function saveDeckFromModal(e) {
  e.preventDefault();
  const deckId = document.getElementById('edit-deck-id').value;
  const title = document.getElementById('deck-input-title').value.trim();
  const description = document.getElementById('deck-input-desc').value.trim();

  const cards = [];
  document.querySelectorAll('.card-edit-row').forEach((row, i) => {
    const q = row.querySelector('.card-edit-q').value.trim();
    const a = row.querySelector('.card-edit-a').value.trim();
    if (q && a) {
      cards.push({ id: `c_${Date.now()}_${i}`, question: q, answer: a });
    }
  });

  if (cards.length === 0) {
    showToast('Please add at least one card.');
    return;
  }

  if (deckId) {
    const existing = store.decks.find(d => d.id === deckId);
    if (existing) {
      existing.title = title;
      existing.description = description;
      existing.cards = cards;
    }
  } else {
    store.decks.push({
      id: `deck_${Date.now()}`,
      title,
      description,
      isTutorial: false,
      cards,
      createdAt: Date.now(),
      lastStudied: null
    });
  }

  store.save();
  document.getElementById('modal-deck').classList.remove('open');
  showToast('Deck saved successfully!');
  renderVault();
  renderLanding();
}

// Confirms deletion and removes the selected deck.

let targetDeleteDeckId = null;

function openDeleteDeckModal(deckId) {
  const deck = store.decks.find(d => d.id === deckId);
  if (!deck) return;

  targetDeleteDeckId = deckId;
  document.getElementById('delete-deck-target-name').textContent = `"${deck.title}" (${deck.cards.length} cards)`;
  document.getElementById('modal-delete').classList.add('open');
}

function confirmDeleteDeck() {
  if (!targetDeleteDeckId) return;

  store.decks = store.decks.filter(d => d.id !== targetDeleteDeckId);
  store.save();
  document.getElementById('modal-delete').classList.remove('open');
  showToast('Deck and all associated cards removed.');
  renderVault();
  renderLanding();
}

// Exports app data to JSON or restores it from a backup.

function exportBackup() {
  const backupData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    decks: store.decks,
    pets: store.pets,
    activePetId: store.activePetId,
    treats: store.treats,
    streak: store.streak
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vault-flashcards-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup file downloaded successfully.');
}

function importBackup(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data.decks)) {
        store.decks = data.decks;
        if (Array.isArray(data.pets)) store.pets = data.pets;
        if (data.activePetId) store.activePetId = data.activePetId;
        if (typeof data.treats === 'number') store.treats = data.treats;
        if (data.streak) store.streak = data.streak;

        store.save();
        renderVault();
        renderLanding();
        renderPets();
        showToast('Backup imported successfully!');
      } else {
        showToast('Invalid backup file format.');
      }
    } catch (err) {
      showToast('Could not read backup file.');
    }
  };
  reader.readAsText(file);
}

// Connects page controls to their actions after the document loads.

document.addEventListener('DOMContentLoaded', () => {
  // Connect desktop and mobile navigation to each screen.
  document.getElementById('nav-landing').addEventListener('click', () => showView('landing'));
  document.getElementById('nav-vault').addEventListener('click', () => showView('vault'));
  document.getElementById('nav-study').addEventListener('click', () => showView('study'));
  document.getElementById('nav-pets').addEventListener('click', () => showView('pets'));
  document.getElementById('btn-brand').addEventListener('click', (e) => { e.preventDefault(); showView('landing'); });

  document.getElementById('btn-mobile-menu-toggle').addEventListener('click', toggleMobileDrawer);
  document.getElementById('mob-nav-landing').addEventListener('click', () => showView('landing'));
  document.getElementById('mob-nav-vault').addEventListener('click', () => showView('vault'));
  document.getElementById('mob-nav-study').addEventListener('click', () => showView('study'));
  document.getElementById('mob-nav-pets').addEventListener('click', () => showView('pets'));
  document.getElementById('btn-create-deck-mobile').addEventListener('click', openCreateDeckModal);

  // Wire the main buttons to study and deck creation.
  document.getElementById('btn-hero-study').addEventListener('click', () => showView('study'));
  document.getElementById('btn-hero-create').addEventListener('click', openCreateDeckModal);
  document.getElementById('btn-create-deck-top').addEventListener('click', openCreateDeckModal);
  document.getElementById('btn-create-deck-vault').addEventListener('click', openCreateDeckModal);

  // Keep the sound button in sync with the saved setting.
  const soundBtn = document.getElementById('btn-sound-toggle');
  const soundOnIcon = document.getElementById('icon-sound-on');
  const soundOffIcon = document.getElementById('icon-sound-off');

  function updateSoundUI() {
    if (store.soundEnabled) {
      soundBtn.classList.add('active');
      soundOnIcon.style.display = 'block';
      soundOffIcon.style.display = 'none';
    } else {
      soundBtn.classList.remove('active');
      soundOnIcon.style.display = 'none';
      soundOffIcon.style.display = 'block';
    }
  }
  updateSoundUI();

  soundBtn.addEventListener('click', () => {
    store.soundEnabled = !store.soundEnabled;
    store.save();
    updateSoundUI();
    if (store.soundEnabled) sound.playTone(523.25, 'sine', 0.2);
  });

  // Connect backup export and import controls.
  document.getElementById('btn-export-backup').addEventListener('click', exportBackup);
  const fileInput = document.getElementById('input-file-import');
  document.getElementById('btn-import-backup').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', importBackup);

  // Refresh the deck list as the search changes.
  document.getElementById('deck-search-input')?.addEventListener('input', renderVault);

  // Start a session with the selected deck.
  document.getElementById('btn-start-study-session').addEventListener('click', () => {
    const picker = document.getElementById('study-deck-picker');
    if (picker.value) startStudyForDeck(picker.value);
  });

  // Flip cards and submit answers by button or keyboard.
  const flashcardEl = document.getElementById('active-flashcard');
  flashcardEl.addEventListener('click', flipCard);
  document.getElementById('btn-flip-card').addEventListener('click', flipCard);

  document.addEventListener('keydown', (e) => {
    const studyActive = document.getElementById('view-study').classList.contains('active');
    const stageActive = document.getElementById('study-stage-screen').style.display !== 'none';
    if (studyActive && stageActive && e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      flipCard();
    }
  });

  document.getElementById('btn-check-answer').addEventListener('click', checkCurrentAnswer);
  document.getElementById('recall-answer-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkCurrentAnswer();
    }
  });

  // Award experience based on each card rating.
  document.getElementById('btn-rate-hard').addEventListener('click', () => rateCard(5));
  document.getElementById('btn-rate-good').addEventListener('click', () => rateCard(15));
  document.getElementById('btn-rate-easy').addEventListener('click', () => rateCard(25));

  // Return to the deck list or open the pet screen.
  document.getElementById('btn-exit-study').addEventListener('click', () => showView('vault'));
  document.getElementById('btn-summary-continue').addEventListener('click', () => showView('vault'));
  document.getElementById('btn-summary-pets').addEventListener('click', () => showView('pets'));

  // Feed the active pet.
  document.getElementById('btn-feed-pet').addEventListener('click', feedActivePet);

  // Add cards, save the deck, or close the editor.
  document.getElementById('btn-add-card-row').addEventListener('click', () => addCardEditorRow());
  document.getElementById('form-deck-builder').addEventListener('submit', saveDeckFromModal);
  document.getElementById('btn-close-deck-modal').addEventListener('click', () => {
    document.getElementById('modal-deck').classList.remove('open');
  });
  document.getElementById('btn-cancel-deck').addEventListener('click', () => {
    document.getElementById('modal-deck').classList.remove('open');
  });

  // Close the dialog or confirm deck deletion.
  document.getElementById('btn-close-delete-modal').addEventListener('click', () => {
    document.getElementById('modal-delete').classList.remove('open');
  });
  document.getElementById('btn-cancel-delete').addEventListener('click', () => {
    document.getElementById('modal-delete').classList.remove('open');
  });
  document.getElementById('btn-confirm-delete').addEventListener('click', confirmDeleteDeck);

  renderLanding();
});
