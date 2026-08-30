import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const FAIRCORE_ICON_URL =
  "https://private-user-images.githubusercontent.com/287196754/643088478-040f63a8-1f9e-4b4a-87c2-916cb8c816de.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODgwODc2ODUsIm5iZiI6MTc4ODA4NzM4NSwicGF0aCI6Ii8yODcxOTY3NTQvNjQzMDg4NDc4LTA0MGY2M2E4LTFmOWUtNGI0YS04N2MyLTkxNmNiOGM4MTZkZS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwODMwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDgzMFQxMDU2MjVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT02M2Q5YTMzNzA1MTE4OTQyYzcyMjVkMjA0MjU5NDgzZmEwZGJlNjU0YWUzODYzYzBlYTBhNDYwYjEzMGM0NGU0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.qIlqwepckTjugX-iW3OQfl9xl6RdWDbZQv48pRKWp48";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solar System Orbit",
  description: "Animated solar system with orbiting planets.",
  icons: {
    icon: FAIRCORE_ICON_URL,
    shortcut: FAIRCORE_ICON_URL,
    apple: FAIRCORE_ICON_URL,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
