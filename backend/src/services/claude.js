const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });
    this.model = 'claude-3-sonnet-20240229';
  }

  // Generate I Ching interpretation
  async generateInterpretation({ question, hexagram, userContext }) {
    const prompt = this.buildInterpretationPrompt(question, hexagram, userContext);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1200,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0].text;
      return this.parseInterpretationResponse(content);

    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('Failed to generate interpretation');
    }
  }

  // Generate follow-up conversation response
  async generateFollowUp({ originalQuestion, originalInterpretation, followUpQuestion, hexagram, conversationHistory }) {
    const prompt = this.buildFollowUpPrompt({
      originalQuestion,
      originalInterpretation,
      followUpQuestion,
      hexagram,
      conversationHistory
    });

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 800,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].text;

    } catch (error) {
      console.error('Claude follow-up error:', error);
      throw new Error('Failed to generate follow-up response');
    }
  }

  // Validate and improve question quality
  async validateQuestion(question) {
    const prompt = `
As an I Ching consultation expert, analyze this question for clarity, specificity, and potential for meaningful guidance:

Question: "${question}"

Rate the question on a scale of 1-10 and provide specific suggestions for improvement. Structure your response as JSON:

{
  "score": [1-10],
  "clarity": [1-10],
  "specificity": [1-10], 
  "actionability": [1-10],
  "suggestions": ["suggestion1", "suggestion2"],
  "improvedQuestion": "An improved version of the question"
}

Focus on making questions that lead to actionable wisdom rather than yes/no answers.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 600,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return JSON.parse(response.content[0].text);

    } catch (error) {
      console.error('Question validation error:', error);
      // Return default validation if Claude fails
      return {
        score: 5,
        clarity: 5,
        specificity: 5,
        actionability: 5,
        suggestions: ['Consider being more specific about your situation'],
        improvedQuestion: question
      };
    }
  }

  // Build interpretation prompt
  buildInterpretationPrompt(question, hexagram, userContext) {
    const primaryHex = hexagram.primary;
    const secondaryHex = hexagram.secondary;
    const changingLines = hexagram.changingLines || [];

    return `You are a wise I Ching interpreter blending ancient wisdom with modern understanding. Provide grounded, practical guidance that respects both traditional teachings and contemporary psychological insights.

User's Question: "${question}"

Primary Hexagram: ${primaryHex.name} (${primaryHex.chinese}) - #${primaryHex.number}
Lines: ${primaryHex.lines.map(line => line ? '⚊' : '⚋').join(' ')}
Trigrams: ${primaryHex.trigrams[1]} (upper) over ${primaryHex.trigrams[0]} (lower)

${changingLines.length > 0 ? `
Changing Lines: ${changingLines.join(', ')}
Secondary Hexagram: ${secondaryHex.name} (${secondaryHex.chinese}) - #${secondaryHex.number}
Transformation: ${primaryHex.name} → ${secondaryHex.name}
` : ''}

User Context: ${userContext.totalReadings} total readings, ${userContext.subscriptionType} user

Provide a thoughtful interpretation that:
1. Directly addresses their specific question and context
2. Blends traditional I Ching wisdom with modern psychological understanding  
3. Offers actionable, practical guidance they can apply
4. Maintains a respectful, non-prescriptive tone that empowers the user
5. If changing lines exist, explains their significance and the transformation

Structure your response as:

**Present Situation:** What the primary hexagram reveals about their current state

**Guidance:** Practical wisdom and recommendations  

${changingLines.length > 0 ? '**Transformation:** What the changing lines and secondary hexagram suggest about potential developments' : ''}

**Action Steps:** Specific, grounded steps they can consider

Keep the interpretation 300-400 words, warm but practical in tone.`;
  }

  // Build follow-up prompt
  buildFollowUpPrompt({ originalQuestion, originalInterpretation, followUpQuestion, hexagram, conversationHistory }) {
    const conversationContext = conversationHistory.length > 0 ? 
      conversationHistory.map(entry => `Q: ${entry.question}\nA: ${entry.response}`).join('\n\n') : '';

    return `Continue the I Ching consultation as a wise, practical interpreter.

Original Question: "${originalQuestion}"
Original Reading: "${originalInterpretation.substring(0, 500)}..."

${conversationContext ? `Previous Conversation:\n${conversationContext}\n` : ''}

User's Follow-up: "${followUpQuestion}"

Provide a thoughtful response that:
- Builds on the original reading context
- Addresses their specific follow-up question
- Maintains the grounded, practical tone
- Offers additional actionable insights
- Keeps the conversation flowing naturally

Response should be 200-300 words, conversational yet wise.`;
  }

  // Parse structured interpretation response
  parseInterpretationResponse(content) {
    const sections = {};
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent = '';

    for (const line of lines) {
      if (line.startsWith('**') && line.endsWith(':**')) {
        if (currentSection) {
          sections[currentSection] = currentContent.trim();
        }
        currentSection = line.replace(/\*\*/g, '').replace(':', '').toLowerCase().replace(' ', '');
        currentContent = '';
      } else {
        currentContent += line + '\n';
      }
    }

    if (currentSection) {
      sections[currentSection] = currentContent.trim();
    }

    return {
      response: content,
      presentSituation: sections.presentsituation || '',
      guidance: sections.guidance || '', 
      transformation: sections.transformation || '',
      actionSteps: sections.actionsteps || ''
    };
  }

  // Get fallback interpretation when Claude is unavailable
  getFallbackInterpretation(hexagram) {
    const templates = this.getInterpretationTemplates();
    const template = templates[hexagram.primary.number] || templates[1];

    return {
      response: template.interpretation,
      presentSituation: template.presentSituation,
      guidance: template.guidance,
      transformation: hexagram.changingLines?.length > 0 ? template.transformation : '',
      actionSteps: template.actionSteps,
      generatedAt: new Date(),
      fallback: true
    };
  }

  // Get basic interpretation templates for fallback
  getInterpretationTemplates() {
    return {
      1: {
        interpretation: "The Creative represents pure yang energy, initiative, and leadership. This is a time of great potential and creative power.",
        presentSituation: "You are in a position of strength with the potential to initiate important changes.",
        guidance: "Act with confidence and integrity. Your leadership and creative energy are needed now.",
        transformation: "Movement toward greater receptivity and collaboration.",
        actionSteps: "Take the initiative, lead by example, trust your creative instincts."
      },
      2: {
        interpretation: "The Receptive represents pure yin energy, receptivity, and nurturing support. This is a time for patience and allowing.",
        presentSituation: "You are in a supportive role where patience and receptivity serve you well.",
        guidance: "Be open to guidance and support others. Strength comes through yielding and adaptation.",
        transformation: "Movement toward more active engagement and leadership.",
        actionSteps: "Practice patience, listen carefully, support others' initiatives."
      }
      // Add more templates as needed
    };
  }
}

module.exports = new ClaudeService();