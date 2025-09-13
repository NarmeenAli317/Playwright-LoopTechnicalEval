import { debugLog } from './debug.js';

export class ReportStatistics {
    constructor() {
        this.totalToProcess = 0; // Total reports to process

        this.downloadSuccess = 0; // Total successfully downloaded reports
        this.downloadSkipped = 0; // Total reports skipped
        this.downloadFailed = new Map(); // Map to track failed reports

        this.uploaded = 0; // Total successfully uploaded reports
        this.uploadFailures = 0; // Total upload failures
        this.uploadSkips = 0; // Total uploads skipped

        this.startTime = new Date(); // Start time for processing
        this.syncedFiles = []; // List of synced files
        this.syncErrors = []; // List of sync errors
        
        // Comparison tracking fields
        this.totalComparisons = 0;
        this.successfulComparisons = 0;
        this.failedComparisons = 0;
        this.comparisonErrors = new Map();
        this.failedReports = new Map();

        this.totalFiles = 0;
        this.totalPages = 0;
        this.totalFailedPages = 0;
        this.pagesWithVisualDiffs = 0; // Total pages with visual differences
        this.pagesWithTextDiffs = 0; // Total pages with text differences
    }

    setTotalReports(count) { this.totalToProcess = count};

    setStartTime() { this.startTime = new Date(); };

    incrementDownloadSuccess() { this.downloadSuccess++};

    incrementDownloadSkips() { this.downloadSkipped++};

    incrementDownloadFailures(reportName, error = 'Download failed') { 
        this.addFailedReport(reportName, error);
    }

    incrementUploadSuccess() { this.uploaded++};

    incrementUploadFailures() { this.uploadFailures++};

    incrementUploadSkips() {this.uploadSkips++};

    incrementComparisonSuccess() {
        this.totalComparisons++;
        this.successfulComparisons++;
    }

    getComparisonSuccesses() { return this.successfulComparisons };

    getComparisonErrors() { return this.comparisonErrors };

    removeFailedReport(reportName) {
        this.downloadFailed.delete(reportName);
        this.failedReports.delete(reportName);
    }

    addFailedReport(reportName, error = 'Processing failed') {
        this.failedReports.set(reportName, error);
    }

    async logDownloadSummary(downloadQueue) {
        const failedReports = this.getFailedReports();

        await debugLog('\n ┌──────────────────────────────────────────┐', 'header');
        await debugLog('│          Download Summary                │', 'header');
        await debugLog('├──────────────────────────────────────────┤', 'header');
        await debugLog(` Total Files:     ${this.padValue(this.totalToProcess)}`, 'info');
        await debugLog(`Downloaded:      ${this.padValue(this.getDownloadSuccesses())}`, 'success');
        await debugLog(` Skipped:         ${this.padValue(this.getDownloadSkips())}`, 'warn');
        await debugLog(`Failed:          ${failedReports.size}`, 'error');
        
        // If there are failed downloads, list them with details
        if (failedReports.size > 0) {
            await debugLog(' Failed Reports:', 'error');
            for (const [reportName, errorInfo] of failedReports.entries()) {
                await debugLog(`  - ${reportName}:`, 'error');
                if (errorInfo.metadata) {
                    await debugLog(`    Language: ${errorInfo.metadata.language}`, 'error');
                    await debugLog(`    Type: ${errorInfo.metadata.type}`, 'error');
                }
                if (errorInfo.idCombo) {
                    await debugLog(`    BIDs: ${errorInfo.idCombo.join(', ')}`, 'error');
                }
                await debugLog(`    Error: ${errorInfo.error}`, 'error');
                await debugLog('', 'error');
            }
        }
        
        await debugLog('└──────────────────────────────────────────┘\n', 'header');
    }

    async logUploadSummary(allFilesToUpload) {
        await debugLog('\n ┌──────────────────────────────────────────┐', 'header');
        await debugLog('│            Upload Summary                │', 'header');
        await debugLog('├──────────────────────────────────────────┤', 'header');
        await debugLog(` Total Files:     ${this.padValue(allFilesToUpload.size)}`, 'info');
        await debugLog(`Uploaded:        ${this.padValue(this.getUploadSuccesses())}`, 'success');
        await debugLog(` Skipped:         ${this.padValue(this.getUploadSkips())}`, 'warn');
        await debugLog(`Failed:          ${this.padValue(this.getUploadFailures())}`, 'error');
        await debugLog('└──────────────────────────────────────────┘\n', 'header');
    }
    
    /**
     * Logs an overall summary of processing statistics.
     */
    async logOverallComparisonSummary() {
        const passRate = this.totalComparisons > 0 
            ? ((this.successfulComparisons / this.totalComparisons) * 100).toFixed(2) 
            : '0.00';
        const failRate = this.totalComparisons > 0 
            ? ((this.failedComparisons / this.totalComparisons) * 100).toFixed(2) 
            : '0.00';

        const summary = `
╔═══════════════════════════════════════╗
║           Overall Statistics          ║
╚═══════════════════════════════════════╝

Total Comparisons: ${this.totalComparisons}
Pass Rate: ${passRate}% (${this.successfulComparisons} passed) [${this.getPassRateVisual(passRate)}] ✓
Fail Rate: ${failRate}% (${this.failedComparisons} failed) [${this.getFailRateVisual(failRate)}] ✗

╔═══════════════════════════════════════╗
║            Failed Reports             ║
╚═══════════════════════════════════════╝
${this.failedReports.size > 0 
    ? Array.from(this.failedReports.entries())
        .map(([report, error]) => `• ${report}: ${error}`)
        .join('\n')
    : 'No failed reports'}`;

        console.log(summary);
        return summary;
    }

