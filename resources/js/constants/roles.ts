/**
 * Centralized role definitions
 * Must match the backend Shift model role constants
 */

export const ROLES = {
    REGISTERED_NURSE: 'registered_nurse',
    HEALTHCARE_ASSISTANT: 'healthcare_assistant',
    SUPPORT_WORKER: 'support_worker',
    SENIOR_CARE_WORKER: 'senior_care_worker',
    NIGHT_SHIFT_WORKER: 'night_shift_worker',
    BANK_STAFF: 'bank_staff',
    DOMESTIC_STAFF: 'domestic_staff',
    KITCHEN_STAFF: 'kitchen_staff',
    MAINTENANCE_STAFF: 'maintenance_staff'
} as const;

export const ROLE_LABELS: Record<string, string> = {
    [ROLES.REGISTERED_NURSE]: 'Registered Nurse (RN)',
    [ROLES.HEALTHCARE_ASSISTANT]: 'Healthcare Assistant (HCA)',
    [ROLES.SUPPORT_WORKER]: 'Support Worker',
    [ROLES.SENIOR_CARE_WORKER]: 'Senior Care Worker',
    [ROLES.NIGHT_SHIFT_WORKER]: 'Night Shift Worker',
    [ROLES.BANK_STAFF]: 'Bank Staff',
    [ROLES.DOMESTIC_STAFF]: 'Domestic Staff',
    [ROLES.KITCHEN_STAFF]: 'Kitchen Staff',
    [ROLES.MAINTENANCE_STAFF]: 'Maintenance Staff'
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
    value,
    label
}));

export type RoleType = typeof ROLES[keyof typeof ROLES];
