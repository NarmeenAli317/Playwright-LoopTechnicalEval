// Enhanced test wrapper system with support for multiple test types
import { test as base } from '@playwright/test';

function extractTagsToAnnotations(testName, testInfo, additionalMetadata = {}) {
    const tags = testName.match(/@\w+/g) || [];
    
    tags.forEach(tag => {
        const cleanTag = tag.substring(1);
        
        // Category tags (smoke, release, regression)
        if (['release', 'smoke', 'regression'].includes(cleanTag)) {
            testInfo.annotations.push({ type: 'category', description: tag });
        }
        // Test type tags (ui, api, reports, questionnaire, security, accessibility, performance)
        else if (['ui', 'api', 'security', 'accessibility', 'performance', 'Design', 'Feature', 'Bug', 'High Priority'].includes(cleanTag)) {
            testInfo.annotations.push({ type: 'test_type', description: tag });
        }
    });
    
    // Add test key if provided
    if (additionalMetadata.testKey) {
        testInfo.annotations.push({ type: 'test_key', description: `@${additionalMetadata.testKey}` });
    }
    
    // Add multiple test types if provided as array
    if (additionalMetadata.testTypes && Array.isArray(additionalMetadata.testTypes)) {
        additionalMetadata.testTypes.forEach(testType => {
            testInfo.annotations.push({ type: 'test_type', description: `@${testType}` });
        });
    }
}

export const smokeTest = (title, opts, fn) => {
    // Validate required options
    if (!opts.testType && !opts.testTypes) {
        throw new Error('smokeTest: testType or testTypes is required');
    }
    if (!opts.testKey) {
        throw new Error('smokeTest: testKey is required');
    }

    // Handle both single testType and multiple testTypes
    const testTypes = opts.testTypes || [opts.testType];
    const testTypeTags = testTypes.map(type => `@${type}`).join(' ');
    
    const testName = `@smoke ${testTypeTags} ${title}`;
    
    return base(testName, 
        async ({ page }, testInfo) => {
            extractTagsToAnnotations(testName, testInfo, { 
                testKey: opts.testKey,
                testTypes: testTypes
            });
            await fn({ page }, testInfo);
        }
    );
};


export const releaseTest = (title, opts, fn) => {
    // Validate required options
    if (!opts.testType && !opts.testTypes) {
        throw new Error('releaseTest: testType or testTypes is required');
    }
    if (!opts.testKey) {
        throw new Error('releaseTest: testKey is required');
    }

    // Handle both single testType and multiple testTypes
    const testTypes = opts.testTypes || [opts.testType];
    const testTypeTags = testTypes.map(type => `@${type}`).join(' ');
    
    const testName = `@release @smoke ${testTypeTags} ${title}`;
    
    return base(testName, 
        async ({ page }, testInfo) => {
            extractTagsToAnnotations(testName, testInfo, { 
                testKey: opts.testKey,
                testTypes: testTypes
            });
            await fn({ page }, testInfo);
        }
    );
};


export const regressionTest = (title, opts, fn) => {
    // Validate required options
    if (!opts.testType && !opts.testTypes) {
        throw new Error('regressionTest: testType or testTypes is required');
    }
    if (!opts.testKey) {
        throw new Error('regressionTest: testKey is required');
    }

    // Handle both single testType and multiple testTypes
    const testTypes = opts.testTypes || [opts.testType];
    const testTypeTags = testTypes.map(type => `@${type}`).join(' ');
    
    const testName = `@regression ${testTypeTags} ${title}`;
    
    return base(testName, 
        async ({ page }, testInfo) => {
            extractTagsToAnnotations(testName, testInfo, { 
                testKey: opts.testKey,
                testTypes: testTypes
            });
            await fn({ page }, testInfo);
        }
    );
};


export const customTest = (title, opts, fn) => {
    // Validate required options
    if (!opts.testType && !opts.testTypes) {
        throw new Error('customTest: testType or testTypes is required');
    }
    if (!opts.testKey) {
        throw new Error('customTest: testKey is required');
    }

    const testTypes = opts.testTypes || [opts.testType];
    const testTypeTags = testTypes.map(type => `@${type}`).join(' ');
    const categoryTags = opts.categories ? opts.categories.map(cat => `@${cat}`).join(' ') : '';
    
    const testName = `${categoryTags} ${testTypeTags} ${title}`.trim();
    
    return base(testName, 
        async ({ page }, testInfo) => {
            extractTagsToAnnotations(testName, testInfo, { 
                testKey: opts.testKey,
                testTypes: testTypes
            });
            await fn({ page }, testInfo);
        }
    );
};

export { test as baseTest } from '@playwright/test';

