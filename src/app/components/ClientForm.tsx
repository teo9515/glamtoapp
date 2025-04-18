"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Client, Cat } from "@/types";

type ClientFormProps = {
  client?: Client;
  cats?: Cat[];
  isEditing?: boolean;
  onSuccess?: () => void;
};

export default function ClientForm({
  client: initialClient,
  cats: initialCats,
  isEditing,
  onSuccess,
}: ClientFormProps) {
  const router = useRouter();

  const [client, setClient] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    emergency_name: "",
    emergency_phone: "",
    photo_permission: false,
  });

  const [cats, setCats] = useState([
    { name: "", age: "", medical_condition: "" },
  ]);

  useEffect(() => {
    if (isEditing && initialClient) {
      setClient(initialClient);
      setCats(initialCats?.length ? initialCats : []);
    }
  }, [isEditing, initialClient, initialCats]);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setClient({ ...client, [name]: type === "checkbox" ? checked : value });
  };

  const handleCatChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newCats = [...cats];
    newCats[index][name as keyof (typeof newCats)[number]] = value;
    setCats(newCats);
  };

  const addCat = () => {
    setCats([...cats, { name: "", age: "", medical_condition: "" }]);
  };

  const removeCat = (index: number) => {
    const newCats = cats.filter((_, i) => i !== index);
    setCats(newCats);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let clientData, clientError;

    if (isEditing && initialClient?.id) {
      ({ data: clientData, error: clientError } = await supabase
        .from("clients")
        .update(client)
        .eq("id", initialClient.id)
        .select()
        .single());

      await supabase.from("cats").delete().eq("client_id", initialClient.id);
    } else {
      ({ data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert([client])
        .select()
        .single());
    }

    if (clientError) {
      alert("Error al guardar cliente: " + clientError.message);
      return;
    }

    const client_id = clientData.id;

    const catsWithClient = cats.map((cat) => ({
      ...cat,
      client_id,
    }));

    const { error: catError } = await supabase
      .from("cats")
      .insert(catsWithClient);

    if (catError) {
      alert(
        "Cliente guardado, pero error al guardar gatos: " + catError.message
      );
    } else {
      if (onSuccess) {
        router.refresh(); // actualiza lista si estamos en misma página
        onSuccess(); // ✅ cierra el modal
      } else {
        router.push("/clients");
      }
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("¿Estás seguro de eliminar este cliente?");
    if (!confirm) return;

    if (initialClient?.id) {
      await supabase.from("cats").delete().eq("client_id", initialClient.id);
      await supabase.from("clients").delete().eq("id", initialClient.id);
      router.push("/clients");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded shadow"
    >
      <h2 className="text-2xl font-bold text-[#163020]">
        {isEditing ? "Editar Cliente" : "Registrar Cliente"}
      </h2>

      <input
        name="name"
        placeholder="Nombre completo"
        value={client.name}
        onChange={handleClientChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        name="phone"
        placeholder="Teléfono"
        value={client.phone}
        onChange={handleClientChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        name="address"
        placeholder="Dirección"
        value={client.address}
        onChange={handleClientChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        name="email"
        placeholder="Correo electrónico"
        type="email"
        value={client.email}
        onChange={handleClientChange}
        className="w-full p-2 border rounded"
      />
      <input
        name="emergency_name"
        placeholder="Nombre contacto de emergencia"
        value={client.emergency_name}
        onChange={handleClientChange}
        className="w-full p-2 border rounded"
      />
      <input
        name="emergency_phone"
        placeholder="Teléfono de emergencia"
        value={client.emergency_phone}
        onChange={handleClientChange}
        className="w-full p-2 border rounded"
      />

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="photo_permission"
          checked={client.photo_permission}
          onChange={handleClientChange}
        />
        <span>¿Autoriza fotos y publicación en redes?</span>
      </label>

      <hr />

      <h3 className="text-xl font-semibold text-[#163020]">Gatos</h3>

      {cats.map((cat, index) => (
        <div
          key={index}
          className="space-y-2 border p-4 rounded bg-gray-50 relative"
        >
          <input
            name="name"
            placeholder="Nombre del gato"
            value={cat.name}
            onChange={(e) => handleCatChange(index, e)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="age"
            placeholder="Edad del gato"
            value={cat.age}
            onChange={(e) => handleCatChange(index, e)}
            className="w-full p-2 border rounded"
          />
          <input
            name="medical_condition"
            placeholder="Condiciones médicas"
            value={cat.medical_condition}
            onChange={(e) => handleCatChange(index, e)}
            className="w-full p-2 border rounded"
          />
          {index > 0 && (
            <button
              type="button"
              onClick={() => removeCat(index)}
              className="text-red-500 absolute top-2 right-2"
            >
              Quitar
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addCat}
        className="text-sm text-[#163020] hover:underline"
      >
        + Añadir otro gato
      </button>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-[#304D30] text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {isEditing ? "Actualizar Cliente" : "Guardar Cliente y Gatos"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Eliminar Cliente
          </button>
        )}
      </div>
    </form>
  );
}
