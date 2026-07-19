import React from "react";
import { assessmentTracks } from "../data/assessmentData";
import { buildRuntimeTrack } from "../data/runtimeAssessment";
import { api, isMockMode } from "../api/client";
import AdminApp from "./admin/AdminApp";
import { ParticipantDetails, Questions, SelectVersion, StageShell, TrackIntroduction, blankParticipant } from "./assessment/AssessmentLayout";
import ReportView from "./assessment/ReportView";

function PaymentStatus({ cancelled = false }) {
  return <StageShell stageKey="report" current={5} total={5}>
    <p className="eyebrow">Secure checkout</p>
    <h1>{cancelled ? "Payment not completed" : "Payment received"}</h1>
    <p className="lead">{cancelled
      ? "Nothing was charged. Return to your private report link when you are ready to try again."
      : "Stripe is confirming your payment. After the signed webhook is verified, a fresh private Full Report link is sent by email."}</p>
    <a className="button button--primary" href="/">Return to assessment</a>
  </StageShell>;
}

function RemoteReport({ token }) {
  const [state, setState] = React.useState({ loading: true, report: null, error: "" });
  React.useEffect(() => {
    let active = true;
    api.getReport(token)
      .then(report => { if (active) setState({ loading: false, report, error: "" }); })
      .catch(error => { if (active) setState({ loading: false, report: null, error: error.message }); });
    return () => { active = false; };
  }, [token]);

  if (state.loading) return <StageShell stageKey="report" current={5} total={5}><p className="lead">Loading your private report…</p></StageShell>;
  if (state.error) return <StageShell stageKey="report" current={5} total={5}><p className="eyebrow">Private report</p><h1>Link unavailable</h1><p className="lead">This link is invalid, expired or revoked. Request a refreshed link from Atom Global support.</p></StageShell>;
  return <ReportView payload={state.report} token={token} />;
}

function attributionFromLocation() {
  const params = new URLSearchParams(window.location.search);
  return {
    affiliateCode: params.get("ref") || params.get("affiliate") || "",
    attribution: {
      landingPage: window.location.pathname + window.location.search,
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      utmContent: params.get("utm_content"),
      utmTerm: params.get("utm_term"),
    },
  };
}

function mockReport(track, answers, participant, session) {
  const totals = track.subscales.map(() => ({ score: 0, count: 0 }));
  let score = 0;
  let scored = 0;
  track.allItems.forEach((item, index) => {
    const raw = answers[index]?.value;
    if (!Number.isInteger(raw) || raw < 1 || raw > 5) return;
    const value = item.d === "K" ? 6 - raw : raw;
    score += value;
    scored += 1;
    totals[item.subIndex].score += value;
    totals[item.subIndex].count += 1;
  });
  const total = Math.round(score / Math.max(1, scored) * 50);
  const profile = track.getProfileFn(total);
  const subscales = Object.fromEntries(track.subscales.map((item, index) => [item.code, totals[index].count ? Math.round(totals[index].score / totals[index].count * 5) : 0]));
  return {
    id: 1,
    sessionId: session.id,
    participantName: participant.name,
    participantEmail: participant.email,
    trackKey: track.key,
    trackName: track.label,
    priceMinor: Math.round(Number(String(track.priceLabel || "0").replace(/[^0-9.]/g, "")) * 100),
    currency: "USD",
    is_unlocked: false,
    pdf_available: false,
    free_report_json: JSON.stringify({
      profile: profile.name,
      total,
      summary: { summary: profile.summary, strengths: profile.strengths.slice(0, 3), watchouts: profile.watchouts.slice(0, 3) },
      subscales,
    }),
    paid_report_json: null,
  };
}

