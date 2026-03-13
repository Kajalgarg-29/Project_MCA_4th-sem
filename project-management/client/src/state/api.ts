import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project { id: number; name: string; description?: string; startDate?: string; endDate?: string; }
export interface Task { id: number; title: string; description?: string; status?: string; priority?: string; tags?: string; startDate?: string; dueDate?: string; points?: number; projectId: number; authorUserId?: number; assignedUserId?: number; }
export interface User { userId: number; username: string; email: string; profilePictureUrl?: string; teamId?: number; role?: string; }
export interface Team { id: number; teamName: string; productOwnerUserId?: number; projectManagerUserId?: number; users?: User[]; projectTeams?: any[]; }
export interface Campaign { id: number; name: string; type: string; platform: string; budget: number; startDate?: string; endDate?: string; goal?: string; status: string; targetAge?: string; targetLocation?: string; targetIndustry?: string; clicks?: number; leads?: number; conversions?: number; impressions?: number; projectId?: number; createdAt: string; }

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  tagTypes: ["Projects", "Tasks", "Users", "Teams", "Campaigns"],
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({ query: () => "/projects", providesTags: ["Projects"] }),
    createProject: build.mutation<Project, Partial<Project>>({ query: (body) => ({ url: "/projects", method: "POST", body }), invalidatesTags: ["Projects"] }),
    getTasks: build.query<Task[], { projectId: number }>({ query: ({ projectId }) => `/tasks?projectId=${projectId}`, providesTags: ["Tasks"] }),
    createTask: build.mutation<Task, Partial<Task>>({ query: (body) => ({ url: "/tasks", method: "POST", body }), invalidatesTags: ["Tasks"] }),
    updateTask: build.mutation<Task, { taskId: number; data: Partial<Task> }>({ query: ({ taskId, data }) => ({ url: `/tasks/${taskId}`, method: "PUT", body: data }), invalidatesTags: ["Tasks"] }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({ query: ({ taskId, status }) => ({ url: `/tasks/${taskId}/status`, method: "PATCH", body: { status } }), invalidatesTags: ["Tasks"] }),
    deleteTask: build.mutation<void, number>({ query: (taskId) => ({ url: `/tasks/${taskId}`, method: "DELETE" }), invalidatesTags: ["Tasks"] }),
    getUsers: build.query<User[], void>({ query: () => "/users", providesTags: ["Users"] }),
    createUser: build.mutation<User, Partial<User>>({ query: (body) => ({ url: "/users", method: "POST", body }), invalidatesTags: ["Users"] }),
    updateUser: build.mutation<User, { userId: number; data: Partial<User> }>({ query: ({ userId, data }) => ({ url: `/users/${userId}`, method: "PUT", body: data }), invalidatesTags: ["Users"] }),
    deleteUser: build.mutation<void, number>({ query: (userId) => ({ url: `/users/${userId}`, method: "DELETE" }), invalidatesTags: ["Users"] }),
    getTeams: build.query<Team[], void>({ query: () => "/teams", providesTags: ["Teams"] }),
    createTeam: build.mutation<Team, Partial<Team>>({ query: (body) => ({ url: "/teams", method: "POST", body }), invalidatesTags: ["Teams"] }),
    updateTeam: build.mutation<Team, { teamId: number } & Partial<Team>>({ query: ({ teamId, ...body }) => ({ url: `/teams/${teamId}`, method: "PUT", body }), invalidatesTags: ["Teams"] }),
    deleteTeam: build.mutation<void, number>({ query: (teamId) => ({ url: `/teams/${teamId}`, method: "DELETE" }), invalidatesTags: ["Teams"] }),
    addTeamMember: build.mutation<void, { teamId: number; userId: number }>({ query: ({ teamId, userId }) => ({ url: `/teams/${teamId}/members`, method: "POST", body: { userId } }), invalidatesTags: ["Teams"] }),
    removeTeamMember: build.mutation<void, { teamId: number; userId: number }>({ query: ({ teamId, userId }) => ({ url: `/teams/${teamId}/members/${userId}`, method: "DELETE" }), invalidatesTags: ["Teams"] }),
    assignProjectToTeam: build.mutation<void, { teamId: number; projectId: number }>({ query: ({ teamId, projectId }) => ({ url: `/teams/${teamId}/projects`, method: "POST", body: { projectId } }), invalidatesTags: ["Teams"] }),
    removeProjectFromTeam: build.mutation<void, { teamId: number; projectId: number }>({ query: ({ teamId, projectId }) => ({ url: `/teams/${teamId}/projects/${projectId}`, method: "DELETE" }), invalidatesTags: ["Teams"] }),
    searchItems: build.query<any, string>({ query: (query) => `/search?query=${query}` }),
    getCampaigns: build.query<Campaign[], void>({ query: () => "/campaigns", providesTags: ["Campaigns"] }),
    createCampaign: build.mutation<Campaign, Partial<Campaign>>({ query: (body) => ({ url: "/campaigns", method: "POST", body }), invalidatesTags: ["Campaigns"] }),
    updateCampaign: build.mutation<Campaign, { id: number; data: Partial<Campaign> }>({ query: ({ id, data }) => ({ url: `/campaigns/${id}`, method: "PUT", body: data }), invalidatesTags: ["Campaigns"] }),
    deleteCampaign: build.mutation<void, number>({ query: (id) => ({ url: `/campaigns/${id}`, method: "DELETE" }), invalidatesTags: ["Campaigns"] }),
  }),
});

export const {
  useGetProjectsQuery, useCreateProjectMutation,
  useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useUpdateTaskStatusMutation, useDeleteTaskMutation,
  useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation,
  useGetTeamsQuery, useCreateTeamMutation, useUpdateTeamMutation, useDeleteTeamMutation,
  useAddTeamMemberMutation, useRemoveTeamMemberMutation,
  useAssignProjectToTeamMutation, useRemoveProjectFromTeamMutation,
  useSearchItemsQuery,
  useGetCampaignsQuery, useCreateCampaignMutation, useUpdateCampaignMutation, useDeleteCampaignMutation,
} = api;
