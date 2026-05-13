import { cleanString } from '../utils/stringUtils';

export interface NormalizedField {
    value: string;
    confidenceScore: number;
    matchType: "exact" | "fuzzy" | "fallback";
}

/**
 * Calculates the Levenshtein distance between two strings.
 * This is the minimum number of single-character edits needed to change one word into the other.
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix = [];
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

/**
 * Calculates a similarity score between 0.0 and 1.0.
 */
function calculateSimilarity(str1: string, str2: string): number {
    const s1 = cleanString(str1).replace(/[^a-z0-9]/g, '');
    const s2 = cleanString(str2).replace(/[^a-z0-9]/g, '');
    
    if (s1 === s2) return 1.0;
    
    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    if (maxLength === 0) return 1.0;
    return 1 - (distance / maxLength);
}

/**
 * Intelligently matches a raw value to a dictionary of aliases using fuzzy logic.
 */
export function findBestMatch(rawValue: string, mapping: Record<string, string>): NormalizedField {
    if (!rawValue) return { value: "", confidenceScore: 0, matchType: "fallback" };

    const cleanedRaw = cleanString(rawValue);

    // 1. Exact Match Check (O(N) but fast)
    for (const [alias, canonical] of Object.entries(mapping)) {
        if (cleanString(alias) === cleanedRaw) {
            return { value: canonical, confidenceScore: 1.0, matchType: "exact" };
        }
    }

    // 2. Fuzzy Match Check
    let bestMatch = "";
    let highestScore = 0;

    for (const [alias, canonical] of Object.entries(mapping)) {
        const score = calculateSimilarity(cleanedRaw, alias);
        if (score > highestScore) {
            highestScore = score;
            bestMatch = canonical;
        }
    }

    // Threshold for accepting a fuzzy match
    if (highestScore >= 0.75) {
        return {
            value: bestMatch,
            confidenceScore: parseFloat(highestScore.toFixed(2)),
            matchType: "fuzzy"
        };
    }

    // 3. Safe Fallback
    return {
        value: rawValue.trim(),
        confidenceScore: 0.0,
        matchType: "fallback"
    };
}
