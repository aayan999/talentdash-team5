import { 
    companyAliases, 
    roleAliases, 
    locationAliases, 
    skillAliases, 
    workModelAliases,
    levelAliases
} from "./rules";
import { findCanonicalValue } from "../utils/stringUtils";

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
    company: string;
    role: string;
    level: string | null;
    location: string;
    salary: string | null;
    skills: string[];
    workModel: string;
}

/**
 * Pipeline step 1: Normalization
 * This normalizer converts raw user inputs (aliases, misspellings, abbreviations)
 * into canonical standard formats for downstream taxonomy & analytics.
 */
export class DataNormalizer {
    public normalizeRecord(record: RawDataRecord): NormalizedDataRecord {
        return {
            id: record.id,
            company: findCanonicalValue(record.company, companyAliases),
            role: findCanonicalValue(record.role, roleAliases),
            level: record.level ? findCanonicalValue(record.level, levelAliases) : null,
            location: findCanonicalValue(record.location, locationAliases),
            salary: record.salary ? record.salary.trim() : null, // In a real system, we'd parse amounts
            skills: record.skills.map(skill => findCanonicalValue(skill, skillAliases)),
            workModel: findCanonicalValue(record.workModel, workModelAliases)
        };
    }

    public normalizeDataset(dataset: RawDataRecord[]): NormalizedDataRecord[] {
        return dataset.map(record => this.normalizeRecord(record));
    }
}
