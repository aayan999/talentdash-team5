import { NormalizedField } from '../normalization/fuzzyMatcher';

/**
 * Safely extracts the string value from a NormalizedField or a plain string.
 * This prevents downstream pipelines from crashing if the data schema changes 
 * or if they receive raw (unnormalized) data by mistake.
 */
export function getFieldValue(field: NormalizedField | string | null | undefined): string {
    if (!field) return "";
    if (typeof field === 'string') return field;
    return field.value || "";
}
