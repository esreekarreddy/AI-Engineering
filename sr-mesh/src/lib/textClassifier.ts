/**
 * Rule-based Text Classifier for SR Mesh
 * 
 * This module provides intelligent classification of text content into
 * meaningful categories based on linguistic patterns and keywords.
 * 
 * The classifier uses a priority-based system where categories are checked
 * in order of specificity. This ensures accurate classification even for
 * ambiguous text.
 * 
 * @module textClassifier
 * @author SR Mesh Team
 * @license MIT
 */

/**
 * Available classification categories
 * Each category represents a distinct type of thought/note
 */
export type TextCategory = 
  | 'Questions'   // Interrogative sentences seeking information
  | 'Insights'    // Opinions, evaluations, and conclusions
  | 'Ideas'       // Creative suggestions and possibilities
  | 'Learning'    // Educational content and study notes
  | 'Facts'       // Declarative statements and definitions
  | 'Projects'    // Action items and development tasks
  | 'Personal'    // Self-referential and emotional content
  | 'Work'        // Professional and business-related
  | 'Creative';   // Artistic and imaginative content

/**
 * Classification rule definition
 * Combines regex patterns and keyword matching for flexible detection
 */
interface ClassificationRule {
  /** Regex patterns that trigger this category (any match triggers) */
  patterns: RegExp[];
  /** Keywords that suggest this category (case-insensitive) */
  keywords: string[];
  /** Phrases that strongly indicate this category */
  phrases: string[];
  /** Priority weight (higher = checked first, used for tie-breaking) */
  priority: number;
}

/**
 * Comprehensive classification rules for each category
 * Rules are designed to be mutually exclusive where possible,
 * with priority-based resolution for ambiguous cases
 */
