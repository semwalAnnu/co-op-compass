import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-blue-600/10 to-transparent">
      <div className="text-center space-y-6 max-w-4xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Track and Conquer Your Co-op Applications
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A serverless job-application tracker built with Next.js, Cloudflare Workers & KV, and Tailwind CSS.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 hover:scale-105 transition-all uppercase text-sm tracking-wide"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}