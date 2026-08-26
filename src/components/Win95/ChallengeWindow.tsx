/**
 * ChallengeWindow.tsx — Flagship Dual-Pane Interactive SQL Challenge Arena (126+ Problems)
 */

import React, { useState, useEffect } from 'react';
import {
  SQLChallenge,
  SQL_CHALLENGES,
  getFilteredChallenges,
  ChallengeDifficulty,
  ChallengeDomain,
} from '../../data/challenges';
import { evaluateChallengeSubmission, EvaluationResult } from '../../utils/challengeEvaluator';
import { WindowControls } from './WindowControls';
import { QueryEditor } from '../IDE/QueryEditor';
import { Dialect } from '../../engine/parser';

interface ChallengeWindowProps {
  isOpen:        boolean;
  isMinimized?:  boolean;
  zIndex:        number;
  onClose:       () => void;
  onMinimize?:   () => void;
  onFocus:       () => void;
  onTryInStudio?: (sql: string, ddl: string, seed: string) => void;
}

const STORAGE_KEY = 'exnihilo_challenge_progress';

export const ChallengeWindow: React.FC<ChallengeWindowProps> = ({
  isOpen,
  isMinimized = false,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  onTryInStudio,
}) => {
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<SQLChallenge>(SQL_CHALLENGES[0]);
  const [userSql, setUserSql] = useState<string>(SQL_CHALLENGES[0].starterSql);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Filter States
  const [diffFilter, setDiffFilter] = useState<string>('All');
  const [domainFilter, setDomainFilter] = useState<string>('All');
  const [companyFilter, setCompanyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Accordion Toggles
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);

  // Load progress on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSolvedIds(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const filteredChallenges = getFilteredChallenges(
    searchQuery,
    diffFilter,
    domainFilter,
    companyFilter
  );

  useEffect(() => {
    if (selectedChallenge) {
      setUserSql(selectedChallenge.starterSql);
      setEvaluation(null);
      setRevealedHints({});
      setShowSolution(false);
    }
  }, [selectedChallenge]);

  if (!isOpen || isMinimized) return null;

  const handleSelectChallenge = (c: SQLChallenge) => {
    setSelectedChallenge(c);
  };

  const handleRunTest = async () => {
    setIsEvaluating(true);
    setEvaluation(null);
    try {
      const res = await evaluateChallengeSubmission(selectedChallenge, userSql);
      setEvaluation(res);

      if (res.isCorrect) {
        if (!solvedIds.includes(selectedChallenge.id)) {
          const nextSolved = [...solvedIds, selectedChallenge.id];
          setSolvedIds(nextSolved);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSolved));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTryInStudioClick = () => {
    if (onTryInStudio) {
      onTryInStudio(
        userSql,
        selectedChallenge.inputSchemaSql,
        selectedChallenge.seedDataSql
      );
    }
  };

  const progressPercent = Math.round((solvedIds.length / SQL_CHALLENGES.length) * 100);

  return (
    <div
      className="win95-window"
      style={
        isMaximized
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: '30px',
              width: '100vw',
              height: 'calc(100vh - 30px)',
              maxWidth: '100vw',
              maxHeight: '100vh',
              zIndex,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'none',
              borderRadius: 0,
            }
          : {
              position: 'fixed',
              top: '25px',
              left: '20px',
              right: '20px',
              bottom: '40px',
              width: 'calc(100vw - 40px)',
              height: 'calc(100vh - 65px)',
              maxWidth: '1800px',
              maxHeight: '94vh',
              zIndex,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 4px 12px rgba(0,0,0,0.5)',
            }
      }
      onMouseDown={onFocus}
    >
      {/* Titlebar */}
      <div className="win95-titlebar" style={{ background: 'var(--w95-title-active-bg, #000080)' }}>
        <div className="win95-titlebar-text">
          <span>🏆</span>
          <span>ExNihilo SQL Challenge Arena — #{selectedChallenge.id}. {selectedChallenge.title}</span>
        </div>
        <WindowControls
          onMinimize={onMinimize}
          onMaximize={() => setIsMaximized((prev) => !prev)}
          isMaximized={isMaximized}
          onClose={onClose}
        />
      </div>

      {/* Control Strip & Multi-Filters */}
      <div
        style={{
          background: 'var(--w95-gray, #c0c0c0)',
          borderBottom: '1px solid var(--w95-dark-gray, #808080)',
          padding: '6px 8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          fontSize: '11px',
        }}
      >
        {/* Difficulty Filter Tabs */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {['All', 'Easy', 'Medium', 'Hard', 'Expert'].map((diff) => (
            <button
              key={diff}
              className="win95-button"
              style={{
                fontSize: '10px',
                fontWeight: diffFilter === diff ? 'bold' : 'normal',
                background: diffFilter === diff ? 'var(--w95-light-gray, #e0e0e0)' : undefined,
                padding: '2px 8px',
              }}
              onClick={() => setDiffFilter(diff)}
            >
              {diff === 'Easy' && '🟢 '}
              {diff === 'Medium' && '🟡 '}
              {diff === 'Hard' && '🔴 '}
              {diff === 'Expert' && '🟣 '}
              {diff}
            </button>
          ))}
        </div>

        <div className="win95-divider-v" style={{ height: '18px' }} />

        {/* Company Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <label style={{ fontWeight: 'bold' }}>Company:</label>
          <select
            className="win95-sunken"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            style={{ fontSize: '10px', padding: '1px 4px' }}
          >
            <option value="All">All Companies</option>
            <option value="Google">Google</option>
            <option value="Meta">Meta</option>
            <option value="Amazon">Amazon</option>
            <option value="Apple">Apple</option>
            <option value="Microsoft">Microsoft</option>
            <option value="Netflix">Netflix</option>
            <option value="Uber">Uber</option>
            <option value="Stripe">Stripe</option>
          </select>
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: '160px' }}>
          <input
            type="text"
            className="win95-sunken"
            placeholder="🔍 Filter 126+ problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', fontSize: '10px', padding: '2px 6px' }}
          />
        </div>

        {/* Global Solved Progress Meter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--w95-sunken-bg, #ffffff)',
            border: '1px solid var(--w95-dark-gray, #808080)',
            padding: '2px 8px',
            borderRadius: '2px',
            fontSize: '10px',
            fontWeight: 'bold',
          }}
        >
          <span>🏆 Progress:</span>
          <span style={{ color: '#008000' }}>
            {solvedIds.length} / {SQL_CHALLENGES.length} Solved ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Main Dual-Pane Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '4px', gap: '4px' }}>
        {/* Left Column: Problem Browser & Statement */}
        <div
          style={{
            width: '420px',
            minWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflow: 'hidden',
          }}
        >
          {/* Problem Selector List */}
          <div
            className="win95-sunken"
            style={{
              height: '140px',
              overflowY: 'auto',
              background: 'var(--w95-sunken-bg, #ffffff)',
              padding: '4px',
            }}
          >
            {filteredChallenges.length === 0 ? (
              <div style={{ padding: '8px', fontSize: '11px', color: '#808080' }}>
                No challenges match your filter criteria.
              </div>
            ) : (
              filteredChallenges.map((c) => {
                const isSelected = selectedChallenge.id === c.id;
                const isSolved = solvedIds.includes(c.id);

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectChallenge(c)}
                    style={{
                      padding: '3px 6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      background: isSelected ? '#000080' : 'transparent',
                      color: isSelected ? '#ffffff' : 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '1px',
                      marginBottom: '1px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span>{isSolved ? '✅' : '📄'}</span>
                      <span style={{ fontWeight: isSelected ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
                        #{c.id}. {c.title}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        background: c.difficulty === 'Easy' ? '#e6ffe6' : c.difficulty === 'Medium' ? '#fff0e6' : '#ffe6e6',
                        color: c.difficulty === 'Easy' ? '#006600' : c.difficulty === 'Medium' ? '#cc6600' : '#cc0000',
                        fontWeight: 'bold',
                        marginLeft: '6px',
                      }}
                    >
                      {c.difficulty}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Problem Details Panel */}
          <div
            className="win95-sunken"
            style={{
              flex: 1,
              overflowY: 'auto',
              background: 'var(--w95-sunken-bg, #ffffff)',
              padding: '10px',
              fontSize: '11px',
              lineHeight: '1.5',
            }}
          >
            {/* Metadata Header */}
            <div style={{ borderBottom: '1px solid #c0c0c0', paddingBottom: '6px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '13px', color: '#000080' }}>
                  #{selectedChallenge.id}. {selectedChallenge.title}
                </h3>
                <span
                  style={{
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    borderRadius: '3px',
                    background: selectedChallenge.difficulty === 'Easy' ? '#d4edda' : selectedChallenge.difficulty === 'Medium' ? '#fff3cd' : '#f8d7da',
                    color: selectedChallenge.difficulty === 'Easy' ? '#155724' : selectedChallenge.difficulty === 'Medium' ? '#856404' : '#721c24',
                  }}
                >
                  {selectedChallenge.difficulty}
                </span>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '9px', background: '#e0e0e0', padding: '1px 5px', borderRadius: '2px' }}>
                  🏷️ {selectedChallenge.domain}
                </span>
                {selectedChallenge.companyTags.map((tag) => (
                  <span
                    key={tag}
                    style={{ fontSize: '9px', background: '#d0e0f0', color: '#004080', padding: '1px 5px', borderRadius: '2px', fontWeight: 'bold' }}
                  >
                    🏢 {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Problem Description */}
            <div style={{ whiteSpace: 'pre-line', marginBottom: '12px' }}>
              {selectedChallenge.description}
            </div>

            {/* Sample Input Tables */}
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#333' }}>📊 Sample Input Data:</h4>
              {selectedChallenge.inputTables.map((tbl) => (
                <div key={tbl.tableName} style={{ marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#000080' }}>
                    Table: <code>{tbl.tableName}</code>
                  </div>
                  <table className="win95-grid" style={{ width: '100%', fontSize: '10px', marginTop: '2px' }}>
                    <thead>
                      <tr>
                        {tbl.columns.map((c) => (
                          <th key={c.name}>{c.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tbl.rows.map((row, idx) => (
                        <tr key={idx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx}>{cell === null ? <i style={{ color: '#808080' }}>NULL</i> : String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Expected Output Grid */}
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#333' }}>🎯 Expected Output Table:</h4>
              <table className="win95-grid" style={{ width: '100%', fontSize: '10px' }}>
                <thead>
                  <tr>
                    {selectedChallenge.expectedOutput.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedChallenge.expectedOutput.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>{cell === null ? <i style={{ color: '#808080' }}>NULL</i> : String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Hints Accordion */}
            <div style={{ borderTop: '1px solid #c0c0c0', paddingTop: '8px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '11px' }}>💡 Hints & Canonical Solution:</h4>
              {selectedChallenge.hints.map((hint, idx) => {
                const isRevealed = revealedHints[idx];
                return (
                  <div key={idx} style={{ marginBottom: '4px' }}>
                    <button
                      className="win95-button"
                      style={{ fontSize: '10px', padding: '1px 6px', textAlign: 'left', width: '100%' }}
                      onClick={() =>
                        setRevealedHints((prev) => ({ ...prev, [idx]: !prev[idx] }))
                      }
                    >
                      {isRevealed ? `▼ Hint #${idx + 1}` : `► Reveal Hint #${idx + 1}`}
                    </button>
                    {isRevealed && (
                      <div
                        style={{
                          padding: '6px',
                          background: '#ffffcc',
                          border: '1px solid #cccc00',
                          fontSize: '10px',
                          marginTop: '2px',
                        }}
                      >
                        {hint}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Reveal Solution Button (Only Unlocked After Solving) */}
              <div style={{ marginTop: '6px' }}>
                {solvedIds.includes(selectedChallenge.id) ? (
                  <>
                    <button
                      className="win95-button"
                      style={{ fontSize: '10px', padding: '1px 6px', width: '100%', fontWeight: 'bold' }}
                      onClick={() => setShowSolution((prev) => !prev)}
                    >
                      {showSolution ? '▲ Hide Canonical Solution' : '🔓 Reveal Canonical Solution SQL (Unlocked)'}
                    </button>
                    {showSolution && (
                      <pre
                        className="win95-sunken"
                        style={{
                          padding: '6px',
                          fontSize: '10px',
                          fontFamily: 'var(--w95-mono)',
                          background: '#f4f4f4',
                          overflowX: 'auto',
                          marginTop: '2px',
                        }}
                      >
                        {selectedChallenge.solutionSql}
                      </pre>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#808080',
                      textAlign: 'center',
                      padding: '4px',
                      background: '#f0f0f0',
                      border: '1px dashed #a0a0a0',
                    }}
                  >
                    🔒 Solution unlocks after you submit an accepted query!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Evaluation Results */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
          {/* Action Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--w95-gray, #c0c0c0)',
              padding: '4px 6px',
              border: '1px solid var(--w95-dark-gray, #808080)',
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="win95-button"
                style={{ fontWeight: 'bold', padding: '3px 12px', fontSize: '11px', background: '#008000', color: '#ffffff' }}
                onClick={handleRunTest}
                disabled={isEvaluating}
              >
                {isEvaluating ? '⌛ Evaluating...' : '🚀 Submit Solution'}
              </button>
              <button
                className="win95-button"
                style={{ padding: '3px 10px', fontSize: '11px' }}
                onClick={handleRunTest}
                disabled={isEvaluating}
              >
                ▶ Test Query
              </button>
            </div>

            {onTryInStudio && (
              <button
                className="win95-button"
                style={{ padding: '3px 10px', fontSize: '11px' }}
                onClick={handleTryInStudioClick}
                title="Materialize challenge tables and open in main SQL Studio"
              >
                🗄️ Try in Main Studio
              </button>
            )}
          </div>

          {/* CodeMirror SQL Editor Canvas */}
          <div className="win95-sunken" style={{ flex: 1, minHeight: '220px', position: 'relative' }}>
            <QueryEditor
              value={userSql}
              onChange={setUserSql}
              dialect={'MySQL' as Dialect}
              onRun={handleRunTest}
            />
          </div>

          {/* Evaluation Result & Diff Output Canvas */}
          <div
            className="win95-sunken"
            style={{
              height: '240px',
              background: 'var(--w95-sunken-bg, #ffffff)',
              overflowY: 'auto',
              padding: '8px',
              fontSize: '11px',
            }}
          >
            {!evaluation ? (
              <div style={{ color: '#808080', textAlign: 'center', marginTop: '40px' }}>
                Click <strong>🚀 Submit Solution</strong> to evaluate your query against test cases.
              </div>
            ) : evaluation.isCorrect ? (
              <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', padding: '10px', borderRadius: '3px' }}>
                <h3 style={{ margin: 0, color: '#155724', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🟢 ACCEPTED!</span>
                  <span>— 100% Match!</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#155724' }}>
                  Execution Runtime: <strong>{evaluation.runtimeMs.toFixed(1)} ms</strong>
                </p>

                {/* User Result Table */}
                {evaluation.userResult && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#155724' }}>Your Output:</div>
                    <table className="win95-grid" style={{ width: '100%', fontSize: '10px', marginTop: '2px' }}>
                      <thead>
                        <tr>
                          {evaluation.userResult.columns.map((c) => (
                            <th key={c}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {evaluation.userResult.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>{cell === null ? 'NULL' : String(cell)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: '#f8d7da', border: '1px solid #f5c6cb', padding: '10px', borderRadius: '3px' }}>
                <h3 style={{ margin: 0, color: '#721c24', fontSize: '13px' }}>
                  ❌ {evaluation.status.replace(/_/g, ' ')}
                </h3>
                <p style={{ margin: '4px 0 8px 0', fontSize: '11px', color: '#721c24', fontWeight: 'bold' }}>
                  {evaluation.errorMessage}
                </p>

                {/* Diff Comparison Grid if user query returned output */}
                {evaluation.userResult && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#cc0000' }}>Your Output:</div>
                      <table className="win95-grid" style={{ width: '100%', fontSize: '10px' }}>
                        <thead>
                          <tr>
                            {evaluation.userResult.columns.map((c) => (
                              <th key={c}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {evaluation.userResult.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => {
                                const isMismatched = evaluation.mismatches?.some(
                                  (m) => m.rowIdx === rIdx + 1 && m.colIdx === cIdx
                                );
                                return (
                                  <td
                                    key={cIdx}
                                    style={{
                                      background: isMismatched ? '#ffcccc' : undefined,
                                      fontWeight: isMismatched ? 'bold' : 'normal',
                                      color: isMismatched ? '#cc0000' : undefined,
                                    }}
                                  >
                                    {cell === null ? 'NULL' : String(cell)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#006600' }}>Expected Output:</div>
                      <table className="win95-grid" style={{ width: '100%', fontSize: '10px' }}>
                        <thead>
                          <tr>
                            {evaluation.expectedOutput.columns.map((c) => (
                              <th key={c}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {evaluation.expectedOutput.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx}>{cell === null ? 'NULL' : String(cell)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
