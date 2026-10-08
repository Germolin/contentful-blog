import Link from "next/link";
import { getBlogPosts } from "@/lib/contentful/posts";
import { formatPostDate } from "@/lib/format-date";

export default async function Home() {
  const posts = await getBlogPosts();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16 sm:px-10 sm:py-20">
      <header className="border-b border-border pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Content archive / Blog
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          Journal
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Stories, ideas, and notes from the Contentful Blog.
        </p>
      </header>

      <section aria-labelledby="entries-heading" className="mt-12">
        <div className="mb-2 flex items-center justify-between border-b border-border pb-3">
          <h2
            id="entries-heading"
            className="font-mono text-xs uppercase tracking-[0.18em] text-foreground"
          >
            Entries
          </h2>
          <span className="font-mono text-xs text-muted">
            {String(posts.length).padStart(2, "0")}
          </span>
        </div>

        {posts.length > 0 ? (
          <ol>
            {posts.map((post, index) => {
              const publishedDate = formatPostDate(post.date);

              return (
                <li key={post.id} className="border-b border-border">
                  <Link
                    href={`/blog/${encodeURIComponent(post.slug)}`}
                    className="group block py-7 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-xs text-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {publishedDate ? (
                        <time
                          dateTime={post.date ?? undefined}
                          className="font-mono text-xs text-muted"
                        >
                          {publishedDate}
                        </time>
                      ) : (
                        <span className="font-mono text-xs uppercase tracking-wider text-muted">
                          Undated
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold leading-snug text-foreground transition-colors group-hover:text-accent sm:text-3xl">
                      {post.header}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-accent">
                      Read entry <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="border-b border-border py-10 text-muted">
            No posts have been published yet.
          </p>
        )}
      </section>
    </main>
  );
}
