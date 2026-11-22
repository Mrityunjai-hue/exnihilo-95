import { describe, it, expect } from 'vitest';
import { loadChallengeById } from '../../data/challenges';
import { evaluateChallengeSubmission } from '../../utils/challengeEvaluator';

describe('Challenge Evaluator WASM Engine', () => {
  it('should return ACCEPTED for canonical solution of Challenge #595 (Big Countries)', async () => {
    const challenge = await loadChallengeById(595);
    expect(challenge).toBeDefined();

    const result = await evaluateChallengeSubmission(challenge!, challenge!.solutionSql);
    expect(result.isCorrect).toBe(true);
    expect(result.status).toBe('ACCEPTED');
  });

  it('should return WRONG_ANSWER for incorrect SQL filtering condition', async () => {
    const challenge = await loadChallengeById(595);
    expect(challenge).toBeDefined();
    const wrongSql = 'SELECT name, population, area FROM World WHERE area > 999999999;';

    const result = await evaluateChallengeSubmission(challenge!, wrongSql);
    expect(result.isCorrect).toBe(false);
    expect(result.status).toBe('ROW_COUNT_MISMATCH');
  });

  it('should return SYNTAX_ERROR for invalid SQL query', async () => {
    const challenge = await loadChallengeById(595);
    expect(challenge).toBeDefined();
    const invalidSql = 'SELEC name FORM World;';

    const result = await evaluateChallengeSubmission(challenge!, invalidSql);
    expect(result.isCorrect).toBe(false);
    expect(result.status).toBe('SYNTAX_ERROR');
    expect(result.errorMessage).toBeDefined();
  });

  it('should detect column header mismatch', async () => {
    const challenge = await loadChallengeById(595);
    expect(challenge).toBeDefined();
    // Returning columns with incorrect aliases
    const mismatchedHeaderSql = 'SELECT name AS country_title, population, area FROM World WHERE area >= 3000000 OR population >= 25000000;';

    const result = await evaluateChallengeSubmission(challenge!, mismatchedHeaderSql);
    expect(result.isCorrect).toBe(false);
    expect(result.status).toBe('COLUMN_MISMATCH');
    expect(result.errorMessage).toContain('Column header mismatch');
  });

  it('grades challenge with hidden test cases and accepts correct general solution', async () => {
    const challenge = await loadChallengeById(175);
    expect(challenge).toBeDefined();

    const result = await evaluateChallengeSubmission(challenge!, challenge!.solutionSql);
    expect(result.isCorrect).toBe(true);
    expect(result.status).toBe('ACCEPTED');
  });
});
