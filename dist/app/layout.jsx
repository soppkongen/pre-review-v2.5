import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
const inter = Inter({ subsets: ["latin"] });
export const metadata = {
    title: "Pre-Review - Epistemic Counterintelligence for Research Papers",
    description: "Revolutionary multi-agent system for comprehensive epistemic analysis of research papers",
    generator: 'v0.dev',
    icons: {
        icon: '/favicon.webp',
        shortcut: '/favicon.webp',
        apple: '/favicon.webp',
    },
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>);
}
