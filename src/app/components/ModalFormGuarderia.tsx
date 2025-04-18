"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ModalFormGuarderiaProps {
  isOpen: boolean;
  onClose: () => void;
  onGuarderiaCreated?: () => void; // <- para recargar lista
}

type Client = {
  id: string;
  name: string;
  cats: {
    name: string;
  }[];
};

export default function ModalFormGuarderia({
  isOpen,
  onClose,
  onGuarderiaCreated,
}: ModalFormGuarderiaProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [visits, setVisits] = useState<{ date: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, cats(name)");

      if (error) {
        setError("Error cargando clientes");
      } else {
        setClients(data || []);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const handleAddVisit = () => {
    setVisits([...visits, { date: "" }]);
  };

  const handleChangeVisit = (index: number, value: string) => {
    const newVisits = [...visits];
    newVisits[index].date = value;
    setVisits(newVisits);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!selectedClientId || visits.length === 0) {
      setError("Selecciona un cliente y al menos una visita");
      setLoading(false);
      return;
    }

    const { data: guarderia, error: insertError } = await supabase
      .from("guarderias")
      .insert({ client_id: selectedClientId })
      .select()
      .single();

    if (insertError || !guarderia) {
      setError("Error creando guardería");
      setLoading(false);
      return;
    }

    const { error: visitsError } = await supabase
      .from("guarderias_visits")
      .insert(
        visits.map((visit) => ({
          guarderia_id: guarderia.id,
          date: visit.date,
        }))
      );

    if (visitsError) {
      setError("Error agregando visitas");
      setLoading(false);
      return;
    }

    // ✅ Actualizar lista y cerrar modal
    onGuarderiaCreated?.();
    onClose();
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Nueva guardería</h2>

        {error && <p className="text-red-600">{error}</p>}

        <label className="block">
          Cliente:
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="mt-1 p-2 border w-full rounded"
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2">
          <p className="font-medium">Fechas:</p>
          {visits.map((visit, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="date"
                value={visit.date}
                onChange={(e) => handleChangeVisit(index, e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddVisit}
            className="text-sm text-blue-600 hover:underline"
          >
            + Agregar otra fecha
          </button>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#163020] text-white px-4 py-2 rounded hover:bg-[#2c4a1c]"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
