import Image from "next/image";

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to the TODO App</h1>
      <Link
        href="/todos"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
      >
        Go to TODOs
      </Link>
    </div>
  );
}
