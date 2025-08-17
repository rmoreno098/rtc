import pb from "../../pocketbase";
import { FormData } from "./models";

export async function signup(formData: FormData) {
  try {
    await pb.collection("users").create({
      username: formData.username,
      email: formData.email,
      emailVisibility: true,
      password: formData.password,
      passwordConfirm: formData.confirmPassword,
      name: formData.name,
    });
    alert("Signed up successfully!");
  } catch (error) {
    alert("Error signing up!, please contact administator");
    console.error(error);
    return;
  }
}
