import { Link } from "react-router-dom";
import { useState } from "react";
import ProjectContextMenu from "./ProjectContextMenu";
import RenameProjectDialog from "./RenameProjectDialog";
import ConfirmDialog from "./ConfirmDialog";
import { useDispatch } from "react-redux";
import { updateProject, deleteProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const statusColors = {
    PLANNING: "bg-gray-200 dark:bg-zinc-600 text-gray-900 dark:text-zinc-200",
    ACTIVE: "bg-emerald-200 dark:bg-emerald-500 text-emerald-900 dark:text-emerald-900",
    ON_HOLD: "bg-amber-200 dark:bg-amber-500 text-amber-900 dark:text-amber-900",
    COMPLETED: "bg-blue-200 dark:bg-blue-500 text-blue-900 dark:text-blue-900",
    CANCELLED: "bg-red-200 dark:bg-red-500 text-red-900 dark:text-red-900",
};

const ProjectCard = ({ project }) => {
    const [contextMenu, setContextMenu] = useState(null);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleRename = async (newName) => {
        try {
            setIsSubmitting(true);
            toast.loading("Renaming project...");
            await dispatch(updateProject({ id: project.id, updates: { name: newName } })).unwrap();
            toast.dismissAll();
            toast.success("Project renamed!");
            setIsRenameOpen(false);
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.message || "Failed to rename");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            toast.loading("Deleting project...");
            await dispatch(deleteProject(project.id)).unwrap();
            toast.dismissAll();
            toast.success("Project deleted!");
            setIsDeleteOpen(false);
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.message || "Failed to delete");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkCompleted = async () => {
        try {
            toast.loading("Updating project...");
            await dispatch(updateProject({ id: project.id, updates: { status: "COMPLETED", progress: 100 } })).unwrap();
            toast.dismissAll();
            toast.success("Project marked as completed!");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.message || "Failed to update project");
        }
    };

    const handlePriorityChange = async () => {
        const priorities = ["LOW", "MEDIUM", "HIGH"];
        const currentIndex = priorities.indexOf(project.priority);
        const nextPriority = priorities[(currentIndex + 1) % priorities.length];

        try {
            toast.loading(`Setting priority to ${nextPriority}...`);
            await dispatch(updateProject({ id: project.id, updates: { priority: nextPriority } })).unwrap();
            toast.dismissAll();
            toast.success(`Priority set to ${nextPriority}`);
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.message || "Failed to update priority");
        }
    };

    return (
        <div onContextMenu={handleContextMenu} className="relative">
            <Link to={`/projectsDetail?id=${project.id}&tab=tasks`} className="block bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg p-5 transition-all duration-200 group">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-zinc-200 mb-1 truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm line-clamp-2 mb-3">
                            {project.description || "No description"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[project.status]}`} >
                        {project.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-zinc-500 capitalize">
                        {project.priority} priority
                    </span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-zinc-500">Progress</span>
                        <span className="text-gray-400 dark:text-zinc-400">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded">
                        <div className="h-1.5 rounded bg-blue-500" style={{ width: `${project.progress || 0}%` }} />
                    </div>
                </div>

            </Link>

            {contextMenu && (
                <ProjectContextMenu
                    project={project}
                    position={contextMenu}
                    onClose={() => setContextMenu(null)}
                    onRename={() => setIsRenameOpen(true)}
                    onDelete={() => setIsDeleteOpen(true)}
                    onMarkCompleted={handleMarkCompleted}
                    onPriorityChange={handlePriorityChange}
                />
            )}

            <RenameProjectDialog
                isOpen={isRenameOpen}
                onClose={() => setIsRenameOpen(false)}
                onSave={handleRename}
                projectName={project.name}
                isSubmitting={isSubmitting}
            />

            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Delete Project"
                message={`Are you sure you want to delete "${project.name}"? This action cannot be undone and all associated data will be lost.`}
                confirmLabel="Delete Project"
                isDestructive={true}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default ProjectCard;
