import "./globals.css"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Sistema de Fumigaciones",
  description: "Sistema profesional de cotizaciones"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-black text-white">
        
        <Navbar />

        <main className="p-6">
          {children}
        </main>

      </body>
    </html>
  )
}