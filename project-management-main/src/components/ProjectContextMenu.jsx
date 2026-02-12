import { Edit2, CheckCircle, Link, Trash2, X, BarChart2, Star } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ProjectContextMenu({ project, position, onClose, onRename, onDelete, onMarkCompleted, onPriorityChange }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleCopyLink = () => {
        const link = `${window.location.origin}/projectsDetail?id=${project.id}&tab=tasks`;
        navigator.clipboard.writeText(link);
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-[100] w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in duration-100"
            style={{
                top: position.y,
                left: position.x,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            }}
        >
            <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                    {project.name}
                </p>
            </div>

            <button
                onClick={() => { onRename(); onClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
                <Edit2 size={14} />
                Rename Project
            </button>

            <button
                onClick={() => { onMarkCompleted(); onClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
            >
                <CheckCircle size={14} />
                Mark as Completed
            </button>

            <button
                onClick={() => { onPriorityChange(); onClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
            >
                <Star size={14} />
                Cycle Priority
            </button>

            <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
                <Link size={14} />
                Copy Project Link
            </button>

            <hr className="my-1 border-zinc-100 dark:border-zinc-800" />

            <button
                onClick={() => { onDelete(); onClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
                <Trash2 size={14} />
                Delete Project
            </button>
        </div>
    );
}
