/**
 * Value Proposition Calculator
 * Real ROI data based on completed projects:
 * - Fernhill Community: $385K-$755K traditional → $11,835 delivered (97%+ savings)
 * - 58,000+ lines of code in 28 hours vs 7-12 months
 */

// Configuration based on REAL Fernhill project data
const CONFIG = {
    // Project complexity tiers with real-world estimates
    projectTiers: {
        small: {
            name: 'Small',
            traditionalCostMin: 15000,
            traditionalCostMax: 35000,
            traditionalTimelineMin: '4-8 weeks',
            aiCostMin: 500,
            aiCostMax: 1500,
            aiTimeline: '2-4 days',
            speedMultiplier: 8,
            roiMultiplier: 20,
            savingsPercent: 95
        },
        medium: {
            name: 'Medium',
            traditionalCostMin: 75000,
            traditionalCostMax: 150000,
            traditionalTimelineMin: '3-6 months',
            aiCostMin: 2500,
            aiCostMax: 5000,
            aiTimeline: '1-2 weeks',
            speedMultiplier: 12,
            roiMultiplier: 30,
            savingsPercent: 96
        },
        large: {
            name: 'Large',
            traditionalCostMin: 200000,
            traditionalCostMax: 400000,
            traditionalTimelineMin: '6-9 months',
            aiCostMin: 6000,
            aiCostMax: 12000,
            aiTimeline: '2-4 weeks',
            speedMultiplier: 16,
            roiMultiplier: 35,
            savingsPercent: 97
        },
        enterprise: {
            name: 'Enterprise (Fernhill-scale)',
            traditionalCostMin: 384915,
            traditionalCostMax: 754591,
            traditionalTimelineMin: '7-12 months',
            aiCostMin: 11835,
            aiCostMax: 15000,
            aiTimeline: '28 hours (6 days)',
            speedMultiplier: 50,
            roiMultiplier: 50,
            savingsPercent: 97
        }
    },
    
    // Real Fernhill project benchmarks (for reference)
    fernhillStats: {
        traditionalCostMin: 384915,
        traditionalCostMax: 754591,
        actualCost: 11835,
        traditionalTimeWeeks: 40,    // Average 28-50 weeks
        actualTimeHours: 28,
        actualTimeDays: 6,
        linesOfCode: 58000,
        typescriptFiles: 176,
        reactComponents: 100,
        teamReplaced: 9              // Full-Stack, Frontend, Backend, DevOps, UI/UX, Security, QA, PM, Tech Writer
    }
};

class ValueCalculator {
    constructor() {
        this.complexitySelect = document.getElementById('project-complexity');
        
        // Result display elements
        this.teamCostEl = document.querySelector('.team-cost');
        this.teamTimelineEl = document.querySelector('.team-timeline');
        this.soloCostEl = document.querySelector('.solo-cost');
        this.soloTimelineEl = document.querySelector('.solo-timeline');
        this.totalSavingsEl = document.querySelector('.total-savings');
        
        // Time factor elements
        this.deliverySpeedEl = document.querySelector('.delivery-speed');
        this.roiMultiplierEl = document.querySelector('.roi-multiplier');
        
        this.init();
    }
    
    init() {
        // Calculate initial values
        this.calculate();
        
        // Add event listener for complexity dropdown
        if (this.complexitySelect) {
            this.complexitySelect.addEventListener('change', () => this.calculate());
        }
    }
    
    calculate() {
        // Get selected complexity tier
        const complexity = this.complexitySelect?.value || 'medium';
        const tier = CONFIG.projectTiers[complexity];
        
        if (!tier) return;
        
        // Calculate savings
        const minSavings = tier.traditionalCostMin - tier.aiCostMax;
        
        // Update display
        this.updateDisplay({
            traditionalCostRange: `${this.formatCurrency(tier.traditionalCostMin)} - ${this.formatCurrency(tier.traditionalCostMax)}`,
            traditionalTimeline: tier.traditionalTimelineMin,
            aiCostRange: `${this.formatCurrency(tier.aiCostMin)} - ${this.formatCurrency(tier.aiCostMax)}`,
            aiTimeline: tier.aiTimeline,
            savings: `${this.formatCurrency(minSavings)}+ (${tier.savingsPercent}% savings)`,
            speedMultiplier: `${tier.speedMultiplier}x faster delivery`,
            roiMultiplier: `${tier.roiMultiplier}x return on investment`
        });
    }
    
    updateDisplay(values) {
        if (this.teamCostEl) {
            this.teamCostEl.textContent = values.traditionalCostRange;
        }
        
        if (this.teamTimelineEl) {
            this.teamTimelineEl.textContent = values.traditionalTimeline;
        }
        
        if (this.soloCostEl) {
            this.soloCostEl.textContent = values.aiCostRange;
        }
        
        if (this.soloTimelineEl) {
            this.soloTimelineEl.textContent = values.aiTimeline;
        }
        
        if (this.totalSavingsEl) {
            this.totalSavingsEl.textContent = values.savings;
        }
        
        if (this.deliverySpeedEl) {
            this.deliverySpeedEl.textContent = values.speedMultiplier;
        }
        
        if (this.roiMultiplierEl) {
            this.roiMultiplierEl.textContent = values.roiMultiplier;
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
