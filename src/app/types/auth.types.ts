export type TJwtPayload = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

export type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type TLoginPayload = {
  email: string;
  password: string;
};