const CLASSIFICATION_RULES: Record<TextCategory, ClassificationRule> = {
  Questions: {
    patterns: [
      /\?/,                                           // Contains question mark
      /^(who|what|where|when|why|how|which)\s/i,      // Starts with WH-word
      /^(is|are|do|does|did|can|could|should|would|will|has|have|had)\s/i, // Starts with auxiliary verb
      /^(am i|are we|is it|is this|is that)\s/i,     // Common question starters
    ],
    keywords: [],
    phrases: [
      'i wonder', 'i\'m wondering', 'not sure if', 'anyone know',
      'how to', 'what is', 'why does', 'can someone', 'need help with'
    ],
    priority: 100  // Highest priority - questions are unambiguous
  },

  Learning: {
    patterns: [
      /\b(need to|want to|going to|have to|trying to)\s+(learn|study|understand|master|grasp)/i,
      /\b(studying|researching|reading about)\s+\w/i,  // Must be followed by a word
      /\btaking\s+(a\s+)?(course|class|lesson)/i,
    ],
    keywords: [
      // Removed 'learn' as standalone keyword - too many false positives
      // 'supervised learning', 'unsupervised learning', 'machine learning' are ML terms, not learning intent
      'study', 'tutorial', 'lesson',
      'education', 'training', 'practice', 'exercise', 'homework',
      'class', 'lecture', 'seminar', 'workshop', 'certification',
      'curriculum', 'syllabus', 'textbook', 'documentation',
      'beginner', 'intermediate', 'advanced', 'fundamentals', 'basics',
      'chapter', 'module', 'section', 'unit'
    ],
    phrases: [
      'need to learn', 'want to learn', 'i want to learn', 'i need to learn',
      'learning about', 'studying for', 'studying about',
      'taking a course', 'taking course', 'reading about',
      'getting started with', 'introduction to', 'guide to', 'mastering',
      'deep dive into', 'research on'
    ],
    priority: 90
  },

  Projects: {
    patterns: [
      /\b(build|create|develop|implement|deploy|launch|ship)\s+(a|an|the|my|our)\b/i,
      /\b(working on|developing|building|creating)\b/i,
      /\bv\d+(\.\d+)*\b/i,  // Version numbers like v1.0, v2.3.1
    ],
    keywords: [
      'project', 'build', 'create', 'develop', 'implement', 'deploy',
      'feature', 'milestone', 'sprint', 'release', 'version', 'roadmap',
      'architecture', 'design', 'prototype', 'mvp', 'beta', 'alpha',
      'backend', 'frontend', 'fullstack', 'api', 'database', 'server',
      'repository', 'codebase', 'refactor', 'optimize', 'debug', 'fix',
      'pipeline', 'cicd', 'devops', 'infrastructure', 'scalability'
    ],
    phrases: [
      'working on', 'building a', 'creating a', 'developing a',
      'need to implement', 'should add', 'todo', 'to do', 'task list',
      'next steps', 'action items', 'deliverables', 'requirements'
    ],
    priority: 85
  },

  Personal: {
    patterns: [
      /^i\s+(am|was|have|had|feel|felt|want|need|like|love|hate)\b/i,
      /\b(myself|mine)\b/i,
      /\b(i\'m|i\'ve|i\'ll|i\'d)\b/i,
    ],
    keywords: [
      'feeling', 'emotion', 'mood', 'happy', 'sad', 'excited', 'anxious',
      'stressed', 'relaxed', 'grateful', 'thankful', 'blessed', 'lucky',
      'journal', 'diary', 'reflection', 'memory', 'remember', 'forgot',
      'birthday', 'anniversary', 'family', 'friend', 'relationship',
      'health', 'wellness', 'fitness', 'diet', 'sleep', 'meditation',
      'goal', 'resolution', 'habit', 'routine', 'lifestyle'
    ],
    phrases: [
      'i feel', 'i want', 'i need',
      'my goal', 'my plan', 'my thought', 'for me',
      'i\'m going to', 'i should', 'i must'
    ],
    priority: 65  // Lower than Insights (85) so opinions take precedence
  },

  Work: {
    patterns: [
      /\b(meeting|call|sync)\s+(with|at|on)\b/i,
      /\b\d{1,2}(:\d{2})?\s*(am|pm|AM|PM)\b/,  // Time patterns
    ],
    keywords: [
      'meeting', 'deadline', 'client', 'customer', 'stakeholder',
      'presentation', 'report', 'proposal', 'budget', 'revenue',
      'manager', 'team', 'colleague', 'boss', 'employee', 'staff',
      'office', 'remote', 'hybrid', 'workplace', 'corporate',
      'email', 'memo', 'agenda', 'minutes', 'action items',
      'quarterly', 'annual', 'kpi', 'okr', 'performance', 'review',
      'salary', 'promotion', 'interview', 'hiring', 'onboarding',
      'contract', 'negotiation', 'vendor', 'partner', 'supplier'
    ],
    phrases: [
      'at work', 'in the office', 'work meeting', 'team meeting',
      'deadline is', 'due by', 'need to finish', 'client wants',
      'send email', 'follow up', 'touch base', 'circle back'
    ],
    priority: 70
  },

  Insights: {
    patterns: [
      /\b(is|are|was|were)\s+(very|really|quite|extremely|incredibly|also|pretty)?\s*(good|bad|great|terrible|amazing|awful|excellent|poor|important)/i,
      /\b(better|worse|best|worst)\s+(than|of|in)\b/i,
      /\bis\s+(also\s+)?(good|bad|great|terrible|amazing|excellent|poor|harmful|useful|useless)\b/i,
      /^i\s+(think|believe)\b/i,  // "I think", "I believe" at start → opinion
    ],
    keywords: [
      'good', 'bad', 'great', 'terrible', 'amazing', 'awful', 'excellent',
      'poor', 'better', 'worse', 'best', 'worst', 'superior', 'inferior',
      'opinion', 'seems', 'appears',
      'interesting', 'boring', 'useful', 'useless', 'helpful', 'harmful',
      'effective', 'ineffective', 'efficient', 'inefficient',
      'important', 'crucial', 'essential', 'significant', 'trivial',
      'surprising', 'expected', 'unexpected', 'obvious', 'subtle',
      'recommend', 'suggest', 'advise', 'caution', 'warn',
      'conclusion', 'takeaway', 'insight', 'observation',
      'realized', 'noticed', 'discovered'
    ],
    phrases: [
      'is very good', 'is also good', 'is good', 'is great', 'is bad', 'is terrible',
      'is harmful', 'is useful', 'is useless', 'is helpful',
      'i think', 'i believe', 'in my opinion', 'it seems',
      'the key is', 'the problem is', 'the solution is',
      'turns out', 'it appears', 'evidently', 'clearly',
      'pros and cons', 'advantages and disadvantages'
    ],
    priority: 85  // High priority for opinions
  },

  Facts: {
    patterns: [
      /\b(is|are)\s+(a|an|the)\s+\w+\s+(of|in|for)\b/i,  // "X is a type of Y"
      /\b(defined as|known as|referred to as|called)\b/i,
      /\b(consists of|comprises|includes|contains)\b/i,
      /\b(was|were)\s+(invented|created|discovered|founded)\s+(in|by)\b/i,
      /\bis\s+(a\s+)?(subset|superset|part|type|kind)\s+of\b/i,  // "is subset of"
      /\b\w+\s+is\s+(a|an)\s+\w+$/i,  // "X is a Y" at end of sentence
      /\bis\s+(new|old|modern|ancient|recent|traditional)\b/i,  // "is new", "is old" → fact
    ],
    keywords: [
      'definition', 'meaning', 'concept', 'theory', 'principle',
      'subset', 'superset', 'type', 'kind', 'category',
      'example', 'instance', 'case', 'sample', 'specimen',
      'fact', 'truth', 'reality', 'evidence', 'proof', 'data',
      'statistic', 'percentage', 'ratio', 'rate',
      'history', 'origin', 'background', 'context', 'source',
      'algorithm', 'function', 'method', 'process', 'procedure',
      'component', 'element', 'part', 'piece'
    ],
    phrases: [
      'is a', 'is an', 'is the', 'are called', 'is defined as', 'is known as',
      'refers to', 'means that', 'consists of', 'is part of',
      'is subset of', 'is a subset of', 'belongs to', 'is classified as', 'falls under',
      'according to', 'based on', 'as per', 'in terms of',
      'is new', 'is old', 'was invented', 'was created'
    ],
    priority: 80  // Higher to compete with Insights for factual statements
  },

  Ideas: {
    patterns: [
      /\b(what if|how about|maybe|perhaps|possibly)\b/i,
      /\b(could|should|might|would)\s+(be|have|try|create|build|make)\b/i,
    ],
    keywords: [
      'idea', 'concept', 'notion', 'thought', 'suggestion',
      'could', 'should', 'might', 'would', 'maybe', 'perhaps',
      'possibly', 'potentially', 'hypothetically', 'theoretically',
      'alternative', 'option', 'possibility', 'opportunity',
      'innovation', 'invention', 'creativity', 'imagination',
      'brainstorm', 'experiment', 'explore', 'try', 'test',
      'proposal', 'proposition', 'recommendation', 'approach'
    ],
    phrases: [
      'what if', 'how about', 'we could', 'we should', 'it would be',
      'one idea', 'another idea', 'an idea', 'my idea', 'just thinking',
      'came up with', 'occurred to me', 'might work', 'worth trying',
      'let\'s try', 'let\'s explore', 'let\'s consider'
    ],
    priority: 40
  },

  Creative: {
    patterns: [
      /\b(poem|poetry|story|novel|song|music|art|painting|drawing|sketch)\b/i,
      /\bwriting\s+(a\s+)?(poem|story|novel|song|essay)/i,
    ],
    keywords: [
      'creative', 'artistic', 'aesthetic', 'beautiful', 'elegant',
      'poem', 'poetry', 'prose', 'narrative', 'fiction',
      'novel', 'essay', 'blog', 'article',
      'song', 'melody', 'rhythm', 'lyrics', 'composition',
      'painting', 'drawing', 'sketch', 'illustration',
      'photography', 'video', 'film', 'movie', 'animation',
      'craft', 'handmade', 'diy', 'hobby',
      'muse', 'expression'
    ],
    phrases: [
      'inspired by', 'creative writing', 'work of art', 'masterpiece',
      'artistic expression', 'visual design', 'creative process',
      'writing a poem', 'composing music', 'creating art'
    ],
    priority: 30
  }
};

/**
 * Normalize text for consistent classification
 * Handles common text issues and prepares for pattern matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .replace(/[']/g, '\'')       // Normalize apostrophes
    .replace(/["]/g, '"');       // Normalize quotes
}

/**
 * Calculate match score for a category
 * Higher scores indicate stronger classification confidence
 */
function calculateScore(text: string, normalizedText: string, rule: ClassificationRule): number {
  let score = 0;

  // Pattern matches (highest weight)
  for (const pattern of rule.patterns) {
    if (pattern.test(text) || pattern.test(normalizedText)) {
      score += 30;
    }
  }

  // Phrase matches (medium-high weight)
  for (const phrase of rule.phrases) {
    if (normalizedText.includes(phrase.toLowerCase())) {
      score += 20;
    }
  }

  // Keyword matches (base weight, cumulative)
  const words = normalizedText.split(/\s+/);
  for (const keyword of rule.keywords) {
    const keywordLower = keyword.toLowerCase();
    // Check both exact word match and substring match
    if (words.includes(keywordLower)) {
      score += 10;
    } else if (normalizedText.includes(keywordLower)) {
      score += 5;  // Partial match (substring)
    }
  }

  return score;
}

/**
 * Classify text content into the most appropriate category
 * 
 * The classification algorithm:
 * 1. Normalizes input text for consistent matching
 * 2. Calculates match scores for all categories
 * 3. Returns the category with the highest score
 * 4. Uses priority as tie-breaker
 * 5. Falls back to 'Ideas' for unclassifiable content
 * 
 * @param content - The text content to classify
 * @returns The most appropriate category for the content
 * 
 * @example
 * ```typescript
 * classifyText("What is machine learning?")  // Returns: "Questions"
 * classifyText("supervised learning is great") // Returns: "Insights"
 * classifyText("neural networks is subset of ai") // Returns: "Facts"
 * classifyText("I need to learn Python") // Returns: "Learning"
 * ```
 */
export function classifyText(content: string): TextCategory {
  if (!content || typeof content !== 'string') {
    return 'Ideas';  // Default fallback
  }

  const normalizedText = normalizeText(content);
  
  // Edge case: very short text
  if (normalizedText.length < 3) {
    return 'Ideas';
  }

  // Calculate scores for all categories
  const scores: Array<{ category: TextCategory; score: number; priority: number }> = [];
  
  for (const [category, rule] of Object.entries(CLASSIFICATION_RULES) as Array<[TextCategory, ClassificationRule]>) {
    const score = calculateScore(content, normalizedText, rule);
    if (score > 0) {
      scores.push({ category, score, priority: rule.priority });
    }
  }

  // Sort by score (descending), then by priority (descending) for tie-breaking
  scores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.priority - a.priority;
  });

  // Return top match or default
  return scores.length > 0 ? scores[0].category : 'Ideas';
}

