import React from "react";
import { answerChoices, assessmentTracks, getIntakeConfiguration } from "../../data/assessmentData";
import { BrandLogo, useBranding } from "../../branding/BrandContext";
import { ArrowLeft, ArrowRight } from "../shared/Icons";

export const blankParticipant = { name: "", email: "", ageRange: "", gender: "", role: "", industry: "", region: "", purpose: "", tenure: "", privacyConsent: false, transactionalConsent: false, marketingConsent: false };

const trackDescriptions = {
  personal: "For anyone who wants to understand how they lead their own life.",
  newjoiner: "For new joiners and anyone in their first 1–2 years of work.",
  manager: "For people managers—how you lead your team, not just yourself.",
  executive: "For senior leaders shaping strategy and culture at scale.",
};

const fallbackMeta = {
  personal: { durationMin: 15, durationMax: 15, questionCount: 50, sectionCount: 10, freeReportLabel: "Lite Report Free" },
  newjoiner: { durationMin: 15, durationMax: 15, questionCount: 50, sectionCount: 10, freeReportLabel: "Lite Report Free" },
  manager: { durationMin: 15, durationMax: 18, questionCount: 50, sectionCount: 10, freeReportLabel: "Lite Report Free" },
  executive: { durationMin: 18, durationMax: 20, questionCount: 50, sectionCount: 10, freeReportLabel: "Lite Report Free" },
};

function durationLabel(meta) {
  return meta.durationMin === meta.durationMax ? `~${meta.durationMin} minutes` : `~${meta.durationMin}–${meta.durationMax} minutes`;
}

function remainingTimeLabel(meta, answered) {
  const total = Number(meta.questionCount || 50);
  const calculated = Math.ceil(((total - answered) / total) * Number(meta.durationMax || 15));
  if (calculated <= 1) return "less than 2 min left";
  if (calculated <= 4) return "about 5 min left";
  if (calculated <= 8) return "about 10 min left";
  if (calculated <= 13) return "about 15 min left";
  return `about ${Math.ceil(calculated / 5) * 5} min left`;
}

export function AssessmentMeta({ trackKey }) {
  const { tracks } = useBranding();
  const track = assessmentTracks[trackKey];
  const meta = { ...fallbackMeta[trackKey], ...(tracks[trackKey] || {}) };
  return <div className="assessment-meta">
    <i className="assessment-meta__dot assessment-meta__dot--heart" />
    <span>Head–Heart Alignment: {track.label} · {meta.freeReportLabel} · {durationLabel(meta)}</span>
    <i className="assessment-meta__dot assessment-meta__dot--head" />
  </div>;
}

function Progress({ current, total, label }) {
  const percentage = Math.max(0, Math.min(100, current / total * 100));
  return <div className="top-progress" aria-label={`${Math.round(percentage)}% complete`}><span>{label || `Step ${current} of ${total}`}</span><div><i style={{ width: `${percentage}%` }} /></div></div>;
}

export function StageShell({ stageKey, current, total = 4, label, onBack, children, actions }) {
  const { stages } = useBranding();
  const stage = stages[stageKey] || stages.version;
  return <div className="assessment-shell">
    <aside className="visual-panel" style={{ "--stage-image": `url(${stage.image})`, "--focal-point": stage.focalPoint, "--overlay": stage.overlay / 100 }} aria-label={stage.alt}>
      <BrandLogo className="visual-logo" />
      <div className="visual-copy"><h2>{String(stage.headline || "").split("\n").map((line, index) => <React.Fragment key={`${line}-${index}`}>{line}<br /></React.Fragment>)}</h2><i /><p>{stage.supporting}</p></div>
    </aside>
    <section className="application-panel">
      <header className="mobile-header"><BrandLogo /><Progress current={current} total={total} label={label} /></header>
      <div className="desktop-topbar"><button className="back-link" onClick={onBack} disabled={!onBack}><ArrowLeft /> Back</button><Progress current={current} total={total} label={label} /></div>
      <main className="screen-content">{children}</main>
      {actions && <footer className="action-bar">{actions}</footer>}
    </section>
  </div>;
}

export function SelectVersion({ onSelect }) {
  const [selected, setSelected] = React.useState("personal");
  const { tracks } = useBranding();
  return <StageShell stageKey="version" current={1} actions={<><button className="button button--ghost" disabled><ArrowLeft /> Back</button><button className="button button--primary" onClick={() => onSelect(selected)}>Continue <ArrowRight /></button></>}>
    <AssessmentMeta trackKey={selected} /><h1>Head–Heart Alignment</h1><p className="lead">Choose the version that fits you best.</p>
    <div className="choice-stack" role="radiogroup" aria-label="Assessment version">
      {Object.values(assessmentTracks).map(track => {
        const meta = { ...fallbackMeta[track.key], ...(tracks[track.key] || {}) };
        return <button role="radio" aria-checked={selected === track.key} className={`choice-card ${selected === track.key ? "selected" : ""}`} key={track.key} onClick={() => setSelected(track.key)}>
          <span className="radio-dot">{selected === track.key && <i />}</span>
          <span className="choice-card__copy"><strong>{track.label}</strong><small>{trackDescriptions[track.key]}</small><small className="choice-card__meta">{meta.questionCount} questions · {meta.sectionCount} sections · {durationLabel(meta)}</small></span>
        </button>;
      })}
    </div>
  </StageShell>;
}

