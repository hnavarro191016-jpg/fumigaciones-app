"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Cliente = {
  id: string
  nombre: string
  telefono?: string
}

type Cotizacion = {
  id: string
  descripcion: string
  precio: number
  pdf_url: string
  fecha: string
  cliente_id: string
  clientes?: Cliente
}

export default function Historial() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCotizaciones()
  }, [])

  async function getCotizaciones() {
    try {
      // 🔥 TRAER COTIZACIONES (CORREGIDO CON fecha)
      const { data: cotizacionesData, error: errorCot } = await supabase
        .from("cotizaciones")
        .select("*")
        .order("fecha", { ascending: false })

      if (errorCot) {
        console.error("Error cotizaciones:", errorCot)
        alert("Error cargando cotizaciones")
        return
      }

      // 🔥 TRAER CLIENTES
      const { data: clientesData, error: errorCli } = await supabase
        .from("clientes")
        .select("*")

      if (errorCli) {
        console.error("Error clientes:", errorCli)
        alert("Error cargando clientes")
        return
      }

      // 🔥 HACER MATCH MANUAL
      const dataFinal = (cotizacionesData || []).map((cot: any) => ({
        ...cot,
        clientes: clientesData?.find(
          (c: any) => String(c.id) === String(cot.cliente_id)
        )
      }))

      console.log("DATA FINAL:", dataFinal)

      setCotizaciones(dataFinal)

    } catch (err) {
      console.error("Error general:", err)
      alert("Error general")
    } finally {
      setLoading(false)
    }
  }

  function abrirPDF(url: string) {
    if (!url) {
      alert("Esta cotización no tiene PDF")
      return
    }
    window.open(url, "_blank")
  }

  function reenviarWhats(cot: Cotizacion) {
    const cliente = cot.clientes

    if (!cliente?.telefono) {
      alert("Cliente sin teléfono")
      return
    }

    const mensaje = `Hola ${cliente.nombre}, te reenvío tu cotización:\n${cot.pdf_url}`

    const whatsappUrl = `https://wa.me/52${cliente.telefono}?text=${encodeURIComponent(mensaje)}`

    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Historial de Cotizaciones</h1>

      {loading && <p className="mt-4">Cargando...</p>}

      {!loading && cotizaciones.length === 0 && (
        <p className="mt-4">No hay cotizaciones aún</p>
      )}

      <div className="mt-6 space-y-4">

        {cotizaciones.map((cot) => (
          <div
            key={cot.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-bold">
                {cot.clientes?.nombre || "Cliente no encontrado"}
              </p>

              <p>{cot.descripcion}</p>

              <p className="text-green-600 font-bold">
                ${cot.precio} MXN
              </p>

              <p className="text-sm text-gray-500">
                {cot.fecha
                  ? new Date(cot.fecha).toLocaleString()
                  : "Sin fecha"}
              </p>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() => abrirPDF(cot.pdf_url)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Ver PDF
              </button>

              <button
                onClick={() => reenviarWhats(cot)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                WhatsApp
              </button>

            </div>
          </div>
        ))}

      </div>
    </div>
  )
}