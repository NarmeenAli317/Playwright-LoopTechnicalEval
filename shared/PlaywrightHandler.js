export class PlaywrightHandler {
    constructor(page) {
        this.page = page;
    }

    async handleDropdown(dropdownSelector, value, options = {}) {
        const { 
            waitForVisible = true, 
            timeout = 5000, 
            verifySelection = true,
            useLanguageMapping = false,
            languageMappingFunction = null,
            isV1LanguageDropdown = false
        } = options;

        try {
            // Handle both string selectors and Locator objects
            const dropdown = typeof dropdownSelector === 'string' 
                ? this.page.locator(dropdownSelector) 
                : dropdownSelector;
            
            if (waitForVisible) {
                await dropdown.waitFor({ state: 'visible', timeout });
            }

            // Get the actual value to use for selection (might be mapped)
            let selectionValue = value;
            let displayName = value;
            
            // If using language mapping, get the display name
            if (useLanguageMapping && languageMappingFunction) {
                try {
                    // Handle both function and object mappings
                    if (typeof languageMappingFunction === 'function') {
                        displayName = languageMappingFunction(value);
                    } else if (typeof languageMappingFunction === 'object') {
                        displayName = languageMappingFunction[value];
                    } else {
                        throw new Error(`Invalid language mapping type: ${typeof languageMappingFunction}`);
                    }
                    
                    if (!displayName) {
                        throw new Error(`No display name found for value: ${value}`);
                    }
                } catch (mappingError) {
                    console.error(`Language mapping error:`, mappingError);
                    throw new Error(`Language mapping failed, using original value: ${value}`);
                }
            }

            // For V1 language dropdowns, use enhanced retry logic
            if (isV1LanguageDropdown) {
                return await this.handleV1LanguageDropdown(dropdown, selectionValue, displayName, options);
            }

            // Standard dropdown handling with fallback strategies
            let selectionSuccess = false;
            
            // Strategy 1: Select by value first
            try {
                await dropdown.selectOption({ value: selectionValue });
                selectionSuccess = true;
            } catch (valueError) {
                // Continue to next strategy
            }
            
            // Strategy 2: Select by label if value failed
            if (!selectionSuccess) {
                try {
                    await dropdown.selectOption({ label: displayName });
                    selectionSuccess = true;
                } catch (labelError) {
                    // Continue to next strategy
                }
            }
            
            // Strategy 3: Select by text if label failed
            if (!selectionSuccess) {
                try {
                    await dropdown.selectOption({ text: displayName });
                    selectionSuccess = true;
                } catch (textError) {
                    // Continue to next strategy
                }
            }
            
            // Strategy 4: Select by index if all above failed
            if (!selectionSuccess) {
                try {
                    const options = await dropdown.locator('option').allTextContents();
                    
                    // Find index by looking for partial matches
                    const index = options.findIndex(option => 
                        option.toLowerCase().includes(displayName.toLowerCase().split(' ')[0]) ||
                        option.toLowerCase().includes(selectionValue.toLowerCase())
                    );
                    
                    if (index > 0) { // Skip the first option if it's a placeholder
                        await dropdown.selectOption({ index: index });
                        selectionSuccess = true;
                    }
                } catch (indexError) {
                    // Continue to next strategy
                }
            }
            
            // Strategy 5: Try exact text match if index failed
            if (!selectionSuccess) {
                try {
                    const options = await dropdown.locator('option').allTextContents();
                    const exactIndex = options.findIndex(option => 
                        option.toLowerCase() === displayName.toLowerCase() ||
                        option.toLowerCase() === selectionValue.toLowerCase()
                    );
                    
                    if (exactIndex >= 0) {
                        await dropdown.selectOption({ index: exactIndex });
                        selectionSuccess = true;
                    }
                } catch (exactError) {
                    // Continue to next strategy
                }
            }
            
            if (!selectionSuccess) {
                throw new Error(`Failed to select '${displayName}' from dropdown using all available methods`);
            }
            
            // Verify selection if requested
            if (verifySelection) {
                try {
                    await dropdown.waitFor({ state: 'visible', timeout: 2000 });
                    
                    const selectedValue = await dropdown.inputValue();
                    const selectedText = await dropdown.locator('option:checked').textContent();
                    
                    // Basic verification - check if something is selected
                    if (!selectedValue || selectedValue === '' || 
                        (selectedText && selectedText.toLowerCase().includes('select'))) {
                        throw new Error(`Selection verification failed - no valid selection detected`);
                    }
                } catch (verifyError) {
                    console.warn(`Selection verification warning: ${verifyError.message}`);
                }
            }
            
            return true;
        } catch (error) {
            console.error(`Failed to handle dropdown "${dropdownSelector}" with value "${value}": ${error.message}`);
            return false;
        }
    }

    async handleV1LanguageDropdown(dropdown, selectionValue, displayName, options = {}) {
        const { verifySelection = true, timeout = 5000 } = options;
        
        let selectionSuccess = false;
        
        // Strategy 1: Try to select by label (display name) with retry mechanism
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!selectionSuccess && retryCount < maxRetries) {
            try {
                // First, ensure dropdown is open and interactive
                await dropdown.click();
                await this.page.waitForTimeout(500);
                
                // Try to select by label
                await dropdown.selectOption({ label: displayName });
                
                // Wait for selection to take effect
                await this.page.waitForTimeout(1000);
                
                // Verify selection worked
                const selectedValue = await dropdown.inputValue();
                if (selectedValue !== '-1' && selectedValue !== '') {
                    selectionSuccess = true;
                } else {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        await this.page.waitForTimeout(1000); // Wait before retry
                    }
                }
            } catch (labelError) {
                retryCount++;
                if (retryCount < maxRetries) {
                    await this.page.waitForTimeout(1000); // Wait before retry
                }
            }
        }
        
        // Strategy 2: Try to select by value if label failed
        if (!selectionSuccess) {
            try {
                await dropdown.click();
                await this.page.waitForTimeout(500);
                await dropdown.selectOption({ value: selectionValue });
                await this.page.waitForTimeout(1000);
                
                const selectedValue = await dropdown.inputValue();
                if (selectedValue !== '-1' && selectedValue !== '') {
                    selectionSuccess = true;
                }
            } catch (valueError) {
                // Failed to select by value
            }
        }
        
        // Strategy 3: Try to select by text if both above failed
        if (!selectionSuccess) {
            try {
                await dropdown.click();
                await this.page.waitForTimeout(500);
                await dropdown.selectOption({ text: displayName });
                await this.page.waitForTimeout(1000);
                
                const selectedValue = await dropdown.inputValue();
                if (selectedValue !== '-1' && selectedValue !== '') {
                    selectionSuccess = true;
                }
            } catch (textError) {
                // Failed to select by text
            }
        }
        
        // Strategy 4: Try to find by partial match if all above failed
        if (!selectionSuccess) {
            try {
                await dropdown.click();
                await this.page.waitForTimeout(500);
                
                const options = await dropdown.locator('option').allTextContents();
                
                // Find index by looking for partial matches
                const index = options.findIndex(option => 
                    option.toLowerCase().includes(displayName.toLowerCase().split(' ')[0]) ||
                    option.toLowerCase().includes(selectionValue.toLowerCase())
                );
                
                if (index >= 0) {
                    await dropdown.selectOption({ index: index });
                    await this.page.waitForTimeout(1000);
                    
                    const selectedValue = await dropdown.inputValue();
                    if (selectedValue !== '-1' && selectedValue !== '') {
                        selectionSuccess = true;
                    }
                }
            } catch (indexError) {
                // Failed to select by index
            }
        }
        
        if (!selectionSuccess) {
            throw new Error(`Failed to select '${displayName}' from V1 language dropdown using all available methods`);
        }
        
        // Enhanced verification for V1 language dropdowns
        if (verifySelection) {
            try {
                // Wait for the dropdown to update and show the selected value
                await this.page.waitForTimeout(1000);
                
                // Wait for the dropdown to show a non-placeholder value
                let selectedValue = await dropdown.inputValue();
                let attempts = 0;
                const maxAttempts = 10;
                
                while ((selectedValue === '-1' || selectedValue === '') && attempts < maxAttempts) {
                    await this.page.waitForTimeout(500);
                    selectedValue = await dropdown.inputValue();
                    attempts++;
                }
                
                if (selectedValue === '-1' || selectedValue === '') {
                    console.warn(`V1 Language dropdown verification warning - dropdown still shows placeholder value after ${maxAttempts} attempts: '${selectedValue}'`);
                }
                
            } catch (verificationError) {
                console.warn(`V1 Language dropdown verification warning: ${verificationError.message}`);
            }
        }
        
        return true;
    }

    async scrollToElement(selector, text = null) {
        try {
            let element;
            
            if (text) {
                // Scroll to element with specific text
                element = this.page.locator(selector).filter({ hasText: text });
            } else {
                // Scroll to element by selector only
                element = this.page.locator(selector);
            }
            
            // Wait for element to be attached to DOM
            await element.waitFor({ state: 'attached', timeout: 5000 });
            
            // Check if element is visible
            const isVisible = await element.isVisible();
            
            if (!isVisible) {
                // Scroll element into view
                await element.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(500); // Let scroll settle
                console.log(`Scrolled to element: ${selector}${text ? ` with text "${text}"` : ''}`);
            }
            
            return true;
        } catch (error) {
            console.warn(`Could not scroll to element "${selector}": ${error.message}`);
            return false;
        }
    }

    async handleCombobox(dropdownSelector, optionText, options = {}) {
        const { 
            waitForVisible = true, 
            timeout = 5000,
            clickFirst = false,
            useExactMatch = false,
            verifySelection = true
        } = options;

        try {
            const dropdown = typeof dropdownSelector === 'string' 
                ? this.page.locator(dropdownSelector) 
                : dropdownSelector;
            
            if (waitForVisible) {
                await dropdown.waitFor({ state: 'visible', timeout });
            }
            
            // Click the dropdown to open it
            await dropdown.click();
            
            // Wait for options to appear
            await this.page.waitForTimeout(500);
            
            // Find and click the option
            let optionLocator;
            if (useExactMatch) {
                optionLocator = this.page.getByRole('option', { name: optionText, exact: true });
            } else {
                optionLocator = this.page.getByRole('option', { name: optionText });
            }
            
            if (clickFirst) {
                optionLocator = optionLocator.first();
            }
            
            await optionLocator.click();
            
            // Automatically verify selection if requested
            if (verifySelection) {
                try {
                    await this.page.waitForTimeout(200);
                    
                    const dropdownText = await dropdown.textContent();
                    if (!dropdownText || !dropdownText.includes(optionText)) {
                        throw new Error(`Selection verification failed - dropdown text '${dropdownText}' does not contain expected option '${optionText}'`);
                    }
                } catch (verificationError) {
                    console.error(`Combobox selection verification failed: ${verificationError.message}`);
                    throw new Error(`Combobox selection completed but verification failed: ${verificationError.message}`);
                }
            }
            
            return true;
        } catch (error) {
            console.error(`Failed to select '${optionText}' from combobox: ${error.message}`);
            return false;
        }
    }
    async handleFilterDropdown(dropdownSelector, optionText, options = {}) {
        const { 
            waitForVisible = true, 
            timeout = 5000,
            useCheckbox = false,
            clearFirst = true
        } = options;

        try {
            const dropdown = typeof dropdownSelector === 'string' 
                ? this.page.locator(dropdownSelector) 
                : dropdownSelector;
            
            if (waitForVisible) {
                await dropdown.waitFor({ state: 'visible', timeout });
            }
            
            // Click the dropdown to open it
            await dropdown.click();
            
            // Wait for options to appear
            await this.page.waitForTimeout(500);
            
            // Find and select the option
            let optionLocator;
            if (useCheckbox) {
                optionLocator = this.page.getByRole('option', { name: optionText }).getByRole('checkbox');
            } else {
                optionLocator = this.page.getByRole('option', { name: optionText });
            }
            
            await optionLocator.click();
            
            return true;
        } catch (error) {
            console.error(`Failed to select '${optionText}' from filter dropdown: ${error.message}`);
            return false;
        }
    }
    async clearDropdown(dropdownSelector) {
        try {
            const dropdown = typeof dropdownSelector === 'string' 
                ? this.page.locator(dropdownSelector) 
                : dropdownSelector;
            
            // Look for a clear button
            const clearButton = this.page.getByRole('button', { name: 'Clear' });
            if (await clearButton.isVisible()) {
                await clearButton.click();
            } else {
                // Try to reset the dropdown
                await dropdown.selectOption({ value: '' });
            }
            
            return true;
        } catch (error) {
            console.error(`Failed to clear dropdown: ${error.message}`);
            return false;
        }
    }
    
    async handleDatePicker(datePickerSelector, dateOptions = {}, options = {}) {
        const { 
            waitForVisible = true, 
            timeout = 5000,
            useToday = true,
            customDate = null
        } = options;

        try {
            const datePicker = typeof datePickerSelector === 'string' 
                ? this.page.locator(datePickerSelector) 
                : datePickerSelector;
            
            if (waitForVisible) {
                await datePicker.waitFor({ state: 'visible', timeout });
            }
            
            // Click the date picker to open it
            await datePicker.click();
            
            if (useToday) {
                // Click today button
                const todayButton = this.page.getByRole('button', { name: 'Today' });
                await todayButton.click();
            } else if (customDate) {
                // Handle custom date selection
                await this.selectCustomDate(dateOptions);
            }
            
            return true;
        } catch (error) {
            console.error(`Failed to select date from date picker: ${error.message}`);
            return false;
        }
    }

    async selectCustomDate(dateOptions = {}) {
        const { 
            month = 'Jan', 
            year = '2024', 
            day = '6' 
        } = dateOptions;
        
        try {
            // Select month
            if (month) {
                const chooseMonthButton = this.page.getByRole('button', { name: 'Choose Month' });
                await chooseMonthButton.click();
                await this.page.getByText(month).click();
            }
            
            // Select year
            if (year) {
                const chooseYearButton = this.page.getByRole('button', { name: 'Choose Year' });
                await chooseYearButton.click();
                await this.page.getByRole('button', { name: year }).click();
            }
            
            // Select day
            if (day) {
                await this.page.getByText(day, { exact: true }).first().click();
            }
            
            return true;
        } catch (error) {
            console.error(`Failed to select custom date: ${error.message}`);
            return false;
        }
    }
};

export const handleDropdown = (page, dropdownSelector, value, options) => {
    const handler = new PlaywrightHandler(page);
    return handler.handleDropdown(dropdownSelector, value, options);
};

export const scrollToElement = async (page, selector, text) => {
    try {
        const handler = new PlaywrightHandler(page);
        return await handler.scrollToElement(selector, text);
    } catch (error) {
        console.error(`Error in scrollToElement: ${error.message}`);
        return false;
    }
};

export const handleCombobox = (page, dropdownSelector, optionText, options) => {
    const handler = new PlaywrightHandler(page);
    return handler.handleCombobox(dropdownSelector, optionText, options);
};

export const handleFilterDropdown = (page, dropdownSelector, optionText, options) => {
    const handler = new PlaywrightHandler(page);
    return handler.handleFilterDropdown(dropdownSelector, optionText, options);
};

export const clearDropdown = (page, dropdownSelector) => {
    const handler = new PlaywrightHandler(page);
    return handler.clearDropdown(dropdownSelector);
};

export const handleDatePicker = (page, datePickerSelector, dateOptions, options) => {
    const handler = new PlaywrightHandler(page);
    return handler.handleDatePicker(datePickerSelector, dateOptions, options);
};
