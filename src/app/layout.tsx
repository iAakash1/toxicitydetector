import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ToxiMeter - Relationship Toxicity Assessment",
  description: "Assess the health of your relationships with our comprehensive toxicity detector",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} text-gray-200 font-sans selection:bg-pink-500/40`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/50 via-gray-900 to-black opacity-80" />
          <div className="relative">
            <Providers>
              {children}
            </Providers>
          </div>
        </div>
      </body>
    </html>
  )
}
