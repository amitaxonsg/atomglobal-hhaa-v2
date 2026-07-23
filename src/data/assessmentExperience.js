import {
  ageRanges,
  genderOptions,
  workRoleOptions,
  industryOptions,
  countryOptions,
  workPurposeOptions,
  tenureOptions,
  personalSituationOptions,
  personalFocusOptions,
  personalPurposeOptions,
  lifeChapterOptions,
} from "./assessmentData";

const sharedIntro = "Every choice you make is cast by two votes: what you feel and what you reason. This assessment maps which one you actually hand the deciding vote to.";
const sharedOffer = "Take the full 50-question assessment free and get your Lite Report instantly. Unlock the complete Full Report — development roadmap, working-style plan, and full breakdown — for {{price}}.";

const departmentOptions = [
  "Executive / C-Suite", "Sales", "Marketing", "Operations", "Finance", "HR / People", "Engineering / IT",
  "Product", "Customer Success / Support", "Legal", "R&D", "Administration", "Other",
];

const levelOptions = [
  "Entry-Level / Individual Contributor", "Senior Individual Contributor", "Team Lead / Supervisor", "Manager",
  "Senior Manager / Director", "VP / Executive", "C-Suite / Founder",
];

export const landingDefaults = {
  title: "Head–Heart Alignment",
  primaryCopy: "Every choice you make is cast by two votes: what you feel and what you reason. This assessment maps which one you actually hand the deciding vote to — not which one you wish you did.",
  secondaryCopy: "You'll answer 50 statements across 10 areas of life, get an instant free result, and can unlock a full in-depth report. Choose the version that fits you:",
  cardTitlePrefix: "Head-Heart Alignment:",
  showBrandName: true,
};

const personalIntake = {
  whoLabel: "Which best describes your current situation? *",
  whoOptions: personalSituationOptions,
  whatLabel: "What area of life are you most focused on right now? *",
  whatOptions: personalFocusOptions,
  whereLabel: "Where are you based? *",
  whereOptions: countryOptions,
  whyLabel: "What brings you to this assessment? *",
  whyOptions: personalPurposeOptions,
  howLabel: "How would you describe this current chapter of your life? *",
  howOptions: lifeChapterOptions,
  hasCompanyFields: false,
};

const workIntake = {
  whoLabel: "Which best describes you? *",
  whoOptions: workRoleOptions,
  whatLabel: "What industry do you work in? *",
  whatOptions: industryOptions,
  whereLabel: "Where are you based? *",
  whereOptions: countryOptions,
  whyLabel: "What brings you to this assessment? *",
  whyOptions: workPurposeOptions,
  howLabel: "How long have you been in your current role? *",
  howOptions: tenureOptions,
  hasCompanyFields: true,
  companyRoleTriggers: ["People Manager", "Senior Executive / Leadership"],
  departmentLabel: "Department *",
  departmentOptions,
  levelLabel: "Level *",
  levelOptions,
};

export const questionnaireReference = {
  sourceFile: "index.html",
  sourceFileSha256: "2626c5f1d1edaf50f4d140b0e93306700cac13c6fcefdff8a107e3b35966c7e8",
  questionnaireSha256: "379fdc28ddcbafab81af33f07cd8cd7a26364a68c98c5dab610c53087105741b",
  reviewedDate: "2026-07-19",
  clientValidation: {
    reviewedDate: "2026-07-23",
    liveFile: "Head-Heart-Alignment-LIVE.html",
    liveFileSha256: "42823643de6c080c580260e6b8e55bc1cab934408ac105eae532c6500b0c0530",
    fullPreviewFile: "Head-Heart-Alignment-FULL-PREVIEW.html",
    fullPreviewFileSha256: "107aa77d15300102f2dd68dcf3dd4da81015269be88fd2fc35e40a2d306c43f9",
    result: "Validated against the existing production engine; no structural questionnaire, scoring, intake, report, payment, or service-worker replacement required.",
  },
};

export const experienceDefaults = {
  personal: {
    tagline: "For anyone who wants to understand how they lead their own life.",
    introHeadline: "Head–Heart Alignment: Personal",
    introBody: sharedIntro,
    introOffer: sharedOffer,
    heartLabel: "Heart",
    heartDescription: "Feeling, intuition, connection, meaning",
    headLabel: "Head",
    headDescription: "Logic, analysis, control, proof",
    intake: personalIntake,
    allowNotApplicable: true,
    allowAnswerNotes: true,
  },
  newjoiner: {
    tagline: "For new joinees and anyone in their first 1–2 years of work — not managing anyone yet.",
    introHeadline: "Head–Heart Alignment: New Joiner",
    introBody: sharedIntro,
    introOffer: sharedOffer,
    heartLabel: "Heart",
    heartDescription: "Feeling, intuition, connection, meaning",
    headLabel: "Head",
    headDescription: "Logic, analysis, control, proof",
    intake: workIntake,
    allowNotApplicable: true,
    allowAnswerNotes: true,
  },
  manager: {
    tagline: "For people managers — how you lead your team, not just yourself.",
    introHeadline: "Head–Heart Alignment: Manager",
    introBody: sharedIntro,
    introOffer: sharedOffer,
    heartLabel: "Heart",
    heartDescription: "Feeling, intuition, connection, meaning",
    headLabel: "Head",
    headDescription: "Logic, analysis, control, proof",
    intake: workIntake,
    allowNotApplicable: true,
    allowAnswerNotes: true,
  },
  executive: {
    tagline: "For senior leaders shaping strategy and culture at scale.",
    introHeadline: "Head–Heart Alignment: Executive",
    introBody: sharedIntro,
    introOffer: sharedOffer,
    heartLabel: "Heart",
    heartDescription: "Feeling, intuition, connection, meaning",
    headLabel: "Head",
    headDescription: "Logic, analysis, control, proof",
    intake: workIntake,
    allowNotApplicable: true,
    allowAnswerNotes: true,
  },
};

export const participantBaseOptions = { ageRanges, genderOptions };

export function landingExperience(remote = {}) {
  return { ...landingDefaults, ...(remote || {}) };
}

export function trackExperience(trackKey, remote = {}, priceLabel = "") {
  const fallback = experienceDefaults[trackKey] || experienceDefaults.personal;
  const intake = remote.intake && typeof remote.intake === "object" ? { ...fallback.intake, ...remote.intake } : fallback.intake;
  const resolvedPrice = priceLabel || remote.priceLabel || "the listed price";
  return {
    ...fallback,
    ...remote,
    tagline: remote.tagline || fallback.tagline,
    introHeadline: remote.introHeadline || fallback.introHeadline,
    introBody: remote.introBody || fallback.introBody,
    introOffer: String(remote.introOffer || fallback.introOffer).replace("{{price}}", resolvedPrice),
    heartLabel: remote.heartLabel || fallback.heartLabel,
    heartDescription: remote.heartDescription || fallback.heartDescription,
    headLabel: remote.headLabel || fallback.headLabel,
    headDescription: remote.headDescription || fallback.headDescription,
    intake,
    allowNotApplicable: remote.allowNotApplicable ?? fallback.allowNotApplicable,
    allowAnswerNotes: remote.allowAnswerNotes ?? fallback.allowAnswerNotes,
  };
}
