import React from "react";
import { answerChoices, assessmentTracks, getIntakeConfiguration } from "../data/assessmentData";
import { api, isMockMode } from "../api/client";
import { stageContent } from "../api/mockData";
import { AlignmentGauge, RadarChart } from "./shared/Charts";
import { ArrowLeft, ArrowRight, Check, Lock } from "./shared/Icons";
import AdminApp from "./admin/AdminApp";

const blankParticipant = { name: "", email: "", ageRange: "", gender: "", role: "", industry: "", region: "", purpose: "", tenure: "", privacyConsent: false, transactionalConsent: false, marketingConsent: false };
const trackDescriptions = { personal: "For anyone who wants to understand how they lead their own life.", newjoiner: "For new joiners and anyone in their first 1–2 years of work.", manager: "For people managers—how you lead your team, not just yourself.", executive: "For senior leaders shaping strategy and culture at scale." };

function Progress({ current, total, label }) { return <div className="top-progress"><span>{label || `Step ${current} of ${total}`}</span><div><i style={{ width: `${current / total * 100}%` }} /></div></div>; }

function StageShell({ stageKey, current, total = 4, label, onBack, children, actions }) {
  const stage = stageContent[stageKey] || stageContent.version;
  return <div className="assessment-shell">
    <aside className={`visual-panel visual-panel--${stageKey}`} style={{ "--stage-image": `url(${stage.image})`, "--focal-point": stage.focalPoint, "--overlay": stage.overlay / 100 }} aria-label={stage.alt}>
      <img className="visual-logo" src="/media/brand/atom-global-wordmark.png" alt="Atom Global Consulting" />
      <div className="visual-copy"><h2>{stage.headline.split("\n").map(line => <React.Fragment key={line}>{line}<br/></React.Fragment>)}</h2><i/><p>{stage.supporting}</p></div>
    </aside>
    <section className="application-panel"><header className="mobile-header"><img src="/media/brand/atom-global-wordmark.png" alt="Atom Global Consulting"/><Progress current={current} total={total} label={label}/></header><div className="desktop-topbar"><button className="back-link" onClick={onBack} disabled={!onBack}><ArrowLeft/> Back</button><Progress current={current} total={total} label={label}/></div><main className="screen-content">{children}</main>{actions && <footer className="action-bar">{actions}</footer>}</section>
  </div>;
}

function SelectVersion({ onSelect }) {
  const [selected, setSelected] = React.useState("personal");
  return <StageShell stageKey="version" current={1} actions={<><button className="button button--ghost" disabled><ArrowLeft/> Back</button><button className="button button--primary" onClick={() => onSelect(selected)}>Continue <ArrowRight/></button></>}>
    <p className="eyebrow">Begin your assessment</p><h1>Head–Heart Alignment</h1><p className="lead">Choose the version that fits you best.</p><div className="choice-stack" role="radiogroup" aria-label="Assessment version">{Object.values(assessmentTracks).map(track => <button role="radio" aria-checked={selected === track.key} className={`choice-card ${selected === track.key ? "selected" : ""}`} key={track.key} onClick={() => setSelected(track.key)}><span className="radio-dot">{selected === track.key && <i/>}</span><span><strong>{track.label}</strong><small>{trackDescriptions[track.key]}</small></span></button>)}</div>
  </StageShell>;
}

