import test from "node:test";
import assert from "node:assert/strict";

import { generateBurnupData } from "./burnupUtils.js";

test("scope rises only on the day a task enters the sprint", () => {
  const sprint = { start_date: "2026-09-01", end_date: "2026-09-04" };
  const tasks = [
    {
      story_points: 5,
      sprint_added_at: "2026-09-01T09:00:00-03:00",
      end_date: "2026-09-02",
    },
    {
      story_points: 3,
      sprint_added_at: "2026-09-03T14:00:00-03:00",
      end_date: null,
    },
  ];

  const data = generateBurnupData(sprint, tasks, new Date(2026, 8, 4));

  assert.deepEqual(
    data.map((item) => item["Escopo Total"]),
    [5, 5, 8, 8],
  );
  assert.deepEqual(
    data.map((item) => item["Trabalho Concluído"]),
    [0, 5, 5, 5],
  );
});

test("ideal line remains a straight diagonal to the current scope", () => {
  const sprint = { start_date: "2026-09-01", end_date: "2026-09-04" };
  const tasks = [
    { story_points: 5, sprint_added_at: "2026-09-01" },
    { story_points: 4, sprint_added_at: "2026-09-03" },
  ];

  const data = generateBurnupData(sprint, tasks, new Date(2026, 8, 4));

  assert.deepEqual(
    data.map((item) => item.Ideal),
    [0, 3, 6, 9],
  );
});

test("scope increases from 15 to 18 on the exact day a new task is added", () => {
  const sprint = { start_date: "2026-09-01", end_date: "2026-09-04" };
  const tasks = [
    { story_points: 8, sprint_added_at: "2026-09-01T08:00:00-03:00" },
    { story_points: 7, sprint_added_at: "2026-09-01T08:00:00-03:00" },
    { story_points: 3, sprint_added_at: "2026-09-03T14:00:00-03:00" },
  ];

  const data = generateBurnupData(sprint, tasks, new Date(2026, 8, 4));

  assert.deepEqual(
    data.map((item) => item["Escopo Total"]),
    [15, 15, 18, 18],
  );
  assert.deepEqual(
    data.map((item) => item.Ideal),
    [0, 6, 12, 18],
  );
});
