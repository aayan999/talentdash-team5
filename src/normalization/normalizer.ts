import { 
    companyAliases, 
    roleAliases, 
    locationAliases, 
    skillAliases, 
    workModelAliases,
    levelAliases
} from "./rules";
import { findBestMatch, NormalizedField } from "./fuzzyMatcher";

export interface RawDataRecord {
    id: number;
    company: string;
    role: string;
    level?: string;
    location: string;
    salary?: string;
    skills: string[];
    workModel: string;
}

export interface NormalizedDataRecord {
    id: number;
    company: NormalizedField;
    role: NormalizedField;
    level: NormalizedField | null;
    location: NormalizedField;
    salary: string | null;
    skills: NormalizedField[];
    workModel: NormalizedField;
}

/**
 * Pipeline step 1: Normalization
 * This normalizer converts raw user inputs (aliases, misspellings, abbreviations)
 * into canonical standard formats for downstream taxonomy & analytics.
 * Now improved with Fuzzy Matching and Confidence Scoring!
 */
export class DataNormalizer {
    public normalizeRecord(record: RawDataRecord): NormalizedDataRecord {
        const companyMatch = findBestMatch(record.company, companyAliases);
        if (companyMatch.matchType === 'fuzzy') {
            console.log(`[Normalizer] Fuzzy match detected: "${record.company}" -> "${companyMatch.value}" (Confidence: ${companyMatch.confidenceScore})`);
        }

        return {
            id: record.id,
            company: companyMatch,
            role: findBestMatch(record.role, roleAliases),
            level: record.level ? findBestMatch(record.level, levelAliases) : null,
            location: findBestMatch(record.location, locationAliases),
            salary: record.salary ? record.salary.trim() : null,
            skills: record.skills.map(skill => findBestMatch(skill, skillAliases)),
            workModel: findBestMatch(record.workModel, workModelAliases)
        };
    }

    public normalizeDataset(dataset: RawDataRecord[]): NormalizedDataRecord[] {
        return dataset.map(record => this.normalizeRecord(record));
    }
}
