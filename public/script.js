/**
 * TOXICITY DETECTOR - ENHANCED JAVASCRIPT 2.0
 * 
 * This application helps users assess relationship toxicity through a questionnaire.
 * Features include dynamic question rendering, score calculation, visual feedback,
 * detailed categorized analysis, personalized suggestions, and accessibility enhancements.
 */

// ==============================================
// CONFIGURATION & CONSTANTS
// ==============================================

/**
 * Question bank with weights for scoring algorithm and categories
 * Positive weights indicate toxic behaviors, negative weights indicate healthy behaviors
 * Each question is categorized for detailed breakdown analysis
 */
const QUESTIONS = [
  { 
    text: "I feel respected when expressing my opinions.", 
    weight: -2,
    category: "respect" 
  },
  { 
    text: "We often insult or belittle each other.", 
    weight: 2,
    category: "respect" 
  },
  { 
    text: "I am afraid of my partner's reactions.", 
    weight: 2,
    category: "safety" 
  },
  { 
    text: "We communicate openly and honestly.", 
    weight: -2,
    category: "communication" 
  },
  { 
    text: "Jealousy is a frequent issue between us.", 
    weight: 2,
    category: "boundaries" 
  },
  { 
    text: "We trust each other completely.", 
    weight: -2,
    category: "boundaries" 
  },
  { 
    text: "I feel pressured to change who I am.", 
    weight: 2,
    category: "respect" 
  },
  { 
    text: "Conflicts are resolved calmly and fairly.", 
    weight: -2,
    category: "communication" 
  },
  { 
    text: "Personal boundaries are ignored.", 
    weight: 2,
    category: "boundaries" 
  },
  { 
    text: "I feel supported in my goals and dreams.", 
    weight: -2,
    category: "respect" 
  },
  { 
    text: "Threats or ultimatums are used.", 
    weight: 2,
    category: "safety" 
  },
  { 
    text: "We celebrate each other's successes.", 
    weight: -2,
    category: "communication" 
  }
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
  HEALTHY: { 
    threshold: 25, 
    class: 'result-healthy', 
    advice: "Healthy dynamics! Your relationship shows signs of mutual respect and good communication.",
    title: "Healthy Relationship Dynamics",
    cardClass: "healthy"
  },
  MANAGEABLE: { 
    threshold: 50, 
    class: 'result-manageable', 
    advice: "Manageable issues detected. Some concerning patterns may need attention.",
    title: "Manageable Relationship Concerns",
    cardClass: "manageable"
  },
  CONCERNING: { 
    threshold: 75, 
    class: 'result-concerning', 
    advice: "Concerning patterns detected. Setting clear boundaries may help improve your relationship.",
    title: "Concerning Relationship Patterns",
    cardClass: "concerning"
  },
  TOXIC: { 
    threshold: 100, 
    class: 'result-toxic', 
    advice: "High toxicity detected! These patterns suggest serious issues that may require professional help.",
    title: "Significant Toxicity Detected",
    cardClass: "toxic"
  }
};

/**
 * Detailed advice for each category and toxicity level
 */
