import { CiMail, CiUser, CiLock } from "react-icons/ci";
import { useState } from "react";
import { signUpWithEmail, signInWithEmail } from "../firebase-utility";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";

export default function Main() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [register, setRegister] = useState(false);
    const [check, setCheck] = useState(false);
    const [showModal, setShowModal] = useState(null);
    const navigate = useNavigate();
    const handlerAuth = async(e) => {
        e.preventDefault();
        if (register) {
            if (!check || username === "") {
                setShowModal(
                    <Modal>
                        <div className="bg-white p-5 rounded-lg shadow-lg w-100">
                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700">Register Error</h1>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mt-3">
                                {username === "" ? "Username is required." : "You must agree to the Terms and Conditions."}
                            </p>
                            <button className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 w-full p-2 text-sm sm:text-base md:text-lg lg:text-xl text-white mt-5 rounded-lg" onClick={() => setShowModal(null)}>
                                Close 
                            </button>
                        </div>
                    </Modal>
                );
                return;
            }
            const error = await signUpWithEmail(username, email, password);
            if (error) {
                setShowModal(
                    <Modal>
                        <div className="bg-white p-5 rounded-lg shadow-lg w-100">
                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700">Login Error</h1>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mt-3">{error}</p>
                            <button className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 w-full p-2 text-sm sm:text-base md:text-lg lg:text-xl text-white mt-5 rounded-lg" onClick={() => setShowModal(null)}>
                                Close 
                            </button>
                        </div>
                    </Modal>
                );
            }
            else {
                setRegister(false);
            }
        }
        else {
            const error = await signInWithEmail(email, password);
            if (error) {
                setShowModal(
                    <Modal>
                        <div className="bg-white p-5 rounded-lg shadow-lg w-100">
                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700">Register Error</h1>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mt-3">{error}</p>
                            <button className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 w-full p-2 text-sm sm:text-base md:text-lg lg:text-xl text-white mt-5 rounded-lg" onClick={() => setShowModal(null)}>
                                Close 
                            </button>
                        </div>
                    </Modal>
                );
            } else {
                navigate("/dashboard");
            }
        }
    }
    return (
        <>
            {showModal}
            <div className="h-screen flex items-center justify-center bg-[url('/assets/bg-main.jpg')] bg-center bg-cover lg:grid lg:grid-cols-2 lg:bg-none">
                <div className="flex items-center justify-center w-full px-3">
                    <form className="flex flex-col items-center justify-center px-3 py-5 bg-white w-150 rounded-lg" onSubmit={handlerAuth}>
                        <h1 className="font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-700 text-center">
                            {register ? 'Create a New Account' : 'Bookmark Management System'}
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mt-3 text-center">
                            {register ? 'Make a new one to get started.' : 'Welcome back! Please log in your account to continue managing your bookmarks.'}
                        </p>
                        {register && (
                            <div className="mt-5 flex items-center bg-gray-200 p-3 text-gray-700 rounded-lg w-full">
                                <CiUser className="text-xl sm:text-2xl md:text-3xl lg:text-4xl"/>
                                <input
                                    className="text-sm sm:text-base md:text-lg lg:text-xl outline-none px-3 w-full"
                                    placeholder="Username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="mt-5 flex items-center bg-gray-200 p-3 text-gray-700 rounded-lg w-full">
                            <CiMail className="text-xl sm:text-2xl md:text-3xl lg:text-4xl"/>
                            <input
                                className="text-sm sm:text-base md:text-lg lg:text-xl outline-none px-3 w-full"
                                placeholder="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mt-5 flex items-center bg-gray-200 p-3 text-gray-700 rounded-lg w-full">
                            <CiLock className="text-xl sm:text-2xl md:text-3xl lg:text-4xl"/>
                            <input
                                className="text-sm sm:text-base md:text-lg lg:text-xl outline-none px-3 w-full"
                                placeholder="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {register && (
                            <>
                                <div className="flex items-center mt-5 text-gray-600 w-full gap-2">
                                    <input
                                        type="checkbox"
                                        className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5"
                                        value={check}
                                        onChange={(e) => setCheck(e.target.checked)}
                                    />
                                    <label className="text-sm sm:text-base md:text-lg lg:text-xl">I agree to the Terms and Conditions</label>
                                </div>
                                <button type="submit" className="bg-blue-400 hover:bg-blue-500 focus:bg-blue-500 w-full p-3 text-sm sm:text-base md:text-lg lg:text-xl text-white mt-5 rounded-lg">
                                    Sign Up
                                </button>
                                <div className="flex items-center justify-center gap-2 mt-5">
                                    <span className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">Already have an account?</span>
                                    <button type="button" onClick={() => setRegister(false)} className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-400 hover:underline">
                                        Log In
                                    </button>
                                </div>
                            </>
                        )}
                        {!register && (
                            <>
                                <div className="mt-5 flex items-center justify-between text-gray-600 w-full">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5"/>
                                        <label className="text-sm sm:text-base md:text-lg lg:text-xl">Remember Me</label>
                                    </div>
                                    <button type="button" className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-400 hover:underline">
                                        Forgot Password?
                                    </button>
                                </div>
                                <button type="submit" className="bg-blue-400 hover:bg-blue-500 focus:bg-blue-500 w-full p-3 text-sm sm:text-base md:text-lg lg:text-xl text-white mt-5 rounded-lg">
                                    Log In
                                </button>
                                <div className="flex items-center justify-center gap-2 mt-5">
                                    <span className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">Don't have an account?</span>
                                    <button type="button" className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-400 hover:underline" onClick={() => setRegister(true)}>
                                        Sign Up
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
                <img src="/assets/bg-main.jpg" className="w-full h-full object-cover hidden lg:block"/>
            </div>
        </>
    );
}