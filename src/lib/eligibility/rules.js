import { BUSINESS_RULES, COMPANY_CATEGORIES } from '../../types/index.js';

export class EligibilityEngine {
  constructor() {
    this.rules = BUSINESS_RULES;
  }

  checkStudentEligibility(student, company) {
    const eligibilityResult = {
      isEligible: true,
      reasons: [],
      blockedCompanies: 0,
      canApply: true
    };

    // Check basic CGPA requirement
    if (student.cgpa < company.minCgpa) {
      eligibilityResult.isEligible = false;
      eligibilityResult.reasons.push(`CGPA requirement not met. Required: ${company.minCgpa}, Current: ${student.cgpa}`);
    }

    // Check department eligibility
    const allowedDepartments = typeof company.allowedDepartments === 'string'
      ? JSON.parse(company.allowedDepartments)
      : company.allowedDepartments;

    if (allowedDepartments.length > 0 && !allowedDepartments.includes(student.department)) {
      eligibilityResult.isEligible = false;
      eligibilityResult.reasons.push(`Department not eligible. Allowed: ${allowedDepartments.join(', ')}`);
    }

    // Check demerit blocks
    const demeritBlock = this.calculateDemeritBlock(student.demerits);
    if (demeritBlock > 0) {
      eligibilityResult.blockedCompanies = demeritBlock;
      eligibilityResult.reasons.push(`Blocked due to ${student.demerits} demerits. Cannot apply to next ${demeritBlock} companies.`);
    }

    // Check offer jump policy - CRITICAL CHECK
    const offerJumpCheck = this.checkOfferJumpPolicy(student, company);
    if (!offerJumpCheck.canJump) {
      eligibilityResult.isEligible = false;
      eligibilityResult.reasons.push(offerJumpCheck.reason);
    }

    // Check category jump attempts
    if (student.categoryJumpAttempts >= this.rules.MAX_CATEGORY_JUMP_ATTEMPTS) {
      const currentCategory = this.getCompanyCategory(student.currentOffer || 0);
      const targetCategory = company.category;

      if (this.isCategoryJump(currentCategory, targetCategory)) {
        eligibilityResult.isEligible = false;
        eligibilityResult.reasons.push(`Maximum category jump attempts (${this.rules.MAX_CATEGORY_JUMP_ATTEMPTS}) exceeded.`);
      }
    }

    return eligibilityResult;
  }

  calculateDemeritBlock(demerits) {
    for (const [demeritThreshold, blockCount] of Object.entries(this.rules.DEMERIT_BLOCKS)) {
      if (demerits >= parseInt(demeritThreshold)) {
        return blockCount;
      }
    }
    return 0;
  }

  checkOfferJumpPolicy(student, company) {
    // If student has no current offer, they can apply to any company
    if (!student.currentOffer || student.currentOffer === 0) {
      return { canJump: true, reason: '' };
    }

    // Student has a current offer, apply strict rules
    const currentOffer = parseFloat(student.currentOffer);
    const companyCtc = parseFloat(company.ctc);
    const requiredCtc = currentOffer + this.rules.OFFER_JUMP_INCREMENT;


    // CRITICAL: Students with offers can ONLY apply to companies offering significantly more
    if (companyCtc < requiredCtc) {
      return {
        canJump: false,
        reason: `Placement policy violation: You have ${currentOffer} LPA offer. You can only apply to companies offering ${requiredCtc} LPA or more (current + 5 LPA). This company offers ${companyCtc} LPA.`
      };
    }

    return { canJump: true, reason: '' };
  }

  getCompanyCategory(ctc) {
    if (ctc >= this.rules.CATEGORY_THRESHOLDS.ELITE) {
      return COMPANY_CATEGORIES.ELITE;
    } else if (ctc >= this.rules.CATEGORY_THRESHOLDS.SUPER_DREAM) {
      return COMPANY_CATEGORIES.SUPER_DREAM;
    } else if (ctc >= this.rules.CATEGORY_THRESHOLDS.DREAM) {
      return COMPANY_CATEGORIES.DREAM;
    } else {
      return COMPANY_CATEGORIES.NORMAL;
    }
  }

  isCategoryJump(currentCategory, targetCategory) {
    const categoryRanks = {
      [COMPANY_CATEGORIES.NORMAL]: 0,
      [COMPANY_CATEGORIES.DREAM]: 1,
      [COMPANY_CATEGORIES.SUPER_DREAM]: 2,
      [COMPANY_CATEGORIES.ELITE]: 3
    };

    return categoryRanks[targetCategory] > categoryRanks[currentCategory];
  }

  getBulkEligibility(students, companies) {
    const results = [];

    for (const student of students) {
      const studentResults = {
        studentId: student.id,
        rollNumber: student.rollNumber,
        eligibleCompanies: [],
        blockedCompanies: [],
        totalEligible: 0
      };

      for (const company of companies) {
        const eligibility = this.checkStudentEligibility(student, company);

        if (eligibility.isEligible && eligibility.canApply) {
          studentResults.eligibleCompanies.push({
            companyId: company.id,
            companyName: company.name,
            ctc: company.ctc,
            category: company.category
          });
        } else {
          studentResults.blockedCompanies.push({
            companyId: company.id,
            companyName: company.name,
            reasons: eligibility.reasons
          });
        }
      }

      studentResults.totalEligible = studentResults.eligibleCompanies.length;
      results.push(studentResults);
    }

    return results;
  }

  validateApplications(applications) {
    const validationResults = [];

    for (const application of applications) {
      const eligibility = this.checkStudentEligibility(application.student, application.company);

      validationResults.push({
        applicationId: application.id,
        studentId: application.studentId,
        companyId: application.companyId,
        isValid: eligibility.isEligible && eligibility.canApply,
        violations: eligibility.reasons
      });
    }

    return validationResults;
  }
}