const DETAILED_ADVICE = {
  communication: {
    healthy: [
      "You have excellent communication patterns. Keep expressing yourself openly.",
      "Your ability to discuss issues calmly contributes to relationship health.",
      "Continue to maintain honest and clear dialogue with your partner."
    ],
    manageable: [
      "Try setting aside dedicated time for important conversations without distractions.",
      "Practice active listening by repeating back what your partner says to ensure understanding.",
      "Consider using 'I' statements instead of accusatory language."
    ],
    concerning: [
      "Communication breakdowns appear frequent. Consider learning conflict resolution techniques.",
      "Try establishing ground rules for discussions, like no interrupting or name-calling.",
      "Take breaks during heated conversations before they escalate."
    ],
    toxic: [
      "Seek professional guidance to establish healthier communication patterns.",
      "Consider whether silent treatment or verbal aggression has become normalized.",
      "Learn to recognize and address communication red flags."
    ]
  },
  
  boundaries: {
    healthy: [
      "You respect each other's boundaries well. This is a strong foundation.",
      "Continue to check in with each other about comfort levels and expectations.",
      "Your mutual respect for personal space and autonomy is healthy."
    ],
    manageable: [
      "Have an explicit conversation about personal boundaries and expectations.",
      "Practice saying no when needed, without feeling guilty.",
      "Remember that healthy boundaries enhance intimacy, not reduce it."
    ],
    concerning: [
      "Your boundaries appear frequently crossed. Start reinforcing them consistently.",
      "Consider whether jealousy or control issues are impacting your autonomy.",
      "Reflect on whether you feel comfortable expressing your needs."
    ],
    toxic: [
      "Significant boundary violations may be occurring. Prioritize your safety and wellbeing.",
      "Seek support from trusted friends, family, or professionals.",
      "Consider whether controlling behaviors have escalated over time."
    ]
  },
  
  respect: {
    healthy: [
      "Mutual respect is evident in your relationship. This is crucial for long-term health.",
      "Continue validating each other's perspectives and feelings.",
      "Your supportive attitudes toward each other's growth is positive."
    ],
    manageable: [
      "Notice when criticism becomes personal rather than focused on specific behaviors.",
      "Practice showing appreciation for each other daily.",
      "Consider whether you're supporting each other's individual goals."
    ],
    concerning: [
      "Disrespect appears to be a recurring issue. Address this directly.",
      "Be mindful of contempt or belittling behaviors creeping into interactions.",
      "Reflect on whether you feel valued and respected in the relationship."
    ],
    toxic: [
      "Persistent disrespect indicates a serious relationship problem.",
      "Consider whether emotional or verbal abuse has become normalized.",
      "Remember that respect is non-negotiable in healthy relationships."
    ]
  },
  
  safety: {
    healthy: [
      "You feel emotionally and physically safe with your partner. This is fundamental.",
      "Continue fostering an environment where vulnerability is welcomed.",
      "Your relationship provides security and stability."
    ],
    manageable: [
      "Address small incidents of feeling unsafe before they grow.",
      "Discuss triggers that make either of you feel threatened or anxious.",
      "Establish clear agreements about what behaviors are unacceptable."
    ],
    concerning: [
      "Feeling unsafe is a serious warning sign. Take this seriously.",
      "Consider whether fear of your partner's reactions guides your behavior.",
      "Document instances where you feel threatened or manipulated."
    ],
    toxic: [
      "Your safety may be at risk. Consider reaching out to a domestic violence hotline.",
      "Prioritize your physical and emotional wellbeing above the relationship.",
      "Develop a safety plan if you feel threatened in any way."
    ]
  }
};

/**
 * Resources for different toxicity levels
 */
