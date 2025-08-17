import pb from "../../pocketbase";
import { FormData, Error } from "./models";

export async function signin(
  formData: FormData,
  setError: React.Dispatch<React.SetStateAction<string>>
) {
  try {
    const authData = await pb
      .collection("users")
      .authWithPassword(formData.username, formData.password);
    if (pb.authStore.isValid) {
      console.log("Logged in!", authData);
    }
  } catch (error) {
    setError((error as Error).message);
    return;
  }
}
