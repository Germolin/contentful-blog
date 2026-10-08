import { cacheLife, cacheTag } from "next/cache";
import type { Document } from "@contentful/rich-text-types";
import { queryContentful } from "@/lib/contentful/graphql";

const blogPostsCacheTag = "contentful:blog-posts";

const blogPostsQuery = /* GraphQL */ `
  query BlogPosts($limit: Int!, $skip: Int!) {
    blogPostCollection(
      limit: $limit
      skip: $skip
      order: [date_DESC]
      preview: false
    ) {
      items {
        sys {
          id
        }
        header
        slug
        date
      }
    }
  }
`;

const blogPostBySlugQuery = /* GraphQL */ `
  query BlogPostBySlug($slug: String!) {
    blogPostCollection(
      where: { slug: $slug }
      limit: 1
      preview: false
    ) {
      items {
        sys {
          id
        }
        header
        slug
        date
        body {
          json
        }
      }
    }
  }
`;

interface GraphQLBlogPost {
  sys?: { id?: string | null } | null;
  header?: string | null;
  slug?: string | null;
  date?: string | null;
  body?: { json?: unknown } | null;
}

interface BlogPostsResponse {
  blogPostCollection?: {
    items?: Array<GraphQLBlogPost | null> | null;
  } | null;
}

export interface BlogPostSummary {
  id: string;
  header: string;
  slug: string;
  date: string | null;
}

export interface BlogPost extends BlogPostSummary {
  body: Document | null;
}

function isRichTextDocument(value: unknown): value is Document {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const document = value as { nodeType?: unknown; content?: unknown };
  return document.nodeType === "document" && Array.isArray(document.content);
}

function toBlogPostSummary(
  entry: GraphQLBlogPost | null | undefined,
): BlogPostSummary | null {
  if (!entry) {
    return null;
  }

  const id = entry.sys?.id;

  if (
    typeof id !== "string" ||
    typeof entry.header !== "string" ||
    typeof entry.slug !== "string"
  ) {
    return null;
  }

  return {
    id,
    header: entry.header,
    slug: entry.slug,
    date: entry.date ?? null,
  };
}

function toBlogPost(entry: GraphQLBlogPost | null | undefined): BlogPost | null {
  const summary = toBlogPostSummary(entry);

  if (!summary) {
    return null;
  }

  const bodyJson = entry?.body?.json;

  return {
    ...summary,
    body: isRichTextDocument(bodyJson) ? bodyJson : null,
  };
}

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  "use cache: remote";

  cacheLife("max");
  cacheTag(blogPostsCacheTag);

  const data = await queryContentful<BlogPostsResponse>(blogPostsQuery, {
    limit: 20,
    skip: 0,
  });

  return (data.blogPostCollection?.items ?? [])
    .map(toBlogPostSummary)
    .filter((post): post is BlogPostSummary => post !== null);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  "use cache: remote";

  cacheLife("max");
  cacheTag(blogPostsCacheTag);

  const data = await queryContentful<BlogPostsResponse>(blogPostBySlugQuery, {
    slug,
  });

  const entry = data.blogPostCollection?.items?.[0];
  return toBlogPost(entry);
}
