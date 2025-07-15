import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { auth } from "./firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import Main from "./routes/Main";
import Dashboard from "./routes/Dashboard";
import "./tailwind.css";

function Root() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });
        return () => unsub();
    }, []);
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={user ? <Dashboard/> : <Main/>}/>
                <Route path="/dashboard" element={user ? <Dashboard/> : <Main/>}/>
            </Routes>
        </BrowserRouter>
    );
}
const root = createRoot(document.getElementById("root"));
root.render(<Root/>);