/**
 * BFF (Backend for Frontend) Proxy Route
 * Forwards requests to Django API with JWT authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Backend API configuration
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

/**
 * Handle all HTTP methods for the proxy route
 */
export async function ALL(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  // Build target URL
  const path = params.path.join("/");
  const targetUrl = new URL(`/api/v1/${path}`, BACKEND_URL);

  // Copy query parameters
  const searchParams = request.nextUrl.searchParams;
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  // Get JWT token from HttpOnly cookie
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Build headers
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
    // Forward request to backend
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

    // Make request to backend
    const backendResponse = await fetch(targetUrl.toString(), fetchOptions);

    // Handle token refresh on 401
    if (backendResponse.status === 401 && accessToken) {
      // Try to refresh token
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry request with new token
        return retryRequest(request, params);
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
  params: { path: string[] }
): Promise<NextResponse> {
  // Get new token
  const cookieStore = await cookies();
  const newToken = cookieStore.get("access_token")?.value;

  const path = params.path.join("/");
  const targetUrl = new URL(`/api/v1/${path}`, BACKEND_URL);

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

// Export specific HTTP method handlers
export { ALL as GET, ALL as POST, ALL as PUT, ALL as DELETE, ALL as PATCH };
