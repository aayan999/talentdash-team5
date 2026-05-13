import { signalRules } from './signalRules';
import { companyAliases } from '../normalization/rules';

export interface RawDiscussion {
    id: number;
    text: string;
    sourceType: string;
}

export interface ExtractedSignal {
    signalType: string;
    confidenceScore: number;
    severity: string;
    company: string;
    normalizedCompany: boolean;
    sourceType: string;
    rawText: string;
}

/**
 * Pipeline step: Workforce Signal Extraction
 * Scans unstructured employee text for intelligence signals.
 */
export class WorkforceSignalExtractor {
    
    /**
     * Reuses our normalization rules to detect what company the text is discussing.
     */
    private extractAndNormalizeCompany(text: string): { company: string, normalized: boolean } {
        const lowerText = text.toLowerCase();
        
        // companyAliases is structured as: { "Alias": "Canonical Name" }
        for (const [alias, canonical] of Object.entries(companyAliases)) {
            // Check for the alias first (e.g., "TCS")
            if (lowerText.includes(alias.toLowerCase())) {
                return { company: canonical, normalized: true };
            }
            // Check for the canonical name (e.g., "Tata Consultancy Services")
            if (lowerText.includes(canonical.toLowerCase())) {
                return { company: canonical, normalized: true };
            }
        }
        return { company: "Unknown Company", normalized: false };
    }

    /**
     * Evaluates a single text block and returns all detected signals.
     */
    public extractSignals(discussion: RawDiscussion): ExtractedSignal[] {
        const signals: ExtractedSignal[] = [];
        const lowerText = discussion.text.toLowerCase();
        
        const { company, normalized } = this.extractAndNormalizeCompany(discussion.text);

        for (const rule of signalRules) {
            // Count how many keywords match
            let matchCount = 0;
            for (const kw of rule.keywords) {
                if (lowerText.includes(kw)) {
                    matchCount++;
                }
            }

            if (matchCount > 0) {
                // Boost confidence slightly if multiple keywords matched
                const confidenceBoost = Math.min(0.10, (matchCount - 1) * 0.05);
                const finalConfidence = Math.min(1.0, rule.baseConfidence + confidenceBoost);

                signals.push({
                    signalType: rule.signalType,
                    confidenceScore: parseFloat(finalConfidence.toFixed(2)),
                    severity: rule.severity,
                    company: company,
                    normalizedCompany: normalized,
                    sourceType: discussion.sourceType,
                    rawText: discussion.text
                });
            }
        }

        return signals;
    }

    /**
     * Processes an array of discussions and flattens all extracted signals into one dataset.
     */
    public processDataset(discussions: RawDiscussion[]): ExtractedSignal[] {
        let allSignals: ExtractedSignal[] = [];
        
        for (const discussion of discussions) {
            const foundSignals = this.extractSignals(discussion);
            if (foundSignals.length > 0) {
                console.log(`[SignalExtractor] Found ${foundSignals.length} signals for company: ${foundSignals[0].company}`);
            }
            allSignals = allSignals.concat(foundSignals);
        }
        
        console.log(`[SignalExtractor] Successfully extracted ${allSignals.length} total signals from ${discussions.length} discussions.`);
        return allSignals;
    }
}
