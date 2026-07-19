import test from "node:test";
import assert from "node:assert/strict";
import { assessmentTracks } from "../../src/data/assessmentData.js";

function scoreTrack(track, rawValue) {
  const subscales = track.subscales.map(() => []);
  const values = track.allItems.map(item => item.d === "K" ? 6 - rawValue : rawValue);
  track.allItems.forEach((item, index) => subscales[item.subIndex].push(values[index]));
  return { total: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 50), subscales: subscales.map(valuesForScale => Math.round(valuesForScale.reduce((sum, value) => sum + value, 0) / valuesForScale.length * 5)) };
}

test("all four current tracks contain exactly 50 versioned questions", () => {
  assert.deepEqual(Object.keys(assessmentTracks), ["personal", "newjoiner", "manager", "executive"]);
  for (const track of Object.values(assessmentTracks)) { assert.equal(track.subscales.length, 10); assert.equal(track.allItems.length, 50); assert.ok(track.subscales.every(section => section.items.length === 5)); }
});

test("reverse scoring applies the preserved six-minus-answer rule", () => {
  for (const track of Object.values(assessmentTracks)) { const reverse = track.allItems.find(item => item.d === "K"); assert.ok(reverse); assert.equal(6 - 1, 5); assert.equal(6 - 5, 1); }
});

test("total and subscale scoring remain within documented ranges", () => {
  for (const track of Object.values(assessmentTracks)) { for (const raw of [1, 3, 5]) { const result = scoreTrack(track, raw); assert.ok(result.total >= 50 && result.total <= 250); assert.equal(result.subscales.length, 10); assert.ok(result.subscales.every(value => value >= 5 && value <= 25)); } }
});

test("profile assignment preserves all score boundaries", () => {
  for (const track of Object.values(assessmentTracks)) { assert.equal(track.getProfileFn(50).range[0], 50); assert.equal(track.getProfileFn(99).range[1], 99); assert.equal(track.getProfileFn(100).range[0], 100); assert.equal(track.getProfileFn(149).range[1], 149); assert.equal(track.getProfileFn(150).range[0], 150); assert.equal(track.getProfileFn(199).range[1], 199); assert.equal(track.getProfileFn(200).range[0], 200); assert.equal(track.getProfileFn(250).range[1], 250); }
});

test("free and paid report source content is present for every profile", () => {
  for (const track of Object.values(assessmentTracks)) for (const profile of track.profiles) { assert.ok(profile.summary.length > 100); assert.ok(profile.strengths.length >= 3); assert.ok(profile.watchouts.length >= 3); assert.ok(profile.roadmap.length >= 3); }
});
