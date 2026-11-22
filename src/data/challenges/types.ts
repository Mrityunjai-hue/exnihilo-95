/**
 * types.ts — SQL Challenge Definitions & Schema Types
 */

export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export type ChallengeDomain =
  | 'Filtering & String Functions'
  | 'Aggregations & Grouping'
  | 'Joins & Relational Sets'
  | 'Subqueries & CTEs'
  | 'Window Ranking & Ordering'
  | 'Window Offset Functions'
  | 'Sliding Window Aggregates'
  | 'Date & Time Analytics'
  | 'DDL, Constraints & Triggers'
  | 'Recursive CTEs & Graphs';

export interface TableColumnDef {
  name: string;
  type: string;
}

export interface TableSchemaDef {
  tableName: string;
  columns: TableColumnDef[];
  rows: any[][];
}

export interface SQLChallenge {
  id: number;
  title: string;
  difficulty: ChallengeDifficulty;
  domain: ChallengeDomain;
  companyTags: string[];
  description: string;
  inputTables: TableSchemaDef[];
  inputSchemaSql: string;
  seedDataSql: string;
  expectedOutput: {
    columns: string[];
    rows: any[][];
  };
  requireOrder?: boolean;
  ordered?: boolean;
  hints: string[];
  solutionSql: string;
  starterSql: string;
  hiddenTestCases?: Array<{
    name: string;
    seedDataSql: string;
    expectedOutput: { columns: string[]; rows: unknown[][] };
  }>;
}

export interface ChallengeMetadata {
  id: number;
  title: string;
  difficulty: ChallengeDifficulty;
  domain: ChallengeDomain;
  companyTags: string[];
  shard: 'easy' | 'medium' | 'hard' | 'expert';
}
