/**
 * Value Proposition Calculator
 * Auto-updating calculator that shows cost savings using Structured For Growth vs traditional teams
 */

// Configuration
const CONFIG = {
    soloRate: 420,           // $420/hour for solo expert
    teamRateMin: 600,        // Minimum team rate (3 devs × $200/hr)
    teamRateMax: 1250,       // Maximum team rate (5 devs × $250/hr)
    templateTimeSaved: 3,    // Average hours saved per template
    totalTemplates: 16       // Current number of templates in library
};

class ValueCalculator {
    constructor() {
        this.projectHoursInput = document.getElementById('project-hours');
        this.templateUsageInput = document.getElementById('template-usage');
        
        // Result display elements
        this.soloCostEl = document.querySelector('.solo-cost');
        this.templateSavingsEl = document.querySelector('.template-savings');
        this.adjustedSoloEl = document.querySelector('.adjusted-solo');
        this.teamCostEl = document.querySelector('.team-cost');
        this.totalSavingsEl = document.querySelector('.total-savings');
        
        // Template stats elements
        this.templateCountEl = document.getElementById('template-count');
        this.hoursSavedEl = document.getElementById('hours-saved');
        this.costSavedEl = document.getElementById('cost-saved');
        
        this.init();
    }
    
    init() {
        // Set initial values
        if (this.templateCountEl) {
            this.templateCountEl.textContent = CONFIG.totalTemplates;
        }
        
        // Calculate initial values
        this.calculate();
        
        // Add event listeners
        if (this.projectHoursInput) {
            this.projectHoursInput.addEventListener('input', () => this.calculate());
        }
        if (this.templateUsageInput) {
            this.templateUsageInput.addEventListener('input', () => this.calculate());
        }
        
        // Update template count dynamically (fetch from template library)
        this.updateTemplateCount();
    }
    
    calculate() {
        // Get input values
        const projectHours = parseInt(this.projectHoursInput?.value || 160);
        const templatesUsed = parseInt(this.templateUsageInput?.value || 5);
        
        // Calculate template time saved
        const timeSavedHours = templatesUsed * CONFIG.templateTimeSaved;
        const timeSavedCost = timeSavedHours * CONFIG.soloRate;
        
        // Calculate solo expert cost
        const soloCost = projectHours * CONFIG.soloRate;
        const adjustedSoloCost = soloCost - timeSavedCost;
        
        // Calculate team cost (average)
        const avgTeamRate = (CONFIG.teamRateMin + CONFIG.teamRateMax) / 2;
        const teamCost = projectHours * avgTeamRate;
        
        // Calculate savings
        const totalSavings = teamCost - adjustedSoloCost;
        const savingsPercent = Math.round((totalSavings / teamCost) * 100);
        
        // Update display
        this.updateDisplay({
            soloCost,
            timeSavedHours,
            timeSavedCost,
            adjustedSoloCost,
            teamCost,
            totalSavings,
            savingsPercent
        });
    }
    
    updateDisplay(values) {
        if (this.soloCostEl) {
            this.soloCostEl.textContent = this.formatCurrency(values.soloCost);
        }
        
        if (this.templateSavingsEl) {
            this.templateSavingsEl.textContent = 
                `${values.timeSavedHours} hours (${this.formatCurrency(values.timeSavedCost)})`;
        }
        
        if (this.adjustedSoloEl) {
            this.adjustedSoloEl.textContent = this.formatCurrency(values.adjustedSoloCost);
        }
        
        if (this.teamCostEl) {
            this.teamCostEl.textContent = this.formatCurrency(values.teamCost);
        }
        
        if (this.totalSavingsEl) {
            this.totalSavingsEl.textContent = 
                `${this.formatCurrency(values.totalSavings)} (${values.savingsPercent}%)`;
        }
        
        // Update template stats
        if (this.hoursSavedEl && this.costSavedEl) {
            const totalHoursSaved = CONFIG.totalTemplates * CONFIG.templateTimeSaved;
            const totalCostSaved = totalHoursSaved * CONFIG.soloRate;
            
            this.hoursSavedEl.textContent = totalHoursSaved;
            this.costSavedEl.textContent = this.formatCurrency(totalCostSaved);
        }
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    async updateTemplateCount() {
        try {
            // Try to fetch actual template count from template library
            const response = await fetch('/templates/templateData.js');
            if (response.ok) {
                const text = await response.text();
                // Extract template count from the exported array
                const match = text.match(/export\s+const\s+templates\s*=\s*\[[\s\S]*?\];/);
                if (match) {
                    // Count template objects in the array
                    const templateMatches = match[0].match(/\{\s*id:\s*\d+/g);
                    if (templateMatches) {
                        CONFIG.totalTemplates = templateMatches.length;
                        if (this.templateCountEl) {
                            this.templateCountEl.textContent = CONFIG.totalTemplates;
                        }
                        // Recalculate with updated template count
                        this.calculate();
                    }
                }
            }
        } catch (error) {
            // Silently fail - use default count
            console.warn('Could not fetch live template count, using default:', CONFIG.totalTemplates);
        }
    }
}

// Initialize calculator when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ValueCalculator();
    });
} else {
    new ValueCalculator();
}

// Export for use in other scripts
export { ValueCalculator, CONFIG };
