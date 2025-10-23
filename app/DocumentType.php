<?php

namespace App;

enum DocumentType: string
{
    // Registration & Legal Documents
    case CQC_CERTIFICATE = 'cqc_certificate';
    case CQC_INSPECTION_REPORTS = 'cqc_inspection_reports';
    case COMPANY_REGISTRATION = 'company_registration';
    case BUSINESS_LICENSE = 'business_license';
    case OPERATING_PERMITS = 'operating_permits';
    case PUBLIC_LIABILITY_INSURANCE = 'public_liability_insurance';
    case PROFESSIONAL_INDEMNITY_INSURANCE = 'professional_indemnity_insurance';

    // Compliance & Safety
    case SAFEGUARDING_POLICIES = 'safeguarding_policies';
    case HEALTH_SAFETY_POLICY = 'health_safety_policy';
    case FIRE_SAFETY_CERTIFICATE = 'fire_safety_certificate';
    case FIRE_RISK_ASSESSMENT = 'fire_risk_assessment';
    case FOOD_HYGIENE_CERTIFICATE = 'food_hygiene_certificate';
    case DBS_CERTIFICATES = 'dbs_certificates';

    // Financial & Operational
    case BUSINESS_ADDRESS_PROOF = 'business_address_proof';
    case UTILITY_BILLS = 'utility_bills';
    case BANK_ACCOUNT_VERIFICATION = 'bank_account_verification';
    case LOCAL_AUTHORITY_REFERENCES = 'local_authority_references';
    case STAFF_TRAINING_FRAMEWORK = 'staff_training_framework';

    // Professional Qualifications
    case NMC_PIN = 'nmc_pin';
    case HCPC_REGISTRATION = 'hcpc_registration';
    case CARE_CERTIFICATE = 'care_certificate';
    case SPECIALIST_TRAINING_CERTIFICATES = 'specialist_training_certificates';

    // Security & Background Checks
    case ENHANCED_DBS_CERTIFICATE = 'enhanced_dbs_certificate';
    case RIGHT_TO_WORK_PROOF = 'right_to_work_proof';
    case PROFESSIONAL_REFERENCES = 'professional_references';
    case IDENTITY_VERIFICATION = 'identity_verification';

    // Health & Compliance
    case OCCUPATIONAL_HEALTH_CLEARANCE = 'occupational_health_clearance';
    case IMMUNIZATION_RECORDS = 'immunization_records';
    case PERSONAL_PROFESSIONAL_INDEMNITY_INSURANCE = 'personal_professional_indemnity_insurance';
    case CPD_RECORDS = 'cpd_records';

    // Training Certifications
    case TRAINING_CERTIFICATIONS = 'training_certifications';

    public function getDisplayName(): string
    {
        return match($this) {
            self::CQC_CERTIFICATE => 'CQC Registration Certificate',
            self::CQC_INSPECTION_REPORTS => 'CQC Inspection Reports',
            self::COMPANY_REGISTRATION => 'Company Registration Documents',
            self::BUSINESS_LICENSE => 'Business License',
            self::OPERATING_PERMITS => 'Operating Permits',
            self::PUBLIC_LIABILITY_INSURANCE => 'Public Liability Insurance Certificate',
            self::PROFESSIONAL_INDEMNITY_INSURANCE => 'Professional Indemnity Insurance',
            self::SAFEGUARDING_POLICIES => 'Safeguarding Policies and Procedures',
            self::HEALTH_SAFETY_POLICY => 'Health and Safety Policy Certificates',
            self::FIRE_SAFETY_CERTIFICATE => 'Fire Safety Certificates',
            self::FIRE_RISK_ASSESSMENT => 'Fire Risk Assessments',
            self::FOOD_HYGIENE_CERTIFICATE => 'Food Hygiene Certificates',
            self::DBS_CERTIFICATES => 'DBS Certificates for Management Staff',
            self::BUSINESS_ADDRESS_PROOF => 'Proof of Business Address',
            self::UTILITY_BILLS => 'Utility Bills',
            self::BANK_ACCOUNT_VERIFICATION => 'Bank Account Verification Documents',
            self::LOCAL_AUTHORITY_REFERENCES => 'References from Local Authority',
            self::STAFF_TRAINING_FRAMEWORK => 'Staff Training and Competency Frameworks',
            self::NMC_PIN => 'NMC PIN (Registered Nurses)',
            self::HCPC_REGISTRATION => 'HCPC Registration (Allied Health Professionals)',
            self::CARE_CERTIFICATE => 'Care Certificate or Equivalent',
            self::SPECIALIST_TRAINING_CERTIFICATES => 'Specialist Training Certificates',
            self::ENHANCED_DBS_CERTIFICATE => 'Enhanced DBS Certificate',
            self::RIGHT_TO_WORK_PROOF => 'Proof of Right to Work in UK',
            self::PROFESSIONAL_REFERENCES => 'Professional References',
            self::IDENTITY_VERIFICATION => 'Identity Verification',
            self::OCCUPATIONAL_HEALTH_CLEARANCE => 'Occupational Health Clearance',
            self::IMMUNIZATION_RECORDS => 'Immunization Records',
            self::PERSONAL_PROFESSIONAL_INDEMNITY_INSURANCE => 'Personal Professional Indemnity Insurance',
            self::CPD_RECORDS => 'Continuing Professional Development Records',
            self::TRAINING_CERTIFICATIONS => 'Training Certifications',
        };
    }

