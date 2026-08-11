const today = new Date('2026-08-04T12:00:00Z');
for (let i = 11; i >= 0; i--) {
  const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  console.log(`${y}-${m}`);
}