export default function AssessmentAppProduction() {
  const path = window.location.pathname;
  if (path.startsWith("/admin")) return <AdminApp />;
  if (path === "/payment/success") return <PaymentStatus />;
  if (path === "/payment/cancelled") return <PaymentStatus cancelled />;
  if (path.startsWith("/report/")) return <RemoteReport token={path.split("/").filter(Boolean).at(-1)} />;

  const [stage, setStage] = React.useState("select");
  const [trackKey, setTrackKey] = React.useState(null);
  const [participant, setParticipant] = React.useState(blankParticipant);
  const [answers, setAnswers] = React.useState([]);
  const [section, setSection] = React.useState(0);
  const [session, setSession] = React.useState(null);
  const [report, setReport] = React.useState(null);
  const [experience, setExperience] = React.useState({ tracks: {} });
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [saveState, setSaveState] = React.useState("");

  const fallbackTrack = trackKey ? assessmentTracks[trackKey] : null;
  const track = buildRuntimeTrack(fallbackTrack, session?.assessment);
  const remoteExperience = trackKey ? experience.tracks?.[trackKey] || {} : {};

  React.useEffect(() => {
    let active = true;
    api.publicAssessmentExperience()
      .then(data => { if (active) setExperience(data || { tracks: {} }); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("resume")) {
      if (isMockMode) localStorage.removeItem("hhaa-v2-preview-session");
      return;
    }
    setBusy(true);
    api.loadSession()
      .then(saved => {
        if (!saved?.trackKey || saved.status === "completed") return;
        setSession(saved);
        setTrackKey(saved.trackKey);
        setParticipant({ ...blankParticipant, ...(saved.participant || {}) });
        setAnswers(saved.answers || []);
        setSection(saved.section || 0);
        setStage("questions");
      })
      .catch(loadError => {
        setError(loadError.message);
        window.history.replaceState({}, "", "/");
      })
      .finally(() => setBusy(false));
  }, []);

  React.useEffect(() => {
    if (!session?.id || !session?.resumeToken || stage !== "questions") return undefined;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      api.saveSession({ id: session.id, resumeToken: session.resumeToken, participant, answers, section })
        .then(saved => {
          setSession(current => ({ ...current, ...saved }));
          setSaveState("saved");
        })
        .catch(saveError => {
          setSaveState("error");
          setError(saveError.message);
        });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [answers, section, participant, session?.id, session?.resumeToken, stage]);

  const selectTrack = key => {
    setError("");
    setTrackKey(key);
    setAnswers(assessmentTracks[key].allItems.map(() => ({ value: null, note: "" })));
    setStage("intro");
  };

  const begin = async () => {
    setBusy(true);
    setError("");
    try {
      const created = await api.createSession({ trackKey, participant, section: 0, ...attributionFromLocation() });
      const count = created.assessment?.questions?.length || 50;
      setAnswers(Array.from({ length: count }, () => ({ value: null, note: "" })));
      setSession(created);
      setStage("questions");
      window.history.replaceState({}, "", "/assessment");
    } catch (beginError) {
      setError(beginError.message);
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    setError("");
    try {
      const completed = await api.completeSession({ id: session.id, resumeToken: session.resumeToken, participant, answers, section: 9 });
      const reportPayload = isMockMode ? mockReport(track, answers, participant, session) : await api.getReport(completed.reportToken);
      setSession(current => ({ ...current, ...completed }));
      setReport(reportPayload);
      setStage("report");
      window.scrollTo(0, 0);
    } catch (finishError) {
      setError(finishError.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    localStorage.removeItem("hhaa-v2-preview-session");
    setStage("select");
    setTrackKey(null);
    setParticipant(blankParticipant);
    setAnswers([]);
    setSection(0);
    setSession(null);
    setReport(null);
    setError("");
    window.history.replaceState({}, "", "/");
  };

  const updateAnswer = (index, value) => setAnswers(current => current.map((answer, answerIndex) => answerIndex === index ? { ...answer, value } : answer));
  const updateNote = (index, note) => setAnswers(current => current.map((answer, answerIndex) => answerIndex === index ? { ...answer, note } : answer));

  if (stage === "select") return <SelectVersion onSelect={selectTrack} />;
  if (stage === "intro" && fallbackTrack) return <TrackIntroduction track={fallbackTrack} remoteExperience={remoteExperience} onBack={() => setStage("select")} onContinue={() => setStage("details")} />;
  if (stage === "details" && fallbackTrack) return <ParticipantDetails track={fallbackTrack} remoteExperience={remoteExperience} participant={participant} setParticipant={setParticipant} onBack={() => setStage("intro")} onContinue={begin} error={error} busy={busy} />;
  if (stage === "questions" && track) return <Questions track={track} remoteExperience={remoteExperience} answers={answers} section={section} setSection={setSection} onBack={() => setStage("details")} onAnswer={updateAnswer} onNote={updateNote} onFinish={finish} saveState={saveState} busy={busy} error={error} />;
  if (stage === "report" && report) return <ReportView payload={report} token={session?.reportToken} onReset={reset} />;
  return <StageShell stageKey="report" current={5} total={5}><p className="eyebrow">Assessment</p><h1>Preparing your experience</h1><p className="lead">{error || "Loading the published assessment…"}</p></StageShell>;
}
