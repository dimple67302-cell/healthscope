import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold">
            H
          </span>
          <span className="text-lg font-bold text-brand-700">HealthScope</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-brand-700/80">
          <Link href="/" className="hover:text-brand-700">
            Home
          </Link>
          <Link href="/results" className="hover:text-brand-700">
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
