import { describe, it, expect } from 'vitest';
import { SQL_CHALLENGES } from '../../data/challenges';
import { evaluateChallengeSubmission } from '../../utils/challengeEvaluator';

describe('Challenge Evaluator WASM Engine', () => {
  it('should return ACCEPTED for canonical solution of Challenge #595 (Big Countries)', async () => {
    const challenge = SQL_CHALLENGES.find((c) => c.id === 595)!;
    expect(challenge).toBeDefined();

    const result = await evaluateChallengeSubmission(challenge, challenge.solutionSql);
    expect(result.isCorrect).toBe(true);
    expect(result.status).toBe('ACCEPTED');
  });

  it('should return WRONG_ANSWER for incorrect SQL filtering condition', async () => {
    const challenge = SQL_CHALLENGES.find((c) => c.id === 595)!;
    const wrongSql = 'SELECT name, population, area FROM World WHERE area > 999999999;';

    const result = await evaluateChallengeSubmission(challenge, wrongSql);
    expect(result.isCorrect).toBe(false);
    expect(result.status).toBe('ROW_COUNT_MISMATCH');
  });

  it('should return SYNTAX_ERROR for invalid SQL query', async () => {
    const challenge = SQL_CHALLENGES.find((c) => c.id === 595)!;
    const invalidSql = 'SELEC name FORM World;';

    const result = await evaluateChallengeSubmission(challenge, invalidSql);
    expect(result.isCorrect).toBe(false);
    expect(result.status).toBe('SYNTAX_ERROR');
    expect(result.errorMessage).toBeDefined();
  });
});
