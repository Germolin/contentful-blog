import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import RichText from "@/components/rich-text";
import { formatPostDate } from "@/lib/format-date";
import { getBlogPostBySlug } from "@/lib/contentful/posts";

export default function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12 sm:px-10 sm:py-16">
      <Suspense fallback={<ArticleLoading />}>
        {params.then(({ slug }) => <BlogPost slug={slug} />)}
      </Suspense>
    </main>
  );
}

async function BlogPost({ slug }: { slug: string }) {
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = formatPostDate(post.date);

  return (
    <>
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-accent transition-colors hover:text-accent-hover"
      >
        <span aria-hidden="true">←</span> All entries
      </Link>

      <article className="mt-10">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Blog post
            {publishedDate ? (
              <>
                <span className="px-2" aria-hidden="true">
                  /
                </span>
                <time dateTime={post.date ?? undefined}>{publishedDate}</time>
              </>
            ) : null}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            {post.header}
          </h1>
        </header>

        <div className="mt-9">
          {post.body ? (
            <RichText document={post.body} />
          ) : (
            <p className="text-muted">This post has no body content yet.</p>
          )}
        </div>
      </article>
    </>
  );
}

function ArticleLoading() {
  return (
    <div aria-busy="true" className="animate-pulse">
      <div className="h-4 w-28 rounded bg-surface-raised" />
      <div className="mt-10 h-12 max-w-2xl rounded bg-surface-raised" />
      <div className="mt-12 h-5 max-w-3xl rounded bg-surface-raised" />
      <div className="mt-4 h-5 max-w-2xl rounded bg-surface-raised" />
      <div className="mt-4 h-5 max-w-xl rounded bg-surface-raised" />
    </div>
  );
}
