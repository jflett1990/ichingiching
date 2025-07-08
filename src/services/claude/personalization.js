/**
 * Personalization Engine
 * Analyzes user questions and context to provide tailored interpretations
 */

export class PersonalizationEngine {
  constructor() {
    this.themes = {
      'relationships': ['love', 'partner', 'relationship', 'dating', 'marriage', 'family', 'friend', 'social'],
      'career': ['job', 'work', 'career', 'business', 'professional', 'promotion', 'salary', 'colleague'],
      'health': ['health', 'illness', 'wellness', 'medical', 'recovery', 'fitness', 'energy', 'healing'],
      'finances': ['money', 'financial', 'investment', 'income', 'spending', 'budget', 'wealth', 'debt'],
      'personal_growth': ['growth', 'development', 'learning', 'change', 'transformation', 'spiritual', 'wisdom'],
      'creativity': ['creative', 'art', 'writing', 'music', 'innovation', 'expression', 'inspiration'],
      'travel': ['travel', 'journey', 'move', 'relocation', 'adventure', 'exploration'],
      'education': ['study', 'learning', 'school', 'university', 'education', 'knowledge', 'skill'],
      'decision_making': ['decision', 'choice', 'option', 'should', 'whether', 'path', 'direction'],
      'timing': ['when', 'time', 'timing', 'now', 'future', 'ready', 'wait', 'patience']
    };

    this.guidanceTypes = {
      'understanding': ['understand', 'why', 'meaning', 'explain', 'insight', 'clarity'],
      'decision': ['should', 'choose', 'decide', 'option', 'path', 'direction'],
      'action': ['do', 'act', 'approach', 'handle', 'deal', 'manage'],
      'timing': ['when', 'time', 'timing', 'now', 'ready', 'wait'],
      'validation': ['right', 'correct', 'good', 'bad', 'wise', 'foolish']
    };

    this.emotionalContext = {
      'anxious': ['worried', 'anxious', 'stressed', 'nervous', 'concerned', 'fearful'],
      'confused': ['confused', 'lost', 'uncertain', 'unclear', 'puzzled', 'mixed'],
      'excited': ['excited', 'eager', 'enthusiastic', 'hopeful', 'optimistic'],
      'frustrated': ['frustrated', 'stuck', 'blocked', 'disappointed', 'annoyed'],
      'curious': ['curious', 'interested', 'wondering', 'exploring', 'seeking']
    };
  }

  /**
   * Analyze user question for themes, guidance type, and emotional context
   */
  analyzeQuestion(question) {
    const normalizedQuestion = question.toLowerCase();
    
    return {
      theme: this.identifyTheme(normalizedQuestion),
      guidanceType: this.identifyGuidanceType(normalizedQuestion),
      emotionalContext: this.identifyEmotionalContext(normalizedQuestion),
      complexity: this.assessComplexity(normalizedQuestion),
      specificity: this.assessSpecificity(normalizedQuestion),
      urgency: this.assessUrgency(normalizedQuestion),
      lifeArea: this.identifyLifeArea(normalizedQuestion)
    };
  }

