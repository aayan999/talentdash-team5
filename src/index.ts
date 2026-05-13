import fs from 'fs';
import path from 'path';
import { JobCrawler } from './crawlers/jobCrawler';
import { DataNormalizer } from './normalization/normalizer';
import { DataDeduplicator } from './deduplication/deduplicator';
import { TaxonomyClassifier } from './taxonomy/classifier';

async function runPipeline() {
    console.log("=== Starting Team 5 Data Normalization Pipeline ===\n");

    // Grab the URL from command line arguments, or fallback to our example
    const targetUrl = process.argv[2] || 'https://example.com/jobs';

    // 0. Initialize and Run Crawler
    const crawler = new JobCrawler();
    await crawler.crawl(targetUrl);

    // 1. Load Raw Dataset (Now containing crawled data!)
    const rawDataPath = path.join(__dirname, 'datasets', 'raw_data.json');
    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

    console.log(`\nLoaded ${rawData.length} raw records from ${rawDataPath}\n`);

    // 2. Initialize ETL Pipeline Modules
    const normalizer = new DataNormalizer();
    const deduplicator = new DataDeduplicator();
    const classifier = new TaxonomyClassifier();

    // 3. Step 1: Normalize
    console.log("Step 1: Normalizing aliases to canonical names...");
    const normalizedData = normalizer.normalizeDataset(rawData);

    // 4. Step 1.5: Deduplication
    console.log("\nStep 1.5: Deduplicating normalized records...");
    const deduplicatedData = deduplicator.deduplicateDataset(normalizedData);

    // 5. Step 2: Taxonomy Classification
    console.log("\nStep 2: Classifying taxonomy groupings...");
    const finalData = classifier.classifyDataset(deduplicatedData);

    // 6. Output Results
    console.log("\n=== Pipeline Execution Complete ===\n");
    console.log("Sample Output (Last 2 Records - Newly Crawled!):");
    console.log(JSON.stringify(finalData.slice(-2), null, 2));

    // Save output
    const outputPath = path.join(__dirname, 'datasets', 'processed_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    console.log(`\nProcessed dataset saved successfully to: ${outputPath}\n`);
}

// Execute the pipeline
runPipeline().catch(console.error);
