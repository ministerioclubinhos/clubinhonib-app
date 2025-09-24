export interface ContactFormData {
  name: string;
  email: string;
  telefone: string;
  mensagem: string;
}

export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  loading: boolean;
  submitted: boolean;
  globalError: string | null;
}

export interface PhoneMaskProps {
  inputRef: React.Ref<HTMLInputElement>;
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}
