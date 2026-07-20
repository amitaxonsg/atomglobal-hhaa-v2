import test from "node:test";
import assert from "node:assert/strict";
import { buildAssessmentReference } from "../../scripts/export-assessment-reference.mjs";

const expectedTrackHashes = {
  personal: "04735a20df3c46f90cc4135994ce77bd0afaea05b74a00dccbb0998d7a30d3fe",
  newjoiner: "7d88b84968c090aedf84dd242e3d5f50552a7c9e681613365dfc2592548d8bda",
  manager: "cda6be90ab798e9c83369d813328853a28638f9ded68ceb57397130bc3e9aade",
  executive: "e43f59c5b3b2739e8a38d604b681af1e1e57cabf93e40fcbe21a3f4f279bfb61",
};

test("CMS reference export matches the attached index.html assessment source", () => {
  const reference = buildAssessmentReference();
  assert.equal(reference.reference.version, "2.0.0");
  assert.equal(reference.reference.sourceFileSha256, "2626c5f1d1edaf50f4d140b0e93306700cac13c6fcefdff8a107e3b35966c7e8");
  assert.equal(reference.reference.questionnaireSha256, "379fdc28ddcbafab81af33f07cd8cd7a26364a68c98c5dab610c53087105741b");
  assert.deepEqual(reference.tracks.map(track => track.key), ["personal", "newjoiner", "manager", "executive"]);

  for (const track of reference.tracks) {
    assert.equal(track.questionnaireSha256, expectedTrackHashes[track.key]);
    assert.equal(track.subscales.length, 10);
    assert.equal(track.subscales.flatMap(section => section.items).length, 50);
    assert.equal(track.answerChoices.length, 5);
    assert.equal(track.allowNotApplicable, true);
    assert.equal(track.allowAnswerNotes, true);
    assert.ok(track.introHeadline);
    assert.ok(track.introBody);
    assert.ok(track.introOffer.includes(track.priceLabel));
    assert.ok(track.intake.whoOptions.length > 1);
    assert.ok(track.intake.whatOptions.length > 1);
    assert.ok(track.intake.whereOptions.includes("Singapore"));
    assert.ok(track.intake.whereOptions.includes("Philippines"));
    assert.ok(track.intake.whyOptions.length > 1);
    assert.ok(track.intake.howOptions.length > 1);
  }
});

test("work assessment CMS intake retains conditional Department and Level fields", () => {
  const reference = buildAssessmentReference();
  for (const key of ["newjoiner", "manager", "executive"]) {
    const track = reference.tracks.find(item => item.key === key);
    assert.equal(track.intake.hasCompanyFields, true);
    assert.deepEqual(track.intake.companyRoleTriggers, ["People Manager", "Senior Executive / Leadership"]);
    assert.ok(track.intake.departmentOptions.includes("Executive / C-Suite"));
    assert.ok(track.intake.levelOptions.includes("C-Suite / Founder"));
  }
});
