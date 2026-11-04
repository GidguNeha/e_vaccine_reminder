import assert from "node:assert/strict";
import test from "node:test";
import { isReminderDay } from "./reminderService.js";

test("sends vaccine reminders only two and three days before the due date", () => {
  assert.equal(isReminderDay(3), true);
  assert.equal(isReminderDay(2), true);
  assert.equal(isReminderDay(1), false);
  assert.equal(isReminderDay(0), false);
  assert.equal(isReminderDay(4), false);
});
