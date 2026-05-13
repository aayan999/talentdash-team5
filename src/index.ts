import fs from 'fs';
import path from 'path';
import { DataNormalizer } from './normalization/normalizer';
import { TaxonomyClassifier } from './taxonomy/classifier';

// 1. Load Raw Dataset
const rawDataPath = path.join(__dirname, 'datasets', 'raw_data.json');
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

console.log("=== 🚀 Starting Team 5 Data Normalization Pipeline ===\n");
console.log(`Loaded ${rawData.length} raw records from ${rawDataPath}\n`);

// 2. Initialize Pipeline Modules
const normalizer = new DataNormalizer();
const classifier = new TaxonomyClassifier();

// 3. Step 1: Normalize
console.log("Step 1: Normalizing aliases to canonical names...");
const normalizedData = normalizer.normalizeDataset(rawData);

// 4. Step 2: Taxonomy Classification
console.log("Step 2: Classifying taxonomy groupings...");
const finalData = classifier.classifyDataset(normalizedData);

// 5. Output Results
console.log("\n=== ✅ Pipeline Execution Complete ===\n");
console.log("Sample Output (First 2 Records):");
console.log(JSON.stringify(finalData.slice(0, 2), null, 2));

// Save output
const outputPath = path.join(__dirname, 'datasets', 'processed_data.json');
fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
console.log(`\n✅ Processed dataset saved successfully to: ${outputPath}\n`);
