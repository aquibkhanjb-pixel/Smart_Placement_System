// Constants and validation schemas for the placement system

export const USER_ROLES = {
  STUDENT: 'STUDENT',
  COORDINATOR: 'COORDINATOR'
};

export const COMPANY_CATEGORIES = {
  ELITE: 'ELITE',
  SUPER_DREAM: 'SUPER_DREAM',
  DREAM: 'DREAM',
  NORMAL: 'NORMAL'
};

export const APPLICATION_STATUS = {
  APPLIED: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED'
};

export const DEPARTMENTS = [
  'CMPN', // Computer Engineering
  'EXTC', // Electronics & Telecommunication Engineering
  'EXCS', // Computer Science Engineering
  'BioMed', // Biomedical Engineering
  'INFT', // Information Technology
];

// Business rule constants
export const BUSINESS_RULES = {
  DEMERIT_BLOCKS: {
    2: 1, // 2 demerits = block next 1 company
    4: 3, // 4 demerits = block next 3 companies
    6: 5  // 6 demerits = block next 5 companies
  },
  CATEGORY_THRESHOLDS: {
    ELITE: 18,      // >= 18 LPA
    SUPER_DREAM: 9, // 9-18 LPA
    DREAM: 6,       // 6-9 LPA
    NORMAL: 3       // 3-6 LPA
  },
  OFFER_JUMP_INCREMENT: 5, // New offer must be >= current + 5 LPA
  MAX_CATEGORY_JUMP_ATTEMPTS: 3
};