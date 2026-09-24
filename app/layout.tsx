import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";

export const metadata: Metadata = {
  title: "HealthScope — Find and compare hospitals",
  description:
    "Discover and compare hospitals by location, condition, budget, distance and facilities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-brand-100 bg-white py-6 text-center text-xs text-brand-700/70">
          HealthScope is a hackathon demo project. Hospital data shown here is a structured
          demo/mock dataset unless explicitly marked as verified. Not medical advice.
        </footer>
        <Chatbot />
      </body>
    </html>
  );
}
