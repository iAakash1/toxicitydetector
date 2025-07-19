/**
 * TOXICITY DETECTOR - ENHANCED JAVASCRIPT
 * 
 * This application helps users assess relationship toxicity through a questionnaire.
 * Features include dynamic question rendering, score calculation, visual feedback,
 * and accessibility enhancements.
 */

// ==============================================
// CONFIGURATION & CONSTANTS
// ==============================================

/**
 * Question bank with weights for scoring algorithm
 * Positive weights indicate toxic behaviors, negative weights indicate healthy behaviors
 */
const QUESTIONS = [
  { text: "I feel respected when expressing my opinions.", weight: -2 },
  { text: "We often insult or belittle each other.", weight: 2 },
  { text: "I am afraid of my partner's reactions.", weight: 2 },
  { text: "We communicate openly and honestly.", weight: -2 },
  { text: "Jealousy is a frequent issue between us.", weight: 2 },
  { text: "We trust each other completely.", weight: -2 },
  { text: "I feel pressured to change who I am.", weight: 2 },
  { text: "Conflicts are resolved calmly and fairly.", weight: -2 },
  { text: "Personal boundaries are ignored.", weight: 2 },
  { text: "I feel supported in my goals and dreams.", weight: -2 },
  { text: "Threats or ultimatums are used.", weight: 2 },
  { text: "We celebrate each other's successes.", weight: -2 }
];

/**
 * Likert scale options for responses
 */
const LIKERT_SCALE = [
  "Strongly Disagree",
  "Disagree", 
  "Neutral",
  "Agree",
  "Strongly Agree"
];

/**
 * Toxicity level thresholds and corresponding advice
 */
const TOXICITY_LEVELS = {
  HEALTHY: { threshold: 25, class: 'result-healthy', advice: "Healthy dynamics! Keep communicating openly." },
  MANAGEABLE: { threshold: 50, class: 'result-warning', advice: "Manageable issues. Consider discussing concerns." },
  CONCERNING: { threshold: 75, class: 'result-danger', advice: "Concerning. Setting clear boundaries may help." },
  CRITICAL: { threshold: 100, class: 'result-critical', advice: "High toxicity detected! Seek professional guidance." }
};

// ==============================================
// DOM ELEMENT REFERENCES
// ==============================================

/**
 * Cache DOM elements for better performance and cleaner code
 */
const DOM = {
  form: null,
  submitBtn: null,
  clearBtn: null,
  resultSection: null,
  progressBar: null,
  percentElement: null,
  adviceElement: null,
  themeToggle: null,
  loadingOverlay: null,
  
  // Initialize DOM references
  init() {
    this.form = document.getElementById("quiz");
    this.submitBtn = document.getElementById("submitBtn");
    this.clearBtn = document.getElementById("clearBtn");
    this.resultSection = document.getElementById("result");
    this.progressBar = document.getElementById("bar");
    this.percentElement = document.getElementById("percent");
    this.adviceElement = document.getElementById("advice");
    this.themeToggle = document.getElementById("themeToggle");
    
    // Create loading overlay
    this.createLoadingOverlay();
  },
  
  /**
   * Create accessible loading overlay with spinner and screen reader text
   */
  createLoadingOverlay() {
    this.loadingOverlay = document.createElement("div");
    this.loadingOverlay.className = "loading-overlay hidden";
    this.loadingOverlay.setAttribute("aria-live", "polite");
    this.loadingOverlay.innerHTML = `
      <div class="spinner" aria-hidden="true"></div>
      <span class="text-white font-medium">Calculating toxicity score...</span>
      <span class="sr-only">Please wait while we analyze your responses</span>
    `;
    
    // Add to the main container
    const container = document.querySelector(".glass");
    container.style.position = "relative";
    container.appendChild(this.loadingOverlay);
  }
};

// ==============================================
// QUESTIONNAIRE MANAGEMENT
// ==============================================

/**
 * Questionnaire builder and manager
 */
