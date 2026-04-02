import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const getBackendBaseUrl = () => {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "";
};

const proxyRequest = async (
  request: NextRequest,
  method: string,
  proxySegments: string[],
) => {
  const backendBaseUrl = getBackendBaseUrl();
  if (!backendBaseUrl) {
    return NextResponse.json(
      {
        error:
          "Backend URL is not configured. Set BACKEND_URL for hosted deployments.",
      },
      { status: 500 },
    );
  }

  const targetUrl = new URL(
    `/api/${proxySegments.join("/")}${request.nextUrl.search}`,
    backendBaseUrl,
  );

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const init: RequestInit = {
    method,
    headers,
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.text();
  }

  const response = await fetch(targetUrl, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> },
) {
  const { proxy } = await context.params;
  return proxyRequest(request, "GET", proxy);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> },
) {
  const { proxy } = await context.params;
  return proxyRequest(request, "POST", proxy);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> },
) {
  const { proxy } = await context.params;
  return proxyRequest(request, "PUT", proxy);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> },
) {
  const { proxy } = await context.params;
  return proxyRequest(request, "PATCH", proxy);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> },
) {
  const { proxy } = await context.params;
  return proxyRequest(request, "DELETE", proxy);
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> },
) {
  const { proxy } = await context.params;
  return proxyRequest(request, "HEAD", proxy);
}