import { auth, database } from "./firebase-config.js";
import { GoogleAuthProvider, signInWithCredential, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// Al cargar la página
window.onload = function () {

  google.accounts.id.initialize({
    client_id: "382420208590-vr9dpgg06t8uqu1rfsnsetfjqv7qm7ta.apps.googleusercontent.com",
    callback: handleCredentialResponse,
    auto_select: false,            // 🔹 IMPORTANTE: evita que Google entre solo
    cancel_on_tap_outside: false   // 🔹 Mantiene abierto el selector de cuentas
  });

  google.accounts.id.renderButton(
    document.getElementById("g_id_signin"),
    {
      theme: "outline",
      size: "large",
      text: "continue_with",
      type: "standard"
    }
  );

  google.accounts.id.prompt(); // 🔹 Esto muestra TODAS las cuentas siempre
};

// Cuando Google devuelve el JWT
async function handleCredentialResponse(response) {

  const idToken = response.credential;

  // 🔹 Convertir token de Google → credencial Firebase
  const credential = GoogleAuthProvider.credential(idToken);

  // 🔹 Login en Firebase
  const result = await signInWithCredential(auth, credential);
  const user = result.user;

  // 🔹 Guardar en Firebase Database
  await set(ref(database, "usuarios/" + user.uid), {
    nombre: user.displayName,
    email: user.email,
    foto: user.photoURL,
    uid: user.uid,
    registrado: new Date().toISOString()
  });

  // 🔹 Mostrar datos en la tarjeta
  document.getElementById("g_id_signin").style.display = "none";
  document.getElementById("user-info").style.display = "block";

  document.getElementById("user-photo").src = user.photoURL;
  document.getElementById("user-name").textContent = user.displayName;
  document.getElementById("user-email").textContent = user.email;

  document.getElementById("title").textContent = "Bienvenido";
}

// Logout
window.logout = async function () {
  await signOut(auth);
  localStorage.clear();
  location.reload();
};