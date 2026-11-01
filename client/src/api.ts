const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "")
    ?? "http://localhost:3000/api";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export class ApiError extends Error {
    status: number;
    details?: unknown;

    constructor(status: number, message: string, details?: unknown) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

export function setAccessToken(token: string | null) {
    accessToken = token;
}

async function parseResponse(response: Response) {
    if (response.status === 204) return undefined;
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ApiError(
            response.status,
            body.error ?? body.message ?? "Something went wrong. Please try again.",
            body.details,
        );
    }
    return body;
}

export async function refreshAccessToken(): Promise<string | null> {
    if (!refreshPromise) {
        refreshPromise = fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        })
            .then(async (response) => {
                if (!response.ok) return null;
                const body = await response.json() as { accessToken: string };
                setAccessToken(body.accessToken);
                return body.accessToken;
            })
            .catch(() => null)
            .finally(() => { refreshPromise = null; });
    }
    return refreshPromise;
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
    const headers = new Headers(options.headers);
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
    });

    if (response.status === 401 && retry && path !== "/auth/login" && path !== "/auth/refresh") {
        const refreshed = await refreshAccessToken();
        if (refreshed) return api<T>(path, options, false);
    }

    return parseResponse(response) as Promise<T>;
}
