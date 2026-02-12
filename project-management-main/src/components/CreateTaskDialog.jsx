import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { createTask } from "../features/workspaceSlice";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects.find((p) => p.id === projectId);
    const teamMembers = project?.members || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assignee_id: "",
        due_date: "",
    });

    const dispatch = useDispatch();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            toast.loading("Creating task...");
            await dispatch(createTask({
                ...formData,
                project_id: projectId
            })).unwrap();
            toast.dismiss();
            toast.success("Task created successfully");
            if (setShowCreateTask) setShowCreateTask(false);
            setFormData({
                title: "",
                description: "",
                status: "TODO",
                priority: "MEDIUM",
                assignee_id: "",
                due_date: "",
            });
        } catch (error) {
            toast.dismiss();
            toast.error(error?.message || "Failed to create task");
            console.error("Failed to create task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm w-full max-w-2xl mx-auto p-8 text-zinc-900 dark:text-white">
            <h2 className="text-xl font-bold mb-6">Create New Task</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Title</label>
                    <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="What needs to be done?" className="w-full rounded-lg dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" required />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Add more details about this task..." className="w-full rounded-lg dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-zinc-200 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Priority */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Priority</label>
                        <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full rounded-lg dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"                             >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Initial Status</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer" >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assignee */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Assign To</label>
                        <select value={formData.assignee_id} onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })} className="w-full rounded-lg dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer" >
                            <option value="">Unassigned</option>
                            {teamMembers.map((member) => (
                                <option key={member?.id} value={member?.id}>
                                    {member?.name || member?.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Due Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                min={project?.start_date || new Date().toISOString().split('T')[0]}
                                max={project?.end_date || ""}
                                className="w-full rounded-lg dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 pl-10 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                required
                            />
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4">
                    {setShowCreateTask && (
                        <button type="button" onClick={() => setShowCreateTask(false)} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-6 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" >
                            Cancel
                        </button>
                    )}
                    <button type="submit" disabled={isSubmitting} className="rounded-lg px-8 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50" >
                        {isSubmitting ? "Creating..." : "Create Task"}
                    </button>
                </div>
            </form>
        </div>
    );
}
