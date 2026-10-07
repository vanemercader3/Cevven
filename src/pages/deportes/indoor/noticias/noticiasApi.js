import { auth } from "../../../../firebase";

// URL de la implementación del Apps Script de NOTICIAS (el nuevo, no el de pedidos)
export const NOTICIAS_API =
  "https://script.google.com/macros/s/AKfycbx_IEiol_8-_7SQyy3uJdz_0gQL_aw8oELlTKm90QMLTln_dg1vfPT_4U1e42_aICU/exec";

// Acepta rutas locales (/noticias/foto.jpg) o links crudos de Drive
export function urlImagen(url) {
  if (!url) return "";
  const m = url.match(/\/d\/([^/?]+)/) || url.match(/[?&]id=([^&]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000` : url;
}

// Achica la foto antes de subirla (lado más largo 1280px, JPG ~80%)
// → queda liviana (~200-400 KB) y Drive genera la miniatura rápido
export function comprimirImagen(file, maxLado = 1280, calidad = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", calidad));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("imagen_invalida"));
    };
    img.src = url;
  });
}

// ¿La noticia está marcada como destacada en la hoja?
export const esDestacada = (n) =>
  ["true", "verdadero", "si", "sí"].includes(
    String(n?.destacada || "")
      .trim()
      .toLowerCase(),
  );

// ── Lectura (cualquiera) ──
export async function obtenerNoticias() {
  const res = await fetch(NOTICIAS_API);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "error");
  return data.noticias;
}

// ── Escritura (manda el token del login para que el script verifique quién es) ──
async function enviar(accion, datos = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("sin_sesion");
  const token = await user.getIdToken();

  const res = await fetch(NOTICIAS_API, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ accion, token, ...datos }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "error");
  return data;
}

// Lista de noticias
export const soyAdmin = async () => (await enviar("soyAdmin")).admin;
export const agregarNoticia = (titulo, mini) =>
  enviar("agregar", { titulo, mini });
export const editarNoticia = (id, titulo, mini) =>
  enviar("editar", { id, titulo, mini });
export const borrarNoticia = (id) => enviar("borrar", { id });
export const destacarNoticia = (id, valor) => enviar("destacar", { id, valor });

// Detalle de la noticia
export const editarDetalle = (id, titulo, texto) =>
  enviar("editarDetalle", { id, titulo, texto });
export const quitarFotoNoticia = (id) => enviar("quitarFoto", { id });
export const subirFotoNoticia = async (id, dataUrl) =>
  (
    await enviar("subirFoto", {
      id,
      archivo: dataUrl.split(",")[1],
      mime: "image/jpeg",
    })
  ).foto;
