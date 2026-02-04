/**
 * Value Proposition Calculator
 * Real ROI data based on completed projects:
 * - Fernhill Community: $385K-$755K traditional → $11,835 delivered (97%+ savings)
 * - Ravi Platform: $75K-$95K value delivered
 */

// Configuration based on REAL project data
const CONFIG = {
    // Content Engineer + AI rate (proven in production)
    soloRate: 420,           // $420/hour for AI-augmented specialist
    
    // Traditional 6-person full-stack team costs (annual salaries / 2080 hours)
    // Based on industry averages: Lead ($175K), 2 Sr Devs ($320K), Jr Dev ($85K), DevOps ($145K), QA ($95K)
    traditionalTeamAnnual: 820000,   // $820K/year for 6-person team
    traditionalTeamHourly: 394,      // ~$394/hour loaded cost (820K / 2080)
    
    // Real project benchmarks
    realProjects: {
        fernhill: {
            traditionalCostMin: 384915,
            traditionalCostMax: 754591,
            actualCost: 11835,
            traditionalTimeWeeks: 40,    // Average 28-50 weeks
            actualTimeHours: 28,
            actualTimeDays: 6,
            linesOfCode: 49178,
            teamReplaced: 9              // Full-Stack, Frontend, Backend, DevOps, UI/UX, Security, QA, PM, Tech Writer
        },
        ravi: {
            developmentValue: 85000,     // $75K-$95K midpoint
            developmentHours: 620,
            hourlyRate: 128,
            linesOfCode: 22583,
            apiEndpoints: 90
        }
    },
    
    // Time factor (the REAL differentiator)
    timeFactor: {
        traditionalWeeksPerProject: 40,  // 7-12 months average
        aiAssistedDays: 6,               // Actual Fernhill delivery
        timeSavingsPercent: 99.98,       // 6 days vs 40 weeks
        responseTime: '< 24 hours'       // Support turnaround
    },
    
    templateTimeSaved: 4,    // Average hours saved per template (conservative)
    totalTemplates: 15       // Current template library count
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
        
        // Time factor elements (new)
        this.timeSavingsEl = document.querySelector('.time-savings');
        this.deliverySpeedEl = document.querySelector('.delivery-speed');
        this.roiMultiplierEl = document.querySelector('.roi-multiplier');
        
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
        
        // Calculate solo expert cost (AI-augmented)
        const soloCost = projectHours * CONFIG.soloRate;
        const adjustedSoloCost = soloCost - timeSavedCost;
        
        // Calculate traditional 6-person team cost
        const teamCost = projectHours * CONFIG.traditionalTeamHourly;
        
        // Calculate time comparison (based on real Fernhill data)
        // Traditional team: 1 week = 240 person-hours (6 people × 40 hrs)
        // AI-assisted: same work in ~7% of the hours
        const traditionalWeeks = Math.ceil(projectHours / 40);  // 40 productive hours/week
        const aiAssistedDays = Math.ceil((projectHours * 0.07));  // 93% time reduction
        
        // Calculate ROI multiplier (based on Fernhill: 32-64x)
        const roiMultiplier = Math.round(teamCost / adjustedSoloCost);
        
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
            savingsPercent,
            traditionalWeeks,
            aiAssistedDays,
            roiMultiplier
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
                `${this.formatCurrency(values.totalSavings)} (${values.savingsPercent}% savings)`;
        }
        
        // Time factor displays (new)
        if (this.timeSavingsEl) {
            this.timeSavingsEl.textContent = 
                `${values.traditionalWeeks} weeks → ${values.aiAssistedDays} days`;
        }
        
        if (this.deliverySpeedEl) {
            const speedMultiplier = Math.round((values.traditionalWeeks * 5) / values.aiAssistedDays);
            this.deliverySpeedEl.textContent = `${speedMultiplier}x faster delivery`;
        }
        
        if (this.roiMultiplierEl) {
            this.roiMultiplierEl.textContent = `${values.roiMultiplier}x ROI`;
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