const Questionnaire = {
  
  /**
   * Build and render the questionnaire form
   */
  build() {
    QUESTIONS.forEach((question, index) => {
      const questionElement = this.createQuestionElement(question, index);
      DOM.form.appendChild(questionElement);
    });
  },
  
  /**
   * Create a single question element with radio buttons
   * @param {Object} question - Question object with text and weight
   * @param {number} index - Question index
   * @returns {HTMLElement} - Complete question element
   */
  createQuestionElement(question, index) {
    // Create question wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "space-y-3";
    wrapper.setAttribute("role", "group");
    wrapper.setAttribute("aria-labelledby", `question-${index}`);
    
    // Create question label
    const label = document.createElement("p");
    label.id = `question-${index}`;
    label.className = "font-medium text-lg";
    label.textContent = `${index + 1}. ${question.text}`;
    wrapper.appendChild(label);
    
    // Create options container
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "grid grid-cols-1 sm:grid-cols-5 gap-2";
    
    // Create radio options
    LIKERT_SCALE.forEach((optionText, optionIndex) => {
      const optionElement = this.createOptionElement(
        optionText, 
        index, 
        optionIndex, 
        `question-${index}`
      );
      optionsContainer.appendChild(optionElement);
    });
    
    wrapper.appendChild(optionsContainer);
    return wrapper;
  },
  
  /**
   * Create a single radio option element
   * @param {string} text - Option text
   * @param {number} questionIndex - Question index
   * @param {number} optionIndex - Option index (0-4)
   * @param {string} ariaDescribedBy - ARIA described by attribute
   * @returns {HTMLElement} - Radio option element
   */
  createOptionElement(text, questionIndex, optionIndex, ariaDescribedBy) {
    const container = document.createElement("div");
    container.className = "relative";
    
    const radioId = `q${questionIndex}_${optionIndex}`;
    
    // Hidden radio input
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `q${questionIndex}`;
    radio.id = radioId;
    radio.value = optionIndex + 1;
    radio.className = "absolute opacity-0";
    radio.setAttribute("aria-describedby", ariaDescribedBy);
    
    // Visible label acting as button
    const label = document.createElement("label");
    label.htmlFor = radioId;
    label.textContent = text;
    label.className = "radio-option block w-full";
    label.setAttribute("tabindex", "0");
    
    // Add keyboard navigation
    label.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    
    container.appendChild(radio);
    container.appendChild(label);
    
    return container;
  }
};

// ==============================================
// SCORE CALCULATION ENGINE
// ==============================================

/**
 * Score calculation and analysis
 */
const ScoreCalculator = {
  
  /**
   * Calculate toxicity score from form responses
   * @param {FormData} formData - Form data containing responses
   * @returns {Object} - Score data including percentage and level
   */
  calculateScore(formData) {
    let rawScore = 0;
    let minPossibleScore = 0;
    let maxPossibleScore = 0;
    
    // Process each question response
    QUESTIONS.forEach((question, index) => {
      const likertValue = parseInt(formData.get(`q${index}`));
      const mappedValue = likertValue - 3; // Convert 1-5 scale to -2 to +2
      
      rawScore += mappedValue * question.weight;
      minPossibleScore += -2 * Math.abs(question.weight);
      maxPossibleScore += 2 * Math.abs(question.weight);
    });
    
    // Normalize to percentage (0-100)
    const percentage = Math.round(
      ((rawScore - minPossibleScore) / (maxPossibleScore - minPossibleScore)) * 100
    );
    
    return {
      percentage: Math.max(0, Math.min(100, percentage)), // Clamp to 0-100
      level: this.getToxicityLevel(percentage),
      rawScore,
      minPossibleScore,
      maxPossibleScore
    };
  },
  
  /**
   * Determine toxicity level based on percentage
   * @param {number} percentage - Toxicity percentage
   * @returns {Object} - Toxicity level object
   */
  getToxicityLevel(percentage) {
    if (percentage < TOXICITY_LEVELS.HEALTHY.threshold) {
      return TOXICITY_LEVELS.HEALTHY;
    } else if (percentage < TOXICITY_LEVELS.MANAGEABLE.threshold) {
      return TOXICITY_LEVELS.MANAGEABLE;
    } else if (percentage < TOXICITY_LEVELS.CONCERNING.threshold) {
      return TOXICITY_LEVELS.CONCERNING;
    } else {
      return TOXICITY_LEVELS.CRITICAL;
    }
  }
};

// ==============================================
// UI FEEDBACK & ANIMATIONS
// ==============================================