const RESOURCES = {
  healthy: [
    {
      title: "Relationship Check-ups",
      link: "https://www.gottman.com/",
      description: "Regular relationship maintenance resources"
    },
    {
      title: "Love Languages Quiz",
      link: "https://www.5lovelanguages.com/",
      description: "Understand how you express and receive love"
    },
    {
      title: "Mindful Communication",
      link: "https://www.mindful.org/communication/",
      description: "Enhance already strong communication"
    }
  ],
  
  manageable: [
    {
      title: "Couples Communication Exercises",
      link: "https://www.therapistaid.com/therapy-worksheets/communication/none",
      description: "Practical worksheets for better communication"
    },
    {
      title: "Setting Healthy Boundaries",
      link: "https://psychcentral.com/lib/10-way-to-build-and-preserve-better-boundaries",
      description: "Learn to establish and maintain boundaries"
    },
    {
      title: "Relationship Check-In Questions",
      link: "https://www.gottman.com/blog/category/column/relationship-maintenance/",
      description: "Regular check-in practices for couples"
    }
  ],
  
  concerning: [
    {
      title: "Find a Couples Therapist",
      link: "https://www.psychologytoday.com/us/therapists/couples-counseling",
      description: "Professional support for relationship issues"
    },
    {
      title: "Recognizing Unhealthy Patterns",
      link: "https://www.thehotline.org/resources/healthy-relationships/",
      description: "Learn to identify concerning behaviors"
    },
    {
      title: "Self-Care During Relationship Stress",
      link: "https://www.verywellmind.com/self-care-strategies-overall-stress-reduction-3144729",
      description: "Taking care of yourself during difficult times"
    }
  ],
  
  toxic: [
    {
      title: "National Domestic Violence Hotline",
      link: "https://www.thehotline.org/",
      description: "24/7 support for relationship abuse"
    },
    {
      title: "Safety Planning Resources",
      link: "https://www.loveisrespect.org/personal-safety/create-a-safety-plan/",
      description: "Creating a plan for your safety"
    },
    {
      title: "Find Support Groups",
      link: "https://www.supportgroupscentral.com/groups_detail.cfm?cid=18",
      description: "Connect with others who understand"
    },
    {
      title: "Trauma-Informed Therapy",
      link: "https://www.psychologytoday.com/us/therapists/trauma-and-ptsd",
      description: "Professional support for trauma recovery"
    }
  ]
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
  
  // Category breakdown elements
  categoryBreakdown: null,
  communicationBar: null,
  communicationPercent: null,
  boundariesBar: null,
  boundariesPercent: null,
  respectBar: null,
  respectPercent: null,
  safetyBar: null,
  safetyPercent: null,
  
  // Detailed advice elements
  detailedAdvice: null,
  adviceTitle: null,
  adviceSummary: null,
  advicePoints: null,
  saveResultsBtn: null,
  shareResultsBtn: null,
  
  // Resources section
  resourcesSection: null,
  resourcesList: null,
  
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
    
    // Category breakdown elements
    this.categoryBreakdown = document.getElementById("category-breakdown");
    this.communicationBar = document.getElementById("communication-bar");
    this.communicationPercent = document.getElementById("communication-percent");
    this.boundariesBar = document.getElementById("boundaries-bar");
    this.boundariesPercent = document.getElementById("boundaries-percent");
    this.respectBar = document.getElementById("respect-bar");
    this.respectPercent = document.getElementById("respect-percent");
    this.safetyBar = document.getElementById("safety-bar");
    this.safetyPercent = document.getElementById("safety-percent");
    
    // Detailed advice elements
    this.detailedAdvice = document.getElementById("detailed-advice");
    this.adviceTitle = document.getElementById("advice-title");
    this.adviceSummary = document.getElementById("advice-summary");
    this.advicePoints = document.getElementById("advice-points");
    this.saveResultsBtn = document.getElementById("save-results");
    this.shareResultsBtn = document.getElementById("share-results");
    
    // Resources section
    this.resourcesSection = document.getElementById("resources-section");
    this.resourcesList = document.querySelector(".resources-list");
    
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
      <span class="text-white font-medium">Analyzing your responses...</span>
      <span class="sr-only">Please wait while we analyze your relationship dynamics</span>
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
   * @param {Object} question - Question object with text, weight and category
   * @param {number} index - Question index
   * @returns {HTMLElement} - Complete question element
   */
  createQuestionElement(question, index) {
    // Create question wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "space-y-3";
    wrapper.setAttribute("role", "group");
    wrapper.setAttribute("aria-labelledby", `question-${index}`);
    wrapper.dataset.category = question.category;
    
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
    radio.dataset.questionIndex = questionIndex;
    
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
   * @returns {Object} - Score data including percentage, level, and category breakdowns
   */
  calculateScore(formData) {
    let rawScore = 0;
    let minPossibleScore = 0;
    let maxPossibleScore = 0;
    
    // Category scores
    const categoryScores = {
      communication: { raw: 0, min: 0, max: 0 },
      boundaries: { raw: 0, min: 0, max: 0 },
      respect: { raw: 0, min: 0, max: 0 },
      safety: { raw: 0, min: 0, max: 0 }
    };
    
    // Actual responses for personalized advice
    const responses = {};
    
    // Process each question response
    QUESTIONS.forEach((question, index) => {
      const likertValue = parseInt(formData.get(`q${index}`));
      const mappedValue = likertValue - 3; // Convert 1-5 scale to -2 to +2
      const category = question.category;
      
      // Store the response
      responses[index] = {
        question: question.text,
        response: likertValue,
        mappedValue,
        category,
        weight: question.weight,
        impact: mappedValue * question.weight
      };
      
      // Add to overall score
      rawScore += mappedValue * question.weight;
      minPossibleScore += -2 * Math.abs(question.weight);
      maxPossibleScore += 2 * Math.abs(question.weight);
      
      // Add to category score
      categoryScores[category].raw += mappedValue * question.weight;
      categoryScores[category].min += -2 * Math.abs(question.weight);
      categoryScores[category].max += 2 * Math.abs(question.weight);
    });
    
    // Normalize overall score to percentage (0-100)
    const percentage = this.normalizeScore(rawScore, minPossibleScore, maxPossibleScore);
    
    // Calculate category percentages
    const categoryPercentages = {};
    for (const category in categoryScores) {
      const { raw, min, max } = categoryScores[category];
      categoryPercentages[category] = this.normalizeScore(raw, min, max);
    }
    
    // Determine toxicity level
    const level = this.getToxicityLevel(percentage);
    
    // Identify concerning areas
    const concerningAreas = this.identifyConcerningAreas(responses, categoryPercentages);
    
    // Identify strengths
    const strengths = this.identifyStrengths(responses, categoryPercentages);
    
    return {
      percentage,
      level,
      categoryPercentages,
      responses,
      concerningAreas,
      strengths,
      rawScore,
      minPossibleScore,
      maxPossibleScore
    };
  },
  
  /**
   * Normalize a score to a percentage between 0-100
   * @param {number} raw - Raw score
   * @param {number} min - Minimum possible score
   * @param {number} max - Maximum possible score
   * @returns {number} - Normalized percentage
   */
  normalizeScore(raw, min, max) {
    const percentage = Math.round(
      ((raw - min) / (max - min)) * 100
    );
    return Math.max(0, Math.min(100, percentage)); // Clamp to 0-100
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
      return TOXICITY_LEVELS.TOXIC;
    }
  },
  
  /**
   * Identify areas of concern based on responses
   * @param {Object} responses - User responses
   * @param {Object} categoryPercentages - Category percentages
   * @returns {Array} - List of concerning areas
   */
  identifyConcerningAreas(responses, categoryPercentages) {
    const concerningAreas = [];
    
    // Add categories with high toxicity
    for (const category in categoryPercentages) {
      const percentage = categoryPercentages[category];
      if (percentage >= 50) {
        concerningAreas.push({
          type: "category",
          category,
          percentage
        });
      }
    }
    
    // Add individual highly concerning responses
    Object.values(responses).forEach(response => {
      // Check for strongly agreeing with toxic statements or strongly disagreeing with healthy statements
      if ((response.weight > 0 && response.response >= 4) || 
          (response.weight < 0 && response.response <= 2)) {
        concerningAreas.push({
          type: "response",
          question: response.question,
          response: response.response,
          category: response.category,
          impact: Math.abs(response.impact)
        });
      }
    });
    
    // Sort by impact/percentage
    return concerningAreas.sort((a, b) => {
      if (a.type === "category" && b.type === "category") {
        return b.percentage - a.percentage;
      } else if (a.type === "response" && b.type === "response") {
        return b.impact - a.impact;
      } else {
        return a.type === "category" ? -1 : 1;
      }
    });
  },
  
  /**
   * Identify relationship strengths based on responses
   * @param {Object} responses - User responses
   * @param {Object} categoryPercentages - Category percentages
   * @returns {Array} - List of strengths
   */
  identifyStrengths(responses, categoryPercentages) {
    const strengths = [];
    
    // Add categories with low toxicity
    for (const category in categoryPercentages) {
      const percentage = categoryPercentages[category];
      if (percentage < 30) {
        strengths.push({
          type: "category",
          category,
          percentage
        });
      }
    }
    
    // Add individual positive responses
    Object.values(responses).forEach(response => {
      // Check for strongly agreeing with healthy statements or strongly disagreeing with toxic statements
      if ((response.weight < 0 && response.response >= 4) || 
          (response.weight > 0 && response.response <= 2)) {
        strengths.push({
          type: "response",
          question: response.question,
          response: response.response,
          category: response.category,
          impact: Math.abs(response.impact)
        });
      }
    });
    
    // Sort by impact/percentage
    return strengths.sort((a, b) => {
      if (a.type === "category" && b.type === "category") {
        return a.percentage - b.percentage;
      } else if (a.type === "response" && b.type === "response") {
        return b.impact - a.impact;
      } else {
        return a.type === "category" ? -1 : 1;
      }
    }).slice(0, 4); // Limit to top 4 strengths
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
    this.announceToScreenReader("Analyzing your relationship dynamics, please wait...");
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
    const { percentage, level, categoryPercentages, concerningAreas, strengths } = scoreData;
    
    // Update progress bar
    DOM.progressBar.style.width = `${percentage}%`;
    DOM.progressBar.setAttribute("aria-valuenow", percentage);
    
    // Update text content
    DOM.percentElement.textContent = `${percentage}% Toxicity`;
    DOM.percentElement.className = `text-3xl font-bold neon ${level.class}`;
    
    DOM.adviceElement.textContent = level.advice;
    DOM.adviceElement.className = `mt-2 text-gray-200`;
    
    // Update category breakdown
    this.updateCategoryBreakdown(categoryPercentages);
    
    // Update detailed advice
    this.updateDetailedAdvice(level, concerningAreas, strengths, scoreData);
    
    // Update resources
    this.updateResources(level);
    
    // Show results section
    DOM.resultSection.classList.remove("hidden");
    DOM.resultSection.setAttribute("aria-live", "polite");
    
    // Add visual feedback based on toxicity level
    this.addVisualFeedback(percentage);
    
    // Announce results to screen readers
    this.announceToScreenReader(
      `Assessment complete. Toxicity score: ${percentage} percent. ${level.advice}`
    );
    
    // Scroll to results
    setTimeout(() => {
      DOM.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  },
  
  /**
   * Update category breakdown section
   * @param {Object} categoryPercentages - Percentages for each category
   */
  updateCategoryBreakdown(categoryPercentages) {
    // Update Communication
    DOM.communicationBar.style.width = `${categoryPercentages.communication}%`;
    DOM.communicationPercent.textContent = `${categoryPercentages.communication}%`;
    
    // Update Boundaries
    DOM.boundariesBar.style.width = `${categoryPercentages.boundaries}%`;
    DOM.boundariesPercent.textContent = `${categoryPercentages.boundaries}%`;
    
    // Update Respect
    DOM.respectBar.style.width = `${categoryPercentages.respect}%`;
    DOM.respectPercent.textContent = `${categoryPercentages.respect}%`;
    
    // Update Safety
    DOM.safetyBar.style.width = `${categoryPercentages.safety}%`;
    DOM.safetyPercent.textContent = `${categoryPercentages.safety}%`;
  },
  
  /**
   * Update detailed advice section
   * @param {Object} level - Toxicity level
   * @param {Array} concerningAreas - Areas of concern
   * @param {Array} strengths - Relationship strengths
   * @param {Object} scoreData - All score data
   */
  updateDetailedAdvice(level, concerningAreas, strengths, scoreData) {
    // Update card class
    DOM.detailedAdvice.className = `advice-card ${level.cardClass}`;
    
    // Update title and summary
    DOM.adviceTitle.textContent = level.title;
    DOM.adviceSummary.textContent = level.advice;
    
    // Clear previous advice points
    DOM.advicePoints.innerHTML = '';
    
    // Determine advice level for each category
    const adviceLevels = {};
    const categories = ['communication', 'boundaries', 'respect', 'safety'];
    
    categories.forEach(category => {
      const percentage = scoreData.categoryPercentages[category];
      let adviceLevel;
      
      if (percentage < 25) adviceLevel = 'healthy';
      else if (percentage < 50) adviceLevel = 'manageable';
      else if (percentage < 75) adviceLevel = 'concerning';
      else adviceLevel = 'toxic';
      
      adviceLevels[category] = adviceLevel;
    });
    
    // Add strengths section
    if (strengths.length > 0) {
      const strengthsHeader = document.createElement('h4');
      strengthsHeader.className = 'font-semibold mt-4 mb-2';
      strengthsHeader.textContent = 'Relationship Strengths';
      DOM.advicePoints.appendChild(strengthsHeader);
      
      // Add top strengths
      strengths.slice(0, 3).forEach(strength => {
        const point = this.createAdvicePoint('✓', 'var(--color-healthy)', this.getStrengthText(strength));
        DOM.advicePoints.appendChild(point);
      });
    }
    
    // Add specific advice for concerning areas
    if (concerningAreas.length > 0) {
      const concerningHeader = document.createElement('h4');
      concerningHeader.className = 'font-semibold mt-4 mb-2';
      concerningHeader.textContent = 'Areas to Address';
      DOM.advicePoints.appendChild(concerningHeader);
      
      // Add most concerning areas first
      const topConcerns = concerningAreas.filter(area => area.type === 'category')
                                          .slice(0, 2);
                                          
      // Generate advice for top categories
      topConcerns.forEach(concern => {
        const category = concern.category;
        const adviceLevel = adviceLevels[category];
        
        // Get random advice from this category and level
        const adviceList = DETAILED_ADVICE[category][adviceLevel];
        adviceList.forEach(advice => {
          const point = this.createAdvicePoint('!', this.getCategoryColor(category), advice);
          DOM.advicePoints.appendChild(point);
        });
      });
    }
    
    // Set up action buttons
    this.setupActionButtons(level);
  },
  
  /**
   * Create an advice point element
   * @param {string} icon - Icon character
   * @param {string} color - Icon background color
   * @param {string} text - Advice text
   * @returns {HTMLElement} - Advice point element
   */
  createAdvicePoint(icon, color, text) {
    const point = document.createElement('div');
    point.className = 'advice-point';
    
    const iconElement = document.createElement('div');
    iconElement.className = 'advice-point-icon';
    iconElement.textContent = icon;
    iconElement.style.backgroundColor = color;
    
    const textElement = document.createElement('div');
    textElement.className = 'advice-point-text';
    textElement.textContent = text;
    
    point.appendChild(iconElement);
    point.appendChild(textElement);
    
    return point;
  },
  
  /**
   * Get text description for a strength
   * @param {Object} strength - Strength object
   * @returns {string} - Descriptive text
   */
  getStrengthText(strength) {
    if (strength.type === 'category') {
      const category = strength.category.charAt(0).toUpperCase() + strength.category.slice(1);
      return `Strong ${category}: Your relationship shows healthy patterns in this area.`;
    } else {
      return strength.question;
    }
  },
  
  /**
   * Get color for a category
   * @param {string} category - Category name
   * @returns {string} - CSS color
   */
  getCategoryColor(category) {
    switch(category) {
      case 'communication': return '#2781ff';
      case 'boundaries': return '#ff38f5';
      case 'respect': return '#21e6c1';
      case 'safety': return '#9c27b0';
      default: return 'var(--accent-teal)';
    }
  },
  
  /**
   * Set up action buttons for results
   * @param {Object} level - Toxicity level
   */
  setupActionButtons(level) {
    // Save results button
    DOM.saveResultsBtn.addEventListener('click', () => {
      this.saveResults();
    });
    
    // Share results button
    DOM.shareResultsBtn.addEventListener('click', () => {
      this.shareResults();
    });
  },
  
  /**
   * Save results to PDF or image
   */
  saveResults() {
    alert('This feature will allow you to save your results as a PDF or image for future reference.');
    // Implementation would use a library like html2canvas or jsPDF
  },
  
  /**
   * Share results via email or social media
   */
  shareResults() {
    alert('This feature will allow you to share your results with a professional or trusted person.');
    // Implementation would use Web Share API or custom sharing functionality
  },
  
  /**
   * Update resources section based on toxicity level
   * @param {Object} level - Toxicity level
   */
  updateResources(level) {
    // Clear previous resources
    DOM.resourcesList.innerHTML = '';
    
    // Determine which resources to show based on level
    let resourceLevel = 'healthy';
    if (level === TOXICITY_LEVELS.TOXIC) {
      resourceLevel = 'toxic';
    } else if (level === TOXICITY_LEVELS.CONCERNING) {
      resourceLevel = 'concerning';
    } else if (level === TOXICITY_LEVELS.MANAGEABLE) {
      resourceLevel = 'manageable';
    }
    
    // Add resources
    RESOURCES[resourceLevel].forEach(resource => {
      const item = document.createElement('div');
      item.className = 'resource-item';
      
      const link = document.createElement('a');
      link.href = resource.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = resource.title;
      
      const description = document.createElement('p');
      description.textContent = resource.description;
      
      item.appendChild(link);
      item.appendChild(description);
      
      DOM.resourcesList.appendChild(item);
    });
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
   * Get the number of questions answered
   * @returns {number} - Number of answered questions
   */
  getCompletionCount() {
    const formData = new FormData(DOM.form);
    let count = 0;
    
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (formData.get(`q${i}`)) {
        count++;
      }
    }
    
    return count;
  },
  
  /**
   * Enable or disable submit button based on form completion
   */
  updateSubmitButton() {
    const isComplete = this.isComplete();
    const completionCount = this.getCompletionCount();
    const totalQuestions = QUESTIONS.length;
    
    DOM.submitBtn.disabled = !isComplete;
    
    // Update button appearance for better UX
    if (isComplete) {
      DOM.submitBtn.classList.remove("opacity-50");
      DOM.submitBtn.setAttribute("aria-disabled", "false");
      DOM.submitBtn.textContent = "Calculate Toxicity";
    } else {
      DOM.submitBtn.classList.add("opacity-50");
      DOM.submitBtn.setAttribute("aria-disabled", "true");
      DOM.submitBtn.textContent = `${completionCount}/${totalQuestions} Questions Answered`;
    }
    
    // Update help text
    if (isComplete) {
      document.getElementById("submit-help").textContent = "All questions answered - ready to calculate";
    } else {
      const remaining = totalQuestions - completionCount;
      document.getElementById("submit-help").textContent = `${remaining} question${remaining !== 1 ? 's' : ''} remaining`;
    }
  },
  
  /**
   * Track question focus for better user experience
   */
  trackQuestionFocus() {
    // Highlight currently focused question
    const questionContainers = DOM.form.querySelectorAll('div[role="group"]');
    
    questionContainers.forEach(container => {
      const options = container.querySelectorAll('input[type="radio"]');
      
      options.forEach(option => {
        // Add focus event
        option.addEventListener('focus', () => {
          questionContainers.forEach(c => c.classList.remove('focused-question'));
          container.classList.add('focused-question');
        });
      });
    });
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    
    // Progress tracking for partial completion
    DOM.form.addEventListener("change", (e) => {
      if (e.target.type === "radio") {
        this.trackProgress();
      }
    });
  },
  
  /**
   * Track progress as user completes the form
   */
  trackProgress() {
    // Update the submit button with completion count
    FormManager.updateSubmitButton();
    
    // Add visual feedback for completed sections
    const completedCount = FormManager.getCompletionCount();
    const totalQuestions = QUESTIONS.length;
    const percentComplete = Math.round((completedCount / totalQuestions) * 100);
    
    // Could add a progress indicator here
    if (completedCount === totalQuestions) {
      // All questions answered - show a small celebration
      DOM.submitBtn.classList.add('btn-ready');
    }
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
  },
  
  /**
   * Load any other required libraries
   */
  loadAdditionalLibraries() {
    // Could add more libraries here as needed
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
    
    // Track question focus
    FormManager.trackQuestionFocus();
    
    // Load external libraries
    LibraryLoader.loadConfetti();
    LibraryLoader.loadAdditionalLibraries();
    
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
