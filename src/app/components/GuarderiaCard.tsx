"use client";

import { useMemo, useState } from "react";

type Cat = {
  name: string;
};

type Client = {
  name: string;
  cats: Cat[];
};

type Visit = {
  date: string;
};

type GuarderiaCardProps = {
  id: string;
  client: Client;
  visits: Visit[];
  onDelete: (id: string) => void;
};

export default function GuarderiaCard({
  id,
  client,
  visits,
  onDelete,
}: GuarderiaCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Obtenemos la fecha de hoy a las 00:00 para comparar solo fechas
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0); // eliminar la parte de la hora
    return t;
  }, []);

  // Revisamos si todas las visitas son anteriores a hoy
  const isCompleted = useMemo(() => {
    return visits.every((visit) => {
      const visitDate = new Date(visit.date);
      visitDate.setHours(0, 0, 0, 0);
      return visitDate < today;
    });
  }, [visits, today]);

  return (
    <div className="p-4 border rounded bg-white shadow space-y-2 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">
            {client?.name ?? "Sin nombre"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              isCompleted
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {isCompleted ? "Terminada" : "Pendiente"}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:underline transition"
          >
            {expanded ? "▲ Ocultar" : "▼ Mostrar"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-2">
          <div>
            <strong>Gatos:</strong>
            <ul className="list-disc ml-6">
              {client?.cats?.map((cat, index) => (
                <li key={index}>{cat.name}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Visitas:</strong>
            <ul className="ml-2 space-y-1">
              {visits.map((visit, index) => {
                const visitDate = new Date(visit.date);
                visitDate.setHours(0, 0, 0, 0);
                const isPast = visitDate < today;

                return (
                  <li key={index} className="flex items-center gap-2">
                    <span>{visit.date}</span>
                    {isPast && <span className="text-green-600">✔️</span>}
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            onClick={() => onDelete(id)}
            className="text-red-600 text-sm hover:underline mt-2"
          >
            Eliminar guardería
          </button>
        </div>
      )}
    </div>
  );
}
