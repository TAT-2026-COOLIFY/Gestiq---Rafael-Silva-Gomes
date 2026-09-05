const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value) {
  if (!value) return null;
  const datePart = String(value).slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function pointsOf(task) {
  return Number.parseFloat(task.story_points) || 0;
}

export function generateBurnupData(sprint, tasks, now = new Date()) {
  const start = parseDateOnly(sprint?.start_date);
  const end = parseDateOnly(sprint?.end_date);
  if (!start || !end || end < start) return [];

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daySpan = Math.round(
    (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
      Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
      DAY_IN_MS,
  );
  const currentScope = tasks.reduce((total, task) => total + pointsOf(task), 0);

  const chartData = [];

  for (let dayIndex = 0; dayIndex <= daySpan; dayIndex += 1) {
    const chartDate = new Date(start);
    chartDate.setDate(start.getDate() + dayIndex);

    const scopeOnDate = tasks.reduce((total, task) => {
      const addedAt =
        parseDateOnly(task.sprint_added_at) ||
        parseDateOnly(task.create_date) ||
        start;
      return addedAt <= chartDate ? total + pointsOf(task) : total;
    }, 0);

    const completedOnDate = tasks.reduce((total, task) => {
      const completedAt = parseDateOnly(task.end_date);
      return completedAt && completedAt <= chartDate
        ? total + pointsOf(task)
        : total;
    }, 0);

    const record = {
      name: `${String(chartDate.getDate()).padStart(2, "0")}/${String(
        chartDate.getMonth() + 1,
      ).padStart(2, "0")}`,
      "Escopo Total": scopeOnDate,
      Ideal:
        daySpan === 0
          ? currentScope
          : Number(((currentScope * dayIndex) / daySpan).toFixed(1)),
    };

    if (chartDate <= today) {
      record["Trabalho Concluído"] = completedOnDate;
    }

    chartData.push(record);
  }

  return chartData;
}