export function ParticipantDetails({ track, participant, setParticipant, onBack, onContinue, error, busy }) {
  const config = getIntakeConfiguration(track.key);
  const update = key => event => setParticipant(current => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const valid = participant.name.trim() && /.+@.+\..+/.test(participant.email) && participant.privacyConsent && participant.transactionalConsent;
  return <StageShell stageKey="participant" current={2} onBack={onBack} actions={<><button className="button button--ghost" onClick={onBack}><ArrowLeft /> Back</button><button className="button button--primary" disabled={!valid || busy} onClick={onContinue}>{busy ? "Creating secure session…" : "Continue"} <ArrowRight /></button></>}>
    <AssessmentMeta trackKey={track.key} /><p className="eyebrow">{track.label} assessment</p><h1>Before you begin</h1><p className="lead">A few details personalise your report and create your secure resume link.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-grid participant-form"><label>Full name *<input autoComplete="name" value={participant.name} onChange={update("name")} placeholder="Your name" /></label><label>Email address *<input type="email" autoComplete="email" value={participant.email} onChange={update("email")} placeholder="you@example.com" /></label><label>{config.whoLabel}<select value={participant.role} onChange={update("role")}><option value="">Select…</option>{config.whoOptions.map(option => <option key={option}>{option}</option>)}</select></label><label>{config.whatLabel}<select value={participant.industry} onChange={update("industry")}><option value="">Select…</option>{config.whatOptions.map(option => <option key={option}>{option}</option>)}</select></label></div>
    <fieldset className="consents"><legend>Privacy and communication</legend><label><input type="checkbox" checked={participant.privacyConsent} onChange={update("privacyConsent")} /><span>I have read the privacy notice and consent to my answers being processed for this assessment. *</span></label><label><input type="checkbox" checked={participant.transactionalConsent} onChange={update("transactionalConsent")} /><span>Send essential messages including my resume link and report. *</span></label><label><input type="checkbox" checked={participant.marketingConsent} onChange={update("marketingConsent")} /><span>Send occasional Atom Global insights. Optional and unchecked by default.</span></label></fieldset>
  </StageShell>;
}

export function Questions({ track, answers, onAnswer, section, setSection, onBack, onFinish, saveState, busy, error }) {
  const { tracks } = useBranding();
  const meta = { ...fallbackMeta[track.key], ...(tracks[track.key] || {}) };
  const subscale = track.subscales[section];
  const offset = section * 5;
  const canContinue = answers.slice(offset, offset + 5).every(answer => answer?.value != null);
  const answered = answers.filter(answer => answer?.value != null).length;
  const choices = track.answerChoices || answerChoices;
  const saveLabel = saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved just now" : saveState === "error" ? "Save issue" : "";
  const continueFlow = () => section === track.subscales.length - 1 ? onFinish() : setSection(section + 1);
  return <StageShell stageKey={track.key} current={section + 1} total={track.subscales.length} label={`${answered} of ${meta.questionCount} · ${remainingTimeLabel(meta, answered)}${saveLabel ? ` · ${saveLabel}` : ""}`} onBack={section ? () => setSection(section - 1) : onBack} actions={<><button className="button button--ghost" onClick={section ? () => setSection(section - 1) : onBack}><ArrowLeft /> Back</button><button className="button button--primary" disabled={!canContinue || busy} onClick={continueFlow}>{busy ? "Preparing report…" : section === track.subscales.length - 1 ? "View result" : "Continue"} <ArrowRight /></button></>}>
    <AssessmentMeta trackKey={track.key} /><p className="eyebrow">Section {section + 1} of {meta.sectionCount}</p><h1>{subscale.name}</h1><p className="lead">Choose the response that feels most true of you, not the one that sounds ideal.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="question-list">{subscale.items.map((item, itemIndex) => { const answerIndex = offset + itemIndex; return <fieldset className="question-card" key={item.id || item.t}><legend><span>{answerIndex + 1}</span>{item.t}</legend><div className="scale-options">{choices.map((choice, choiceIndex) => <label className={answers[answerIndex]?.value === choiceIndex + 1 ? "selected" : ""} key={choice}><input type="radio" name={`question-${answerIndex}`} value={choiceIndex + 1} checked={answers[answerIndex]?.value === choiceIndex + 1} onChange={() => onAnswer(answerIndex, choiceIndex + 1)} /><i>{choiceIndex + 1}</i><span>{choice}</span></label>)}</div></fieldset>; })}</div>
  </StageShell>;
}
