import { computeScore, type Question } from '@/lib/compute-score'

const mockQuestions: Question[] = [
  { id: '1', text: 'I feel respected when expressing my opinions.', weight: -2, order: 1 },
  { id: '2', text: 'We often insult or belittle each other.', weight: 2, order: 2 },
  { id: '3', text: 'I am afraid of my partner\'s reactions.', weight: 2, order: 3 },
  { id: '4', text: 'We communicate openly and honestly.', weight: -2, order: 4 },
]

describe('computeScore', () => {
  it('should calculate 0% toxicity for all healthy responses', () => {
    const answers = {
      '1': 5, // Strongly agree with positive statement
      '2': 1, // Strongly disagree with negative statement  
      '3': 1, // Strongly disagree with negative statement
      '4': 5, // Strongly agree with positive statement
    }

    const result = computeScore(answers, mockQuestions)
    
    expect(result.percent).toBe(0)
    expect(result.tier).toBe('Healthy')
    expect(result.advice).toContain('Healthy dynamics')
  })

  it('should calculate 100% toxicity for all toxic responses', () => {
    const answers = {
      '1': 1, // Strongly disagree with positive statement
      '2': 5, // Strongly agree with negative statement
      '3': 5, // Strongly agree with negative statement  
      '4': 1, // Strongly disagree with positive statement
    }

    const result = computeScore(answers, mockQuestions)
    
    expect(result.percent).toBe(100)
    expect(result.tier).toBe('Toxic')
    expect(result.advice).toContain('High toxicity detected')
  })

  it('should calculate 50% toxicity for neutral responses', () => {
    const answers = {
      '1': 3, // Neutral
      '2': 3, // Neutral
      '3': 3, // Neutral
      '4': 3, // Neutral
    }

    const result = computeScore(answers, mockQuestions)
    
    expect(result.percent).toBe(50)
    expect(result.tier).toBe('Concerning')
  })

  it('should throw error for missing answers', () => {
    const answers = {
      '1': 5,
      '2': 1,
      // Missing question 3 and 4
    }

    expect(() => computeScore(answers, mockQuestions))
      .toThrow('Missing answer for question 3')
  })

  it('should handle mixed responses correctly', () => {
    const answers = {
      '1': 4, // Agree with positive statement
      '2': 2, // Disagree with negative statement
      '3': 4, // Agree with negative statement (concerning)
      '4': 4, // Agree with positive statement
    }

    const result = computeScore(answers, mockQuestions)
    
    expect(result.percent).toBeGreaterThan(0)
    expect(result.percent).toBeLessThan(100)
    expect(result.tier).toMatch(/Healthy|Manageable|Concerning/)
  })
})
