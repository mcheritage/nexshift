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

    // Healthcare Worker Documents
    case WORKER_DBS_CERTIFICATE = 'worker_dbs_certificate';
    case WORKER_ID_PROOF = 'worker_id_proof';
    case WORKER_RIGHT_TO_WORK = 'worker_right_to_work';
    case WORKER_NVQ_CERTIFICATE = 'worker_nvq_certificate';
    case WORKER_CARE_CERTIFICATE = 'worker_care_certificate';
    case WORKER_NURSING_REGISTRATION = 'worker_nursing_registration';
    case WORKER_PROFESSIONAL_QUALIFICATIONS = 'worker_professional_qualifications';
    case WORKER_TRAINING_CERTIFICATES = 'worker_training_certificates';
    case WORKER_REFERENCES = 'worker_references';
    case WORKER_ADDRESS_PROOF = 'worker_address_proof';
    case WORKER_IMMUNIZATION_RECORDS = 'worker_immunization_records';
    case WORKER_HEALTH_DECLARATION = 'worker_health_declaration';

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
            
            // Healthcare Worker Documents
            self::WORKER_DBS_CERTIFICATE => 'DBS Certificate',
            self::WORKER_ID_PROOF => 'Proof of Identity',
            self::WORKER_RIGHT_TO_WORK => 'Right to Work in UK',
            self::WORKER_NVQ_CERTIFICATE => 'NVQ Certificate in Health & Social Care',
            self::WORKER_CARE_CERTIFICATE => 'Care Certificate',
            self::WORKER_NURSING_REGISTRATION => 'NMC Registration (Nursing & Midwifery Council)',
            self::WORKER_PROFESSIONAL_QUALIFICATIONS => 'Professional Qualifications',
            self::WORKER_TRAINING_CERTIFICATES => 'Training Certificates',
            self::WORKER_REFERENCES => 'Professional References',
            self::WORKER_ADDRESS_PROOF => 'Proof of Address',
            self::WORKER_IMMUNIZATION_RECORDS => 'Immunization Records',
            self::WORKER_HEALTH_DECLARATION => 'Health Declaration',
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
            
            // Healthcare Worker Documents
            self::WORKER_DBS_CERTIFICATE => 'Enhanced DBS certificate (Disclosure and Barring Service)',
            self::WORKER_ID_PROOF => 'Valid government-issued photo ID (passport or driving license)',
            self::WORKER_RIGHT_TO_WORK => 'Proof of right to work in the UK (passport, visa, share code)',
            self::WORKER_NVQ_CERTIFICATE => 'NVQ Level 2 or 3 in Health & Social Care certificate',
            self::WORKER_CARE_CERTIFICATE => 'Care Certificate completion documentation',
            self::WORKER_NURSING_REGISTRATION => 'Valid NMC registration certificate for nurses',
            self::WORKER_PROFESSIONAL_QUALIFICATIONS => 'Professional qualifications and certifications',
            self::WORKER_TRAINING_CERTIFICATES => 'Mandatory training certificates (e.g., moving and handling, safeguarding)',
            self::WORKER_REFERENCES => 'Two professional references from previous employers',
            self::WORKER_ADDRESS_PROOF => 'Proof of current address (utility bill or bank statement)',
            self::WORKER_IMMUNIZATION_RECORDS => 'Immunization records (Hep B, COVID-19, etc.)',
            self::WORKER_HEALTH_DECLARATION => 'Occupational health declaration',
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

    public static function getAllRequiredForWorker(): array
    {
        return [
            self::WORKER_DBS_CERTIFICATE,
            self::WORKER_ID_PROOF,
            self::WORKER_RIGHT_TO_WORK,
            self::WORKER_ADDRESS_PROOF,
            self::WORKER_REFERENCES,
        ];
    }

    public static function getAllOptionalForWorker(): array
    {
        return [
            self::WORKER_NVQ_CERTIFICATE,
            self::WORKER_CARE_CERTIFICATE,
            self::WORKER_NURSING_REGISTRATION,
            self::WORKER_PROFESSIONAL_QUALIFICATIONS,
            self::WORKER_TRAINING_CERTIFICATES,
            self::WORKER_IMMUNIZATION_RECORDS,
            self::WORKER_HEALTH_DECLARATION,
        ];
    }

    public function isWorkerDocument(): bool
    {
        return str_starts_with($this->value, 'worker_');
    }

    public function isCareHomeDocument(): bool
    {
        return !$this->isWorkerDocument();
    }
}
