export interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  [key: string]: string;
}
