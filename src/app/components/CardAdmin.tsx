import Link from "next/link";

interface CardAdminProps {
  title: string;
  description: string;
  href: string;
  icon?: string; // opcional si quieres personalizar el icono
}

export default function CardAdmin({
  title,
  description,
  href,
  icon = "👤",
}: CardAdminProps) {
  return (
    <Link href={href}>
      <div className="bg-[#AEBD77] rounded-2xl shadow-md shadow-black w-full max-w-2xl h-60 p-6 text-center hover:shadow-lg hover:scale-101 transition-shadow cursor-pointer">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-3xl text-[#163020] font-semibold mb-2">{title}</h2>
        <p className="text-[#163020] text-xl">{description}</p>
      </div>
    </Link>
  );
}
