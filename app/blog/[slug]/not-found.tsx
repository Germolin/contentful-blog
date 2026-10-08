import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16 sm:px-10 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
        404 / Not found
      </p>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">
        This entry could not be found.
      </h1>
      <Link
        href="/"
        className="mt-8 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-accent transition-colors hover:text-accent-hover"
      >
        <span aria-hidden="true">←</span> Back to the journal
      </Link>
    </main>
  );
}
