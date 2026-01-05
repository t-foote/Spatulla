import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spatulla — Image-to-Video Prompt Generator",
  description:
    "Upload up to 5 reference images and optional notes. Spatulla synthesizes them into one detailed, cinematic video generation prompt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(224 14% 12%)",
              border: "1px solid hsl(224 14% 18%)",
              color: "hsl(220 14% 95%)",
            },
          }}
        />
      </body>
    </html>
  );
}