/**
 * Visual feedback and animation manager
 */
const UIFeedback = {
  
  /**
   * Display loading state
   */
  showLoading() {
    DOM.loadingOverlay.classList.remove("hidden");
    DOM.submitBtn.disabled = true;
    DOM.clearBtn.disabled = true;
    
    // Announce to screen readers
    this.announceToScreenReader("Calculating your toxicity score, please wait...");
  },
  
  /**
   * Hide loading state
   */
  hideLoading() {
    DOM.loadingOverlay.classList.add("hidden");
    DOM.submitBtn.disabled = false;
    DOM.clearBtn.disabled = false;
  },
  
  /**
   * Display results with visual feedback
   * @param {Object} scoreData - Score calculation results
   */
  displayResults(scoreData) {
    const { percentage, level } = scoreData;
    
    // Update progress bar
    DOM.progressBar.style.width = `${percentage}%`;
    DOM.progressBar.setAttribute("aria-valuenow", percentage);
    
    // Update text content
    DOM.percentElement.textContent = `${percentage}% Toxic`;
    DOM.percentElement.className = `text-3xl font-bold neon ${level.class}`;
    
    DOM.adviceElement.textContent = level.advice;
    DOM.adviceElement.className = `mt-2 ${level.class}`;
    
    // Show results section
    DOM.resultSection.classList.remove("hidden");
    DOM.resultSection.setAttribute("aria-live", "polite");
    
    // Add visual feedback based on toxicity level
    this.addVisualFeedback(percentage);
    
    // Announce results to screen readers
    this.announceToScreenReader(
      `Assessment complete. Toxicity score: ${percentage} percent. ${level.advice}`
    );
  },
  
  /**
   * Add visual feedback animations based on score
   * @param {number} percentage - Toxicity percentage
   */
  addVisualFeedback(percentage) {
    const container = document.querySelector(".glass");
    
    if (percentage < TOXICITY_LEVELS.HEALTHY.threshold) {
      // Launch celebratory confetti for healthy relationships
      this.launchConfetti();
    } else if (percentage >= TOXICITY_LEVELS.CONCERNING.threshold) {
      // Add shake animation for high toxicity
      container.classList.add("animate-shake");
      setTimeout(() => {
        container.classList.remove("animate-shake");
      }, 600);
    }
  },
  
  /**
   * Launch confetti animation for positive results
   */
  launchConfetti() {
    // Check if confetti library is available
    if (typeof confetti === 'undefined') {
      console.warn('Confetti library not loaded');
      return;
    }
    
    const duration = 3000; // 3 seconds
    const end = Date.now() + duration;
    const colors = ["#21e6c1", "#2781ff", "#ff38f5"];
    
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  },
  
  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }
};

// ==============================================
// FORM VALIDATION & MANAGEMENT
// ==============================================

/**
 * Form state management and validation
 */
const FormManager = {
  
  /**
   * Check if all questions have been answered
   * @returns {boolean} - Whether all questions are answered
   */
  isComplete() {
    const formData = new FormData(DOM.form);
    
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (!formData.get(`q${i}`)) {
        return false;
      }
    }
    return true;
  },
  
  /**
   * Enable or disable submit button based on form completion
   */
  updateSubmitButton() {
    DOM.submitBtn.disabled = !this.isComplete();
    
    // Update button appearance for better UX
    if (this.isComplete()) {
      DOM.submitBtn.classList.remove("opacity-50");
      DOM.submitBtn.setAttribute("aria-disabled", "false");
    } else {
      DOM.submitBtn.classList.add("opacity-50");
      DOM.submitBtn.setAttribute("aria-disabled", "true");
    }
  },
  
  /**
   * Clear all form responses
   */
  clearForm() {
    // Clear all radio buttons
    const radios = DOM.form.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
      radio.checked = false;
    });
    
    // Hide results
    DOM.resultSection.classList.add("hidden");
    
    // Reset submit button
    this.updateSubmitButton();
    
    // Announce to screen readers
    UIFeedback.announceToScreenReader("Form cleared. Please answer all questions to get your toxicity assessment.");
    
    // Focus first question for better UX
    const firstRadio = DOM.form.querySelector('input[type="radio"]');
    if (firstRadio) {
      firstRadio.focus();
    }
  },
  
  /**
   * Handle form submission with loading state
   */
  async handleSubmit() {
    if (!this.isComplete()) {
      UIFeedback.announceToScreenReader("Please answer all questions before submitting.");
      return;
    }
    
    // Show loading state
    UIFeedback.showLoading();
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get form data and calculate score
      const formData = new FormData(DOM.form);
      const scoreData = ScoreCalculator.calculateScore(formData);
      
      // Display results
      UIFeedback.displayResults(scoreData);
      
    } catch (error) {
      console.error('Error processing assessment:', error);
      UIFeedback.announceToScreenReader("An error occurred while processing your assessment. Please try again.");
    } finally {
      // Hide loading state
      UIFeedback.hideLoading();
    }
  }
};

