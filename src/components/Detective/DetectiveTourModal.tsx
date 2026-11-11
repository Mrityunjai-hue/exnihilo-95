/**
 * DetectiveTourModal.tsx — Windows 95 Detective Field Manual & Quick Guide Tour
 *
 * Authentic Windows 95 Wizard dialog that introduces players to the 4-step
 * murder mystery gameplay loop, the forensic SQL Investigation Room, and the
 * evidence selection system.
 */

import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface DetectiveTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInvestigationRoom?: () => void;
}

interface TourStep {
  title: string;
  badge: string;
  subtitle: string;
  body: React.ReactNode;
  icon: string;
}

export const DetectiveTourModal: React.FC<DetectiveTourModalProps> = ({
  isOpen,
  onClose,
  onOpenInvestigationRoom,
}) => {
  const { activeTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const steps: TourStep[] = [
    {
      title: 'The Crime at Blackwood Manor',
      badge: 'CASE 1995-CR-0842',
      icon: '🏰',
      subtitle: 'A poisoned Scottish patriarch, 6 trapped suspects, and digital evidence.',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', lineHeight: '1.6' }}>
          <p style={{ margin: 0 }}>
            On the storm-lashed night of <strong>October 24, 1995</strong>, Scottish landowner{' '}
            <strong>Lord Archibald Blackwood (68)</strong> collapsed dead in his locked second-floor study.
          </p>
          <div
            className="win95-sunken"
            style={{
              padding: '10px 12px',
              background: 'var(--w95-sunken-bg, #ffffff)',
              borderLeft: '4px solid #b71c1c',
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#b71c1c' }}>🚨 Official Coroner Finding:</div>
            <div>
              Lord Archibald was killed by <strong>Potassium Cyanide</strong> slipped into his vintage 1945 port wine.
              The family doctor claimed natural heart failure, and the chef was caught hiding rat poison.
              Six persons remain inside the sealed estate.
            </div>
          </div>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Your mission as Lead Detective: <strong>interrogate the evidence using SQL</strong>, shatter the killer's false
            alibi, and deliver a capital indictment to the Grand Jury!
          </p>
        </div>
      ),
    },
    {
      title: 'Step 1: Check Suspects & Sworn Alibis',
      badge: 'THE 6 SUSPECTS',
      icon: '👥',
      subtitle: 'Every suspect claims an innocent story. Look for contradictions!',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', lineHeight: '1.6' }}>
          <p style={{ margin: 0 }}>
            Click the <strong>👥 Suspects & Alibis</strong> tab. Read what each suspect claims they were doing
            between 21:00 and 22:30.
          </p>
          <div
            className="win95-sunken"
            style={{
              padding: '10px 12px',
              background: 'var(--w95-sunken-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>🔍 Prime Example: Julian Vance (Nephew & Former Heir)</div>
            <div style={{ fontStyle: 'italic', background: 'rgba(0,0,0,0.04)', padding: '6px 8px' }}>
              "I caught the 21:15 express train south from Dalwhinnie Station and was nowhere near the manor..."
            </div>
            <div style={{ fontSize: '11px', color: '#0066cc', fontWeight: 'bold' }}>
              💡 Suspicion: Did Julian really board that train? The mansion's electronic door locks tell a different story!
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Step 2: Enter the Data Investigation Room',
      badge: 'FORENSIC SQL LAB',
      icon: '🔬',
      subtitle: 'Your crime laboratory equipped with 8 relational police tables.',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', lineHeight: '1.6' }}>
          <p style={{ margin: 0 }}>
            Open the <strong>🔬 Investigation Room</strong> tab. You have full SQL query access to:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <div className="win95-sunken" style={{ padding: '6px 8px', background: 'var(--w95-sunken-bg)' }}>
              <strong>🔑 keycard_logs:</strong> Door swipe timestamps & room IDs.
            </div>
            <div className="win95-sunken" style={{ padding: '6px 8px', background: 'var(--w95-sunken-bg)' }}>
              <strong>🧪 toxicology_records:</strong> Lab chemical assays & fatal toxins.
            </div>
            <div className="win95-sunken" style={{ padding: '6px 8px', background: 'var(--w95-sunken-bg)' }}>
              <strong>💊 apothecary_orders:</strong> Invoices & poison purchases.
            </div>
            <div className="win95-sunken" style={{ padding: '6px 8px', background: 'var(--w95-sunken-bg)' }}>
              <strong>📜 estate_wills:</strong> Archibald's secret £4.5M inheritance.
            </div>
          </div>
          <div style={{ padding: '8px 10px', background: 'rgba(0, 128, 0, 0.1)', border: '1px solid #2e7d32' }}>
            <strong>💡 Investigation Leads:</strong> Select an <strong>Investigation Lead</strong> on the left sidebar
            to review the objective and table schema. Then write your custom SQL <code>WHERE</code> filter and press <strong>[F5]</strong> to run!
          </div>
        </div>
      ),
    },
    {
      title: 'Step 3: Selecting Evidence (The Pin Method)',
      badge: 'EVIDENCE SELECTION',
      icon: '📌',
      subtitle: 'How to isolate the smoking gun row and use it against the killer.',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', lineHeight: '1.6' }}>
          <p style={{ margin: 0 }}>
            When a query returns records, look for the row that proves a suspect lied.
          </p>
          <div
            className="win95-sunken"
            style={{
              padding: '10px 12px',
              background: 'var(--w95-sunken-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  background: '#ffb000',
                  color: '#000000',
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  borderRadius: '2px',
                  fontSize: '11px',
                }}
              >
                📌 ATTACH AS CLUE EVIDENCE
              </div>
              <div>Click this button on the row you want to use as proof!</div>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>
              Once clicked, the row turns into <strong>✓ ATTACHED AS EVIDENCE</strong>. It is now loaded into your active
              detective clip and ready to be submitted at the interrogation desk!
            </div>
          </div>
          <div style={{ padding: '8px 10px', background: 'rgba(230, 81, 0, 0.1)', border: '1px solid #e65100' }}>
            ⚠️ <strong>Watch out for Red Herrings:</strong> Chef Gordon's rat poison (Arsenic) is a decoy!
            Always verify that the evidence matches the coroner's findings (Cyanide).
          </div>
        </div>
      ),
    },
    {
      title: 'Step 4: Solve Clues & Interrogate Suspects',
      badge: 'CONFRONTATION DESK',
      icon: '🧩',
      subtitle: 'Confront the suspects with your proof and shatter their defense.',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', lineHeight: '1.6' }}>
          <p style={{ margin: 0 }}>
            Open the <strong>🧩 Solve Clues</strong> tab. Select any of the 5 Clue Dossiers.
          </p>
          <div
            className="win95-sunken"
            style={{
              padding: '10px 12px',
              background: 'var(--w95-sunken-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>Side-by-Side Confrontation:</div>
            <div>• <strong>Left:</strong> The suspect's sworn lie under police oath.</div>
            <div>• <strong>Right:</strong> Your forensic proof selected from the Investigation Room.</div>
            <div style={{ marginTop: '4px', fontWeight: 'bold', color: '#1b5e20' }}>
              Click [ ⚖️ CONFRONT SUSPECT WITH THIS EVIDENCE ] to deliver the proof!
            </div>
          </div>
          <p style={{ margin: 0, opacity: 0.9 }}>
            When submitted correctly, a red <strong>ADMITTED AS EVIDENCE</strong> stamp is slammed onto the file,
            the suspect's confession is unlocked, and your detective credibility increases!
          </p>
        </div>
      ),
    },
    {
      title: 'Step 5: High Court Grand Jury Trial',
      badge: 'THE FINAL INDICTMENT',
      icon: '⚖️',
      subtitle: 'Unlock the 3 Prosecution Vault Exhibits to deliver justice.',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', lineHeight: '1.6' }}>
          <p style={{ margin: 0 }}>
            Once you have solved the 5 clues, the Crown Prosecution Vault unseals the 3 pillars of justice:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
            <div className="win95-sunken" style={{ padding: '6px 10px', background: 'var(--w95-sunken-bg)' }}>
              <strong>🔓 Exhibit A: Motive</strong> — The secret will revision cutting Julian off.
            </div>
            <div className="win95-sunken" style={{ padding: '6px 10px', background: 'var(--w95-sunken-bg)' }}>
              <strong>🔓 Exhibit B: Means</strong> — The potassium cyanide purchased in Edinburgh.
            </div>
            <div className="win95-sunken" style={{ padding: '6px 10px', background: 'var(--w95-sunken-bg)' }}>
              <strong>🔓 Exhibit C: Opportunity</strong> — The 21:44 keycard swipe into the study.
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <span style={{ fontWeight: 'bold', color: '#1b5e20', fontSize: '13px' }}>
              🔨 Strike the High Court Oak Gavel and print the front-page victory extra edition!
            </span>
          </div>
        </div>
      ),
    },
  ];

  const handleFinish = () => {
    if (typeof window !== 'undefined' && dontShowAgain) {
      localStorage.setItem('exnihilo_detective_tour_completed', 'true');
    }
    onClose();
    if (onOpenInvestigationRoom) {
      onOpenInvestigationRoom();
    }
  };

  const cur = steps[currentStep];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 10005,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="win95-window"
        style={{
          width: '580px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 4px 16px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="win95-titlebar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="win95-titlebar-text">
            <span>📖 Detective Field Manual: Guide Tour (Step {currentStep + 1} of {steps.length})</span>
          </div>
          <button
            className="win95-close-btn"
            onClick={onClose}
            title="Close Tour"
            style={{ minWidth: '18px', height: '18px', padding: 0, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Wizard Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Classic Left Wizard Strip */}
          <div
            style={{
              width: '140px',
              background: 'linear-gradient(180deg, #000080 0%, #1084d0 100%)',
              color: '#ffffff',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRight: '2px solid var(--w95-dark-gray, #808080)',
            }}
          >
            <div>
              <div style={{ fontSize: '36px', textAlign: 'center', marginBottom: '8px' }}>{cur.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>
                SCOTLAND YARD
              </div>
              <div style={{ fontSize: '10px', textAlign: 'center', opacity: 0.8, marginTop: '2px' }}>
                HOMICIDE BUREAU
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
              {steps.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  style={{
                    cursor: 'pointer',
                    padding: '3px 6px',
                    borderRadius: '2px',
                    background: currentStep === idx ? 'rgba(255,255,255,0.25)' : 'transparent',
                    fontWeight: currentStep === idx ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{currentStep === idx ? '▶' : '•'}</span>
                  <span>Step {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Main Content */}
          <div
            style={{
              flex: 1,
              padding: '18px 20px',
              background: 'var(--w95-gray, #c0c0c0)',
              color: 'var(--w95-text-color, #000000)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--w95-dark-gray, #808080)', paddingBottom: '10px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="win95-badge success" style={{ fontSize: '10px' }}>{cur.badge}</span>
                <span style={{ fontSize: '11px', opacity: 0.75 }}>{currentStep + 1} / {steps.length}</span>
              </div>
              <h2 style={{ margin: '6px 0 2px', fontSize: '17px', fontWeight: 'bold' }}>{cur.title}</h2>
              <div style={{ fontSize: '12px', opacity: 0.85 }}>{cur.subtitle}</div>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>{cur.body}</div>

            {/* Checkbox */}
            <div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid var(--w95-light-gray, #ffffff)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                <span>Don't show this guide tour automatically on case launch</span>
              </label>
            </div>
          </div>
        </div>

        {/* Wizard Footer Controls */}
        <div
          className="win95-inset"
          style={{
            padding: '10px 14px',
            background: 'var(--w95-gray, #c0c0c0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--w95-dark-gray, #808080)',
          }}
        >
          <button
            className="win95-button"
            onClick={onClose}
            style={{ padding: '4px 14px', fontSize: '11px' }}
          >
            Skip Tour
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="win95-button"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              style={{ padding: '4px 14px', fontSize: '11px' }}
            >
              &lt; Back
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                className="win95-button"
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                style={{ padding: '4px 16px', fontSize: '11px', fontWeight: 'bold' }}
              >
                Next &gt;
              </button>
            ) : (
              <button
                className="win95-button"
                onClick={handleFinish}
                style={{
                  padding: '4px 18px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  background: 'var(--w95-title-active-bg, #000080)',
                  color: '#ffffff',
                }}
              >
                Start Investigating ➔
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

