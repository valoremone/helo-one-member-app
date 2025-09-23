import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppToaster } from "@/components/ui/sonner-toaster";

const monument = localFont({
  src: [
    {
      path: "../public/fonts/monument-extended-webfonts/ppmonumentextended-thin-webfont.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/monument-extended-webfonts/ppmonumentextended-light-webfont.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/monument-extended-webfonts/ppmonumentextended-regular-webfont.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/monument-extended-webfonts/ppmonumentextended-bold-webfont.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/monument-extended-webfonts/ppmonumentextended-black-webfont.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-monument",
});

export const metadata: Metadata = {
  title: "Helo One - Member Portal",
  description: "Premium concierge services for members",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/aax0lvp.css" />
      </head>
      <body className={`${monument.className} ${monument.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
