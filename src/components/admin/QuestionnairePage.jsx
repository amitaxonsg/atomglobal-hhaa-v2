import React from "react";
import { api } from "../../api/client";
import { adminQuestionnaireConfiguration, saveQuestionnaireLanding } from "../../api/questionnaireCms";
import { experienceDefaults, landingDefaults, questionnaireReference } from "../../data/assessmentExperience";
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
  const source = item || {};
  return {
    ...fallback,
    ...source,
    tagline: source.tagline || fallback.tagline,
    introHeadline: source.introHeadline || fallback.introHeadline,
    introBody: source.introBody || fallback.introBody,
    introOffer: source.introOffer || fallback.introOffer,
    heartLabel: source.heartLabel || fallback.heartLabel,
    heartDescription: source.heartDescription || fallback.heartDescription,
    headLabel: source.headLabel || fallback.headLabel,
    headDescription: source.headDescription || fallback.headDescription,
    intake: { ...fallback.intake, ...(source.intake || {}) },
    allowNotApplicable: source.allowNotApplicable ?? fallback.allowNotApplicable,
    allowAnswerNotes: source.allowAnswerNotes ?? fallback.allowAnswerNotes,
  };
}

function optionsToText(options) {
  return Array.isArray(options) ? options.join("\n") : "";
}

function textToOptions(value) {
  return String(value || "").split("\n").map(item => item.trim()).filter(Boolean);
}

function LandingEditor({ initial, onSaved }) {
  const [form, setForm] = React.useState({ ...landingDefaults, ...(initial || {}) });
  const [notice, setNotice] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => setForm({ ...landingDefaults, ...(initial || {}) }), [initial]);
  const update = key => event => setForm(current => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const save = async event => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const saved = await saveQuestionnaireLanding(form);
      setForm({ ...landingDefaults, ...saved });
      setNotice("Latest questionnaire landing page saved. The public track-selection page uses this content immediately.");
      onSaved?.();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  return <form className="admin-card editor-form questionnaire-landing-editor" onSubmit={save}>
    <div className="card-heading"><div><h2>Latest public landing page</h2><small>Matches the approved Netlify/index.html layout. The former split-screen stage image is not used by the public questionnaire.</small></div></div>
    <Notice>{notice}</Notice>
    <div className="form-grid">
      <label className="form-grid__wide">Main heading<input value={form.title || ""} onChange={update("title")} /></label>
      <label className="form-grid__wide">First introduction paragraph<textarea rows="4" value={form.primaryCopy || ""} onChange={update("primaryCopy")} /></label>
      <label className="form-grid__wide">Second introduction paragraph<textarea rows="4" value={form.secondaryCopy || ""} onChange={update("secondaryCopy")} /></label>
      <label>Track-card title prefix<input value={form.cardTitlePrefix || ""} onChange={update("cardTitlePrefix")} /></label>
      <label className="check-row"><input type="checkbox" checked={Boolean(form.showBrandName)} onChange={update("showBrandName")} /> Show Atom Global brand name beside the logo</label>
    </div>
    <button className="button button--primary" disabled={busy}>{busy ? "Saving…" : "Save landing page"}</button>
  </form>;
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
      setNotice("Questionnaire process saved. Existing participant sessions remain pinned to their original published question version and snapshots.");
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
      <div className="card-heading"><div><h2>Track card and introduction</h2><small>Controls the selected track card and the next introduction screen.</small></div></div>
      <div className="form-grid">
        <label className="form-grid__wide">Track-card description<textarea rows="3" value={form.tagline || ""} onChange={update("tagline")} /></label>
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
      <div className="card-heading"><div><h2>Participant intake</h2><small>Name, email, age range, gender and consent are standard. Configure the context questions below.</small></div></div>
      <div className="questionnaire-intake-grid">
        {fieldDefinitions.map(([prefix, title]) => <article className="questionnaire-intake-field" key={prefix}>
          <h3>{title}</h3>
          <label>Question label<input value={form.intake?.[`${prefix}Label`] || ""} onChange={event => updateIntake(`${prefix}Label`, event.target.value)} /></label>
          <label>Options — one per line<textarea rows="8" value={optionsToText(form.intake?.[`${prefix}Options`])} onChange={event => updateIntake(`${prefix}Options`, textToOptions(event.target.value))} /></label>
        </article>)}
      </div>

      <div className="questionnaire-company-fields">
        <label className="check-row"><input type="checkbox" checked={Boolean(form.intake?.hasCompanyFields)} onChange={event => updateIntake("hasCompanyFields", event.target.checked)} /> Show department and level for selected work roles</label>
        {form.intake?.hasCompanyFields && <div className="form-grid">
          <label className="form-grid__wide">Roles that trigger company fields — one per line<textarea rows="4" value={optionsToText(form.intake?.companyRoleTriggers)} onChange={event => updateIntake("companyRoleTriggers", textToOptions(event.target.value))} /></label>
          <label>Department label<input value={form.intake?.departmentLabel || ""} onChange={event => updateIntake("departmentLabel", event.target.value)} /></label>
          <label>Level label<input value={form.intake?.levelLabel || ""} onChange={event => updateIntake("levelLabel", event.target.value)} /></label>
          <label>Department options — one per line<textarea rows="8" value={optionsToText(form.intake?.departmentOptions)} onChange={event => updateIntake("departmentOptions", textToOptions(event.target.value))} /></label>
          <label>Level options — one per line<textarea rows="8" value={optionsToText(form.intake?.levelOptions)} onChange={event => updateIntake("levelOptions", textToOptions(event.target.value))} /></label>
        </div>}
      </div>
    </section>

    <section className="admin-card">
      <div className="card-heading"><div><h2>Question response process</h2><small>The five scored choices remain versioned with each assessment.</small></div></div>
      <div className="settings-checks">
        <label className="check-row"><input type="checkbox" checked={Boolean(form.allowNotApplicable)} onChange={update("allowNotApplicable")} /> Show “N/A — doesn’t apply / can’t answer” and exclude it from scoring</label>
        <label className="check-row"><input type="checkbox" checked={Boolean(form.allowAnswerNotes)} onChange={update("allowAnswerNotes")} /> Allow an optional note beneath every question</label>
      </div>
      <Notice>Question wording is protected under <strong>Assessments</strong>. Only spelling, grammar or clarity corrections are allowed in a draft, and meaning, identity, section, position and scoring remain locked.</Notice>
    </section>

    <div className="questionnaire-cms__actions"><button className="button button--primary" disabled={busy}>{busy ? "Saving…" : "Save questionnaire process"}</button></div>
  </form>;
}