/**
 * Get classification details including confidence score
 * Useful for debugging and transparency
 * 
 * @param content - The text content to analyze
 * @returns Object with category, score, and alternative matches
 */
export function getClassificationDetails(content: string): {
  category: TextCategory;
  confidence: number;
  alternatives: Array<{ category: TextCategory; score: number }>;
} {
  if (!content || typeof content !== 'string') {
    return { category: 'Ideas', confidence: 0, alternatives: [] };
  }

  const normalizedText = normalizeText(content);
  
  const scores: Array<{ category: TextCategory; score: number }> = [];
  
  for (const [category, rule] of Object.entries(CLASSIFICATION_RULES) as Array<[TextCategory, ClassificationRule]>) {
    const score = calculateScore(content, normalizedText, rule);
    scores.push({ category, score });
  }

  scores.sort((a, b) => b.score - a.score);
  
  const topScore = scores[0]?.score || 0;
  const maxPossibleScore = 100; // Approximate maximum achievable score
  const confidence = Math.min(1, topScore / maxPossibleScore);

  return {
    category: topScore > 0 ? scores[0].category : 'Ideas',
    confidence,
    alternatives: scores.filter(s => s.score > 0).slice(0, 3)
  };
}

/**
 * Batch classify multiple texts efficiently
 * 
 * @param contents - Array of text contents to classify
 * @returns Map of content to category
 */
export function batchClassify(contents: string[]): Map<string, TextCategory> {
  const results = new Map<string, TextCategory>();
  for (const content of contents) {
    results.set(content, classifyText(content));
  }
  return results;
}
