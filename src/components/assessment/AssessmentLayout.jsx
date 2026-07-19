import React from "react";
import { answerChoices, assessmentTracks } from "../../data/assessmentData";
import { participantBaseOptions, trackExperience } from "../../data/assessmentExperience";
import { BrandLogo, useBranding } from "../../branding/BrandContext";
import { ArrowLeft, ArrowRight } from "../shared/Icons";

export const blankParticipant = {
  name: "", email: "", ageRange: "", gender: "", role: "", industry: "", region: "", purpose: "", tenure: "",
  privacyConsent: false, transactionalConsent: false, marketingConsent: false,
};

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

export function StageShell({ stageKey, current, total = 5, label, onBack, children, actions }) {
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
      <div className="application-powered-by">Powered by <a href="https://axon.com.sg/" target="_blank" rel="noreferrer">Axon 1Pro</a></div>
    </section>
  </div>;
}

export function SelectVersion({ onSelect }) {
  const [selected, setSelected] = React.useState("personal");
  const { tracks } = useBranding();
  return <StageShell stageKey="version" current={1} total={5} actions={<><button className="button button--ghost" disabled><ArrowLeft /> Back</button><button className="button button--primary" onClick={() => onSelect(selected)}>Continue <ArrowRight /></button></>}>
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

export function TrackIntroduction({ track, remoteExperience, onBack, onContinue }) {
  const experience = trackExperience(track.key, remoteExperience, track.priceLabel);
  return <StageShell stageKey={track.key} current={2} total={5} onBack={onBack} actions={<><button className="button button--ghost" onClick={onBack}><ArrowLeft /> Back</button><button className="button button--primary" onClick={onContinue}>Begin <ArrowRight /></button></>}>
    <AssessmentMeta trackKey={track.key} />
    <p className="eyebrow">How this assessment works</p>
    <h1>{experience.introHeadline}</h1>
    <p className="lead questionnaire-intro__body">{experience.introBody}</p>
    <div className="head-heart-explainer">
      <article><i className="assessment-meta__dot assessment-meta__dot--heart" /><div><strong>{experience.heartLabel}</strong><span>{experience.heartDescription}</span></div></article>
      <article><i className="assessment-meta__dot assessment-meta__dot--head" /><div><strong>{experience.headLabel}</strong><span>{experience.headDescription}</span></div></article>
    </div>
    <section className="questionnaire-offer"><strong>50 reflective questions · 10 areas</strong><p>{experience.introOffer}</p></section>
    <p className="hint">There are no right or wrong answers. Choose what is most true of you. Select “N/A” only when a question genuinely does not apply.</p>
  </StageShell>;
}

function SelectField({ label, options = [], value, onChange }) {
  return <label>{label}<select value={value} onChange={onChange} required><option value="">Select…</option>{options.map(option => <option key={option}>{option}</option>)}</select></label>;
}

export function ParticipantDetails({ track, remoteExperience, participant, setParticipant, onBack, onContinue, error, busy }) {
  const experience = trackExperience(track.key, remoteExperience, track.priceLabel);
  const config = experience.intake;
  const update = key => event => setParticipant(current => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const contextComplete = [participant.ageRange, participant.gender, participant.role, participant.industry, participant.region, participant.purpose, participant.tenure].every(Boolean);
  const valid = participant.name.trim() && /.+@.+\..+/.test(participant.email) && contextComplete && participant.privacyConsent && participant.transactionalConsent;
  return <StageShell stageKey="participant" current={3} total={5} onBack={onBack} actions={<><button className="button button--ghost" onClick={onBack}><ArrowLeft /> Back</button><button className="button button--primary" disabled={!valid || busy} onClick={onContinue}>{busy ? "Creating secure session…" : "Continue"} <ArrowRight /></button></>}>
    <AssessmentMeta trackKey={track.key} /><p className="eyebrow">{track.label} assessment</p><h1>Before you begin</h1><p className="lead">A few details personalise your report and create your secure resume link.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-grid participant-form">
      <label>Full name *<input autoComplete="name" value={participant.name} onChange={update("name")} placeholder="Your name" required /></label>
      <label>Email address *<input type="email" autoComplete="email" value={participant.email} onChange={update("email")} placeholder="you@example.com" required /></label>
      <SelectField label="Age range *" options={participantBaseOptions.ageRanges} value={participant.ageRange} onChange={update("ageRange")} />
      <SelectField label="Gender *" options={participantBaseOptions.genderOptions} value={participant.gender} onChange={update("gender")} />
      <SelectField label={config.whoLabel} options={config.whoOptions} value={participant.role} onChange={update("role")} />
      <SelectField label={config.whatLabel} options={config.whatOptions} value={participant.industry} onChange={update("industry")} />
      <SelectField label={config.whereLabel} options={config.whereOptions} value={participant.region} onChange={update("region")} />
      <SelectField label={config.whyLabel} options={config.whyOptions} value={participant.purpose} onChange={update("purpose")} />
      <SelectField label={config.howLabel} options={config.howOptions} value={participant.tenure} onChange={update("tenure")} />
    </div>
    <fieldset className="consents"><legend>Privacy and communication</legend><label><input type="checkbox" checked={participant.privacyConsent} onChange={update("privacyConsent")} /><span>I have read the privacy notice and consent to my answers being processed for this assessment. *</span></label><label><input type="checkbox" checked={participant.transactionalConsent} onChange={update("transactionalConsent")} /><span>Send essential messages including my resume link and report. *</span></label><label><input type="checkbox" checked={participant.marketingConsent} onChange={update("marketingConsent")} /><span>Send occasional Atom Global insights. Optional and unchecked by default.</span></label></fieldset>
  </StageShell>;
}

export function Questions({ track, remoteExperience, answers, onAnswer, onNote, section, setSection, onBack, onFinish, saveState, busy, error }) {
  const { tracks } = useBranding();
  const meta = { ...fallbackMeta[track.key], ...(tracks[track.key] || {}) };
  const experience = trackExperience(track.key, remoteExperience, track.priceLabel);
  const subscale = track.subscales[section];
  const offset = section * 5;
  const canContinue = answers.slice(offset, offset + 5).every(answer => answer?.value != null);
  const answered = answers.filter(answer => answer?.value != null).length;
  const choices = track.answerChoices || answerChoices;
  const saveLabel = saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved just now" : saveState === "error" ? "Save issue" : "";
  const continueFlow = () => section === track.subscales.length - 1 ? onFinish() : setSection(section + 1);
  return <StageShell stageKey={track.key} current={section + 1} total={track.subscales.length} label={`${answered} of ${meta.questionCount} · ${remainingTimeLabel(meta, answered)}${saveLabel ? ` · ${saveLabel}` : ""}`} onBack={section ? () => setSection(section - 1) : onBack} actions={<><button className="button button--ghost" onClick={section ? () => setSection(section - 1) : onBack}><ArrowLeft /> Back</button><button className="button button--primary" disabled={!canContinue || busy} onClick={continueFlow}>{busy ? "Preparing report…" : section === track.subscales.length - 1 ? "View result" : "Continue"} <ArrowRight /></button></>}>
    <AssessmentMeta trackKey={track.key} /><p className="eyebrow">Section {section + 1} of {meta.sectionCount}</p><h1>{subscale.name}</h1><p className="lead">{subscale.blurb || "Choose the response that feels most true of you, not the one that sounds ideal."}</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="question-list">{subscale.items.map((item, itemIndex) => {
      const answerIndex = offset + itemIndex;
      const current = answers[answerIndex] || { value: null, note: "" };
      return <fieldset className="question-card" key={item.id || item.t}>
        <legend><span>{answerIndex + 1}</span>{item.t}</legend>
        <div className="scale-options">{choices.map((choice, choiceIndex) => <label className={current.value === choiceIndex + 1 ? "selected" : ""} key={choice}><input type="radio" name={`question-${answerIndex}`} value={choiceIndex + 1} checked={current.value === choiceIndex + 1} onChange={() => onAnswer(answerIndex, choiceIndex + 1)} /><i>{choiceIndex + 1}</i><span>{choice}</span></label>)}</div>
        {experience.allowNotApplicable && <label className={`not-applicable-answer ${current.value === "NA" ? "selected" : ""}`}><input type="radio" name={`question-${answerIndex}`} value="NA" checked={current.value === "NA"} onChange={() => onAnswer(answerIndex, "NA")} /><span>N/A — doesn’t apply / can’t answer</span></label>}
        {experience.allowAnswerNotes && <label className="answer-note">Optional note<textarea rows="2" value={current.note || ""} onChange={event => onNote(answerIndex, event.target.value)} placeholder="Add context for your own record or coaching conversation" /></label>}
      </fieldset>;
    })}</div>
  </StageShell>;
}
