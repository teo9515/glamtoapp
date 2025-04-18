"use client";

import { motion } from "framer-motion";
import ClientForm from "./ClientForm";

interface ModalFormClientProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalFormClient({
  isOpen,
  onClose,
}: ModalFormClientProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        className="bg-white w-11/12 md:w-3/5 max-h-[90vh] rounded-xl shadow-xl overflow-y-auto p-6 relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <ClientForm onSuccess={onClose} />
      </motion.div>
    </div>
  );
}
