import React from "react";
import { api } from "../../api/client";
import { experienceDefaults, questionnaireReference } from "../../data/assessmentExperience";
import { Notice, PageHeader, Spinner, useLoader } from "./AdminShared";

const fieldDefinitions = [
  ["who", "Who / current situation"],
  ["what", "Work, industry or area of focus"],
  ["where", "Location"],
  ["why", "Reason for taking the assessment"],
  ["how", "Current chapter or tenure"],
];

function normalise(item, trackKey) {
  const fallback = experienceDefaults[trackKey] || experienceDefaults.personal;
  return {
    ...fallback,
    ...(item || {}),
    intake: { ...fallback.intake, ...(item?.intake || {}) },
  };
}

function optionsToText(options) {
  return Array.isArray(options) ? options.join("\n") : "";
}

function textToOptions(value) {
  return String(value || "").split("\n").map(item => item.trim()).filter(Boolean);
}

function TrackEditor({ track, onSaved }) {
  const loader = useLoader(() => api.adminAssessmentExperience(track.trackId), [track.trackId]);
  const [form, setForm] = React.useState(() => normalise(null, track.trackKey));
  const [notice, setNotice] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (loader.data) setForm(normalise(loader.data, track.trackKey));
  }, [loader.data, track.trackKey]);

  if (loader.loading) return <Spinner />;

  const update = key => event => setForm(current => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const updateIntake = (key, value) => setForm(current => ({ ...current, intake: { ...current.intake, [key]: value } }));
  const save = async event => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const saved = await api.saveAssessmentExperience(track.trackId, form);
      setForm(normalise(saved, track.trackKey));
      setNotice("Questionnaire process saved to the CMS. Existing participant sessions remain pinned to their original published question version.");
      onSaved?.();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  return <form className="questionnaire-cms editor-form" onSubmit={save}>
    <Notice>{notice}</Notice><Notice type="error">{loader.error}</Notice>
    <section className="admin-card">
      <div className="card-heading"><div><h2>Introduction and positioning</h2><small>Preserved from the supplied live index reference and editable per track.</small></div></div>
      <div className="form-grid">
        <label className="form-grid__wide">Introduction heading<input value={form.introHeadline || `Head–Heart Alignment: ${track.trackName}`} onChange={update("introHeadline")} /></label>
        <label className="form-grid__wide">Introduction copy<textarea rows="5" value={form.introBody || ""} onChange={update("introBody")} /></label>
        <label className="form-grid__wide">Lite/Full report offer<textarea rows="4" value={form.introOffer || ""} onChange={update("introOffer")} /><small>Use <code>{"{{price}}"}</code> where the track price should appear.</small></label>
        <label>Heart label<input value={form.heartLabel || ""} onChange={update("heartLabel")} /></label>
        <label>Head label<input value={form.headLabel || ""} onChange={update("headLabel")} /></label>
        <label>Heart explanation<input value={form.heartDescription || ""} onChange={update("heartDescription")} /></label>
        <label>Head explanation<input value={form.headDescription || ""} onChange={update("headDescription")} /></label>
      </div>
    </section>

    <section className="admin-card">
      <div className="card-heading"><div><h2>Participant intake</h2><small>Name, email, age range and gender remain standard. Configure the five context questions below.</small></div></div>
      <div className="questionnaire-intake-grid">
        {fieldDefinitions.map(([prefix, title]) => <article className="questionnaire-intake-field" key={prefix}>
          <h3>{title}</h3>
          <label>Question label<input value={form.intake?.[`${prefix}Label`] || ""} onChange={event => updateIntake(`${prefix}Label`, event.target.value)} /></label>
          <label>Options — one per line<textarea rows="8" value={optionsToText(form.intake?.[`${prefix}Options`])} onChange={event => updateIntake(`${prefix}Options`, textToOptions(event.target.value))} /></label>
        </article>)}
      </div>
    </section>

    <section className="admin-card">
      <div className="card-heading"><div><h2>Question response process</h2><small>The five scored choices remain versioned with each assessment. These controls preserve the supplied live process.</small></div></div>
      <div className="settings-checks">
        <label className="check-row"><input type="checkbox" checked={Boolean(form.allowNotApplicable)} onChange={update("allowNotApplicable")} /> Show “N/A — doesn’t apply / can’t answer” and exclude it from scoring</label>
        <label className="check-row"><input type="checkbox" checked={Boolean(form.allowAnswerNotes)} onChange={update("allowAnswerNotes")} /> Allow an optional note beneath every question</label>
      </div>
      <Notice>Question wording, scoring direction, sections, answer labels and report profiles remain under <strong>Assessments</strong>. Clone a published version before editing; published versions remain immutable.</Notice>
    </section>

    <div className="questionnaire-cms__actions"><button className="button button--primary" disabled={busy}>{busy ? "Saving…" : "Save questionnaire process"}</button></div>
  </form>;
}

export default function QuestionnairePage() {
  const assessments = useLoader(() => api.adminAssessments(), []);
  const [trackKey, setTrackKey] = React.useState("personal");
  const [revision, setRevision] = React.useState(0);

  if (assessments.loading) return <Spinner />;
  const rows = assessments.data?.items || [];
  const tracks = [...new Map(rows.map(item => [item.trackKey, item])).values()];
  const selected = tracks.find(item => item.trackKey === trackKey) || tracks[0];

  return <>
    <PageHeader eyebrow="CMS questionnaire workflow" title="Questionnaire" actions={<button className="button" onClick={assessments.refresh}>Refresh</button>} />
    <Notice type="error">{assessments.error}</Notice>
    <section className="admin-card questionnaire-reference">
      <div><strong>Supplied reference verified</strong><span>index.html · 4 tracks · 10 sections · 50 questions per track</span></div>
      <small>Reference SHA-256: {questionnaireReference.sourceFileSha256.slice(0, 16)}… · Questionnaire SHA-256: {questionnaireReference.questionnaireSha256.slice(0, 16)}…</small>
    </section>
    <div className="questionnaire-track-tabs" role="tablist" aria-label="Questionnaire track">
      {tracks.map(track => <button role="tab" aria-selected={selected?.trackKey === track.trackKey} className={selected?.trackKey === track.trackKey ? "active" : ""} key={track.trackKey} onClick={() => setTrackKey(track.trackKey)}><strong>{track.trackName}</strong><small>{track.questionCount} questions · {track.sectionCount} sections</small></button>)}
    </div>
    {selected && <TrackEditor key={`${selected.trackId}-${revision}`} track={selected} onSaved={() => setRevision(value => value + 1)} />}
  </>;
}
