export const Toast = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl transition-all animate-bounce-in">
      <div className="mr-3 bg-white/20 rounded-full p-1">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-70">
        ✕
      </button>
    </div>
  );
};
