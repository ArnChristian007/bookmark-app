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
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        });
        return () => unsub();
    }, []);
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen relative">
                <div className="h-12 w-12 sm:w-13 sm:h-13 md:w-14 md:h-14 lg:w-15 lg:h-15 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                <h1 className="absolute bottom-4 w-full text-center">&copy;{new Date().getFullYear()} ArnDev. All rights reserved</h1>
            </div>
        );
    }
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