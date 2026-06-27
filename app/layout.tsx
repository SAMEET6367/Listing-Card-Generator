import "./globals.css";

export const metadata = {
  title: "Listing Card Generator",
  description: "AI Listing Card Generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}