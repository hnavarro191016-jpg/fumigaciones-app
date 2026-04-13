"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"

type Cliente = {
  id: string
  nombre: string
  telefono?: string
  direccion?: string
}

export default function Cotizaciones() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precio, setPrecio] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getClientes()
  }, [])

  async function getClientes() {
    const { data } = await supabase.from("clientes").select("*")
    setClientes(data || [])
  }

  async function generarFolio() {
    const { count } = await supabase
      .from("cotizaciones")
      .select("*", { count: "exact", head: true })

    const numero = (count || 0) + 1
    return `COT-${numero.toString().padStart(4, "0")}`
  }

  async function getBase64Image(url: string) {
    try {
      const res = await fetch(url)

      if (!res.ok) return null

      const blob = await res.blob()

      return await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  async function generarPDF() {
    if (loading) return

    if (!clienteId || !descripcion || !precio) {
      alert("Faltan datos")
      return
    }

    setLoading(true)

    try {
      const { data: cliente } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", clienteId)
        .single()

      if (!cliente) {
        alert("Cliente no encontrado")
        return
      }

      const folio = await generarFolio()

      const doc = new jsPDF()

      // HEADER
      doc.setFillColor(40, 167, 69)
      doc.rect(0, 0, 210, 30, "F")

      // 🔥 LOGO SEGURO
      const logoBase64 = await getBase64Image("/logo.png")

      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 10, 5, 40, 20)
      } else {
        console.warn("Logo no cargado, continuando sin logo")
      }

      // TITULO
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.text("FUMIGACIONES PROFESIONALES", 60, 15)

      doc.setTextColor(0, 0, 0)

      // INFO
      doc.setFontSize(10)
      doc.text(`Folio: ${folio}`, 150, 40)
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 48)

      // CLIENTE
      doc.rect(20, 50, 170, 30)
      doc.text(`Cliente: ${cliente.nombre}`, 25, 60)
      doc.text(`Tel: ${cliente.telefono || "-"}`, 25, 68)
      doc.text(`Dirección: ${cliente.direccion || "-"}`, 25, 76)

      // TABLA
      doc.setFillColor(230, 230, 230)
      doc.rect(20, 90, 170, 10, "F")
      doc.text("Servicio", 25, 97)
      doc.text("Precio", 150, 97)

      doc.text(doc.splitTextToSize(descripcion, 110), 25, 110)
      doc.text(`$${precio}`, 150, 110)

      // TOTAL
      doc.setFontSize(14)
      doc.text(`TOTAL: $${precio} MXN`, 25, 140)

      // FOOTER
      doc.setFontSize(10)
      doc.text("Gracias por su preferencia", 25, 170)
      doc.text("Contacto: 444-123-4567", 25, 180)

      // SUBIR
      const pdfBlob = doc.output("blob")
      const fileName = `cotizacion_${folio}.pdf`

      await supabase.storage
        .from("cotizaciones")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf"
        })

      const { data: publicUrlData } = supabase.storage
        .from("cotizaciones")
        .getPublicUrl(fileName)

      const pdfUrl = publicUrlData.publicUrl

      await supabase.from("cotizaciones").insert([
        {
          cliente_id: clienteId,
          descripcion,
          precio: Number(precio),
          pdf_url: pdfUrl,
          folio
        }
      ])

      // WHATSAPP
      if (cliente.telefono) {
        const mensaje = `Hola ${cliente.nombre}, te envío tu cotización (${folio}):\n${pdfUrl}`
        const url = `https://wa.me/52${cliente.telefono}?text=${encodeURIComponent(mensaje)}`
        window.open(url, "_blank")
      }

      setDescripcion("")
      setPrecio("")
      setClienteId("")

      alert(`Cotización ${folio} generada 🚀`)

    } catch (err) {
      console.error(err)
      alert("Error general")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Cotizaciones</h1>

      <div className="mt-6 border p-4 rounded space-y-4">

        <select
          className="border p-2 w-full"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
        >
          <option value="">Selecciona cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <input
          className="border p-2 w-full"
          placeholder="Descripción del servicio"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <button
          onClick={generarPDF}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-green-500"
          }`}
        >
          {loading ? "Generando..." : "Generar PDF"}
        </button>

      </div>
    </div>
  )
}