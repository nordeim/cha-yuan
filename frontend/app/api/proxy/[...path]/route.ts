/**
 * BFF (Backend for Frontend) Proxy Route
 * Forwards requests to Django API with JWT authentication.
 *
 * NOTE: In Next.js 15+, `params` is a Promise that must be awaited.
 * Ref: https://nextjs.org/docs/messages/sync-dynamic-apis
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Backend API configuration
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Define the new async context type for Next.js 15+
type ProxyRouteContext = {
  params: Promise<{ path: string[] }>;
};

/**
 * Handle all HTTP methods for the proxy route
 */
export async function ALL(
  request: NextRequest,
  context: ProxyRouteContext
): Promise<NextResponse> {
  // Await params before accessing properties (Next.js 15+ requirement)
  const { path } = await context.params;

  // Validate catch-all segment
  if (!path?.length) {
    return NextResponse.json(
      { error: "Invalid proxy path" },
      { status: 400 }
    );
  }

  const pathString = path.join("/");
  const targetUrl = new URL(`/api/v1/${pathString}`, BACKEND_URL);

  // Copy query parameters from incoming request
  const searchParams = request.nextUrl.searchParams;
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  // Get JWT token from HttpOnly cookie
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Build headers with secure forwarding
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Request-ID": crypto.randomUUID(),
    "X-SG-Timezone": "Asia/Singapore",
    "Accept-Language": "en-SG",
  };

  // Add Authorization header if token exists
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Copy client headers (excluding sensitive ones)
  const clientHeaders = request.headers;
  const forwardedHeaders = ["x-forwarded-for", "user-agent"];
  forwardedHeaders.forEach((header) => {
    const value = clientHeaders.get(header);
    if (value) {
      headers[header] = value;
    }
  });

  try {
    // Build fetch options
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    // Add body for non-GET requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    // Forward request to backend
    const backendResponse = await fetch(targetUrl.toString(), fetchOptions);

    // Handle token refresh on 401
    if (backendResponse.status === 401 && accessToken) {
      // Try to refresh token
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry request with new token
        return retryRequest(request, context);
      }
    }

    // Create response
    const responseBody = await backendResponse.text();
    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // Copy response headers (excluding sensitive ones)
    backendResponse.headers.forEach((value, key) => {
      if (!["set-cookie", "content-encoding"].includes(key.toLowerCase())) {
        response.headers.set(key, value);
      }
    });

    // Set cache headers
    response.headers.set("Cache-Control", "private, no-store");

    return response;
  } catch (error) {
    console.error("BFF Proxy Error:", error);

    return NextResponse.json(
      {
        error: "Service unavailable",
        message:
          "Unable to connect to backend service. Please try again later.",
      },
      { status: 503 }
    );
  }
}

/**
 * Try to refresh the access token using the refresh token
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

/**
 * Retry the original request after token refresh
 */
async function retryRequest(
  request: NextRequest,
  context: ProxyRouteContext
): Promise<NextResponse> {
  // Get new token
  const cookieStore = await cookies();
  const newToken = cookieStore.get("access_token")?.value;

  // Await params (Next.js 15+ requirement)
  const { path } = await context.params;
  const pathString = path.join("/");
  const targetUrl = new URL(`/api/v1/${pathString}`, BACKEND_URL);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-SG-Timezone": "Asia/Singapore",
  };

  if (newToken) {
    headers["Authorization"] = `Bearer ${newToken}`;
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.clone().text();
    if (body) {
      fetchOptions.body = body;
    }
  }

  const response = await fetch(targetUrl.toString(), fetchOptions);
  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}

// Export individual methods that delegate to ALL handler
export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const DELETE = ALL;
export const PATCH = ALL;
