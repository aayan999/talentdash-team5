import { NormalizedDataRecord } from "../normalization/normalizer";

export interface ParsedSalary {
    baseSalary: number | null;
    currency: string;
    bonusIncluded: boolean;
    equityIncluded: boolean;
    salaryType: "Annual" | "Monthly" | "Unknown";
    confidenceScore: number;
    rawSalary: string | null;
}

export interface SalaryParsedRecord extends NormalizedDataRecord {
    parsedCompensation: ParsedSalary;
}

/**
 * Pipeline step 1.75: Salary Parsing
 * Converts messy salary strings into structured numerical compensation data.
 */
export class SalaryParser {
    
    /**
     * Parses a single salary string into a structured ParsedSalary object.
     */
    public parseSalaryString(rawSalary: string | null): ParsedSalary {
        // Fallback for missing salaries
        if (!rawSalary || rawSalary.trim() === "" || rawSalary.toLowerCase() === "not disclosed") {
            return {
                baseSalary: null,
                currency: "INR",
                bonusIncluded: false,
                equityIncluded: false,
                salaryType: "Unknown",
                confidenceScore: 0.0,
                rawSalary: rawSalary
            };
        }

        const lowerSalary = rawSalary.toLowerCase();

        // 1. Detect Base Salary (e.g., "18 LPA", "12.5 Lakhs")
        let baseSalary: number | null = null;
        let salaryType: "Annual" | "Monthly" | "Unknown" = "Unknown";
        
        const lpaMatch = lowerSalary.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|l)/);
        if (lpaMatch) {
            baseSalary = parseFloat(lpaMatch[1]) * 100000;
            salaryType = "Annual";
        }

        // 2. Detect Components
        const bonusIncluded = /(bonus|variable|performance)/.test(lowerSalary);
        const equityIncluded = /(rsu|esop|stock|equity)/.test(lowerSalary);

        return {
            baseSalary,
            currency: "INR", // Assuming India-tech focus per requirements
            bonusIncluded,
            equityIncluded,
            salaryType,
            confidenceScore: baseSalary !== null ? 0.95 : 0.50, // High confidence if integer parsed
            rawSalary: rawSalary
        };
    }

    /**
     * Processes an entire dataset, enriching each record with parsed compensation.
     */
    public parseDataset(dataset: NormalizedDataRecord[]): SalaryParsedRecord[] {
        let successfulParses = 0;

        const parsedDataset = dataset.map(record => {
            const parsedCompensation = this.parseSalaryString(record.salary);
            
            if (parsedCompensation.baseSalary !== null) {
                successfulParses++;
            }

            // Log interesting findings for debugging
            if (parsedCompensation.equityIncluded) {
                console.log(`[SalaryParser] Detected Equity/RSUs for ID ${record.id} (${record.company.value})`);
            }

            return {
                ...record,
                parsedCompensation
            };
        });

        console.log(`[SalaryParser] Successfully parsed exact base salary for ${successfulParses} out of ${dataset.length} records.`);
        return parsedDataset;
    }
}
