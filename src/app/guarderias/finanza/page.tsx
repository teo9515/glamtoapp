"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

type Pago = {
  id: string;
  guarderia_id: string;
  monto: number;
  forma_pago?: "efectivo" | "transferencia";
  fecha: string;
};

export default function FinanzasPage() {
  const [guarderias, setGuarderias] = useState<Guarderia[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [nuevoAbonos, setNuevoAbonos] = useState<{ [key: string]: number }>({});
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const COP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("guarderias")
        .select(
          "id, clients(id, name, cats(name)), guarderias_visits(id, date, time)"
        );

      if (error) {
        console.error("Error fetching guarderías:", error);
        return;
      }

      setGuarderias(data as unknown as Guarderia[]);

      const { data: pagosData, error: pagosError } = await supabase
        .from("pagos_guarderias")
        .select("*");

      if (pagosError) {
        console.error("Error fetching pagos:", pagosError);
        return;
      }

      setPagos(pagosData as unknown as Pago[]);
    };

    fetchData();
  }, []);

  const calcularPrecio = (numGatos: number) => {
    if (numGatos === 1) return 40000;
    if (numGatos === 2) return 60000;
    if (numGatos >= 3 && numGatos <= 5) return 80000;
    return 80000;
  };

  const agregarAbono = async (guarderiaId: string, monto: number) => {
    if (!monto || monto <= 0) return;

    const { error } = await supabase.from("pagos_guarderias").insert([
      {
        guarderia_id: guarderiaId,
        monto,
        forma_pago: "transferencia",
        fecha: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error al agregar abono:", error);
      return;
    }

    const { data: pagosActualizados } = await supabase
      .from("pagos_guarderias")
      .select("*")
      .eq("guarderia_id", guarderiaId);

    setPagos((prevPagos) => [
      ...prevPagos.filter((p) => p.guarderia_id !== guarderiaId),
      ...(pagosActualizados as unknown as Pago[]),
    ]);

    setNuevoAbonos((prev) => ({ ...prev, [guarderiaId]: 0 }));
    setNotificacion("✅ Abono registrado exitosamente");

    setTimeout(() => setNotificacion(null), 3000);
  };

  const calcularTotalAbonado = (guarderiaId: string) => {
    return pagos
      .filter((pago) => pago.guarderia_id === guarderiaId)
      .reduce((total, pago) => total + pago.monto, 0);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const terminadas = guarderias.filter((guarderia) =>
    guarderia.guarderias_visits.every((visit) => {
      const visitDate = new Date(`${visit.date}T${visit.time}`);
      return visitDate < today;
    })
  );

  const pendientes = guarderias.filter((guarderia) =>
    guarderia.guarderias_visits.some((visit) => {
      const visitDate = new Date(`${visit.date}T${visit.time}`);
      return visitDate >= today;
    })
  );

  const renderTabla = (lista: Guarderia[], titulo: string) => (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-2">{titulo}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border"># Visitas</th>
              <th className="p-2 border"># Gatos</th>
              <th className="p-2 border">Valor por visita</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">10% Gasolina</th>
              <th className="p-2 border">40% Cuidador</th>
              <th className="p-2 border">50% Glamto</th>
              <th className="p-2 border">Abono</th>
              <th className="p-2 border">Saldo Pendiente</th>
              <th className="p-2 border">Deuda</th>
              <th className="p-2 border">Estado</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((guarderia) => {
              const numGatos = guarderia.clients?.cats?.length || 0;
              const precioPorVisita = calcularPrecio(numGatos);
              const visitas = guarderia.guarderias_visits || [];
              const total = visitas.length * precioPorVisita;
              const gasolina = total * 0.1;
              const cuidador = total * 0.4;
              const glamto = total * 0.5;
              const totalAbonado = calcularTotalAbonado(guarderia.id);
              const saldoPendiente = total - totalAbonado;
              const sinDeuda = saldoPendiente === 0;

              const isCompleted = visitas.every((visit) => {
                const visitDate = new Date(`${visit.date}T${visit.time}`);
                return visitDate < today;
              });

              return (
                <tr key={guarderia.id}>
                  <td className="p-2 border">{guarderia.clients?.name}</td>
                  <td className="p-2 border text-center">{visitas.length}</td>
                  <td className="p-2 border text-center">{numGatos}</td>
                  <td className="p-2 border text-center">
                    {COP.format(precioPorVisita)}
                  </td>
                  <td className="p-2 border text-center font-semibold">
                    {COP.format(total)}
                  </td>
                  <td className="p-2 border text-center text-blue-700">
                    {COP.format(gasolina)}
                  </td>
                  <td className="p-2 border text-center text-green-700">
                    {COP.format(cuidador)}
                  </td>
                  <td className="p-2 border text-center text-pink-700">
                    {COP.format(glamto)}
                  </td>
                  <td className="p-2 border text-center font-semibold">
                    <input
                      type="number"
                      value={nuevoAbonos[guarderia.id] || ""}
                      onChange={(e) =>
                        setNuevoAbonos((prev) => ({
                          ...prev,
                          [guarderia.id]: Number(e.target.value),
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          agregarAbono(
                            guarderia.id,
                            nuevoAbonos[guarderia.id] || 0
                          );
                        }
                      }}
                      placeholder="$"
                      className="w-24 border p-1 text-sm rounded"
                    />
                  </td>
                  <td className="p-2 border text-center font-semibold">
                    {COP.format(saldoPendiente)}
                  </td>
                  <td
                    className={`p-2 border text-center font-medium ${
                      sinDeuda ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {sinDeuda ? "Sin deuda" : "Con deuda"}
                  </td>
                  <td
                    className={`p-2 border text-center font-medium ${
                      isCompleted ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {isCompleted ? "Terminada" : "Pendiente"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Resumen financiero</h1>
      {notificacion && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded">
          {notificacion}
        </div>
      )}
      {renderTabla(pendientes, "Guarderías Pendientes")}
      {renderTabla(terminadas, "Guarderías Terminadas")}
    </div>
  );
}
