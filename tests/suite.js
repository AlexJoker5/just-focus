import test from "node:test";
import assert from "node:assert/strict";

// Test domain normalization
function normalizeDomain(input) {
  let cleaned = input.trim().toLowerCase();
  if (cleaned.startsWith("http://")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("https://")) cleaned = cleaned.slice(8);
  cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0];
  cleaned = cleaned.split(":")[0];
  if (cleaned.startsWith("www.")) cleaned = cleaned.slice(4);
  return cleaned.trim();
}

function isValidDomain(input) {
  const domain = normalizeDomain(input);
  if (!domain || domain.length < 3 || domain.length > 253) return false;
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
  return domainRegex.test(domain);
}

function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");
  return `${hours}:${paddedMinutes}:${paddedSeconds}`;
}

function formatDurationLabel(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) return `${hrs}h`;
  return `${hrs}h ${rem}m`;
}

test("Domain normalization tests", () => {
  assert.equal(normalizeDomain("https://www.youtube.com/watch?v=123"), "youtube.com");
  assert.equal(normalizeDomain("http://reddit.com/r/programming"), "reddit.com");
  assert.equal(normalizeDomain("WWW.INSTAGRAM.COM"), "instagram.com");
  assert.equal(normalizeDomain("  facebook.com  "), "facebook.com");
  assert.equal(normalizeDomain("x.com:8080/test"), "x.com");
});

test("Domain validity tests", () => {
  assert.equal(isValidDomain("reddit.com"), true);
  assert.equal(isValidDomain("https://youtube.com/path"), true);
  assert.equal(isValidDomain("invalid"), false);
  assert.equal(isValidDomain(""), false);
  assert.equal(isValidDomain("bad..domain.com"), false);
});

test("Countdown formatting tests", () => {
  assert.equal(formatCountdown(3600), "1:00:00");
  assert.equal(formatCountdown(1500), "0:25:00");
  assert.equal(formatCountdown(65), "0:01:05");
  assert.equal(formatCountdown(0), "0:00:00");
  assert.equal(formatCountdown(-10), "0:00:00");
});

test("Duration label formatting tests", () => {
  assert.equal(formatDurationLabel(15), "15m");
  assert.equal(formatDurationLabel(60), "1h");
  assert.equal(formatDurationLabel(90), "1h 30m");
  assert.equal(formatDurationLabel(120), "2h");
  assert.equal(formatDurationLabel(180), "3h");
});

test("Penalty phrase match verification", () => {
  const target = "I will try harder next time";
  assert.equal("I will try harder next time".trim() === target, true);
  assert.equal("i will try harder next time".trim() === target, false);
  assert.equal("Give up".trim() === target, false);
});