    public function getDescription(): string
    {
        return match($this) {
            self::CQC_CERTIFICATE => 'Care Quality Commission registration certificate',
            self::CQC_INSPECTION_REPORTS => 'Current CQC inspection reports',
            self::COMPANY_REGISTRATION => 'Companies House certificate',
            self::BUSINESS_LICENSE => 'Business license documentation',
            self::OPERATING_PERMITS => 'Operating permits for care home services',
            self::PUBLIC_LIABILITY_INSURANCE => 'Minimum £2-6 million coverage required',
            self::PROFESSIONAL_INDEMNITY_INSURANCE => 'Professional indemnity insurance documentation',
            self::SAFEGUARDING_POLICIES => 'Safeguarding policies and procedures documentation',
            self::HEALTH_SAFETY_POLICY => 'Health and safety policy certificates',
            self::FIRE_SAFETY_CERTIFICATE => 'Fire safety certificates',
            self::FIRE_RISK_ASSESSMENT => 'Fire risk assessments',
            self::FOOD_HYGIENE_CERTIFICATE => 'Food hygiene certificates (if providing meals)',
            self::DBS_CERTIFICATES => 'Disclosure and Barring Service certificates for management staff',
            self::BUSINESS_ADDRESS_PROOF => 'Proof of business address',
            self::UTILITY_BILLS => 'Utility bills as address verification',
            self::BANK_ACCOUNT_VERIFICATION => 'Bank account verification documents',
            self::LOCAL_AUTHORITY_REFERENCES => 'References from local authority commissioning teams',
            self::STAFF_TRAINING_FRAMEWORK => 'Staff training and competency frameworks',
            self::NMC_PIN => 'Nursing and Midwifery Council PIN for registered nurses',
            self::HCPC_REGISTRATION => 'Health and Care Professions Council registration for allied health professionals',
            self::CARE_CERTIFICATE => 'Care Certificate or equivalent vocational qualifications',
            self::SPECIALIST_TRAINING_CERTIFICATES => 'Specialist training certificates (dementia care, medication administration, etc.)',
            self::ENHANCED_DBS_CERTIFICATE => 'Enhanced DBS certificate (must be current, typically within 3 years)',
            self::RIGHT_TO_WORK_PROOF => 'Proof of right to work in the UK (passport, visa, or settled status documentation)',
            self::PROFESSIONAL_REFERENCES => 'Professional references from previous healthcare employers',
            self::IDENTITY_VERIFICATION => 'Identity verification (photo ID plus proof of address)',
            self::OCCUPATIONAL_HEALTH_CLEARANCE => 'Occupational health clearance certificate',
            self::IMMUNIZATION_RECORDS => 'Immunization records (including COVID-19, hepatitis B, MMR, tuberculosis screening)',
            self::PERSONAL_PROFESSIONAL_INDEMNITY_INSURANCE => 'Professional indemnity insurance (personal or confirmation of employer coverage)',
            self::CPD_RECORDS => 'Continuing Professional Development (CPD) records',
            self::TRAINING_CERTIFICATIONS => 'Training certifications and competency records',
        };
    }

    public static function getRequiredHealthWorkerDocumentsAsGrouped(): array
    {
        return [
            'Professional Qualifications' => [
                self::NMC_PIN,
                self::HCPC_REGISTRATION,
                self::CARE_CERTIFICATE,
                self::SPECIALIST_TRAINING_CERTIFICATES,
            ],
            'Security & Background Checks' => [
                self::ENHANCED_DBS_CERTIFICATE,
                self::RIGHT_TO_WORK_PROOF,
                self::PROFESSIONAL_REFERENCES,
                self::IDENTITY_VERIFICATION,
            ],
            'Health & Compliance' => [
                self::OCCUPATIONAL_HEALTH_CLEARANCE,
                self::IMMUNIZATION_RECORDS,
                self::PERSONAL_PROFESSIONAL_INDEMNITY_INSURANCE,
                self::CPD_RECORDS,
            ],
            'Training Certifications' => [
                self::TRAINING_CERTIFICATIONS,
            ]
        ];
    }

    public static function getRequiredDocumentsForHealthWorker(): array
    {
        return [
            self::NMC_PIN,
            self::HCPC_REGISTRATION,
            self::CARE_CERTIFICATE,
            self::SPECIALIST_TRAINING_CERTIFICATES,
            self::ENHANCED_DBS_CERTIFICATE,
            self::RIGHT_TO_WORK_PROOF,
            self::PROFESSIONAL_REFERENCES,
            self::IDENTITY_VERIFICATION,
            self::OCCUPATIONAL_HEALTH_CLEARANCE,
            self::IMMUNIZATION_RECORDS,
            self::PERSONAL_PROFESSIONAL_INDEMNITY_INSURANCE,
            self::CPD_RECORDS,
            self::TRAINING_CERTIFICATIONS,
        ];
    }

    public static function getAllRequired(): array
    {
        return [
            self::CQC_CERTIFICATE,
            self::CQC_INSPECTION_REPORTS,
            self::COMPANY_REGISTRATION,
            self::BUSINESS_LICENSE,
            self::OPERATING_PERMITS,
            self::PUBLIC_LIABILITY_INSURANCE,
            self::PROFESSIONAL_INDEMNITY_INSURANCE,
            self::SAFEGUARDING_POLICIES,
            self::HEALTH_SAFETY_POLICY,
            self::FIRE_SAFETY_CERTIFICATE,
            self::FIRE_RISK_ASSESSMENT,
            self::FOOD_HYGIENE_CERTIFICATE,
            self::DBS_CERTIFICATES,
            self::BUSINESS_ADDRESS_PROOF,
            self::UTILITY_BILLS,
            self::BANK_ACCOUNT_VERIFICATION,
            self::LOCAL_AUTHORITY_REFERENCES,
            self::STAFF_TRAINING_FRAMEWORK,
        ];
    }
}
