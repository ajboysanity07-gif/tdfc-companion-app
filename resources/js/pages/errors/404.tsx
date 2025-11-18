import { Head, Link } from '@inertiajs/react';
import { FileQuestion } from 'lucide-react';

export default function Error404() {
  return (
    <>
      <Head title="Page Not Found" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800 px-4">
        <div className="text-center max-w-md">
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <FileQuestion className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-[#F57979] text-white font-medium rounded-lg hover:bg-[#f46868] transition"
            >
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
