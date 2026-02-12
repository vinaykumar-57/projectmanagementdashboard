import { XIcon, AlertTriangle } from "lucide-react";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, isDestructive, isSubmitting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-[110] p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                <button
                    className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    onClick={onClose}
                >
                    <XIcon className="size-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    {isDestructive && (
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <AlertTriangle className="size-5 text-red-600 dark:text-red-500" />
                        </div>
                    )}
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isSubmitting}
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors shadow-lg ${isDestructive
                                ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isSubmitting ? "Processing..." : confirmLabel || "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
