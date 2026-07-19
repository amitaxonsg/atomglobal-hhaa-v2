export function buildRuntimeTrack(fallbackTrack, assessment) {
  if (!fallbackTrack || !assessment?.questions?.length) return fallbackTrack;

  const fallbackSections = new Map((fallbackTrack.subscales || []).map(section => [section.code, section]));
  const sectionMap = new Map();
  (assessment.sections || []).forEach(section => {
    const fallback = fallbackSections.get(section.code) || {};
    sectionMap.set(section.code, {
      code: section.code,
      name: section.name,
      blurb: section.description || fallback.blurb || "",
      order: Number(section.order || 0),
      items: [],
    });
  });

  assessment.questions.forEach(question => {
    const code = question.subscaleCode;
    const fallback = fallbackSections.get(code) || {};
    if (!sectionMap.has(code)) {
      sectionMap.set(code, {
        code,
        name: question.subscaleName || code,
        blurb: question.subscaleDescription || fallback.blurb || "",
        order: Number(question.sectionOrder || sectionMap.size + 1),
        items: [],
      });
    }
    sectionMap.get(code).items.push({
      id: Number(question.id),
      position: Number(question.position),
      t: question.text,
      d: question.direction,
    });
  });

  const subscales = [...sectionMap.values()]
    .sort((left, right) => left.order - right.order)
    .map(section => ({
      code: section.code,
      name: section.name,
      blurb: section.blurb,
      items: section.items.sort((left, right) => left.position - right.position),
    }));

  const allItems = subscales.flatMap((section, subIndex) => section.items.map(item => ({ ...item, subIndex })));
  if (allItems.length !== 50 || subscales.length !== 10) return fallbackTrack;

  return {
    ...fallbackTrack,
    subscales,
    allItems,
    answerChoices: assessment.answerChoices?.length === 5 ? assessment.answerChoices : undefined,
    assessmentVersionId: assessment.versionId,
  };
}

export function parseReportPayload(payload) {
  if (!payload) return null;
  const parse = value => {
    if (!value) return null;
    if (typeof value === "object") return value;
    try { return JSON.parse(value); } catch { return null; }
  };
  return {
    ...payload,
    free: parse(payload.free_report_json),
    paid: parse(payload.paid_report_json),
  };
}

export function reportSummary(report) {
  const free = report?.free || {};
  const summary = free.summary || {};
  return {
    profile: free.profile || "Head–Heart Alignment",
    total: Number(free.total || 0),
    summary: typeof summary === "string" ? summary : summary.summary || "",
    strengths: Array.isArray(summary.strengths) ? summary.strengths : [],
    watchouts: Array.isArray(summary.watchouts) ? summary.watchouts : [],
    subscales: free.subscales || {},
  };
}
