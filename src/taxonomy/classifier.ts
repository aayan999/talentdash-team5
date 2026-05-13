import { NormalizedDataRecord } from "../normalization/normalizer";

export interface TaxonomyEnrichedRecord extends NormalizedDataRecord {
    jobFamily: string; // e.g., "Engineering", "Product", "Data"
    companyTier: string; // e.g., "Tier 1 - Big Tech (MANG)", "Enterprise IT Services (WITCH)"
    isRemoteFriendly: boolean;
}

/**
 * Pipeline step 2: Taxonomy Classification
 * Maps normalized entities into broad taxonomy groups for ranking & search.
 */
export class TaxonomyClassifier {
    private categorizeJobFamily(role: string, skills: string[]): string {
        const roleLower = role.toLowerCase();
        
        if (roleLower.includes("engineer") || roleLower.includes("developer") || roleLower.includes("sde")) {
            return "Engineering";
        }
        if (roleLower.includes("product manager") || roleLower.includes("pm")) {
            return "Product Management";
        }
        if (skills.some(s => s.toLowerCase().includes("data") || s.toLowerCase().includes("ai") || s.toLowerCase().includes("machine learning"))) {
            return "Data & AI";
        }
        return "Other";
    }

    private categorizeCompanyTier(company: string): string {
        const mangCompanies = ["Meta", "Amazon", "Apple", "Netflix", "Google"];
        const witchCompanies = ["Wipro", "Infosys", "Tata Consultancy Services", "Cognizant", "HCL"];
        
        if (mangCompanies.includes(company)) return "Tier 1 - Big Tech (MANG)";
        if (witchCompanies.includes(company)) return "Enterprise IT Services (WITCH)";
        if (company === "Razorpay" || company === "Atlassian") return "Tier 1 - Product / Unicorn";
        
        return "Other";
    }

    public classify(record: NormalizedDataRecord): TaxonomyEnrichedRecord {
        return {
            ...record,
            jobFamily: this.categorizeJobFamily(record.role.value, record.skills.map(s => s.value)),
            companyTier: this.categorizeCompanyTier(record.company.value),
            isRemoteFriendly: record.workModel.value === "Remote" || record.workModel.value === "Hybrid"
        };
    }

    public classifyDataset(dataset: NormalizedDataRecord[]): TaxonomyEnrichedRecord[] {
        return dataset.map(record => this.classify(record));
    }
}
