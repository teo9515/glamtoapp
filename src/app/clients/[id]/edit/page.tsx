/* // src/app/clients/[id]/edit/page.tsx

import { supabase } from "@/lib/supabase";
import ClientForm from "../../../components/ClientForm";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

type Props = {
  params: {
    id: string;
  };
};

async function getClientData(id: string) {
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  const { data: cats, error: catsError } = await supabase
    .from("cats")
    .select("*")
    .eq("client_id", id);

  if (clientError || catsError) {
    return { error: clientError?.message || catsError?.message };
  }

  return { client, cats };
}

export default async function EditClientPage({ params }: Props) {
  const id = params.id;

  if (!id) {
    notFound();
  }

  const { client, cats, error } = await getClientData(id);

  if (error) {
    return <p>Error cargando cliente: {error}</p>;
  }

  if (!client) {
    redirect("/clients");
  }

  return (
    <main className="min-h-screen p-8">
      <ClientForm client={client} cats={cats} isEditing />
    </main>
  );
}
 */
