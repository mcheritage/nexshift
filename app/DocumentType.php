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
        };
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
