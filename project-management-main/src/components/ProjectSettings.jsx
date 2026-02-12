import { format } from "date-fns";
import { Plus, Save, Trash2, AlertCircle, Shield, Settings2, Layout } from "lucide-react";
import { useEffect, useState } from "react";
import AddProjectMember from "./AddProjectMember";
import { useDispatch } from "react-redux";
import { updateProject, deleteProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import ConfirmDialog from "./ConfirmDialog";
import { useNavigate } from "react-router-dom";
import AIAssistantButton from "./AIAssistantButton";

export default function ProjectSettings({ project }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        color: "#3b82f6",
        visibility: "private",
        default_role: "viewer",
        default_task_status: "todo",
        default_task_priority: "medium",
        start_date: new Date(),
        end_date: new Date(),
        progress: 0,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (project) {
            setFormData({
                ...project,
                start_date: project.start_date ? new Date(project.start_date) : new Date(),
                end_date: project.end_date ? new Date(project.end_date) : new Date(),
                color: project.color || "#3b82f6",
                visibility: project.visibility || "private",
                default_role: project.default_role || "viewer",
                default_task_status: project.default_task_status || "todo",
                default_task_priority: project.default_task_priority || "medium",
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await dispatch(updateProject({ id: project.id, updates: formData })).unwrap();
            toast.success("Project updated successfully!");
        } catch (error) {
            console.error("Failed to update project:", error);
            toast.error(error?.message || "Failed to update project");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            await dispatch(deleteProject(project.id)).unwrap();
            toast.success("Project deleted successfully");
            navigate("/dashboard/projects");
        } catch (error) {
            toast.error(error?.message || "Failed to delete project");
        } finally {
            setIsSubmitting(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    const inputClasses = "w-full px-3 py-2 rounded mt-1 border text-sm dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
    const sectionClasses = "rounded-xl border p-6 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-sm";
    const labelClasses = "text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider";

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Project Settings</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your project preferences and team access.</p>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50" >
                        <Save className="size-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* General Settings */}
                        <div className={sectionClasses}>
                            <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
                                <Settings2 className="size-5 text-blue-500" />
                                <h2 className="text-lg font-semibold">General Settings</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className={labelClasses}>Project Name</label>
                                        <AIAssistantButton
                                            onGenerate={(text) => setFormData({ ...formData, name: text })}
                                            context="Suggest a creative and professional name for a project management application feature."
                                            type="custom"
                                        />
                                    </div>
                                    <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} placeholder="Enter project name" required />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className={labelClasses}>Description</label>
                                        {formData.name && (
                                            <AIAssistantButton
                                                onGenerate={(text) => setFormData({ ...formData, description: text })}
                                                context={formData.name}
                                            />
                                        )}
                                    </div>
                                    <textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClasses} placeholder="What is this project about?" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className={labelClasses}>Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses} >
                                            <option value="PLANNING">Planning</option>
                                            <option value="ACTIVE">Active</option>
                                            <option value="ON_HOLD">On Hold</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="ARCHIVED">Archived</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelClasses}>Project Color</label>
                                        <div className="flex gap-3 items-center mt-1">
                                            <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="h-9 w-14 rounded cursor-pointer bg-transparent" />
                                            <span className="text-xs text-zinc-500 font-mono uppercase">{formData.color}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Task Defaults */}
                        <div className={sectionClasses}>
                            <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
                                <Layout className="size-5 text-purple-500" />
                                <h2 className="text-lg font-semibold">Task Defaults</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className={labelClasses}>Default Task Status</label>
                                    <select value={formData.default_task_status} onChange={(e) => setFormData({ ...formData, default_task_status: e.target.value })} className={inputClasses} >
                                        <option value="todo">Todo</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClasses}>Default Task Priority</label>
                                    <select value={formData.default_task_priority} onChange={(e) => setFormData({ ...formData, default_task_priority: e.target.value })} className={inputClasses} >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-6">
                            <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                                <AlertCircle className="size-5" />
                                <h2 className="text-lg font-semibold">Danger Zone</h2>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Delete this project</p>
                                    <p className="text-xs text-red-600/70 dark:text-red-400/60 mt-0.5">Once you delete a project, there is no going back. Please be certain.</p>
                                </div>
                                <button type="button" onClick={() => setIsDeleteConfirmOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap" >
                                    <Trash2 className="size-4" /> Delete Project
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Access Settings */}
                        <div className={sectionClasses}>
                            <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
                                <Shield className="size-5 text-emerald-500" />
                                <h2 className="text-lg font-semibold">Access Settings</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className={labelClasses}>Project Visibility</label>
                                    <select value={formData.visibility} onChange={(e) => setFormData({ ...formData, visibility: e.target.value })} className={inputClasses} >
                                        <option value="private">Private</option>
                                        <option value="organization">Organization</option>
                                    </select>
                                    <p className="text-[10px] text-zinc-500 mt-1">Shared with all workspace members if 'Organization' is selected.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className={labelClasses}>Default Member Role</label>
                                    <select value={formData.default_role} onChange={(e) => setFormData({ ...formData, default_role: e.target.value })} className={inputClasses} >
                                        <option value="viewer">Viewer</option>
                                        <option value="editor">Editor</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Team Members info */}
                        <div className={sectionClasses}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Team Members</h2>
                                <button type="button" onClick={() => setIsDialogOpen(true)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" >
                                    <Plus className="size-4 text-zinc-500" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {project.members?.map((member, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50" >
                                        <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase" >
                                            {member?.email?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">{member?.email}</p>
                                            <p className="text-[10px] text-zinc-500">{project.team_lead === member?.id ? 'Team Lead' : 'Member'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <AddProjectMember isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                        </div>
                    </div>
                </div>
            </form>

            <ConfirmDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Project"
                message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
                confirmLabel="Delete Project"
                isDestructive={true}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
