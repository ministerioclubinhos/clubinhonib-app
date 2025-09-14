export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt?: string;
};

export type SnackbarKind = "success" | "error";