// ==============================================
// THEME MANAGEMENT
// ==============================================

/**
 * Theme switching functionality
 */
const ThemeManager = {
  
  /**
   * Toggle between light and dark themes
   */
  toggle() {
    const html = document.documentElement;
    const isCurrentlyDark = html.classList.contains("dark");
    
    if (isCurrentlyDark) {
      // Switch to light theme
      html.classList.remove("dark");
      html.dataset.theme = "light";
      this.updateToggleText("Switch to Dark Mode");
      UIFeedback.announceToScreenReader("Switched to light theme");
    } else {
      // Switch to dark theme
      html.classList.add("dark");
      delete html.dataset.theme;
      this.updateToggleText("Switch to Light Mode");
      UIFeedback.announceToScreenReader("Switched to dark theme");
    }
    
    // Save preference
    localStorage.setItem('theme', isCurrentlyDark ? 'light' : 'dark');
  },
  
  /**
   * Update toggle button text
   * @param {string} text - New button text
   */
  updateToggleText(text) {
    DOM.themeToggle.textContent = text;
  },
  
  /**
   * Initialize theme based on user preference or system preference
   */
  init() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    const html = document.documentElement;
    
    if (shouldUseDark) {
      html.classList.add("dark");
      this.updateToggleText("Switch to Light Mode");
    } else {
      html.dataset.theme = "light";
      this.updateToggleText("Switch to Dark Mode");
    }
  }
};

// ==============================================
// EVENT LISTENERS
// ==============================================

/**
 * Set up all event listeners
 */
const EventManager = {
  
  init() {
    // Form change events for validation
    DOM.form.addEventListener("change", () => {
      FormManager.updateSubmitButton();
    });
    
    // Submit button click
    DOM.submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      FormManager.handleSubmit();
    });
    
    // Clear button click
    DOM.clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      FormManager.clearForm();
    });
    
    // Theme toggle
    DOM.themeToggle.addEventListener("click", (e) => {
      e.preventDefault();
      ThemeManager.toggle();
    });
    
    // Keyboard navigation for theme toggle
    DOM.themeToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        ThemeManager.toggle();
      }
    });
  }
};

// ==============================================
// EXTERNAL LIBRARY LOADER
// ==============================================

/**
 * Load external libraries
 */
const LibraryLoader = {
  
  /**
   * Load confetti library for celebrations
   */
  loadConfetti() {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.async = true;
    script.onerror = () => {
      console.warn('Failed to load confetti library');
    };
    document.head.appendChild(script);
  }
};

// ==============================================
// APPLICATION INITIALIZATION
// ==============================================

/**
 * Initialize the entire application
 */
function initializeApp() {
  try {
    // Initialize DOM references
    DOM.init();
    
    // Build questionnaire
    Questionnaire.build();
    
    // Initialize theme
    ThemeManager.init();
    
    // Set up event listeners
    EventManager.init();
    
    // Load external libraries
    LibraryLoader.loadConfetti();
    
    // Initialize form state
    FormManager.updateSubmitButton();
    
    console.log('Toxicity Detector application initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Show error message to user
    const errorMessage = document.createElement('div');
    errorMessage.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-50';
    errorMessage.textContent = 'Application failed to load. Please refresh the page.';
    document.body.appendChild(errorMessage);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
      if (document.body.contains(errorMessage)) {
        document.body.removeChild(errorMessage);
      }
    }, 5000);
  }
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
