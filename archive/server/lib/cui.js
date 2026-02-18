/**
 * CUI (Controlled Unclassified Information) Marking System (P2.1)
 *
 * Implements banner marking, portion marking, designation indicators,
 * and distribution statements per 32 CFR 2002 and DoD Manual 5200.01.
 *
 * Standards: 32 CFR 2002, NARA CUI Registry, DoD Dir 5230.24
 */

/**
 * CUI Categories from NARA CUI Registry
 * @see https://www.archives.gov/cui/registry/category-list
 */
export const CUI_CATEGORIES = {
  // Defense categories
  CTI: { name: 'Controlled Technical Information', authority: 'DoD Instruction 5230.24' },
  EXPT: { name: 'Export Controlled', authority: 'ITAR/EAR' },
  NOFORN: { name: 'Not Releasable to Foreign Nationals', authority: 'DoDM 5200.01' },

  // Critical infrastructure
  PCII: { name: 'Protected Critical Infrastructure Information', authority: '6 U.S.C. § 131' },
  SSI: { name: 'Sensitive Security Information', authority: '49 CFR Part 1520' },

  // Privacy
  PRVCY: { name: 'Privacy', authority: 'Privacy Act, 5 U.S.C. § 552a' },
  PII: { name: 'Personally Identifiable Information', authority: 'OMB M-17-12' },
  PHI: { name: 'Protected Health Information', authority: 'HIPAA' },

  // Law enforcement
  LES: { name: 'Law Enforcement Sensitive', authority: 'DoD 5400.7-R' },

  // Procurement
  PROPIN: { name: 'Proprietary Business Information', authority: '41 U.S.C. § 2102' },
  SBD: { name: 'Source Selection', authority: 'FAR 2.101/3.104' },

  // General
  'SP-BASIC': { name: 'CUI Specified - Basic', authority: '32 CFR 2002' },
};

/**
 * Dissemination controls
 */
export const DISSEMINATION_CONTROLS = {
  NOFORN: 'Not releasable to foreign nationals',
  'FED ONLY': 'Federal employees only',
  FEDCON: 'Federal employees and contractors',
  NOCON: 'Not releasable to contractors',
  'DL ONLY': 'Dissemination list only',
  'REL TO': 'Releasable to (specify countries)',
  'DISPLAY ONLY': 'Authorized for display only',
};

/**
 * Distribution Statements per DoD Directive 5230.24
 */
export const DISTRIBUTION_STATEMENTS = {
  A: {
    label: 'Distribution Statement A',
    text: 'Approved for public release; distribution is unlimited.',
    authority: 'DoD Directive 5230.24',
  },
  B: {
    label: 'Distribution Statement B',
    text: 'Distribution authorized to U.S. Government agencies only.',
    authority: 'DoD Directive 5230.24',
    requiresReason: true,
  },
  C: {
    label: 'Distribution Statement C',
    text: 'Distribution authorized to U.S. Government agencies and their contractors.',
    authority: 'DoD Directive 5230.24',
    requiresReason: true,
  },
  D: {
    label: 'Distribution Statement D',
    text: 'Distribution authorized to the Department of Defense and U.S. DoD contractors only.',
    authority: 'DoD Directive 5230.24',
    requiresReason: true,
  },
  E: {
    label: 'Distribution Statement E',
    text: 'Distribution authorized to DoD Components only.',
    authority: 'DoD Directive 5230.24',
    requiresReason: true,
  },
  F: {
    label: 'Distribution Statement F',
    text: 'Further dissemination only as directed by the controlling DoD office.',
    authority: 'DoD Directive 5230.24',
  },
  X: {
    label: 'Distribution Statement X',
    text: 'Distribution authorized to U.S. Government agencies and private individuals or enterprises eligible to obtain export-controlled technical data.',
    authority: 'DoD Directive 5230.24',
  },
};

/**
 * Generate CUI banner marking string
 * Used at top and bottom of documents
 *
 * @param {object} config
 * @param {string} config.type - 'CUI' or 'CUI//SP' (Specified)
 * @param {string[]} config.categories - CUI category codes
 * @param {string[]} config.dissemination - Dissemination control codes
 * @returns {string} Formatted banner string
 */
