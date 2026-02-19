import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-600 p-2 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="3" x2="21" y1="10" y2="10" />
                <line x1="9" x2="9" y1="4" y2="22" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              TimetableAI
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/#features"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
