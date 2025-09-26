import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if backend is healthy by calling its health endpoint
    // In Docker network, use service name; otherwise use configured URL
    const backendUrl =
      process.env.NODE_ENV === "production"
        ? "http://myblog-backend:3003" // Docker service name
        : process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3003";

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${backendUrl}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const backendHealth = await response.json();
      return NextResponse.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        backend: backendHealth,
        frontend: {
          status: "healthy",
          uptime: process.uptime(),
        },
      });
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: "Backend health check failed",
          backendStatus: response.status,
        },
        { status: 503 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
