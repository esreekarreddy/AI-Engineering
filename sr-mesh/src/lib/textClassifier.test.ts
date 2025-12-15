/**
 * Text Classifier Tests
 * 
 * Comprehensive test suite for the rule-based text classification system
 * Tests cover all categories, edge cases, and priority handling
 */

import { describe, test, expect } from 'vitest';
import { classifyText, getClassificationDetails, batchClassify } from './textClassifier';

describe('Text Classifier', () => {
  describe('Questions Category', () => {
    test('classifies text with question marks as Questions', () => {
      expect(classifyText('What is machine learning?')).toBe('Questions');
      expect(classifyText('How does this work?')).toBe('Questions');
      expect(classifyText('Why is the sky blue?')).toBe('Questions');
      expect(classifyText('do i need this pen?')).toBe('Questions');
    });

    test('classifies WH-word starters as Questions', () => {
      expect(classifyText('Who invented the telephone')).toBe('Questions');
      expect(classifyText('What makes a good leader')).toBe('Questions');
      expect(classifyText('Where should I start')).toBe('Questions');
      expect(classifyText('When did this happen')).toBe('Questions');
      expect(classifyText('Why does this matter')).toBe('Questions');
      expect(classifyText('How to learn programming')).toBe('Questions');
      expect(classifyText('Which option is better')).toBe('Questions');
    });

    test('classifies auxiliary verb starters as Questions', () => {
      expect(classifyText('Is this the right approach')).toBe('Questions');
      expect(classifyText('Are we on track')).toBe('Questions');
      expect(classifyText('Do we need more resources')).toBe('Questions');
      expect(classifyText('Can this be improved')).toBe('Questions');
      expect(classifyText('Should we proceed')).toBe('Questions');
    });
  });

  describe('Learning Category', () => {
    test('classifies learning-related content', () => {
      expect(classifyText('I need to learn AI')).toBe('Learning');
      expect(classifyText('studying for the exam')).toBe('Learning');
      expect(classifyText('taking a course on Python')).toBe('Learning');
      expect(classifyText('reading the tutorial')).toBe('Learning');
    });

    test('classifies educational keywords', () => {
      expect(classifyText('fundamentals of programming')).toBe('Learning');
      expect(classifyText('beginner guide to React')).toBe('Learning');
      expect(classifyText('certification exam prep')).toBe('Learning');
    });
  });

  describe('Insights Category', () => {
    test('classifies opinions and evaluations', () => {
      expect(classifyText('supervised learning is very good')).toBe('Insights');
      expect(classifyText('unsupervised learning is also good')).toBe('Insights');
      expect(classifyText('this framework is terrible')).toBe('Insights');
      expect(classifyText('I think this approach is better')).toBe('Insights');
    });

    test('classifies comparative statements', () => {
      expect(classifyText('Python is better than Java for beginners')).toBe('Insights');
      expect(classifyText('The worst mistake I ever made')).toBe('Insights');
    });

    test('classifies evaluation keywords', () => {
      expect(classifyText('pen is harmful')).toBe('Insights');
      expect(classifyText('this is really useful for debugging')).toBe('Insights');
      expect(classifyText('I recommend using TypeScript')).toBe('Insights');
    });
  });

  describe('Facts Category', () => {
    test('classifies definitional statements', () => {
      expect(classifyText('neural networks is subset of ai')).toBe('Facts');
      expect(classifyText('Machine learning is a type of artificial intelligence')).toBe('Facts');
      expect(classifyText('HTML is defined as HyperText Markup Language')).toBe('Facts');
    });

    test('classifies factual declarations', () => {
      expect(classifyText('artificial intelligence is new')).toBe('Facts');
      expect(classifyText('The algorithm consists of three steps')).toBe('Facts');
      expect(classifyText('Python was invented in 1991')).toBe('Facts');
    });
  });

  describe('Projects Category', () => {
    test('classifies project-related content', () => {
      expect(classifyText('building a new feature for the app')).toBe('Projects');
      expect(classifyText('working on the v2.0 release')).toBe('Projects');
      expect(classifyText('need to implement authentication')).toBe('Projects');
    });

    test('classifies development keywords', () => {
      expect(classifyText('refactor the codebase')).toBe('Projects');
      expect(classifyText('deploy to production')).toBe('Projects');
      expect(classifyText('the API endpoint is broken')).toBe('Projects');
    });
  });

  describe('Personal Category', () => {
    test('classifies self-referential content', () => {
      expect(classifyText('I feel happy today')).toBe('Personal');
      expect(classifyText('my goal is to exercise more')).toBe('Personal');
      expect(classifyText('I am grateful for my family')).toBe('Personal');
    });
  });

  describe('Work Category', () => {
    test('classifies work-related content', () => {
      expect(classifyText('meeting with the client at 2pm')).toBe('Work');
      expect(classifyText('deadline for the proposal is Friday')).toBe('Work');
      expect(classifyText('need to send the email to stakeholders')).toBe('Work');
    });
  });

  describe('Ideas Category', () => {
    test('classifies creative suggestions', () => {
      expect(classifyText('what if we tried a different approach')).toBe('Ideas');
      expect(classifyText('maybe we could use microservices')).toBe('Ideas');
      expect(classifyText('one idea is to automate this process')).toBe('Ideas');
    });
  });

  describe('Creative Category', () => {
    test('classifies artistic content', () => {
      expect(classifyText('writing a poem about nature')).toBe('Creative');
      expect(classifyText('composing music for the video')).toBe('Creative');
      expect(classifyText('inspired by modern art')).toBe('Creative');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty or invalid input', () => {
      expect(classifyText('')).toBe('Ideas');
      expect(classifyText('   ')).toBe('Ideas');
      expect(classifyText('ab')).toBe('Ideas'); // Very short
      expect(classifyText(null as unknown as string)).toBe('Ideas');
      expect(classifyText(undefined as unknown as string)).toBe('Ideas');
    });

    test('handles mixed signals with priority resolution', () => {
      // Question takes priority over insight
      expect(classifyText('Is this good?')).toBe('Questions');
      // Learning takes priority over personal (I need to learn)
      expect(classifyText('I need to learn AI')).toBe('Learning');
    });

    test('handles case insensitivity', () => {
      expect(classifyText('WHAT IS AI')).toBe('Questions');
      expect(classifyText('this is VERY GOOD')).toBe('Insights');
    });
  });

  describe('getClassificationDetails', () => {
    test('returns classification with confidence', () => {
      const result = getClassificationDetails('What is machine learning?');
      expect(result.category).toBe('Questions');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.alternatives).toBeDefined();
    });

    test('returns alternatives when multiple categories match', () => {
      // This text contains "study" (Learning), "good" (Insights), and "project" (Projects)
      const result = getClassificationDetails('I need to study this good project idea');
      expect(result.alternatives.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('batchClassify', () => {
    test('classifies multiple texts efficiently', () => {
      const texts = [
        'What is AI?',
        'supervised learning is very good',
        'neural networks is subset of ai',
        'I need to learn AI'
      ];
      
      const results = batchClassify(texts);
      
      expect(results.get('What is AI?')).toBe('Questions');
      expect(results.get('supervised learning is very good')).toBe('Insights');
      expect(results.get('neural networks is subset of ai')).toBe('Facts');
      expect(results.get('I need to learn AI')).toBe('Learning');
    });
  });

  describe('Real-world Examples from User Data', () => {
    test('classifies user sample data correctly', () => {
      // These are the actual notes from the user's backup
      expect(classifyText('supervised learning is very good')).toBe('Insights');
      expect(classifyText('neural networks is subset of ai')).toBe('Facts');
      expect(classifyText('i need to learn AI')).toBe('Learning');
      expect(classifyText('unsupervised learning is also good')).toBe('Insights');
      expect(classifyText('do i need this pen?')).toBe('Questions');
      expect(classifyText('pen is harmful')).toBe('Insights');
      expect(classifyText('artificial intelligence is new')).toBe('Facts');
    });
  });

  describe('ML/AI Terminology - Should NOT trigger Learning', () => {
    test('machine learning terms are not confused with learning intent', () => {
      // The key is these should NOT be 'Learning' category
      expect(classifyText('machine learning models are powerful')).not.toBe('Learning');
      expect(classifyText('deep learning is a subset of machine learning')).toBe('Facts');
      expect(classifyText('reinforcement learning works well for games')).not.toBe('Learning');
      expect(classifyText('transfer learning saves time')).not.toBe('Learning');
    });
  });

  describe('More Questions', () => {
    test('classifies implied questions', () => {
      expect(classifyText('I wonder how AI works')).toBe('Questions');
      expect(classifyText('Not sure if this is correct')).toBe('Questions');
      expect(classifyText('Anyone know the answer')).toBe('Questions');
    });

    test('classifies indirect questions', () => {
      expect(classifyText('Could someone explain this concept')).toBe('Questions');
      expect(classifyText('Would it be possible to fix this')).toBe('Questions');
    });
  });

  describe('More Insights', () => {
    test('classifies strong opinions', () => {
      expect(classifyText('React is amazing for building UIs')).toBe('Insights');
      expect(classifyText('This book is excellent for beginners')).toBe('Insights');
      expect(classifyText('The code quality is poor')).toBe('Insights');
    });

    test('classifies recommendations', () => {
      expect(classifyText('I suggest using TypeScript instead')).toBe('Insights');
      // Using strong evaluation keywords
      expect(classifyText('That framework is really good and I recommend it')).toBe('Insights');
      expect(classifyText('I would advise against this terrible approach')).toBe('Insights');
    });

    test('classifies discoveries and realizations', () => {
      expect(classifyText('I realized that caching improves performance')).toBe('Insights');
      expect(classifyText('I noticed the bug only happens at night')).toBe('Insights');
      expect(classifyText('Turns out the issue was a race condition')).toBe('Insights');
    });
  });

  describe('More Facts', () => {
    test('classifies technical definitions', () => {
      expect(classifyText('HTTP is a protocol for data transfer')).toBe('Facts');
      expect(classifyText('JavaScript is a programming language')).toBe('Facts');
      expect(classifyText('REST is defined as Representational State Transfer')).toBe('Facts');
    });

    test('classifies compositional facts', () => {
      expect(classifyText('The stack consists of React, Node, and MongoDB')).toBe('Facts');
      expect(classifyText('This function includes error handling')).toBe('Facts');
    });

    test('classifies historical facts', () => {
      expect(classifyText('Git was created in 2005')).toBe('Facts');
      expect(classifyText('The company was founded by two engineers')).toBe('Facts');
    });
  });

  describe('More Projects', () => {
    test('classifies development activities', () => {
      expect(classifyText('implementing the new payment system')).toBe('Projects');
      expect(classifyText('debugging the authentication flow')).toBe('Projects');
      expect(classifyText('optimizing database queries')).toBe('Projects');
    });

    test('classifies version and release notes', () => {
      expect(classifyText('v3.0 includes major breaking changes')).toBe('Projects');
      expect(classifyText('the beta release is ready for testing')).toBe('Projects');
    });
  });

  describe('More Personal', () => {
    test('classifies emotional content', () => {
      expect(classifyText('I feel stressed about the deadline')).toBe('Personal');
      expect(classifyText('I am excited about this opportunity')).toBe('Personal');
    });

    test('classifies personal goals', () => {
      expect(classifyText('my resolution is to read more books')).toBe('Personal');
      expect(classifyText('I want to improve my communication skills')).toBe('Personal');
    });
  });

  describe('More Work', () => {
    test('classifies professional activities', () => {
      expect(classifyText('call with the team at 3pm')).toBe('Work');
      expect(classifyText('quarterly review is next week')).toBe('Work');
      expect(classifyText('need to update the stakeholders')).toBe('Work');
    });

    test('classifies office-related content', () => {
      expect(classifyText('the office wifi is down again')).toBe('Work');
      expect(classifyText('sending the report to the manager')).toBe('Work');
    });
  });

  describe('More Ideas', () => {
    test('classifies suggestions and proposals', () => {
      expect(classifyText('we could implement lazy loading')).toBe('Ideas');
      expect(classifyText('it would be cool to add dark mode')).toBe('Ideas');
      expect(classifyText('perhaps we should reconsider the approach')).toBe('Ideas');
    });

    test('classifies brainstorming content', () => {
      expect(classifyText('one possibility is to use websockets')).toBe('Ideas');
      expect(classifyText('an alternative approach would be GraphQL')).toBe('Ideas');
    });
  });

  describe('More Creative', () => {
    test('classifies artistic activities', () => {
      expect(classifyText('writing a short story about space travel')).toBe('Creative');
      expect(classifyText('painting beautiful landscapes in watercolor')).toBe('Creative');
      expect(classifyText('the music composition is almost done')).toBe('Creative');
    });
  });

  describe('Ambiguous Inputs', () => {
    test('handles technical terms correctly', () => {
      // These should NOT be confused with simpler categories
      expect(classifyText('the learning rate is too high')).not.toBe('Learning');
      expect(classifyText('work in progress on the feature')).toBe('Projects');
    });

    test('prioritizes stronger signals', () => {
      // Question mark should take priority over other signals
      expect(classifyText('Who knows about this?')).toBe('Questions');
      // I think triggers Insights
      expect(classifyText('I think we definitely need more time')).toBe('Insights');
    });
  });

  describe('Real Conversation Snippets', () => {
    test('classifies natural language inputs', () => {
      expect(classifyText('gotta finish the project by friday')).toBe('Projects');
      expect(classifyText('feeling burnt out and tired lately')).toBe('Personal');
      expect(classifyText('hmm what if we could use caching')).toBe('Ideas');
      expect(classifyText('this is amazing and really impressive')).toBe('Insights');
    });
  });
});
