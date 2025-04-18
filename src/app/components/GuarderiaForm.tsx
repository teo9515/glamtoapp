"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

type ClientOption = {
  id: string;
  name: string;
};

type Client = {
  id: string;
  name: string;
  address: string;
  phone: string;
  cats: { name: string }[];
};

type GuarderiaFormProps = {
  onCreated?: () => void;
};

export default function GuarderiaForm({ onCreated }: GuarderiaFormProps) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [fechas, setFechas] = useState<string[]>([]);
  const [nuevaFecha, setNuevaFecha] = useState<string>("");

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from("clients").select("id, name");
      if (data) setClients(data);
      if (error) console.error(error);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!selectedClientId) return;
      const { data: client, error } = await supabase
        .from("clients")
        .select("id, name, address, phone, cats(name)")
        .eq("id", selectedClientId)
        .single();

      if (client) setSelectedClient(client as Client);
      if (error) console.error(error);
    };
    fetchClientDetails();
  }, [selectedClientId]);

  const agregarFecha = () => {
    if (nuevaFecha && !fechas.includes(nuevaFecha)) {
      setFechas([...fechas, nuevaFecha]);
      setNuevaFecha("");
    }
  };

  const eliminarFecha = (fecha: string) => {
    setFechas(fechas.filter((f) => f !== fecha));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || fechas.length === 0) return;

    const guarderiaId = uuidv4();

    const { error: errorGuarderia } = await supabase.from("guarderias").insert({
      id: guarderiaId,
      client_id: selectedClientId,
    });

    if (errorGuarderia) {
      console.error("Error al crear guardería:", errorGuarderia.message);
      return;
    }

    const visitas = fechas.map((fecha) => ({
      guarderia_id: guarderiaId,
      date: fecha,
    }));

    const { error: errorVisitas } = await supabase
      .from("guarderias_visits")
      .insert(visitas);

    if (errorVisitas) {
      console.error("Error al crear visitas:", errorVisitas.message);
      return;
    }

    if (onCreated) onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold">Seleccionar cliente</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          <option value="">-- Escoge un cliente --</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClient && (
        <div className="p-4 bg-gray-100 rounded-md space-y-1">
          <p>
            <strong>Nombre:</strong> {selectedClient.name}
          </p>
          <p>
            <strong>Dirección:</strong> {selectedClient.address}
          </p>
          <p>
            <strong>Teléfono:</strong> {selectedClient.phone}
          </p>
          <p>
            <strong>Gatos:</strong>{" "}
            {selectedClient.cats?.map((cat) => cat.name).join(", ")}
          </p>
        </div>
      )}

      <div>
        <label className="block font-semibold">Agregar fechas</label>
        <div className="flex gap-2">
          <input
            type="date"
            value={nuevaFecha}
            onChange={(e) => setNuevaFecha(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            type="button"
            onClick={agregarFecha}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Agregar
          </button>
        </div>
        {fechas.length > 0 && (
          <ul className="mt-2 space-y-1">
            {fechas.map((f) => (
              <li key={f} className="flex justify-between items-center">
                <span>{f}</span>
                <button
                  type="button"
                  onClick={() => eliminarFecha(f)}
                  className="text-red-600 text-sm"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        className="bg-green-700 text-white px-4 py-2 rounded"
      >
        Crear guardería
      </button>
    </form>
  );
}
