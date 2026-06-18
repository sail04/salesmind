import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CurrencyProvider } from "@/lib/CurrencyContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SalesMind - AI-Powered CRM SaaS Platform",
  description: "Turn Leads Into Customers with the next-generation AI CRM. Forecast revenue, score leads, coach sales staff, and summarize meetings automatically.",
  keywords: "CRM, AI CRM, Sales Pipeline, Revenue Forecasting, Lead Scoring, Meeting Summarizer, SaaS, Nexvora",
  authors: [{ name: "Nexvora" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
