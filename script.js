/**
 * TOXICITY DETECTOR - MODERN JAVASCRIPT
 * Professional relationship assessment tool with premium UX
 */

// ==============================================
// CONFIGURATION & CONSTANTS
// ==============================================

/**
 * Enhanced question bank with sophisticated scoring
 */
const QUESTIONS = [
  { text: "I feel genuinely respected when expressing my thoughts and opinions", weight: -3 },
  { text: "Communication often involves harsh criticism, insults, or belittling", weight: 3 },
  { text: "I frequently worry about my partner's emotional reactions", weight: 3 },
  { text: "We have productive conversations about our feelings and needs", weight: -3 },
  { text: "Jealousy creates tension and restricts personal freedom", weight: 3 },
  { text: "We maintain complete trust and emotional safety with each other", weight: -3 },
  { text: "I feel pressured to fundamentally change aspects of my personality", weight: 3 },
  { text: "Disagreements are resolved through calm, respectful dialogue", weight: -3 },
  { text: "Personal boundaries are frequently crossed or dismissed", weight: 3 },
  { text: "I feel genuinely supported in pursuing my personal goals", weight: -3 },
  { text: "Threats, ultimatums, or manipulation tactics are sometimes used", weight: 3 },
  { text: "We actively celebrate and encourage each other's achievements", weight: -3 },
  { text: "I feel comfortable being my authentic self in this relationship", weight: -2 },
  { text: "There are attempts to control social connections or activities", weight: 3 },
  { text: "We maintain healthy independence while staying emotionally connected", weight: -2 }
];

/**
 * Response options with nuanced scoring
 */
const RESPONSE_OPTIONS = [
  { text: "Never true", value: 0 },
  { text: "Rarely true", value: 1 },
  { text: "Sometimes true", value: 2 },
  { text: "Often true", value: 3 },
  { text: "Always true", value: 4 }
];

/**
 * Sophisticated assessment levels
 */
const ASSESSMENT_LEVELS = {
  EXCELLENT: {
    threshold: 0,
    maxThreshold: 20,
    title: "Excellent Relationship Health",
    color: "#22c55e",
    icon: "💚",
    description: "Your relationship demonstrates exceptional emotional health, communication, and mutual respect.",
    advice: [
      "Continue nurturing open communication",
      "Maintain the strong foundation you've built",
      "Consider sharing these positive patterns with others"
    ]
  },
  GOOD: {
    threshold: 21,
    maxThreshold: 35,
    title: "Good Relationship Health",
    color: "#16a34a",
    icon: "✅",
    description: "Your relationship shows strong healthy patterns with minor areas for growth.",
    advice: [
      "Address small concerns before they grow",
      "Continue strengthening communication skills",
      "Celebrate what's working well"
    ]
  },
  MODERATE: {
    threshold: 36,
    maxThreshold: 55,
    title: "Moderate Concerns",
    color: "#f59e0b",
    icon: "⚠️",
    description: "Some relationship patterns may benefit from attention and improvement.",
    advice: [
      "Focus on improving communication patterns",
      "Consider couples counseling for guidance",
      "Set clearer boundaries together"
    ]
  },
  CONCERNING: {
    threshold: 56,
    maxThreshold: 75,
    title: "Significant Concerns",
    color: "#ef4444",
    icon: "🚨",
    description: "Your relationship shows patterns that may be impacting your wellbeing.",
    advice: [
      "Seek professional counseling support",
      "Prioritize your personal safety and wellbeing",
      "Consider involving trusted friends or family"
    ]
  },
  CRITICAL: {
    threshold: 76,
    maxThreshold: 100,
    title: "Critical Safety Concerns",
    color: "#dc2626",
    icon: "🆘",
    description: "This assessment indicates patterns that may pose risks to your wellbeing and safety.",
    advice: [
      "Contact professional support immediately",
      "Reach out to domestic violence resources",
      "Prioritize your safety above all else",
      "Contact National Domestic Violence Hotline: 1-800-799-7233"
    ]
  }
};

// ==============================================
// APPLICATION STATE
// ==============================================

class AssessmentApp {
  constructor() {
    this.responses = new Map();
    this.currentQuestion = 0;
    this.isSubmitted = false;
    this.animationQueue = [];
    
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.renderQuestions();
    this.attachEventListeners();
    this.updateProgressIndicator();
    this.setupThemeToggle();
    this.setupAccessibility();
    console.log('🎉 Assessment application initialized');
  }

  /**
   * Render all questions with modern styling
   */
  renderQuestions() {
    const quizContainer = document.getElementById('quiz');
    quizContainer.innerHTML = '';

    QUESTIONS.forEach((question, index) => {
      const questionCard = this.createQuestionCard(question, index);
      quizContainer.appendChild(questionCard);
    });
  }