export default function QuestionnairePage() {
  const assessments = useLoader(() => api.adminAssessments(), []);
  const configuration = useLoader(() => adminQuestionnaireConfiguration(), []);
  const [trackKey, setTrackKey] = React.useState("personal");
  const [revision, setRevision] = React.useState(0);

  if (assessments.loading || configuration.loading) return <Spinner />;
  const rows = assessments.data?.items || [];
  const tracks = [...new Map(rows.map(item => [item.trackKey, item])).values()];
  const selected = tracks.find(item => item.trackKey === trackKey) || tracks[0];

  return <>
    <PageHeader eyebrow="Latest index.html / Netlify workflow" title="Questionnaire" actions={<button className="button" onClick={() => { assessments.refresh(); configuration.refresh(); }}>Refresh</button>} />
    <Notice type="error">{assessments.error || configuration.error}</Notice>
    <section className="admin-card questionnaire-reference">
      <div><strong>Latest reference verified</strong><span>Simple single-column public flow · 4 tracks · 10 sections · 50 questions per track</span></div>
      <small>Reference SHA-256: {questionnaireReference.sourceFileSha256.slice(0, 16)}… · Questionnaire SHA-256: {questionnaireReference.questionnaireSha256.slice(0, 16)}…</small>
    </section>

    <LandingEditor initial={configuration.data?.landing} onSaved={configuration.refresh} />

    <div className="questionnaire-track-tabs" role="tablist" aria-label="Questionnaire track">
      {tracks.map(track => <button role="tab" aria-selected={selected?.trackKey === track.trackKey} className={selected?.trackKey === track.trackKey ? "active" : ""} key={track.trackKey} onClick={() => setTrackKey(track.trackKey)}><strong>{track.trackName}</strong><small>{track.questionCount} questions · {track.sectionCount} sections</small></button>)}
    </div>
    {selected && <TrackEditor key={`${selected.trackId}-${revision}`} track={selected} onSaved={() => setRevision(value => value + 1)} />}
  </>;
}
