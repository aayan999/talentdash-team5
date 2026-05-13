import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { RawDataRecord } from '../normalization/normalizer';

/**
 * Pipeline Step 0: Data Ingestion (Crawler)
 * 
 * Automatically navigates to a public job board, extracts job listings,
 * and appends them to our raw dataset for downstream processing.
 */
export class JobCrawler {
    private rawDataPath = path.join(__dirname, '../datasets', 'raw_data.json');

    /**
     * Crawls a target URL and extracts job listings.
     * @param targetUrl The URL of the public job board
     */
    public async crawl(targetUrl: string): Promise<void> {
        console.log(`\n[Crawler] Starting crawler for: ${targetUrl}`);
        
        // 1. Launch a headless browser
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            // 2. Navigate to the target jobs page
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
            console.log('[Crawler] Page loaded successfully. Extracting jobs...');

            // 3. Extract job details using simple CSS selectors
            // Note: These selectors are examples. In a real scenario, you'll inspect
            // the target website and update '.job-card', '.company-name', etc.
            const extractedJobs = await page.$$eval('.job-card', (cards: any) => {
                return cards.map((card: any) => {
                    // Provide fallback values if a field is missing on the page
                    const company = card.querySelector('.company-name')?.textContent?.trim() || 'Unknown Company';
                    const role = card.querySelector('.job-title')?.textContent?.trim() || 'Unknown Role';
                    const location = card.querySelector('.job-location')?.textContent?.trim() || 'Unknown Location';
                    const salary = card.querySelector('.job-salary')?.textContent?.trim() || 'Not Disclosed';
                    
                    return { company, role, location, salary };
                });
            });

            console.log(`[Crawler] Successfully extracted ${extractedJobs.length} job cards.`);

            // If we didn't find any (because it's a dummy run), let's inject some realistic mock data
            // to demonstrate the pipeline flow without needing a live, perfectly formatted site.
            let newRecords: Partial<RawDataRecord>[] = extractedJobs;
            if (extractedJobs.length === 0) {
                console.log('[Crawler] No elements found with ".job-card". Generating fallback data...');
                newRecords = [
                    {
                        company: "Wipro Technologies",
                        role: "Software Dev",
                        location: "BLR",
                        salary: "12 LPA"
                    },
                    {
                        company: "Amazon Development Centre",
                        role: "SDE 2",
                        location: "Hyderabad",
                        salary: "Base + RSU"
                    }
                ];
            }

            // 4. Read existing data to determine the next ID
            const existingData: RawDataRecord[] = JSON.parse(fs.readFileSync(this.rawDataPath, 'utf8'));
            const maxId = existingData.reduce((max, record) => Math.max(max, record.id), 0);

            // 5. Format extracted data into our RawDataRecord shape
            const formattedRecords: RawDataRecord[] = newRecords.map((job, index) => ({
                id: maxId + index + 1,
                company: job.company || "Unknown",
                role: job.role || "Unknown",
                level: "Unknown", // Can be enriched later
                location: job.location || "Unknown",
                salary: job.salary || "Not Disclosed",
                skills: ["JavaScript", "TypeScript"], // Mocked skills for now
                workModel: "Hybrid" // Mocked work model for now
            }));

            // 6. Save the combined data back to raw_data.json
            const updatedData = [...existingData, ...formattedRecords];
            fs.writeFileSync(this.rawDataPath, JSON.stringify(updatedData, null, 2));

            console.log(`[Crawler] Successfully appended ${formattedRecords.length} new records to raw_data.json`);

        } catch (error) {
            console.error('[Crawler] Error during crawling:', error);
        } finally {
            // 7. Always close the browser to free up resources
            await browser.close();
            console.log('[Crawler] Browser closed. Ingestion complete.');
        }
    }
}
