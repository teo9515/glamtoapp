"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import GuarderiaCard from "../components/GuarderiaCard";
import ModalFormGuarderia from "../components/ModalFormGuarderia";
import Link from "next/link";

type Visit = {
  id: string;
  date: string;
  time: string;
};

type Cat = {
  name: string;
};

type Client = {
  id: string;
  name: string;
  cats: Cat[];
};

type Guarderia = {
  id: string;
  clients: Client;
  guarderias_visits: Visit[];
};

export default function GuarderiasPage() {
  const [guarderias, setGuarderias] = useState<Guarderia[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchGuarderias = async () => {
      const { data, error } = await supabase
        .from("guarderias")
        .select(
          "id, clients(id, name, cats(name)), guarderias_visits(id, date)"
        );

      if (error) {
        console.error("Error fetching guarderías:", error);
        return;
      }

      const sorted = (data as unknown as Guarderia[]).sort((a, b) => {
        const aDate = a.guarderias_visits[0]?.date ?? "";
        const bDate = b.guarderias_visits[0]?.date ?? "";
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });

      setGuarderias(sorted);
    };

    fetchGuarderias();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("guarderias").delete().eq("id", id);
    if (!error) {
      setGuarderias((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const isToday = (date: string) => date === todayStr;
  const isFuture = (date: string) => new Date(date) > today;

  const guarderiasDeHoy = guarderias.filter((g) =>
    g.guarderias_visits.some((v) => isToday(v.date))
  );

  const guarderiasPendientes = guarderias.filter(
    (g) =>
      !guarderiasDeHoy.includes(g) &&
      g.guarderias_visits.some((v) => isFuture(v.date))
  );

  const guarderiasTerminadas = guarderias.filter(
    (g) =>
      !guarderiasDeHoy.includes(g) &&
      !g.guarderias_visits.some((v) => isFuture(v.date) || isToday(v.date))
  );

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h1 className="text-2xl font-bold">Guarderías</h1>

        <div className="flex gap-2">
          <button
            className="bg-[#163020] hover:bg-[#2c4a1c] text-white w-40 py-3 text-center rounded-xl transition"
            onClick={handleOpenModal}
          >
            Nueva guarderia
          </button>
          <Link href="/guarderias/finanza">
            <button className="bg-[#163020] hover:bg-[#2c4a1c] text-white w-40 py-3 text-center rounded-xl transition">
              Finanzas guardería
            </button>
          </Link>
          <Link href="/">
            <button className="bg-[#163020] hover:bg-[#2c4a1c] text-white w-40 py-3 text-center rounded-xl transition">
              Home
            </button>
          </Link>
        </div>
      </div>

      {/* Guarderías del día */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Guarderías del día</h2>
        {guarderiasDeHoy.length === 0 ? (
          <p className="text-gray-600">No hay guarderías para hoy.</p>
        ) : (
          <div className="space-y-4">
            {guarderiasDeHoy.map((g) => (
              <GuarderiaCard
                key={g.id}
                id={g.id}
                client={g.clients}
                visits={g.guarderias_visits}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pendientes */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Pendientes</h2>
        {guarderiasPendientes.length === 0 ? (
          <p className="text-gray-600">No hay guarderías pendientes.</p>
        ) : (
          <div className="space-y-4">
            {guarderiasPendientes.map((g) => (
              <GuarderiaCard
                key={g.id}
                id={g.id}
                client={g.clients}
                visits={g.guarderias_visits}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Terminadas */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Terminadas</h2>
        {guarderiasTerminadas.length === 0 ? (
          <p className="text-gray-600">No hay guarderías terminadas.</p>
        ) : (
          <div className="space-y-4">
            {guarderiasTerminadas.map((g) => (
              <GuarderiaCard
                key={g.id}
                id={g.id}
                client={g.clients}
                visits={g.guarderias_visits}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {isModalOpen && (
        <ModalFormGuarderia isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
}
