import type { Metadata } from "next";
import { Newsreader, Archivo_Narrow } from "next/font/google";
import "./globals.css";

// Newsreader for the prose: a literary serif built for long reading, with
// enough contrast to carry the cataloguer's voice. Archivo Narrow for the
// ledger fields — condensed, plain, the lettering of an index card.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const archivo = Archivo_Narrow({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "StoryTree",
  description:
    "One tree, one climber, and everything anyone leaves behind. Post a note or a photo and he climbs higher.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${archivo.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
