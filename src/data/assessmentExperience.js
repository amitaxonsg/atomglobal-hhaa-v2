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
};

export const questionnaireReference = {
  sourceFile: "index.html",
  sourceFileSha256: "2626c5f1d1edaf50f4d140b0e93306700cac13c6fcefdff8a107e3b35966c7e8",
  questionnaireSha256: "379fdc28ddcbafab81af33f07cd8cd7a26364a68c98c5dab610c53087105741b",
  reviewedDate: "2026-07-19",
};

export const experienceDefaults = {
  personal: {
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

export function trackExperience(trackKey, remote = {}, priceLabel = "") {
  const fallback = experienceDefaults[trackKey] || experienceDefaults.personal;
  const intake = remote.intake && typeof remote.intake === "object" ? remote.intake : fallback.intake;
  return {
    ...fallback,
    ...remote,
    intake,
    introOffer: String(remote.introOffer || fallback.introOffer).replace("{{price}}", priceLabel || remote.priceLabel || "the listed price"),
  };
}