  /**
   * Create a modern question card component
   */
  createQuestionCard(question, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-card';
    questionDiv.setAttribute('data-question-index', index);
    
    questionDiv.innerHTML = `
      <h3 class="question-title">
        <span class="text-cyan-400 font-mono text-sm">${String(index + 1).padStart(2, '0')}.</span>
        ${question.text}
      </h3>
      <div class="radio-group" role="radiogroup" aria-labelledby="question-${index}">
        ${RESPONSE_OPTIONS.map((option, optionIndex) => `
          <label class="radio-option group" for="q${index}_${optionIndex}">
            <input 
              type="radio" 
              id="q${index}_${optionIndex}" 
              name="question${index}" 
              value="${option.value}"
              data-question="${index}"
              data-weight="${question.weight}"
            >
            <div class="radio-custom"></div>
            <span class="radio-label">${option.text}</span>
          </label>
        `).join('')}
      </div>
    `;

    return questionDiv;
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Radio button responses
    document.addEventListener('change', (e) => {
      if (e.target.type === 'radio') {
        this.handleResponse(e.target);
      }
    });

    // Submit button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Clear button
    const clearBtn = document.getElementById('clearBtn');
    clearBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleClear();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
  }

  /**
   * Handle individual question responses
   */
  handleResponse(radioInput) {
    const questionIndex = parseInt(radioInput.dataset.question);
    const value = parseInt(radioInput.value);
    const weight = parseFloat(radioInput.dataset.weight);

    this.responses.set(questionIndex, { value, weight });
    
    // Visual feedback
    this.animateQuestionResponse(radioInput.closest('.question-card'));
    
    // Update progress
    this.updateProgressIndicator();
    
    // Enable submit when all questions answered
    this.updateSubmitButton();

    console.log(`Question ${questionIndex + 1} answered:`, { value, weight });
  }

  /**
   * Animate question response with modern effects
   */
  animateQuestionResponse(questionCard) {
    questionCard.style.transform = 'scale(1.02)';
    questionCard.style.borderColor = 'rgba(6, 182, 212, 0.3)';
    
    setTimeout(() => {
      questionCard.style.transform = '';
      questionCard.style.borderColor = '';
    }, 200);
  }