function ParticipantDetails({ track, participant, setParticipant, onBack, onContinue }) {
  const config = getIntakeConfiguration(track.key);
  const update = key => event => setParticipant(current => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const valid = participant.name.trim() && /.+@.+\..+/.test(participant.email) && participant.privacyConsent && participant.transactionalConsent;
  return <StageShell stageKey="participant" current={2} onBack={onBack} actions={<><button className="button button--ghost" onClick={onBack}><ArrowLeft/> Back</button><button className="button button--primary" disabled={!valid} onClick={onContinue}>Continue <ArrowRight/></button></>}>
    <p className="eyebrow">{track.label} assessment</p><h1>Before you begin</h1><p className="lead">A few details personalise your report and create your secure resume link.</p><div className="form-grid participant-form"><label>Full name *<input autoComplete="name" value={participant.name} onChange={update("name")} placeholder="Your name"/></label><label>Email address *<input type="email" autoComplete="email" value={participant.email} onChange={update("email")} placeholder="you@example.com"/></label><label>{config.whoLabel}<select value={participant.role} onChange={update("role")}><option value="">Select…</option>{config.whoOptions.map(option => <option key={option}>{option}</option>)}</select></label><label>{config.whatLabel}<select value={participant.industry} onChange={update("industry")}><option value="">Select…</option>{config.whatOptions.map(option => <option key={option}>{option}</option>)}</select></label></div><fieldset className="consents"><legend>Privacy and communication</legend><label><input type="checkbox" checked={participant.privacyConsent} onChange={update("privacyConsent")}/><span>I have read the privacy notice and consent to my answers being processed for this assessment. *</span></label><label><input type="checkbox" checked={participant.transactionalConsent} onChange={update("transactionalConsent")}/><span>Send essential messages including my resume link and report. *</span></label><label><input type="checkbox" checked={participant.marketingConsent} onChange={update("marketingConsent")}/><span>Send occasional Atom Global insights. Optional and unchecked by default.</span></label></fieldset>
  </StageShell>;
}

function Questions({ track, answers, onAnswer, section, setSection, onBack, onFinish }) {
  const subscale = track.subscales[section];
  const offset = section * 5;
  const sectionAnswers = answers.slice(offset, offset + 5);
  const canContinue = sectionAnswers.every(answer => answer?.value != null);
  const answered = answers.filter(answer => answer?.value != null).length;
  const continueFlow = () => section === track.subscales.length - 1 ? onFinish() : setSection(section + 1);
  return <StageShell stageKey={track.key} current={section + 1} total={track.subscales.length} label={`${answered} of 50 answered`} onBack={section ? () => setSection(section - 1) : onBack} actions={<><button className="button button--ghost" onClick={section ? () => setSection(section - 1) : onBack}><ArrowLeft/> Back</button><button className="button button--primary" disabled={!canContinue} onClick={continueFlow}>{section === 9 ? "View result" : "Continue"} <ArrowRight/></button></>}>
    <p className="eyebrow">Section {section + 1} of 10</p><h1>{subscale.name}</h1><p className="lead">Choose the response that feels most true of you, not the one that sounds ideal.</p><div className="question-list">{subscale.items.map((item, itemIndex) => { const answerIndex = offset + itemIndex; return <fieldset className="question-card" key={item.t}><legend><span>{answerIndex + 1}</span>{item.t}</legend><div className="scale-options">{answerChoices.map((choice, choiceIndex) => <label className={answers[answerIndex]?.value === choiceIndex + 1 ? "selected" : ""} key={choice}><input type="radio" name={`question-${answerIndex}`} value={choiceIndex + 1} checked={answers[answerIndex]?.value === choiceIndex + 1} onChange={() => onAnswer(answerIndex, choiceIndex + 1)}/><i>{choiceIndex + 1}</i><span>{choice}</span></label>)}</div></fieldset>})}</div>
  </StageShell>;
}

function calculateReport(track, answers) {
  const totals = track.subscales.map(() => ({ score: 0, count: 0 }));
  let score = 0;
  track.allItems.forEach((item, index) => { const raw = answers[index]?.value; if (!raw) return; const value = item.d === "K" ? 6 - raw : raw; score += value; totals[item.subIndex].score += value; totals[item.subIndex].count += 1; });
  const total = Math.round(score / answers.length * 50);
  return { total, subScores: totals.map(item => Math.round(item.score / item.count * 5)), profile: track.getProfileFn(total) };
}

function Report({ track, report, participant, session, onReset }) {
  const [unlocked, setUnlocked] = React.useState(false);
  React.useEffect(() => { if (!session?.reportToken || isMockMode) return; api.getReport(session.reportToken).then(remote => setUnlocked(Number(remote?.is_unlocked) === 1)).catch(() => {}); }, [session?.reportToken]);
  const checkout = async () => { const result = await api.createCheckout({ sessionId: session?.id, track: track.key }); if (result.preview) setUnlocked(true); else location.href = result.url; };
  return <StageShell stageKey="report" current={4} onBack={null} actions={<><button className="button button--ghost" onClick={onReset}>Start again</button><button className="button button--primary" onClick={() => window.print()}>Print report</button></>}>
    <p className="eyebrow">Your {track.label} result</p><h1>{report.profile.name}</h1><p className="lead">{participant.name ? `${participant.name}, this` : "This"} profile reflects the pattern across your 50 responses.</p><section className="report-hero"><AlignmentGauge score={report.total}/><div><h2>Your alignment pattern</h2><p>{report.profile.summary}</p></div></section><div className="report-columns"><section className="report-card"><h2>Strengths to build on</h2><ul>{report.profile.strengths.slice(0, 3).map(item => <li key={item}><Check/>{item}</li>)}</ul></section><section className="report-card"><h2>Development observations</h2><ul>{report.profile.watchouts.slice(0, 3).map(item => <li key={item}><span>—</span>{item}</li>)}</ul></section></div>
    <section className={`paid-report ${unlocked ? "unlocked" : "locked"}`}><div className="paid-heading"><div><p className="eyebrow">Complete report</p><h2>{unlocked ? "Your full development report" : "Go beyond the headline"}</h2></div>{!unlocked && <span className="lock-badge"><Lock/> Locked</span>}</div>{unlocked ? <><RadarChart values={report.subScores} labels={track.subscales.map(item => item.code)}/><div className="full-report-copy"><h3>Development roadmap</h3>{report.profile.roadmap.map(item => <article key={item.area}><h4>{item.area}</h4><p>{item.insight}</p><ul>{item.steps.map(step => <li key={step}>{step}</li>)}</ul></article>)}</div></> : <><div className="locked-preview"><div><h3>10-area radar and deep dive</h3><p>See exactly where your head and heart lead across decisions, relationships, conflict and pressure.</p></div><div><h3>Practical development roadmap</h3><p>Receive tailored actions, working-style guidance and track-specific leadership or culture insights.</p></div></div><div className="upgrade-box"><div><span>One-time payment</span><strong>{track.priceLabel}</strong><small>Secure checkout · Printable PDF · Private report link</small></div><button className="button button--primary" onClick={checkout}>Unlock complete report <ArrowRight/></button></div></> }</section>{isMockMode && <p className="preview-note">Preview mode: payment unlock is simulated. Production unlocks only after a verified Stripe webhook or authorised admin action.</p>}
  </StageShell>;
}

function PaymentStatus({ cancelled = false }) {
  return <StageShell stageKey="report" current={4}><p className="eyebrow">Secure checkout</p><h1>{cancelled ? "Payment not completed" : "Payment received"}</h1><p className="lead">{cancelled ? "Nothing was charged. You can return to your private report and try again when ready." : "Stripe is confirming your payment. Your full report unlocks only after the verified webhook arrives, and the private link is sent by email."}</p><a className="button button--primary" href="/">Return to assessment</a></StageShell>;
}

function RemoteReport({ token }) {
  const [state, setState] = React.useState({ loading: true, report: null, error: "" });
  React.useEffect(() => { api.getReport(token).then(report => setState({ loading: false, report, error: "" })).catch(error => setState({ loading: false, report: null, error: error.message })); }, [token]);
  if (state.loading) return <StageShell stageKey="report" current={4}><p className="lead">Loading your private report…</p></StageShell>;
  if (state.error) return <StageShell stageKey="report" current={4}><p className="eyebrow">Private report</p><h1>Link unavailable</h1><p className="lead">This report link is invalid, expired or revoked. Request a new link from Atom Global support.</p></StageShell>;
  const free = JSON.parse(state.report.free_report_json); const paid = state.report.paid_report_json ? JSON.parse(state.report.paid_report_json) : null;
  return <StageShell stageKey="report" current={4}><p className="eyebrow">Private report</p><h1>{free.profile}</h1><p className="lead">Alignment score: {free.total} out of 250.</p><section className="report-card"><pre>{JSON.stringify(paid || free, null, 2)}</pre></section></StageShell>;
}

export default function AssessmentApp() {
  if (location.pathname.startsWith("/admin")) return <AdminApp/>;
  if (location.pathname === "/payment/success") return <PaymentStatus/>;
  if (location.pathname === "/payment/cancelled") return <PaymentStatus cancelled/>;
  if (location.pathname.startsWith("/report/")) return <RemoteReport token={location.pathname.split("/").filter(Boolean).at(-1)}/>;
  const [stage, setStage] = React.useState("select");
  const [trackKey, setTrackKey] = React.useState(null);
  const [participant, setParticipant] = React.useState(blankParticipant);
  const [answers, setAnswers] = React.useState([]);
  const [section, setSection] = React.useState(0);
  const [session, setSession] = React.useState(null);
  const track = trackKey ? assessmentTracks[trackKey] : null;
  React.useEffect(() => { api.loadSession().then(saved => { if (!saved?.trackKey || saved.status === "completed") return; setSession(saved); setTrackKey(saved.trackKey); setParticipant(saved.participant || blankParticipant); setAnswers(saved.answers || []); setSection(saved.section || 0); setStage(saved.participant?.email ? "questions" : "details"); }); }, []);
  React.useEffect(() => { if (!session?.id || stage !== "questions") return; const timer = setTimeout(() => api.saveSession({ id: session.id, participant, answers, section }).then(setSession), 250); return () => clearTimeout(timer); }, [answers, section]);
  const selectTrack = key => { setTrackKey(key); setAnswers(assessmentTracks[key].allItems.map(() => ({ value: null, note: "" }))); setStage("details"); };
  const begin = async () => { const created = await api.createSession({ trackKey, assessmentVersion: "1.0.0", participant, answers, section: 0 }); setSession(created); setStage("questions"); };
  const finish = async () => { const completed = await api.completeSession({ id: session.id, participant, answers, section: 9 }); setSession(completed); setStage("report"); window.scrollTo(0, 0); };
  const reset = () => { localStorage.removeItem("hhaa-v2-preview-session"); setStage("select"); setTrackKey(null); setParticipant(blankParticipant); setAnswers([]); setSection(0); setSession(null); history.replaceState({}, "", location.pathname); };
  if (stage === "select") return <SelectVersion onSelect={selectTrack}/>;
  if (stage === "details") return <ParticipantDetails track={track} participant={participant} setParticipant={setParticipant} onBack={() => setStage("select")} onContinue={begin}/>;
  if (stage === "questions") return <Questions track={track} answers={answers} section={section} setSection={setSection} onBack={() => setStage("details")} onAnswer={(index, value) => setAnswers(current => current.map((answer, answerIndex) => answerIndex === index ? { ...answer, value } : answer))} onFinish={finish}/>;
  return <Report track={track} report={calculateReport(track, answers)} participant={participant} session={session} onReset={reset}/>;
}
