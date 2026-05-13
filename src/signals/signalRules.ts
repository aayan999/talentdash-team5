export interface SignalRule {
    signalType: string;
    keywords: string[];
    severity: "Low" | "Medium" | "High" | "Critical";
    baseConfidence: number;
}

export const signalRules: SignalRule[] = [
    {
        signalType: "Layoffs",
        keywords: ["layoff", "layoffs", "fired", "let go", "reduction in force", "rif", "severance"],
        severity: "Critical",
        baseConfidence: 0.90
    },
    {
        signalType: "Hiring Freeze",
        keywords: ["hiring freeze", "not hiring", "headcount locked", "stop hiring", "freeze on hiring"],
        severity: "High",
        baseConfidence: 0.85
    },
    {
        signalType: "Bench Pressure",
        keywords: ["bench", "benched", "unallocated", "no project", "bench pressure"],
        severity: "High",
        baseConfidence: 0.85
    },
    {
        signalType: "Appraisal Delay",
        keywords: ["appraisal delay", "delayed appraisals", "no hike", "delayed hike", "salary frozen"],
        severity: "Medium",
        baseConfidence: 0.80
    },
    {
        signalType: "Burnout",
        keywords: ["burnout", "burnt out", "exhausted", "mental health", "overworked"],
        severity: "High",
        baseConfidence: 0.75
    },
    {
        signalType: "Toxic Culture",
        keywords: ["toxic", "toxic culture", "micromanagement", "harassment", "hostile"],
        severity: "Critical",
        baseConfidence: 0.80
    },
    {
        signalType: "Return To Office",
        keywords: ["rto", "return to office", "mandate", "back to office", "hybrid mandate"],
        severity: "Medium",
        baseConfidence: 0.90
    },
    {
        signalType: "Overtime Pressure",
        keywords: ["overtime", "weekends", "late nights", "working late", "14 hours"],
        severity: "High",
        baseConfidence: 0.85
    },
    {
        signalType: "Salary Dissatisfaction",
        keywords: ["underpaid", "low pay", "terrible compensation", "below market"],
        severity: "Medium",
        baseConfidence: 0.80
    },
    {
        signalType: "Promotion Delay",
        keywords: ["promotion delay", "no promotion", "stuck at same level"],
        severity: "Medium",
        baseConfidence: 0.75
    }
];
