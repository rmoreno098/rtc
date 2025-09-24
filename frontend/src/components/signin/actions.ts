import pb from "../../pocketbase";
import { FormData, Error } from "./models";

export async function signin(
  formData: FormData,
  setError: React.Dispatch<React.SetStateAction<string>>
) {
  try {
    await pb
      .collection("users")
      .authWithPassword(formData.username, formData.password);
    return true;
  } catch (error) {
    setError((error as Error).message);
    return false;
  }
}
