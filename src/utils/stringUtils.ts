/**
 * Cleans a string by converting it to lowercase, trimming whitespace,
 * and removing extra spaces.
 */
export function cleanString(input: string): string {
    if (!input) return "";
    return input.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Very basic exact/lowercase lookup for aliases.
 * In a real-world system, we would use fuzzy matching (e.g., Levenshtein distance)
 * or a specialized library like Fuse.js.
 */
export function findCanonicalValue(rawValue: string, mapping: Record<string, string>): string {
    if (!rawValue) return "";
    
    const cleanedRaw = cleanString(rawValue);
    
    // First pass: exact match (case insensitive)
    for (const [alias, canonical] of Object.entries(mapping)) {
        if (cleanString(alias) === cleanedRaw) {
            return canonical;
        }
    }
    
    // If no match found, fallback to the original string (trimmed)
    return rawValue.trim();
}
