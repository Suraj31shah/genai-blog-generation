import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

/* ---------- EMAIL + PASSWORD ---------- */

export const registerWithEmail = async (
  email: string,
  password: string
) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithEmail = async (
  email: string,
  password: string
) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/* ---------- GOOGLE ---------- */

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithRedirect(auth, provider);
};

/* ---------- LOGOUT ---------- */

export const logout = async () => {
  await signOut(auth);
};
