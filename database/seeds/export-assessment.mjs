import { writeFile } from "node:fs/promises";
import { assessmentTracks, answerChoices } from "../../src/data/assessmentData.js";

const tracks = Object.values(assessmentTracks).map(track => ({
  key: track.key,
  label: track.label,
  tagline: track.tagline,
  priceLabel: track.priceLabel,
  answerChoices,
  subscales: track.subscales.map(subscale => ({ code: subscale.code, name: subscale.name, items: subscale.items })),
  profiles: track.profiles,
  subscaleReads: track.subscaleReads,
  upgradeReasons: track.upgradeReasons,
  hasLeadershipImpact: track.hasLeadershipImpact,
  hasCultureFit: track.hasCultureFit,
  leadershipImpactLabel: track.leadershipImpactLabel,
  cultureFitLabel: track.cultureFitLabel,
}));

await writeFile(new URL("./assessment-v1.json", import.meta.url), `${JSON.stringify({ version: "1.0.0", tracks }, null, 2)}\n`);

