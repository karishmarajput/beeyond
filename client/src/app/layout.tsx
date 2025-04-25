import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"

export const metadata = {
  title: "Quick Commerce"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
