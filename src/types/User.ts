export interface UserData{
    nombre:string;
    apellidos:string;
    fechaNacimiento:string;
    edad:number;
    ciudad:string;
    email:string;
    password:string;
    fotoPerfil:string|null,
}

export interface UserDataLogin{
    email:string;
    password:string;
    deviceInfo:string;
}


export interface UserDataProfile{
    id:string;
    nombre:string;
    email:string;
    edad:string;
    ciudad:string;
}

export interface EditUserData {
  nombre?: string;
  apellidos?: string;
  ciudad?: string;
  email?: string;
  fotoPerfil?: string | null;
}