    /**
     * Logs a summary of failed reports (both API and download failures)
     */
    async logFailedReportsSummary() {
        if (this.comparisonErrors.size === 0 && this.downloadFailed.size === 0) {
            return;
        }

        await debugLog('\n┌──────────────────────────────────────────┐', 'header');
        await debugLog('│            Failed Reports                │', 'header');
        await debugLog('├──────────────────────────────────────────┤', 'header');

        if (this.comparisonErrors.size > 0) {
            await debugLog('Comparison Failures:', 'error');
            for (const [report, error] of this.comparisonErrors.entries()) {
                await debugLog(`   - ${report}: ${error}`, 'error');
            }
        }

        if (this.downloadFailed.size > 0) {
            await debugLog('\nDownload Failures:', 'error');
            for (const [report, errorInfo] of this.downloadFailed.entries()) {
                await debugLog(`   - ${report}:`, 'error');
                if (errorInfo.metadata) {
                    await debugLog(`     Language: ${errorInfo.metadata.language}`, 'error');
                    await debugLog(`     Type: ${errorInfo.metadata.type}`, 'error');
                }
                if (errorInfo.idCombo) {
                    await debugLog(`     BIDs: ${errorInfo.idCombo.join(', ')}`, 'error');
                }
                await debugLog(`     Error: ${errorInfo.error}`, 'error');
                await debugLog('', 'error');
            }
        }

        await debugLog('└──────────────────────────────────────────┘', 'header');
    }

    padValue(value) {
        // Handle undefined or null values
        if (value === undefined || value === null) {
            return '0'.padEnd(27);
        }
        return value.toString().padEnd(27);
    }

    getDownloadSuccesses() {return this.downloadSuccess};

    getDownloadSkips() {return this.downloadSkipped};

    getDownloadFailures() {
        // Return the actual count of failed downloads
        return this.downloadFailed.size;
    }

    getTotalProcessed() {
        // Return the sum of successful downloads, skips, and actual failures
        return this.downloadSuccess + this.downloadSkipped + this.downloadFailed.size;
    }

    getFailedReports() {
        return this.failedReports;
    }

    getUploadSuccesses() {return this.uploaded};

    getUploadSkips() {return this.uploadSkips};

    getUploadFailures() {
        // Return the uploadFailures count directly since it's not a Map
        return this.uploadFailures;
    };

    logSyncedFile(filePath) {
        this.syncedFiles.push(filePath);
    }

    logSyncError(filePath, error) {
        this.syncErrors.push({ filePath, error });
    }

    addComparisonError(file, error) {
        this.totalComparisons++;
        this.failedComparisons++;
        this.comparisonErrors.set(file, error);
    }

    addDownloadError(fileName, error) {
        this.downloadFailed.set(fileName, error);
    }

    incrementTotalFiles() {
        this.totalFiles++;
    }

    incrementTotalPages(count) {
        this.totalPages += count;
    }

    incrementFailedPages(count) {
        this.totalFailedPages += count;
    }

    calculateSuccessRate() {
        const totalComparisons = this.successfulComparisons + this.comparisonErrors.size;
        if (totalComparisons === 0) return 0;
        return ((this.successfulComparisons / totalComparisons) * 100).toFixed(2);
    }

    addVisualDifference(reportName, diffPercentage, pagesWithDiffs) {
        this.pagesWithVisualDiffs += pagesWithDiffs;
    }

    addTextDifference(reportName, pagesWithDiffs) {
        this.pagesWithTextDiffs += pagesWithDiffs;
    }

    getPagesWithVisualDiffs() {
        return this.pagesWithVisualDiffs;
    }

    getPagesWithTextDiffs() {
        return this.pagesWithTextDiffs;
    }

    getAverageDiffPercentage() {
        const totalComparisons = this.comparisonErrors.size;
        return totalComparisons > 0 ? (this.totalDiffPercentage / totalComparisons).toFixed(2) : 0;
    }

    getTotalPages() { return this.totalPages };

    getFailedPages() { return this.totalFailedPages };

    getTotalFiles() { return this.totalFiles };

    getElapsedTime() {
        const endTime = new Date();
        const elapsed = endTime - this.startTime;
        const elapsedMinutes = (elapsed / 1000) / 60; // Convert milliseconds to minutes
        return `${elapsedMinutes.toFixed(2)} minutes`;
    };

    getPassRateVisual(percentage) {
        const blocks = Math.round(percentage / 10);
        return '█'.repeat(blocks) + ' '.repeat(10 - blocks);
    }

    getFailRateVisual(percentage) {
        const blocks = Math.round(percentage / 10);
        return '█'.repeat(blocks) + ' '.repeat(10 - blocks);
    }
}
