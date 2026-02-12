import { supabase } from '../lib/supabase';

// Projects API
export const projectsApi = {
    // Get all projects for a workspace
    async getAll(workspaceId) {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        team_lead_user:users!projects_team_lead_fkey(id, name, email, image),
        tasks(*),
        project_members(
          user:users(*)
        )
      `)
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(project => ({
            ...project,
            members: project.project_members?.map(pm => pm.user) || []
        }));
    },

    // Get single project
    async getById(projectId) {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        team_lead_user:users!projects_team_lead_fkey(id, name, email, image),
        tasks(*),
        project_members(
          user:users(*)
        )
      `)
            .eq('id', projectId)
            .single();

        if (error) throw error;
        // Flatten members
        return {
            ...data,
            members: data.project_members?.map(pm => pm.user) || []
        };
    },

    // Create project
    async create(projectData) {
        const { team_members, ...projectDetails } = projectData;

        // Sanitize projectDetails to match Supabase schema
        const validFields = [
            'workspace_id',
            'name',
            'description',
            'status',
            'priority',
            'color',
            'visibility',
            'default_role',
            'default_task_status',
            'default_task_priority',
            'start_date',
            'end_date',
            'team_lead'
        ];

        const sanitizedProject = Object.keys(projectDetails)
            .filter(key => validFields.includes(key))
            .reduce((obj, key) => {
                const value = projectDetails[key];
                // Convert empty strings to null for foreign key fields
                obj[key] = (key === 'team_lead' && value === '') ? null : value;
                return obj;
            }, {});

        // 1. Insert Project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert([sanitizedProject])
            .select()
            .single();

        if (projectError) throw projectError;

        // 2. Insert Members if any
        if (team_members && team_members.length > 0) {
            const memberInserts = team_members.map(userId => ({
                project_id: project.id,
                user_id: userId,
                role: 'MEMBER'
            }));

            const { error: membersError } = await supabase
                .from('project_members')
                .insert(memberInserts);

            if (membersError) throw membersError;
        }

        // Return the project with members/tasks placeholder for unshift
        return { ...project, tasks: [], project_members: [] };
    },

    // Update project
    async update(projectId, updates) {
        // Sanitize updates to match Supabase schema
        const validFields = [
            'name',
            'description',
            'status',
            'priority',
            'color',
            'visibility',
            'default_role',
            'default_task_status',
            'default_task_priority',
            'start_date',
            'end_date',
            'team_lead',
            'progress'
        ];

        const sanitizedUpdates = Object.keys(updates)
            .filter(key => validFields.includes(key))
            .reduce((obj, key) => {
                let value = updates[key];

                // Handle日期
                if (key.endsWith('_date') && typeof value === 'object' && value !== null) {
                    value = value.toISOString();
                }

                // Convert empty strings to null for foreign key fields
                if (key === 'team_lead' && value === '') {
                    value = null;
                }

                obj[key] = value;
                return obj;
            }, {});

        const { data, error } = await supabase
            .from('projects')
            .update(sanitizedUpdates)
            .eq('id', projectId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete project
    async delete(projectId) {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;
    },
};

// Tasks API
export const tasksApi = {
    // Get all tasks for a project
    async getByProject(projectId) {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name, email, image)
      `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get task by ID
    async getById(taskId) {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name, email, image),
        project:projects(*),
        comments(
          *,
          user:users(*)
        )
      `)
            .eq('id', taskId)
            .single();

        if (error) throw error;
        return data;
    },

    // Create task
    async create(taskData) {
        // Sanitize payload to match Supabase schema exactly
        const validFields = [
            'project_id',
            'title',
            'description',
            'status',
            'priority',
            'type',
            'assignee_id',
            'due_date'
        ];

        const sanitizedData = Object.keys(taskData)
            .filter(key => validFields.includes(key))
            .reduce((obj, key) => {
                const value = taskData[key];
                // Convert empty strings to null for foreign key fields
                obj[key] = (key === 'assignee_id' && value === '') ? null : value;
                return obj;
            }, {});

        const { data, error } = await supabase
            .from('tasks')
            .insert([sanitizedData])
            .select(`
                *,
                assignee:users!tasks_assignee_id_fkey(id, name, email, image)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    // Update task
    async update(taskId, updates) {
        // Sanitize updates to match Supabase schema
        const validFields = [
            'id',
            'project_id',
            'title',
            'description',
            'status',
            'priority',
            'type',
            'assignee_id',
            'due_date'
        ];

        const sanitizedUpdates = Object.keys(updates)
            .filter(key => validFields.includes(key))
            .reduce((obj, key) => {
                const value = updates[key];
                // Convert empty strings to null for foreign key fields
                obj[key] = (key === 'assignee_id' && value === '') ? null : value;
                return obj;
            }, {});

        const { data, error } = await supabase
            .from('tasks')
            .update(sanitizedUpdates)
            .eq('id', taskId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete task(s)
    async delete(taskIds) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .in('id', Array.isArray(taskIds) ? taskIds : [taskIds]);

        if (error) throw error;
    },
};

// Comments API
export const commentsApi = {
    // Create comment
    async create(commentData) {
        const { data, error } = await supabase
            .from('comments')
            .insert([commentData])
            .select(`
        *,
        user:users(*)
      `)
            .single();

        if (error) throw error;
        return data;
    },
};

// User API
export const userApi = {
    // Sync user to Supabase
    async syncUser(user) {
        const { data, error } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                name: user.fullName || user.firstName || 'User',
                email: user.primaryEmailAddress?.emailAddress,
                image: user.imageUrl,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Sync multiple users (batch)
    async syncUsers(usersData) {
        if (!usersData.length) return [];
        const { data, error } = await supabase
            .from('users')
            .upsert(usersData, { onConflict: 'id' })
            .select();

        if (error) throw error;
        return data;
    },
};

// Workspaces API
export const workspacesApi = {
    // Sync workspace to Supabase
    async syncWorkspace(org, userId) {
        const { data, error } = await supabase
            .from('workspaces')
            .upsert({
                id: org.id,
                name: org.name,
                slug: org.slug,
                image_url: org.imageUrl,
                owner_id: userId, // Fallback to current user if not available
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};

// Workspace Members API
export const workspaceMembersApi = {
    // Sync member relation
    async syncMember(workspaceId, userId, role = 'MEMBER') {
        const { data, error } = await supabase
            .from('workspace_members')
            .upsert({
                user_id: userId,
                workspace_id: workspaceId,
                role: role
            }, { onConflict: 'user_id, workspace_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Sync multiple members (batch)
    async syncMembers(workspaceId, membersData) {
        if (!membersData.length) return [];
        const inserts = membersData.map(m => ({
            workspace_id: workspaceId,
            user_id: m.userId,
            role: m.role || 'MEMBER'
        }));

        const { data, error } = await supabase
            .from('workspace_members')
            .upsert(inserts, { onConflict: 'user_id, workspace_id' })
            .select();

        if (error) throw error;
        return data;
    },

    // Get all members for a workspace
    async getAll(workspaceId) {
        const { data, error } = await supabase
            .from('workspace_members')
            .select(`
        *,
        user:users(*)
      `)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        return data;
    },
};

// Project Members API (for specific projects)
export const projectMembersApi = {
    async add(projectId, userId, role = 'MEMBER') {
        const { data, error } = await supabase
            .from('project_members')
            .insert([{ project_id: projectId, user_id: userId, role }])
            .select(`*, user:users(*)`)
            .single();

        if (error) throw error;
        return data;
    },

    async remove(projectId, userId) {
        const { error } = await supabase
            .from('project_members')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);

        if (error) throw error;
    }
};
