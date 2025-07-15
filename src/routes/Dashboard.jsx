import { auth, db } from "../firebase-config";
import { signOut, onAuthStateChanged} from "firebase/auth";
import { serverTimestamp, doc, getDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import { onSnapshot as onSubSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTags, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { CiLogout } from "react-icons/ci";
import { addDocument } from "../firebase-utility";
import { BsList } from "react-icons/bs";
import Modal from "../components/Modal";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tags, setTags] = useState("");
    const [tagsList, setTagsList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editTag, setEditTag] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const [bookmarkName, setBookmarkName] = useState("");
    const [bookmarkUrl, setBookmarkUrl] = useState("");
    const [editBookmarkModal, setEditBookmarkModal] = useState(false);
    const [editingBookmark, setEditingBookmark] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const addBookmark = async () => {
        if (!selectedTag || !bookmarkName || !bookmarkUrl) return;
        const bookmarksCol = collection(db, "tags", selectedTag.id, "bookmarks");
        await addDocument(bookmarksCol.path, {
            name: bookmarkName,
            url: bookmarkUrl,
            createdAt: serverTimestamp(),
        });
        setBookmarkName("");
        setBookmarkUrl("");
        setShowBookmarkModal(false);
    };
    const deleteBookmark = async (bookmarkId) => {
        if (!selectedTag) return;
        await deleteDoc(doc(db, "tags", selectedTag.id, "bookmarks", bookmarkId));
    };
    const openEditBookmark = (bm) => {
        setEditingBookmark(bm);
        setBookmarkName(bm.name);
        setBookmarkUrl(bm.url);
        setEditBookmarkModal(true);
    };
    const saveEditBookmark = async () => {
        if (!selectedTag || !editingBookmark) return;
        const bookmarkRef = doc(db, "tags", selectedTag.id, "bookmarks", editingBookmark.id);
        await updateDoc(bookmarkRef, {
            name: bookmarkName,
            url: bookmarkUrl,
        });
        setEditBookmarkModal(false);
        setEditingBookmark(null);
        setBookmarkName("");
        setBookmarkUrl("");
    };
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUser({ ...userSnap.data(), uid: currentUser.uid });
                } else {
                    setUser(null);
                }
            } else {
                navigate("/");
            }
        });
        return () => unsub();
    }, [])
    useEffect(() => {
        if (!user || !user.uid) return;
        const q = query(collection(db, "tags"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTagsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);
    useEffect(() => {
        if (!selectedTag) {
            setBookmarks([]);
            return;
        }
        const unsub = onSubSnapshot(
            collection(db, "tags", selectedTag.id, "bookmarks"),
            (snapshot) => {
                setBookmarks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        );
        return () => unsub();
    }, [selectedTag]);
    const handlerLogout = async() => {
        await signOut(auth);
        navigate("/");
    }
    const addTag = async() => {
        await addDocument("tags", {
            userId: user.uid,
            name: tags,
            createdAt: serverTimestamp(),
        });
        setTags("");
        setShowModal(false);
    }
    const handlerCreateTag = () => {
        setShowModal(true);
    }
    const deleteTag = async (tagId) => {
        await deleteDoc(doc(db, "tags", tagId));
        if (selectedTag && selectedTag.id === tagId) {
            setSelectedTag(null);
        }
    };
    return (
        <>
            {showModal && (
                <Modal>
                    <div className="bg-white p-5 rounded-lg shadow-lg w-100">
                        <div className="flex items-center gap-3 text-xl text-gray-700">
                            <h2 className="font-semibold">Create New Tag</h2>
                            <FaTags />
                        </div>
                        <input
                            className="border-b border-gray-300 w-full outline-none mt-3 text-gray-600"
                            type="text"
                            placeholder="#Tag Name"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                        <div className="flex flex-row gap-3 mt-3">
                            <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 w-full" onClick={() => addTag()}>Create</button>
                            <button className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 w-full" onClick={() => setShowModal(false)}>Back</button>
                        </div>
                    </div>
                </Modal>
            )}
            <div className="h-screen min-h-0 grid grid-rows-[50px_1fr] lg:grid-cols-[16rem_1fr] lg:grid-rows-none">
                <aside className="bg-gray-800 text-white p-5 hidden lg:flex flex-col h-full min-h-0">
                    <h1 className="font-semibold text-xl">@{user && user.username}</h1>
                    <div className="border border-gray-500 mt-1"/>
                    <div className="mt-3">
                        <button className="flex items-center gap-2 text-md hover:text-blue-500 focus:text-blue-500" onClick={() => handlerCreateTag()}>
                            <FaPlus/>
                            Add Tags
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-5">
                        <div className="flex items-center text-md gap-2">
                            <FaTags />
                            <h1>Tags</h1>
                        </div>
                        <button onClick={() => setEditTag(!editTag)}>
                            <HiOutlinePencilSquare />
                        </button>
                    </div>
                    <div className="border border-gray-500 mt-1"/>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {tagsList.map(tag => (
                            <div key={tag.id} className={`flex items-center justify-between hover:bg-gray-700 cursor-pointer py-2 px-3 text-gray-300 rounded ${selectedTag && selectedTag.id === tag.id ? 'bg-gray-700' : ''}`} onClick={() => setSelectedTag(tag)}>
                                <span>#{tag.name}</span>
                                {editTag && (
                                    <button className="ml-2" onClick={e => {e.stopPropagation(); deleteTag(tag.id); setEditTag(false)}}>
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="border border-gray-500"/>
                    <div>
                        <button className="flex items-center mt-2 gap-2 text-md hover:text-blue-500 focus:text-blue-500" onClick={handlerLogout}>
                            <CiLogout />
                            Logout
                        </button>
                    </div>
                </aside>
                <aside className="lg:hidden bg-gray-800 text-white flex items-center justify-between px-6">
                    <div className="flex items-center justify-between mx-auto container">
                        <h1 className="font-semibold text-md sm:text-lg md:text-xl"> @{user && user.username}</h1>
                        <button onClick={() => setIsOpen(!isOpen)}>
                            <BsList className="text-xl hover:text-blue-500 focus:text-blue-500"/>
                        </button>
                    </div>
                </aside>
                <div className="px-6 py-4 overflow-y-auto">
                    <div className="container mx-auto">
                        {!selectedTag ? (
                            <div className="flex flex-col items-center justify-center h-screen">
                                <img src="/assets/book-glasses.jpg" alt="book-glasses" className="w-full h-auto max-w-[300px]"/>
                                <h1 className="text-gray-700 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-center">Select a tag to view bookmarks</h1>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4 text-gray-700 flex-wrap">
                                    <h2 className="text-lg font-semibold">Bookmarks for #{selectedTag.name}</h2>
                                    <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm" onClick={() => setShowBookmarkModal(true)}>
                                        <FaPlus /> Create Bookmark
                                    </button>
                                </div>
                                {bookmarks.length === 0 ? (
                                    <p className="text-gray-500">No bookmarks for this tag.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {bookmarks.map(bm => (
                                            <div key={bm.id} className="bg-white rounded p-4 shadow flex flex-col h-full">
                                                <span className="font-medium text-gray-800 mb-2">{bm.name}</span>
                                                {bm.url && (
                                                    <a href={bm.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{bm.url}</a>
                                                )}
                                                <div className="flex gap-2 mt-3">
                                                    <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800" onClick={() => openEditBookmark(bm)}>
                                                        <FaEdit /> Edit
                                                    </button>
                                                    <button className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800" onClick={() => deleteBookmark(bm.id)}>
                                                        <FaTrash /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {showBookmarkModal && (
                <Modal>
                    <div className="bg-white p-5 rounded-lg shadow-lg w-100">
                        <div className="flex items-center gap-3 text-xl text-gray-700 mb-2">
                            <h2 className="font-semibold">Create New Bookmark</h2>
                            <FaPlus />
                        </div>
                        <input
                            className="border-b border-gray-300 w-full outline-none mt-3 text-gray-600"
                            type="text"
                            placeholder="Bookmark Name"
                            value={bookmarkName}
                            onChange={e => setBookmarkName(e.target.value)}
                        />
                        <input
                            className="border-b border-gray-300 w-full outline-none mt-3 text-gray-600"
                            type="url"
                            placeholder="Bookmark URL"
                            value={bookmarkUrl}
                            onChange={e => setBookmarkUrl(e.target.value)}
                        />
                        <div className="flex flex-row gap-3 mt-3">
                            <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 w-full" onClick={addBookmark}>Create</button>
                            <button className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 w-full" onClick={() => setShowBookmarkModal(false)}>Back</button>
                        </div>
                    </div>
                </Modal>
            )}
            {editBookmarkModal && (
                <Modal>
                    <div className="bg-white p-5 rounded-lg shadow-lg w-100">
                        <div className="flex items-center gap-3 text-xl text-gray-700 mb-2">
                            <h2 className="font-semibold">Edit Bookmark</h2>
                            <FaEdit />
                        </div>
                        <input
                            className="border-b border-gray-300 w-full outline-none mt-3 text-gray-600"
                            type="text"
                            placeholder="Bookmark Name"
                            value={bookmarkName}
                            onChange={e => setBookmarkName(e.target.value)}
                        />
                        <input
                            className="border-b border-gray-300 w-full outline-none mt-3 text-gray-600"
                            type="url"
                            placeholder="Bookmark URL"
                            value={bookmarkUrl}
                            onChange={e => setBookmarkUrl(e.target.value)}
                        />
                        <div className="flex flex-row gap-3 mt-3">
                            <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 w-full" onClick={saveEditBookmark}>Save</button>
                            <button className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 w-full" onClick={() => { setEditBookmarkModal(false); setEditingBookmark(null); setBookmarkName(""); setBookmarkUrl(""); }}>Cancel</button>
                        </div>
                    </div>
                </Modal>
            )}
            {isOpen && (
                <nav className="bg-gray-800 text-white px-5 py-3 fixed top-12 w-full z-40 lg:hidden text-sm rounded-b-lg h-[calc(100dvh-3rem)]">
                    <div className="mx-auto container flex flex-col flex-1 min-h-0 h-full">
                        <button className="flex items-center gap-2 text-md hover:text-blue-500 focus:text-blue-500" onClick={() => handlerCreateTag()}>
                            <FaPlus/>
                            Add Tags
                        </button>
                        <div className="flex items-center justify-between mt-5">
                            <div className="flex items-center gap-2">
                                <FaTags />
                                <h1>Tags</h1>
                            </div>
                            <button className="flex items-center gap-2 hover:text-blue-500 focus:text-blue-500" onClick={() => setEditTag(!editTag)}>
                                <HiOutlinePencilSquare />
                                <h1>Edit</h1>
                            </button>
                        </div>
                        <div className="border border-gray-500 mt-1"/>
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                            {tagsList.map(tag => (
                                <div key={tag.id} className={`flex items-center justify-between hover:bg-gray-700 cursor-pointer py-2 px-3 text-gray-300 rounded ${selectedTag && selectedTag.id === tag.id ? 'bg-gray-700' : ''}`} onClick={() => setSelectedTag(tag)}>
                                    <span onClick={() => setIsOpen(false)}>#{tag.name}</span>
                                    {editTag && (
                                        <button className="ml-2" onClick={e => {e.stopPropagation(); deleteTag(tag.id); setEditTag(false)}}>
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="border border-gray-500"/>
                        <div>
                            <button className="flex items-center mt-2 gap-2 text-md hover:text-blue-500 focus:text-blue-500" onClick={handlerLogout}>
                                <CiLogout />
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>
            )}
        </>
    )
}