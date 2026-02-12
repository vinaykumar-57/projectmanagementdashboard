import { useRef, useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { fetchProjects, fetchWorkspaceMembers, setCurrentWorkspace } from '../features/workspaceSlice'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Loader2Icon } from 'lucide-react'
import { userApi, workspacesApi, workspaceMembersApi } from '../services/api'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading } = useSelector((state) => state.workspace)
    const { organization, isLoaded: isOrgLoaded } = useOrganization()
    const { user, isLoaded: isUserLoaded } = useUser()
    const dispatch = useDispatch()

    // Sync User
    useEffect(() => {
        if (isUserLoaded && user) {
            userApi.syncUser(user).catch(err => console.error("Failed to sync user:", err))
        }
    }, [isUserLoaded, user])

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
    }, [dispatch])

    // Load Workspace Data
    const orgId = organization?.id
    const currentWorkspaceId = useSelector(state => state.workspace.currentWorkspace?.id)

    useEffect(() => {
        if (isOrgLoaded && organization && user) {
            // Only dispatch and fetch if the workspace ID has changed
            if (orgId !== currentWorkspaceId) {
                // 1. Sync Workspace and Membership first to avoid FK errors
                const syncData = async () => {
                    try {
                        // A. Sync Workspace
                        await workspacesApi.syncWorkspace(organization, user.id)

                        // B. Sync All Members from Clerk to Supabase
                        const membershipResponse = await organization.getMemberships();
                        const memberships = membershipResponse.data || [];

                        // Prepare users for batch sync
                        const usersToSync = memberships.map(m => ({
                            id: m.publicUserData.userId,
                            name: `${m.publicUserData.firstName || ''} ${m.publicUserData.lastName || ''}`.trim() || m.publicUserData.identifier || 'User',
                            email: m.publicUserData.identifier,
                            image: m.publicUserData.imageUrl,
                        }));

                        // Prepare memberships for batch sync
                        const membersToSync = memberships.map(m => ({
                            userId: m.publicUserData.userId,
                            role: m.role.split(':')[1]?.toUpperCase() || 'MEMBER' // Convert org:admin to ADMIN
                        }));

                        await userApi.syncUsers(usersToSync);
                        await workspaceMembersApi.syncMembers(organization.id, membersToSync);

                        // 2. Update Redux and fetch dependent data
                        dispatch(setCurrentWorkspace({
                            id: organization.id,
                            name: organization.name,
                            slug: organization.slug,
                            imageUrl: organization.imageUrl,
                            projects: []
                        }))
                        dispatch(fetchProjects(organization.id))
                        dispatch(fetchWorkspaceMembers(organization.id))
                    } catch (err) {
                        console.error("Failed to sync workspace/members:", err)
                    }
                }
                syncData()
            }
        }
    }, [isOrgLoaded, orgId, currentWorkspaceId, user, organization, dispatch])

    if (loading) return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
        </div>
    )

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
