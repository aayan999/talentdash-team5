import fs from 'fs';
import path from 'path';
import { JobCrawler } from './crawlers/jobCrawler';
import { DataNormalizer } from './normalization/normalizer';
import { DataDeduplicator } from './deduplication/deduplicator';
import { SalaryParser } from './parsers/salaryParser';
import { TaxonomyClassifier } from './taxonomy/classifier';
import { WorkforceSignalExtractor } from './signals/workforceSignalExtractor';

async function runPipeline() {
    const startTime = Date.now();
    const batchId = `batch_${Math.random().toString(36).substring(2, 9)}`;
    const crawlTimestamp = new Date().toISOString();

    console.log(`=== Starting Team 5 Data Normalization Pipeline ===`);
    console.log(`[Pipeline] Session ID: ${batchId}`);
    console.log(`[Pipeline] Time: ${crawlTimestamp}\n`);

    // Grab the URL from command line arguments, or fallback to our example
    const targetUrl = process.argv[2] || 'https://example.com/jobs';

    // 0. Initialize and Run Crawler
    const crawler = new JobCrawler();
    await crawler.crawl(targetUrl);

    // 1. Load Raw Dataset (Now containing crawled data!)
    const rawDataPath = path.join(__dirname, 'datasets', 'raw_data.json');
    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
    
    const discussionsPath = path.join(__dirname, 'datasets', 'employee_discussions.json');
    const discussionsData = JSON.parse(fs.readFileSync(discussionsPath, 'utf8'));

    console.log(`\nLoaded ${rawData.length} raw records from ${rawDataPath}`);
    console.log(`Loaded ${discussionsData.length} raw discussions from ${discussionsPath}\n`);

    // 2. Initialize ETL Pipeline Modules
    const normalizer = new DataNormalizer();
    const deduplicator = new DataDeduplicator();
    const salaryParser = new SalaryParser();
    const signalExtractor = new WorkforceSignalExtractor();
    const classifier = new TaxonomyClassifier();

    // 3. Step 1: Normalize
    console.log("Step 1: Normalizing aliases to canonical names...");
    const normalizedData = normalizer.normalizeDataset(rawData);

    // 4. Step 1.5: Deduplication
    console.log("\nStep 1.5: Deduplicating normalized records...");
    const deduplicatedData = deduplicator.deduplicateDataset(normalizedData);

    // 5. Step 1.75: Salary Parsing
    console.log("\nStep 1.75: Parsing compensation structures...");
    const parsedData = salaryParser.parseDataset(deduplicatedData);

    // 6. Step 1.85: Workforce Signal Extraction
    console.log("\nStep 1.85: Extracting workforce signals from employee discussions...");
    const extractedSignals = signalExtractor.processDataset(discussionsData);

    // 7. Step 2: Taxonomy Classification
    console.log("\nStep 2: Classifying taxonomy groupings...");
    const classifiedData = classifier.classifyDataset(parsedData);

    // 7.5: Metadata & Historical Snapshot Layer
    console.log("\nStep 2.5: Generating metadata layer...");
    const finalData = classifiedData.map(record => ({
        ...record,
        metadata: {
            source: "crawler",
            crawlTimestamp: crawlTimestamp,
            pipelineVersion: "v1.2",
            ingestionBatchId: batchId
        }
    }));

    // 8. Output Results
    const durationMs = Date.now() - startTime;
    console.log(`\n=== Pipeline Execution Complete (${durationMs}ms) ===\n`);
    console.log("Sample Output (Last 2 Jobs):");
    console.log(JSON.stringify(finalData.slice(-2), null, 2));

    console.log("\nSample Output (First 2 Extracted Signals):");
    console.log(JSON.stringify(extractedSignals.slice(0, 2), null, 2));

    // Save outputs
    const outputPath = path.join(__dirname, 'datasets', 'processed_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    
    const signalsOutputPath = path.join(__dirname, 'datasets', 'extracted_signals.json');
    fs.writeFileSync(signalsOutputPath, JSON.stringify(extractedSignals, null, 2));
    
    console.log(`\nProcessed datasets saved successfully to:`);
    console.log(`- ${outputPath}`);
    console.log(`- ${signalsOutputPath}\n`);
}

// Execute the pipeline
runPipeline().catch(console.error);
