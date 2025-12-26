export const BATCHES = [
  { id: 1, time: "08.45 - 11.00" },
  { id: 2, time: "09.45 - 12.00" },
  { id: 3, time: "12.45 - 15.00" },
  { id: 4, time: "13.45 - 16.00" },
];

export const GROUP_PER_BATCH = 3;
export const PERSON_PER_GROUP = 18;

export const BATCH_CAPACITY = GROUP_PER_BATCH * PERSON_PER_GROUP; // 54
export const DAILY_CAPACITY = BATCH_CAPACITY * 4; // 216

export function findNextAvailableDate(data) {
  let date = new Date();

  while (true) {
    const d = date.toISOString().slice(0, 10);
    const count = data
      .filter(r => r[0] === d)
      .reduce((s, r) => s + Number(r[4] || 1), 0);

    if (count < DAILY_CAPACITY) return d;
    date.setDate(date.getDate() + 1);
  }
}

export function calculateBatchUsage(data, date) {
  const usage = {};
  data
    .filter(r => r[0] === date)
    .forEach(r => {
      const batch = r[1];
      const people = Number(r[4] || 1);
      usage[batch] = (usage[batch] || 0) + people;
    });
  return usage;
}
