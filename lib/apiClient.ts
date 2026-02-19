// lib/apiClient.ts
import { auth } from './firebase';

/**
 * Makes an authenticated API request
 * Automatically includes the Firebase auth token in the request
 */
export async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    // Get current user's auth token
    const user = auth.currentUser;

    if (!user) {
        throw new Error('User must be authenticated to make this request');
    }

    // Get ID token
    const token = await user.getIdToken();

    // Merge headers with auth token
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    // Make the request
    return fetch(url, {
        ...options,
        headers,
    });
}

/**
 * Helper for POST requests with authentication
 */
export async function authenticatedPost<T = any>(
    url: string,
    data: any
): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
        const response = await authenticatedFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || `Request failed with status ${response.status}`,
            };
        }

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Request failed',
        };
    }
}

/**
 * Helper for GET requests with authentication
 */
export async function authenticatedGet<T = any>(
    url: string
): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
        const response = await authenticatedFetch(url, {
            method: 'GET',
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || `Request failed with status ${response.status}`,
            };
        }

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Request failed',
        };
    }
}

/**
 * Example usage in components:
 * 
 * ```typescript
 * import { authenticatedPost } from '@/lib/apiClient';
 * 
 * const handleSubmit = async (formData) => {
 *   const result = await authenticatedPost('/api/submit-staff', formData);
 *   
 *   if (result.success) {
 *     toast.success('Submitted successfully!');
 *   } else {
 *     toast.error(result.error);
 *   }
 * };
 * ```
 */
