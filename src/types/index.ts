// src/types/index.ts

export interface Client {
    id?: string; // opcional para cuando aún no ha sido creado
    name: string;
    phone: string;
    address: string;
    email: string;
    emergency_name: string;
    emergency_phone: string;
    photo_permission: boolean;
  }
  
  export interface Cat {
    id?: string;
    name: string;
    age: string;
    medical_condition: string;
    client_id?: string;
  }
  