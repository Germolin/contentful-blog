import "server-only";

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<TData> {
  data?: TData | null;
  errors?: GraphQLError[];
}


export async function queryContentful<TData>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> {
  const accessToken =
    process.env.CONTENTFUL_DELIVERY_TOKEN ??
    process.env.CONTENTFUL_ACCESS_TOKEN ??
    process.env.ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "Missing Contentful credentials. Set ACCESS_TOKEN, CONTENTFUL_ACCESS_TOKEN, or CONTENTFUL_DELIVERY_TOKEN in the server environment.",
    );
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID ?? process.env.SPACE_ID;

  if (!spaceId) {
    throw new Error(
      "Missing Contentful space ID. Set SPACE_ID or CONTENTFUL_SPACE_ID in the server environment.",
    );
  }

  const environment = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
  const endpoint = `https://graphql.contentful.com/content/v1/spaces/${encodeURIComponent(spaceId)}/environments/${encodeURIComponent(environment)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json().catch(() => null)) as GraphQLResponse<TData> | null;

  if (!payload) {
    throw new Error(
      `Contentful GraphQL returned an invalid response (${response.status}).`,
    );
  }

  const errors = payload.errors?.map(({ message }) => message);

  if (!response.ok || errors?.length) {
    const details = errors?.join("; ") ?? response.statusText;
    throw new Error(
      `Contentful GraphQL request failed (${response.status}): ${details}`,
    );
  }

  if (payload.data == null) {
    throw new Error("Contentful GraphQL response did not include data.");
  }

  return payload.data;
}