  /**
   * Identify the primary theme of the question
   */
  identifyTheme(question) {
    const themeScores = {};
    
    for (const [theme, keywords] of Object.entries(this.themes)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (question.includes(keyword)) {
          score += 1;
        }
      });
      themeScores[theme] = score;
    }
    
    const maxScore = Math.max(...Object.values(themeScores));
    if (maxScore === 0) return 'general';
    
    return Object.keys(themeScores).find(theme => themeScores[theme] === maxScore);
  }

  /**
   * Identify the type of guidance being sought
   */
  identifyGuidanceType(question) {
    const guidanceScores = {};
    
    for (const [type, keywords] of Object.entries(this.guidanceTypes)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (question.includes(keyword)) {
          score += 1;
        }
      });
      guidanceScores[type] = score;
    }
    
    const maxScore = Math.max(...Object.values(guidanceScores));
    if (maxScore === 0) return 'understanding';
    
    return Object.keys(guidanceScores).find(type => guidanceScores[type] === maxScore);
  }

  /**
   * Identify emotional context from question
   */
  identifyEmotionalContext(question) {
    const emotionalScores = {};
    
    for (const [emotion, keywords] of Object.entries(this.emotionalContext)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (question.includes(keyword)) {
          score += 1;
        }
      });
      emotionalScores[emotion] = score;
    }
    
    const maxScore = Math.max(...Object.values(emotionalScores));
    if (maxScore === 0) return 'neutral';
    
    return Object.keys(emotionalScores).find(emotion => emotionalScores[emotion] === maxScore);
  }

  /**
   * Assess question complexity
   */
  assessComplexity(question) {
    const indicators = {
      high: ['multiple', 'several', 'both', 'either', 'complex', 'complicated', 'difficult'],
      low: ['simple', 'just', 'only', 'basic', 'straightforward']
    };
    
    let highScore = 0;
    let lowScore = 0;
    
    indicators.high.forEach(indicator => {
      if (question.includes(indicator)) highScore++;
    });
    
    indicators.low.forEach(indicator => {
      if (question.includes(indicator)) lowScore++;
    });
    
    if (highScore > lowScore) return 'high';
    if (lowScore > highScore) return 'low';
    return 'medium';
  }

  /**
   * Assess question specificity
   */
  assessSpecificity(question) {
    const specificIndicators = ['specific', 'particular', 'exact', 'precise', 'detailed'];
    const vagueIndicators = ['general', 'overall', 'broad', 'vague', 'unclear'];
    
    let specificScore = 0;
    let vagueScore = 0;
    
    specificIndicators.forEach(indicator => {
      if (question.includes(indicator)) specificScore++;
    });
    
    vagueIndicators.forEach(indicator => {
      if (question.includes(indicator)) vagueScore++;
    });
    
    // Also consider question length and structure
    const wordCount = question.split(' ').length;
    if (wordCount > 20) specificScore++;
    if (wordCount < 8) vagueScore++;
    
    if (specificScore > vagueScore) return 'high';
    if (vagueScore > specificScore) return 'low';
    return 'medium';
  }

  /**
   * Assess urgency from question
   */
  assessUrgency(question) {
    const urgentIndicators = ['urgent', 'immediate', 'now', 'quickly', 'soon', 'emergency', 'crisis'];
    const patientIndicators = ['patient', 'wait', 'eventually', 'sometime', 'future', 'when ready'];
    
    let urgentScore = 0;
    let patientScore = 0;
    
    urgentIndicators.forEach(indicator => {
      if (question.includes(indicator)) urgentScore++;
    });
    
    patientIndicators.forEach(indicator => {
      if (question.includes(indicator)) patientScore++;
    });
    
    if (urgentScore > patientScore) return 'high';
    if (patientScore > urgentScore) return 'low';
    return 'medium';
  }

  /**
   * Identify primary life area
   */
  identifyLifeArea(question) {
    const lifeAreas = {
      'personal': ['personal', 'myself', 'self', 'individual', 'own'],
      'professional': ['professional', 'work', 'career', 'job', 'business'],
      'interpersonal': ['relationship', 'social', 'friend', 'family', 'partner'],
      'spiritual': ['spiritual', 'soul', 'divine', 'sacred', 'meditation'],
      'practical': ['practical', 'daily', 'routine', 'everyday', 'normal']
    };
    
    const areaScores = {};
    
    for (const [area, keywords] of Object.entries(lifeAreas)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (question.includes(keyword)) {
          score += 1;
        }
      });
      areaScores[area] = score;
    }
    
    const maxScore = Math.max(...Object.values(areaScores));
    if (maxScore === 0) return 'personal';
    
    return Object.keys(areaScores).find(area => areaScores[area] === maxScore);
  }

  /**
   * Generate personalized context for Claude prompt
   */
  generatePersonalizedContext(questionAnalysis, userProfile = {}) {
    const context = {
      theme: questionAnalysis.theme,
      guidanceType: questionAnalysis.guidanceType,
      emotionalContext: questionAnalysis.emotionalContext,
      lifeArea: questionAnalysis.lifeArea,
      complexity: questionAnalysis.complexity,
      specificity: questionAnalysis.specificity,
      urgency: questionAnalysis.urgency,
      experienceLevel: userProfile.experienceLevel || 'intermediate',
      preferredStyle: userProfile.preferredStyle || 'balanced',
      culturalContext: userProfile.culturalContext || 'western'
    };

    // Add specific guidance based on analysis
    context.recommendedApproach = this.getRecommendedApproach(questionAnalysis);
    context.focusAreas = this.getFocusAreas(questionAnalysis);
    context.cautionAreas = this.getCautionAreas(questionAnalysis);

    return context;
  }

  /**
   * Get recommended interpretation approach
   */
  getRecommendedApproach(analysis) {
    const approaches = [];
    
    if (analysis.emotionalContext === 'anxious') {
      approaches.push('reassuring_and_grounding');
    }
    
    if (analysis.guidanceType === 'decision') {
      approaches.push('decision_framework');
    }
    
    if (analysis.complexity === 'high') {
      approaches.push('step_by_step_breakdown');
    }
    
    if (analysis.urgency === 'high') {
      approaches.push('immediate_practical_steps');
    }
    
    return approaches.length > 0 ? approaches : ['balanced_interpretation'];
  }

  /**
   * Get focus areas based on analysis
   */
  getFocusAreas(analysis) {
    const focusAreas = [analysis.theme];
    
    if (analysis.guidanceType === 'timing') {
      focusAreas.push('temporal_aspects');
    }
    
    if (analysis.emotionalContext !== 'neutral') {
      focusAreas.push('emotional_guidance');
    }
    
    if (analysis.specificity === 'high') {
      focusAreas.push('detailed_application');
    }
    
    return focusAreas;
  }

  /**
   * Get caution areas based on analysis
   */
  getCautionAreas(analysis) {
    const cautionAreas = [];
    
    if (analysis.guidanceType === 'validation') {
      cautionAreas.push('avoid_direct_validation');
    }
    
    if (analysis.emotionalContext === 'anxious') {
      cautionAreas.push('avoid_alarming_language');
    }
    
    if (analysis.urgency === 'high') {
      cautionAreas.push('emphasize_thoughtful_action');
    }
    
    return cautionAreas;
  }

  /**
   * Analyze user's interaction history for better personalization
   */
  analyzeUserHistory(readingHistory) {
    if (!readingHistory || readingHistory.length === 0) {
      return {
        primaryThemes: ['general'],
        preferredGuidanceType: 'understanding',
        complexity: 'medium',
        engagement: 'standard'
      };
    }

    const themes = readingHistory.map(reading => 
      this.identifyTheme(reading.question.toLowerCase())
    );
    
    const guidanceTypes = readingHistory.map(reading => 
      this.identifyGuidanceType(reading.question.toLowerCase())
    );

    return {
      primaryThemes: this.getMostCommon(themes, 3),
      preferredGuidanceType: this.getMostCommon(guidanceTypes, 1)[0],
      complexity: this.getAverageComplexity(readingHistory),
      engagement: this.assessEngagement(readingHistory),
      patterns: this.identifyPatterns(readingHistory)
    };
  }

  /**
   * Get most common items from array
   */
  getMostCommon(array, count) {
    const frequency = {};
    array.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
      .map(([item]) => item);
  }

  /**
   * Get average complexity from reading history
   */
  getAverageComplexity(readingHistory) {
    const complexities = readingHistory.map(reading => 
      this.assessComplexity(reading.question.toLowerCase())
    );
    
    const complexityScores = {
      'low': 1,
      'medium': 2,
      'high': 3
    };
    
    const average = complexities.reduce((sum, complexity) => 
      sum + complexityScores[complexity], 0
    ) / complexities.length;
    
    if (average < 1.5) return 'low';
    if (average > 2.5) return 'high';
    return 'medium';
  }

  /**
   * Assess user engagement level
   */
  assessEngagement(readingHistory) {
    const recentReadings = readingHistory.slice(-10);
    const followUpCount = recentReadings.filter(reading => 
      reading.followUps && reading.followUps.length > 0
    ).length;
    
    if (followUpCount > 5) return 'high';
    if (followUpCount > 2) return 'medium';
    return 'low';
  }

  /**
   * Identify patterns in user's reading history
   */
  identifyPatterns(readingHistory) {
    const patterns = {};
    
    // Time-based patterns
    const timePattern = this.analyzeTimePatterns(readingHistory);
    if (timePattern) patterns.timePattern = timePattern;
    
    // Theme evolution
    const themeEvolution = this.analyzeThemeEvolution(readingHistory);
    if (themeEvolution) patterns.themeEvolution = themeEvolution;
    
    // Recurring concerns
    const recurringConcerns = this.identifyRecurringConcerns(readingHistory);
    if (recurringConcerns) patterns.recurringConcerns = recurringConcerns;
    
    return patterns;
  }

  /**
   * Analyze time-based patterns
   */
  analyzeTimePatterns(readingHistory) {
    // Implementation would analyze reading frequency, timing, etc.
    return null; // Placeholder
  }

  /**
   * Analyze theme evolution
   */
  analyzeThemeEvolution(readingHistory) {
    // Implementation would track how themes change over time
    return null; // Placeholder
  }

  /**
   * Identify recurring concerns
   */
  identifyRecurringConcerns(readingHistory) {
    // Implementation would find repeated themes or questions
    return null; // Placeholder
  }
}

export default PersonalizationEngine;