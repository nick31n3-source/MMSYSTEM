import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDXMAUqlcHGZMFQVwns8F_zDlZ63xOn8eA",
  authDomain: "mm-systems-ef1da.firebaseapp.com",
  projectId: "mm-systems-ef1da",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  try {
    await signInWithEmailAndPassword(auth, "nick31", "password");
  } catch(e) {
    console.log("nick31:", e.code);
  }
  try {
    await signInWithEmailAndPassword(auth, "nick31.N3@gmail.com", "password");
  } catch(e) {
    console.log("nick31.N3@gmail.com:", e.code);
  }
}
test();
