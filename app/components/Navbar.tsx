"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  const linkClass = (path: string) =>
    `px-4 py-2 rounded ${
      pathname === path
        ? "bg-green-600 text-white"
        : "text-gray-300 hover:bg-gray-800"
    }`

  return (
    <div className="w-full bg-black border-b border-gray-800 px-6 py-4 flex justify-between items-center">
      
      <h1 className="text-white font-bold text-lg">
        🐜 Fumigaciones
      </h1>

      <div className="flex gap-4">
        <Link href="/" className={linkClass("/")}>
          🏠 Inicio
        </Link>

        <Link href="/cotizaciones" className={linkClass("/cotizaciones")}>
          🧾 Cotizaciones
        </Link>

        <Link href="/historial" className={linkClass("/historial")}>
          📊 Historial
        </Link>
      </div>

    </div>
  )
}