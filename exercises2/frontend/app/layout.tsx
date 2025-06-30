import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Cognito Auth App",
  description: "Next.js application with Cognito authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
