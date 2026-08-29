import Link from "next/link";

export default function Home() {
  return (
    <main
      className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-4"
      style={{ background: "var(--felt-dark)" }}
    >
      <h1 className="font-display text-5xl" style={{ color: "var(--gold-bright)" }}>
        حکم‌آرت
      </h1>
      <p className="opacity-70 max-w-sm">
        بازی حکم چهارنفره — تمرین با ربات یا آنلاین با دوستان
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/play"
          className="px-6 py-3 rounded-xl font-semibold"
          style={{ background: "var(--gold)", color: "var(--ink)" }}
        >
          تمرین با ربات
        </Link>
        <Link
          href="/online"
          className="px-6 py-3 rounded-xl font-semibold border"
          style={{ borderColor: "var(--gold)", color: "var(--gold-bright)" }}
        >
          بازی آنلاین
        </Link>
      </div>
    </main>
  );
}
