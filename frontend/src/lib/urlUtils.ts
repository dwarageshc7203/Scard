export function sanitizeUrl(url: string | undefined | null): string | undefined {
    if (!url) return undefined;
    try {
        const parsed = new URL(url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'mailto:') {
            return url;
        }
        return undefined; // Reject javascript: and others
    } catch (e) {
        // If it's not a valid URL (e.g., relative path), just return as is?
        // But for social/project URLs, they should be absolute.
        // We can just reject it if it fails to parse as absolute.
        return undefined;
    }
}
