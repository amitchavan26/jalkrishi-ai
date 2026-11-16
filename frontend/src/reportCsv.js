export function toCsv(report) {
  const header = "period_days,supply_litres,demand_litres,balance_litres,ratio,suitability";
  const breakdown = report?.breakdown || [];
  
  if (breakdown.length === 0) {
    return header;
  }
  
  const rows = breakdown.map((b) => {
    const horizonDays = b.horizonDays;
    const supplyLitres = Math.round(b.supplyLitres);
    const demandLitres = Math.round(b.demandLitres);
    const balanceLitres = Math.round(supplyLitres - demandLitres);
    const ratio = Number(b.ratio).toFixed(2);
    const suitability = b.suitability;
    return `${horizonDays},${supplyLitres},${demandLitres},${balanceLitres},${ratio},${suitability}`;
  });
  
  return [header, ...rows].join("\n");
}