import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDfWo9NiHqv5cc-9hyfdEA9JJ1jpujxVRA",
  authDomain: "cevven-web-f376e.firebaseapp.com",
  projectId: "cevven-web-f376e",
  storageBucket: "cevven-web-f376e.firebasestorage.app",
  messagingSenderId: "69295159631",
  appId: "1:69295159631:web:2584cb1079b2aff3dfed3a",
};

const JUGADORAS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=1550165418&single=true&output=csv";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

async function obtenerMailsAutorizados() {
  const res = await fetch(JUGADORAS_URL);
  const texto = await res.text();
  const filas = texto.trim().split("\n");
  const headers = filas[0].split(",").map((h) => h.trim());
  const idxMail = headers.indexOf("mail");
  const idxMail2 = headers.indexOf("mail2");

  const mails = [];
  filas.slice(1).forEach((fila) => {
    const cols = fila.split(",").map((v) => v.trim());
    if (cols[idxMail]) mails.push(cols[idxMail].toLowerCase());
    if (idxMail2 >= 0 && cols[idxMail2])
      mails.push(cols[idxMail2].toLowerCase());
  });
  return mails;
}

export const loginConGoogle = async () => {
  const resultado = await signInWithPopup(auth, provider);
  const emailUsuario = resultado.user.email.toLowerCase();
  const mailsAutorizados = await obtenerMailsAutorizados();

  if (!mailsAutorizados.includes(emailUsuario)) {
    await signOut(auth);
    throw new Error("no_autorizado");
  }

  return resultado;
};

export const logout = () => signOut(auth);
