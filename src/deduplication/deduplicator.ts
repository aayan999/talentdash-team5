import { NormalizedDataRecord } from "../normalization/normalizer";
import { getFieldValue } from "../utils/recordUtils";

/**
 * Pipeline step 1.5: Deduplication
 * 
 * Detects and removes duplicate workforce records after normalization.
 * Records are considered duplicates if they match on:
 * - company
 * - role
 * - location
 * - salary
 * 
 * Differences in casing and spacing are ignored.
 * The first valid occurrence is kept.
 */
export class DataDeduplicator {
    /**
     * Generates a unique fingerprint for a record based on key fields.
     */
    private generateFingerprint(record: NormalizedDataRecord): string {
        const company = getFieldValue(record.company);
        const role = getFieldValue(record.role);
        const location = getFieldValue(record.location);
        const salary = record.salary || "";

        // Combine fields, convert to lowercase, and remove all whitespace
        const combined = `${company}|${role}|${location}|${salary}`;
        return combined.toLowerCase().replace(/\s+/g, "");
    }

    /**
     * Deduplicates a dataset of normalized records.
     */
    public deduplicateDataset(dataset: NormalizedDataRecord[]): NormalizedDataRecord[] {
        const seenFingerprints = new Set<string>();
        const deduplicatedDataset: NormalizedDataRecord[] = [];
        let duplicatesRemoved = 0;

        for (const record of dataset) {
            const fingerprint = this.generateFingerprint(record);

            if (seenFingerprints.has(fingerprint)) {
                // It's a duplicate, we drop it
                duplicatesRemoved++;
                // Helpful logging to show which records are being dropped
                console.log(`[Deduplicator] Removed duplicate ID ${record.id} for fingerprint: ${fingerprint}`);
            } else {
                // First time seeing this fingerprint, keep it
                seenFingerprints.add(fingerprint);
                deduplicatedDataset.push(record);
            }
        }

        console.log(`[Deduplicator] Total duplicates removed: ${duplicatesRemoved}`);
        return deduplicatedDataset;
    }
}