  /**
   * Update progress indicator
   */
  updateProgressIndicator() {
    const progress = (this.responses.size / QUESTIONS.length) * 100;
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${this.responses.size} of ${QUESTIONS.length} questions`;
    }
  }

  /**
   * Update submit button state
   */
  updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const allAnswered = this.responses.size === QUESTIONS.length;
    
    if (submitBtn) {
      submitBtn.disabled = !allAnswered;
      
      if (allAnswered) {
        submitBtn.classList.add('animate-pulse');
        setTimeout(() => submitBtn.classList.remove('animate-pulse'), 2000);
      }
    }
  }

  /**
   * Handle form submission with sophisticated calculations
   */
  async handleSubmit() {
    if (this.responses.size !== QUESTIONS.length) {
      this.showErrorMessage('Please answer all questions before submitting.');
      return;
    }

    this.isSubmitted = true;
    this.showLoadingState();

    // Simulate processing time for better UX
    await this.delay(1500);

    const results = this.calculateResults();
    this.displayResults(results);
    this.scrollToResults();
  }

  /**
   * Advanced scoring algorithm
   */
  calculateResults() {
    let rawScore = 0;
    let maxPossibleScore = 0;

    // Calculate weighted score
    for (const [questionIndex, response] of this.responses.entries()) {
      const question = QUESTIONS[questionIndex];
      const weightedScore = response.value * Math.abs(response.weight);
      
      if (question.weight > 0) {
        // Positive weight = toxic behavior
        rawScore += weightedScore;
      } else {
        // Negative weight = healthy behavior (subtract from toxicity)
        rawScore -= weightedScore;
      }
      
      maxPossibleScore += 4 * Math.abs(question.weight);
    }

    // Normalize to 0-100 scale
    const normalizedScore = Math.max(0, Math.min(100, 
      ((rawScore + maxPossibleScore) / (2 * maxPossibleScore)) * 100
    ));

    // Determine assessment level
    const level = this.getAssessmentLevel(normalizedScore);

    return {
      score: Math.round(normalizedScore),
      level,
      responses: this.responses.size,
      timestamp: new Date()
    };
  }

  /**
   * Get assessment level based on score
   */
  getAssessmentLevel(score) {
    for (const [key, level] of Object.entries(ASSESSMENT_LEVELS)) {
      if (score >= level.threshold && score <= level.maxThreshold) {
        return level;
      }
    }
    return ASSESSMENT_LEVELS.EXCELLENT;
  }

  /**
   * Display results with beautiful animations
   */
  displayResults(results) {
    const resultSection = document.getElementById('result');
    const percentElement = document.getElementById('percent');
    const barElement = document.getElementById('bar');
    const adviceElement = document.getElementById('advice');

    if (!resultSection) return;

    // Update result content
    if (percentElement) {
      percentElement.textContent = `${results.score}%`;
      percentElement.style.color = results.level.color;
    }

    if (adviceElement) {
      adviceElement.innerHTML = this.createAdviceHTML(results.level);
    }

    // Animate progress bar
    if (barElement) {
      barElement.style.background = `linear-gradient(90deg, ${results.level.color}, ${results.level.color}dd)`;
      
      // Animate to score
      setTimeout(() => {
        barElement.style.width = `${results.score}%`;
      }, 100);
    }

    // Show results with animation
    resultSection.classList.remove('hidden');
    resultSection.classList.add('animate-slide-up');
    
    this.hideLoadingState();
    
    // Track analytics (if implemented)
    this.trackAssessmentCompletion(results);
  }

  /**
   * Create rich advice HTML
   */
  createAdviceHTML(level) {
    return `
      <div class="result-content">
        <div class="flex items-center justify-center mb-6">
          <div class="text-4xl mr-3">${level.icon}</div>
          <h3 class="text-2xl font-bold text-white">${level.title}</h3>
        </div>
        
        <p class="text-gray-300 text-center mb-6 text-lg leading-relaxed">
          ${level.description}
        </p>
        
        <div class="bg-white/5 rounded-xl p-6 border border-white/10">
          <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Recommended Actions
          </h4>
          <ul class="space-y-3">
            ${level.advice.map(item => `
              <li class="flex items-start text-gray-300">
                <svg class="w-5 h-5 mr-3 mt-0.5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                ${item}
              </li>
            `).join('')}
          </ul>
        </div>
        
        ${level.threshold >= 56 ? `
          <div class="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p class="text-red-300 text-sm text-center">
              <strong>Important:</strong> If you're in immediate danger, please contact emergency services or the National Domestic Violence Hotline at <a href="tel:18007997233" class="text-red-200 underline">1-800-799-7233</a>
            </p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Handle form reset
   */
  handleClear() {
    // Confirm action
    if (this.responses.size > 0) {
      const confirmed = confirm('Are you sure you want to clear all responses? This action cannot be undone.');
      if (!confirmed) return;
    }

    // Reset state
    this.responses.clear();
    this.isSubmitted = false;
    
    // Clear form
    document.querySelectorAll('input[type="radio"]').forEach(input => {
      input.checked = false;
    });
    
    // Hide results
    const resultSection = document.getElementById('result');
    if (resultSection) {
      resultSection.classList.add('hidden');
    }
    
    // Reset progress
    this.updateProgressIndicator();
    this.updateSubmitButton();
    
    // Visual feedback
    this.showSuccessMessage('Form cleared successfully!');
    
    // Scroll to top
    document.querySelector('main').scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Setup theme toggle functionality
   */
  setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update button text/icon if needed
      this.updateThemeToggleButton(newTheme);
    });
  }

  /**
   * Update theme toggle button
   */
  updateThemeToggleButton(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('svg');
      if (icon && theme === 'light') {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`;
      }
    }
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Keyboard navigation for radio groups
    document.addEventListener('keydown', (e) => {
      if (e.target.type === 'radio') {
        const questionGroup = e.target.closest('.radio-group');
        const radios = questionGroup.querySelectorAll('input[type="radio"]');
        let currentIndex = Array.from(radios).indexOf(e.target);

        switch(e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault();
            currentIndex = (currentIndex + 1) % radios.length;
            radios[currentIndex].focus();
            radios[currentIndex].click();
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault();
            currentIndex = currentIndex === 0 ? radios.length - 1 : currentIndex - 1;
            radios[currentIndex].focus();
            radios[currentIndex].click();
            break;
        }
      }
    });
  }

  /**
   * Utility methods
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  scrollToResults() {
    const resultSection = document.getElementById('result');
    if (resultSection) {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  showLoadingState() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }
  }

  hideLoadingState() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.classList.remove('loading');
    }
  }

  showErrorMessage(message) {
    // You could implement a toast notification system here
    alert(message);
  }

  showSuccessMessage(message) {
    // You could implement a toast notification system here
    console.log('✅', message);
  }

  trackAssessmentCompletion(results) {
    // Analytics tracking could go here
    console.log('📊 Assessment completed:', results);
  }

  handleKeyboardNavigation(e) {
    // Add global keyboard shortcuts if needed
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'Enter':
          if (!this.isSubmitted) {
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn && !submitBtn.disabled) {
              this.handleSubmit();
            }
          }
          break;
        case 'Backspace':
          if (e.shiftKey) {
            this.handleClear();
          }
          break;
      }
    }
  }
}

// ==============================================
// APPLICATION INITIALIZATION
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the application
  window.assessmentApp = new AssessmentApp();
  
  // Setup global error handling
  window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
  });
  
  console.log('🚀 Toxicity Detector loaded successfully');
});
