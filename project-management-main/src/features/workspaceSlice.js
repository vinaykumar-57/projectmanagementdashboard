import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { projectsApi, tasksApi, workspaceMembersApi, projectMembersApi, commentsApi } from "../services/api";

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchProjects = createAsyncThunk(
    'workspace/fetchProjects',
    async (workspaceId) => {
        const data = await projectsApi.getAll(workspaceId);
        return data;
    }
);

export const createProject = createAsyncThunk(
    'workspace/createProject',
    async (projectData) => {
        const data = await projectsApi.create(projectData);
        return data;
    }
);

export const createTask = createAsyncThunk(
    'workspace/createTask',
    async (taskData) => {
        const data = await tasksApi.create(taskData);
        return data;
    }
);

export const fetchProjectById = createAsyncThunk(
    'workspace/fetchProjectById',
    async (projectId) => {
        const data = await projectsApi.getById(projectId);
        return data;
    }
);

export const updateTask = createAsyncThunk(
    'workspace/updateTask',
    async (taskData) => {
        const data = await tasksApi.update(taskData.id, taskData);
        return data;
    }
);

export const deleteTask = createAsyncThunk(
    'workspace/deleteTask',
    async (taskIds) => {
        await tasksApi.delete(taskIds);
        return taskIds;
    }
);

export const fetchWorkspaceMembers = createAsyncThunk(
    'workspace/fetchWorkspaceMembers',
    async (workspaceId) => {
        const data = await workspaceMembersApi.getAll(workspaceId);
        return data;
    }
);

export const updateProject = createAsyncThunk(
    'workspace/updateProject',
    async ({ id, updates }) => {
        const data = await projectsApi.update(id, updates);
        return data;
    }
);

export const deleteProject = createAsyncThunk(
    'workspace/deleteProject',
    async (projectId) => {
        await projectsApi.delete(projectId);
        return projectId;
    }
);

export const addProjectMember = createAsyncThunk(
    'workspace/addProjectMember',
    async ({ projectId, userId, role }) => {
        const data = await projectMembersApi.add(projectId, userId, role);
        return { projectId, member: data };
    }
);

export const removeProjectMember = createAsyncThunk(
    'workspace/removeProjectMember',
    async ({ projectId, userId }) => {
        await projectMembersApi.remove(projectId, userId);
        return { projectId, userId };
    }
);

export const createComment = createAsyncThunk(
    'workspace/createComment',
    async (commentData) => {
        const data = await commentsApi.create(commentData);
        return data;
    }
);

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action) => {
            const nextWorkspace = action.payload;
            // Only update if the ID has changed or if currentWorkspace is null
            if (!state.currentWorkspace || state.currentWorkspace.id !== nextWorkspace?.id) {
                state.currentWorkspace = {
                    ...nextWorkspace,
                    projects: nextWorkspace?.projects || []
                };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Projects
            .addCase(fetchProjects.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentWorkspace) {
                    state.currentWorkspace.projects = action.payload;
                }
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Create Project
            .addCase(createProject.fulfilled, (state, action) => {
                if (state.currentWorkspace) {
                    if (!state.currentWorkspace.projects) {
                        state.currentWorkspace.projects = [];
                    }
                    state.currentWorkspace.projects.unshift(action.payload);
                }
            })
            // Create Task
            .addCase(createTask.fulfilled, (state, action) => {
                if (state.currentWorkspace) {
                    // 1. Update project internally if it exists in projects list
                    const project = state.currentWorkspace.projects?.find(p => p.id === action.payload.project_id);
                    if (project) {
                        if (!project.tasks) project.tasks = [];
                        project.tasks.unshift(action.payload);
                    }
                }
            })
            // Fetch Project By Id
            .addCase(fetchProjectById.fulfilled, (state, action) => {
                // If we don't have a current workspace, we might need to set it or just add this project to a list
                // For now, let's assume if we are fetching by ID, we might be in a "view only" mode or just need to populate the current workspace's project list
                // If currentWorkspace is null, we can't really set it fully without fetching workspace details.
                // But we can try to at least make the project available.
                if (!state.currentWorkspace) {
                    state.currentWorkspace = { projects: [action.payload] };
                } else {
                    if (!state.currentWorkspace.projects) state.currentWorkspace.projects = [];
                    const index = state.currentWorkspace.projects.findIndex(p => p.id === action.payload.id);
                    if (index !== -1) {
                        state.currentWorkspace.projects[index] = action.payload;
                    } else {
                        state.currentWorkspace.projects.push(action.payload);
                    }
                }
            })
            // Update Task
            .addCase(updateTask.fulfilled, (state, action) => {
                if (state.currentWorkspace && state.currentWorkspace.projects) {
                    const project = state.currentWorkspace.projects.find(p => p.id === action.payload.project_id);
                    if (project && project.tasks) {
                        const index = project.tasks.findIndex(t => t.id === action.payload.id);
                        if (index !== -1) {
                            project.tasks[index] = action.payload;
                        }
                    }
                }
            })
            // Delete Task
            .addCase(deleteTask.fulfilled, (state, action) => {
                // action.payload is array of IDs or single ID
                const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
                if (state.currentWorkspace && state.currentWorkspace.projects) {
                    state.currentWorkspace.projects.forEach(project => {
                        if (project.tasks) {
                            project.tasks = project.tasks.filter(t => !ids.includes(t.id));
                        }
                    });
                }
            })
            // Fetch Workspace Members
            .addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
                if (state.currentWorkspace) {
                    state.currentWorkspace.members = action.payload;
                }
            })
            // Update Project
            .addCase(updateProject.fulfilled, (state, action) => {
                if (state.currentWorkspace && state.currentWorkspace.projects) {
                    const index = state.currentWorkspace.projects.findIndex(p => p.id === action.payload.id);
                    if (index !== -1) {
                        state.currentWorkspace.projects[index] = {
                            ...state.currentWorkspace.projects[index],
                            ...action.payload
                        };
                    }
                }
            })
            // Delete Project
            .addCase(deleteProject.fulfilled, (state, action) => {
                if (state.currentWorkspace && state.currentWorkspace.projects) {
                    state.currentWorkspace.projects = state.currentWorkspace.projects.filter(p => p.id !== action.payload);
                }
            })
            // Add Project Member
            .addCase(addProjectMember.fulfilled, (state, action) => {
                if (state.currentWorkspace && state.currentWorkspace.projects) {
                    const project = state.currentWorkspace.projects.find(p => p.id === action.payload.projectId);
                    if (project) {
                        if (!project.members) project.members = [];
                        project.members.push(action.payload.member.user);
                    }
                }
            })
            // Remove Project Member
            .addCase(removeProjectMember.fulfilled, (state, action) => {
                if (state.currentWorkspace && state.currentWorkspace.projects) {
                    const project = state.currentWorkspace.projects.find(p => p.id === action.payload.projectId);
                    if (project && project.members) {
                        project.members = project.members.filter(m => m.id !== action.payload.userId);
                    }
                }
            });
    }
});

export const { setCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;