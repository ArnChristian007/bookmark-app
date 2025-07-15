export default function Modal({ children }) {
    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black opacity-50 z-50"/>
            <div className="fixed inset-0 flex items-center justify-center z-50 px-3">
                {children}
            </div>
        </>
    )
}