export function generateBannerMarking(config = {}) {
  const { type = 'CUI', categories = [], dissemination = [] } = config;

  let banner = type;

  if (categories.length > 0) {
    banner += '//' + categories.join('/');
  }

  if (dissemination.length > 0) {
    banner += '//' + dissemination.join('/');
  }

  return banner;
}

/**
 * Generate CUI portion marking
 * Used inline at the paragraph level
 *
 * @param {string} text - The text content
 * @param {string} marking - CUI category code
 * @returns {object} Marked text with metadata
 */
export function generatePortionMarking(text, marking = 'CUI') {
  return {
    text,
    marking: `(${marking})`,
    markedText: `(${marking}) ${text}`,
  };
}

/**
 * Generate CUI Designation Indicator Block
 * Required on the first page of CUI documents
 *
 * @param {object} config
 * @param {string} config.controlledBy - Organization controlling the CUI
 * @param {string} config.category - CUI category
 * @param {string} config.distribution - Distribution control
 * @param {string} config.poc - Point of Contact
 * @returns {object} Designation block fields
 */
export function generateDesignationBlock(config = {}) {
  return {
    controlledBy: config.controlledBy || 'Not specified',
    cuiCategory: config.category || 'CUI Basic',
    distributionAuthorization: config.distribution || DISSEMINATION_CONTROLS['FEDCON'],
    poc: config.poc || 'Not specified',
    dateOfOrigin: config.dateOfOrigin || new Date().toISOString().split('T')[0],
  };
}

/**
 * Generate Distribution Statement block
 *
 * @param {string} statement - Distribution statement letter (A through F, or X)
 * @param {string} reason - Reason for distribution restriction (required for B-E)
 * @param {string} date - Date of determination
 * @param {string} office - Controlling office
 * @returns {object} Distribution statement block
 */
export function generateDistributionStatement(statement, reason = '', date = '', office = '') {
  const dist = DISTRIBUTION_STATEMENTS[statement.toUpperCase()];

  if (!dist) {
    throw new Error(`Invalid distribution statement: ${statement}. Use A through F, or X.`);
  }

  return {
    statement: statement.toUpperCase(),
    label: dist.label,
    text: dist.text,
    reason: dist.requiresReason ? reason || 'Not specified' : null,
    dateOfDetermination: date || new Date().toISOString().split('T')[0],
    controllingOffice: office || 'Not specified',
    authority: dist.authority,
  };
}

/**
 * Generate CUI header/footer for print/PDF output
 *
 * @param {object} config - CUI configuration
 * @returns {object} Header and footer text
 */
export function generatePrintMarkings(config = {}) {
  const banner = generateBannerMarking(config);

  return {
    header: banner,
    footer: `${banner} | Controlled by: ${config.controlledBy || 'Not specified'} | CUI Category: ${config.category || 'Basic'} | POC: ${config.poc || 'See cover page'}`,
    watermark: config.includeWatermark ? 'CUI' : null,
  };
}

/**
 * CUI metadata for document data model
 * Used to enrich templates and documents with CUI fields
 *
 * @param {object} config
 * @returns {object} CUI metadata object for storage
 */
export function createCuiMetadata(config = {}) {
  return {
    isCui: config.isCui || false,
    cuiType: config.cuiType || 'Basic', // 'Basic' or 'Specified'
    category: config.category || null,
    subcategory: config.subcategory || null,
    disseminationControls: config.disseminationControls || [],
    designatingAgency: config.designatingAgency || null,
    distributionStatement: config.distributionStatement || 'A',
    distributionReason: config.distributionReason || null,
    controlledBy: config.controlledBy || null,
    poc: config.poc || null,
    bannerMarking: config.isCui
      ? generateBannerMarking({
          type: config.cuiType === 'Specified' ? 'CUI//SP' : 'CUI',
          categories: config.category ? [config.category] : [],
          dissemination: config.disseminationControls || [],
        })
      : null,
    dateDesignated: config.dateDesignated || new Date().toISOString(),
    decontrolDate: config.decontrolDate || null,
  };
}

export default {
  CUI_CATEGORIES,
  DISSEMINATION_CONTROLS,
  DISTRIBUTION_STATEMENTS,
  generateBannerMarking,
  generatePortionMarking,
  generateDesignationBlock,
  generateDistributionStatement,
  generatePrintMarkings,
  createCuiMetadata,
};
