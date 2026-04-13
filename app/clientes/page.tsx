"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([])

  const [nombre, setNombre] = useState("")
  const [tipo, setTipo] = useState("")
  const [telefono, setTelefono] = useState("")

  useEffect(() => {
    getClientes()
  }, [])

  async function getClientes() {
    const { data } = await supabase.from("clientes").select("*")
    setClientes(data || [])
  }

  async function crearCliente() {
    if (!nombre) {
      alert("El nombre es obligatorio")
      return
    }

    const { error } = await supabase.from("clientes").insert([
      {
        nombre,
        tipo,
        telefono
      }
    ])

    if (error) {
      alert("Error al guardar")
      console.log(error)
    } else {
      alert("Cliente guardado 🚀")

      // limpiar campos
      setNombre("")
      setTipo("")
      setTelefono("")

      // refrescar lista
      getClientes()
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Clientes</h1>

      {/* FORMULARIO */}
      <div className="mt-6 border p-4 rounded">
        <h2 className="font-bold mb-2">Nuevo Cliente</h2>

        <input
          className="border p-2 mr-2"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          className="border p-2 mr-2"
          placeholder="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        />

        <input
          className="border p-2 mr-2"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        <button
          onClick={crearCliente}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Guardar
        </button>
      </div>

      {/* LISTA */}
      <ul className="mt-6">
        {clientes.map((c) => (
          <li key={c.id} className="border p-2 my-2">
            {c.nombre} - {c.tipo}
          </li>
        ))}
      </ul>
    </div>
  )
}