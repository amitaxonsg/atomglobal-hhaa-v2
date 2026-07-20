import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import {
  assessmentTracks,
  answerChoices,
  ageRanges,
  genderOptions,
  workRoleOptions,
  industryOptions,
  countryOptions,
  workPurposeOptions,
  tenureOptions,
  departmentOptions,
  levelOptions,
  personalSituationOptions,
  personalFocusOptions,
  personalPurposeOptions,
  lifeChapterOptions,
} from "../src/data/assessmentData.js";

const TRACK_ORDER = ["personal", "newjoiner", "manager", "executive"];
const SOURCE_FILE_SHA256 = "2626c5f1d1edaf50f4d140b0e93306700cac13c6fcefdff8a107e3b35966c7e8";
const QUESTIONNAIRE_SHA256 = "379fdc28ddcbafab81af33f07cd8cd7a26364a68c98c5dab610c53087105741b";
const TRACK_HASHES = {
  personal: "04735a20df3c46f90cc4135994ce77bd0afaea05b74a00dccbb0998d7a30d3fe",
  newjoiner: "7d88b84968c090aedf84dd242e3d5f50552a7c9e681613365dfc2592548d8bda",
  manager: "cda6be90ab798e9c83369d813328853a28638f9ded68ceb57397130bc3e9aade",
  executive: "e43f59c5b3b2739e8a38d604b681af1e1e57cabf93e40fcbe21a3f4f279bfb61",
};

const PRICE_MINOR = { personal: 499, newjoiner: 1900, manager: 2900, executive: 9900 };
const DURATIONS = { personal: [15, 15], newjoiner: [15, 15], manager: [15, 18], executive: [18, 20] };
const AUDIENCES = {
  personal: "Personal reflection",
  newjoiner: "New joiners and early-career professionals",
  manager: "People managers",
  executive: "Senior leaders and executives",
};

const LANDING = {
  title: "Head–Heart Alignment",
  primaryCopy: "Every choice you make is cast by two votes: what you feel and what you reason. This assessment maps which one you actually hand the deciding vote to — not which one you wish you did.",
  secondaryCopy: "You'll answer 50 statements across 10 areas of life, get an instant free result, and can unlock a full in-depth report. Choose the version that fits you:",
  cardTitlePrefix: "Head-Heart Alignment:",
  showBrandName: true,
};

const SHARED_INTRO = "Every choice you make is cast by two votes: what you feel and what you reason. This assessment maps which one you actually hand the deciding vote to.";
const offer = price => `Take the full 50-question assessment free and get your Lite Report instantly. Unlock the complete Full Report — development roadmap, working-style plan, and full breakdown — for ${price}.`;

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

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  }
  return value;
}

function digest(value) {
  return createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

function questionnairePayload(track) {
  return {
    label: track.label,
    tagline: track.tagline,
    priceLabel: track.priceLabel,
    answerChoices,
    subscales: track.subscales.map(section => ({
      code: section.code,
      name: section.name,
      blurb: section.blurb,
      items: section.items.map(item => ({ d: item.d, t: item.t })),
    })),
  };
}

function serialisableTrack(key) {
  const source = assessmentTracks[key];
  if (!source?.available) throw new Error(`Assessment track ${key} is unavailable in the approved source.`);

  const questionnaire = questionnairePayload(source);
  const questionnaireSha256 = digest(questionnaire);
  if (questionnaireSha256 !== TRACK_HASHES[key]) {
    throw new Error(`${key} differs from the approved attached index.html reference.`);
  }

  const [durationMin, durationMax] = DURATIONS[key];
  return {
    key,
    label: source.label,
    tagline: source.tagline,
    priceLabel: source.priceLabel,
    priceMinor: PRICE_MINOR[key],
    currency: "USD",
    audienceLabel: AUDIENCES[key],
    durationMin,
    durationMax,
    answerChoices: [...answerChoices],
    subscales: source.subscales.map(section => ({
      code: section.code,
      name: section.name,
      blurb: section.blurb,
      items: section.items.map(item => ({ d: item.d, t: item.t })),
    })),
    profiles: source.profiles,
    subscaleReads: source.subscaleReads,
    upgradeReasons: source.upgradeReasons,
    hasLeadershipImpact: Boolean(source.hasLeadershipImpact),
    hasCultureFit: Boolean(source.hasCultureFit),
    leadershipImpactLabel: source.leadershipImpactLabel || "Leadership Impact",
    cultureFitLabel: source.cultureFitLabel || "Culture Fit Reflection",
    introHeadline: `Head–Heart Alignment: ${source.label}`,
    introBody: SHARED_INTRO,
    introOffer: offer(source.priceLabel),
    heartLabel: "Heart",
    heartDescription: "Feeling, intuition, connection, meaning",
    headLabel: "Head",
    headDescription: "Logic, analysis, control, proof",
    intake: key === "personal" ? personalIntake : workIntake,
    allowNotApplicable: true,
    allowAnswerNotes: true,
    questionnaireSha256,
  };
}

export function buildAssessmentReference() {
  const tracks = TRACK_ORDER.map(serialisableTrack);
  const aggregatePayload = Object.fromEntries(TRACK_ORDER.map(key => [key, questionnairePayload(assessmentTracks[key])]));
  const aggregateSha256 = digest(aggregatePayload);
  if (aggregateSha256 !== QUESTIONNAIRE_SHA256) {
    throw new Error("The aggregate questionnaire differs from the approved attached index.html reference.");
  }

  return {
    reference: {
      version: "2.0.0",
      sourceFile: "index.html",
      sourceFileSha256: SOURCE_FILE_SHA256,
      questionnaireSha256: aggregateSha256,
      reviewedDate: "2026-07-20",
    },
    landing: LANDING,
    participantBaseOptions: { ageRanges, genderOptions },
    tracks,
  };
}

function main() {
  const output = process.argv[2];
  if (!output) throw new Error("Usage: node scripts/export-assessment-reference.mjs <output.json>");
  writeFileSync(output, `${JSON.stringify(buildAssessmentReference(), null, 2)}\n`, "utf8");
  process.stdout.write(`${output}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
