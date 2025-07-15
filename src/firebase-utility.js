import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";

export async function signUpWithEmail(username, email, password) {
    try {
        const credentialUser = await createUserWithEmailAndPassword(auth, email, password);
        const user = credentialUser.user;
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username,
            email: user.email,
            createdAt: serverTimestamp(),
        });
        return null;
    } catch (error) {
        return error.code;
    }
}
export async function signInWithEmail(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        return error.code;
    }
    return null;
}
export async function addDocument(collectionName, data) {
    try {
        await addDoc(collection(db, collectionName), data);
    } catch (error) {
        throw error;
    }
}