// lib/validation.ts
import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Validates and normalizes an email address
 */
export function validateEmail(email: string): string {
    if (!email || typeof email !== 'string') {
        throw new Error('Email is required');
    }

    const trimmedEmail = email.trim();

    if (!validator.isEmail(trimmedEmail)) {
        throw new Error('Invalid email format');
    }

    return validator.normalizeEmail(trimmedEmail) || trimmedEmail.toLowerCase();
}

/**
 * Validates a phone number (international format)
 */
export function validatePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') {
        throw new Error('Phone number is required');
    }

    const trimmedPhone = phone.trim();

    // Allow international format with + or without
    if (!validator.isMobilePhone(trimmedPhone, 'any', { strictMode: false })) {
        throw new Error('Invalid phone number format');
    }

    return trimmedPhone;
}

/**
 * Sanitizes text input to prevent XSS attacks
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // Remove any HTML tags and scripts
    const sanitized = DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });

    // Trim and limit length
    return sanitized.trim().substring(0, maxLength);
}

/**
 * Validates and sanitizes a name field
 */
export function validateName(name: string): string {
    if (!name || typeof name !== 'string') {
        throw new Error('Name is required');
    }

    const sanitized = sanitizeText(name, 100);

    if (sanitized.length < 2) {
        throw new Error('Name must be at least 2 characters');
    }

    if (!/^[a-zA-Z\s'-]+$/.test(sanitized)) {
        throw new Error('Name contains invalid characters');
    }

    return sanitized;
}

/**
 * Validates staff inquiry data
 */
export interface StaffInquiryData {
    name: string;
    email: string;
    mobile: string;
    message?: string;
}

export function validateStaffInquiry(data: any): StaffInquiryData {
    return {
        name: validateName(data.name),
        email: validateEmail(data.email),
        mobile: validatePhone(data.mobile),
        message: data.message ? sanitizeText(data.message, 2000) : undefined,
    };
}

/**
 * Validates client lead data
 */
export interface ClientLeadData {
    name: string;
    email: string;
    mobile: string;
    company?: string;
    message?: string;
}

export function validateClientLead(data: any): ClientLeadData {
    return {
        name: validateName(data.name),
        email: validateEmail(data.email),
        mobile: validatePhone(data.mobile),
        company: data.company ? sanitizeText(data.company, 200) : undefined,
        message: data.message ? sanitizeText(data.message, 2000) : undefined,
    };
}

/**
 * Validates a URL
 */
export function validateUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }

    return validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true,
    });
}

/**
 * Sanitizes an object by removing undefined/null values and extra fields
 */
export function sanitizeObject<T extends Record<string, any>>(
    obj: any,
    allowedFields: (keyof T)[]
): Partial<T> {
    const sanitized: Partial<T> = {};

    for (const field of allowedFields) {
        if (obj[field] !== undefined && obj[field] !== null) {
            sanitized[field] = obj[field];
        }
    }

    return sanitized;
}
