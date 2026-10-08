import {
  verifyRequest,
  type CanonicalRequest,
} from "@contentful/node-apps-toolkit";
import { revalidateTag } from "next/cache";

const blogPostsCacheTag = "contentful:blog-posts";
const blogPostContentType = "blogPost";
const contentfulEnvironment = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

const relevantTopics = new Set([
  "ContentManagement.Entry.publish",
  "ContentManagement.Entry.unpublish",
  "ContentManagement.Entry.delete",
]);

interface ContentfulWebhookPayload {
  sys: {
    contentType?: { sys?: { id?: string } | null } | null;
    environment?: { sys?: { id?: string } | null } | null;
  };
}

function hasWebhookSystemProperties(
  value: unknown,
): value is ContentfulWebhookPayload {
  if (typeof value !== "object" || value === null || !("sys" in value)) {
    return false;
  }

  const sys = (value as { sys?: unknown }).sys;
  return typeof sys === "object" && sys !== null;
}

export async function POST(request: Request) {
  const secret = process.env.CONTENTFUL_WEBHOOK_SECRET;

  if (!secret) {
    return new Response("Webhook verification is not configured.", {
      status: 503,
    });
  }

  const rawBody = await request.text();
  const requestUrl = new URL(request.url);
  const canonicalRequest: CanonicalRequest = {
    method: "POST",
    path: `${requestUrl.pathname}${requestUrl.search}`,
    headers: Object.fromEntries(request.headers.entries()),
    body: rawBody,
  };

  try {
    if (!verifyRequest(secret, canonicalRequest)) {
      return new Response("Invalid webhook signature.", { status: 401 });
    }
  } catch {
    return new Response("Invalid webhook signature.", { status: 401 });
  }

  const topic = request.headers.get("x-contentful-topic");

  if (!topic || !relevantTopics.has(topic)) {
    return new Response(null, { status: 204 });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid webhook payload.", { status: 400 });
  }

  if (!hasWebhookSystemProperties(payload)) {
    return new Response("Invalid webhook payload.", { status: 400 });
  }

  if (payload.sys.contentType?.sys?.id !== blogPostContentType) {
    return new Response(null, { status: 204 });
  }

  const entryEnvironment = payload.sys.environment?.sys?.id;

  if (entryEnvironment && entryEnvironment !== contentfulEnvironment) {
    return new Response(null, { status: 204 });
  }

  revalidateTag(blogPostsCacheTag, "max");
  return new Response(null, { status: 204 });
}
