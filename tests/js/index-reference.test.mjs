import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { assessmentTracks, answerChoices } from "../../src/data/assessmentData.js";

const expected = {
  personal: "04735a20df3c46f90cc4135994ce77bd0afaea05b74a00dccbb0998d7a30d3fe",
  newjoiner: "7d88b84968c090aedf84dd242e3d5f50552a7c9e681613365dfc2592548d8bda",
  manager: "cda6be90ab798e9c83369d813328853a28638f9ded68ceb57397130bc3e9aade",
  executive: "e43f59c5b3b2739e8a38d604b681af1e1e57cabf93e40fcbe21a3f4f279bfb61",
};

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  }
  return value;
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

function digest(value) {
  return createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

test("editable questionnaire source matches the uploaded live index reference", () => {
  for (const [key, expectedHash] of Object.entries(expected)) {
    assert.equal(digest(questionnairePayload(assessmentTracks[key])), expectedHash, `${key} questionnaire differs from the uploaded index.html reference`);
  }
});
