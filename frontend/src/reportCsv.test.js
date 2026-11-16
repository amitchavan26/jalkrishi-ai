import { describe, it, expect } from "vitest";
import { toCsv } from "./reportCsv";

const HEADER =
  "period_days,supply_litres,demand_litres,balance_litres,ratio,suitability";

describe("toCsv", () => {
  it("buildsHeaderAndRows", () => {
    const csv = toCsv({
      breakdown: [
        {
          horizonDays: 30,
          supplyLitres: 1000.4,
          demandLitres: 1500,
          ratio: 0.6667,
          suitability: "RISKY",
        },
        {
          horizonDays: 60,
          supplyLitres: 2000,
          demandLitres: 3200,
          ratio: 0.625,
          suitability: "RISKY",
        },
      ],
    });
    expect(csv).toBe(
      HEADER + "\n30,1000,1500,-500,0.67,RISKY\n60,2000,3200,-1200,0.63,RISKY",
    );
  });

  it("emptyBreakdownGivesOnlyHeader", () => {
    expect(toCsv({ breakdown: [] })).toBe(HEADER);
    expect(toCsv({})).toBe(HEADER);
  });
});
