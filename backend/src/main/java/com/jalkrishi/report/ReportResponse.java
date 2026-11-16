package com.jalkrishi.report;

import com.jalkrishi.assessment.AssessmentResponse;
import java.util.List;

public record ReportResponse(
    AssessmentResponse assessment,
    List<BreakdownRow> breakdown
) {}