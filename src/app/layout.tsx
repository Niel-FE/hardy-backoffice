import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import NotificationBadge from "@/components/NotificationBadge";

export const metadata: Metadata = {
  title: "UD Final Backoffice - 관리자 시스템",
  description: "UD 교육 프로그램 백오피스 관리 시스템 (Final)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <div className="flex h-screen overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
              <div className="flex items-center gap-4">
                <NotificationBadge />
                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">관리자</p>
                    <p className="text-xs text-gray-500">admin@ud.com</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <div className="p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
