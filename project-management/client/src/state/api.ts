import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: number;
}
export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;
}
export interface User {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  teamId?: number;
  role?: string;
  team?: Team;
}
export interface Team {
  id: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
  users?: User[];
}
export interface Attendance {
  id: number;
  userId: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  notes?: string;
  workHours?: number;
  user: { userId: number; username: string; email: string };
}
export interface Campaign {
  id: number;
  name: string;
  description?: string;
  status: string;
  type: string;
  budget?: number;
  spent?: number;
  startDate?: string;
  endDate?: string;
  target?: string;
  reach?: number;
  clicks?: number;
  conversions?: number;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  type: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string;
  color: string;
  allDay: boolean;
  reminder?: number;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      // First try localStorage (email/password login)
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
          return headers;
        }
      }
      // Fallback: get token from NextAuth session (Google login)
      const session = (await getSession()) as any;
      if (session?.accessToken) {
        headers.set("Authorization", `Bearer ${session.accessToken}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Projects",
    "Tasks",
    "Users",
    "Teams",
    "Attendance",
    "Campaigns",
    "Events",
  ],
  endpoints: (build) => ({
    // Projects
    getProjects: build.query<Project[], void>({
      query: () => "/projects",
      providesTags: ["Projects"],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (body) => ({ url: "/projects", method: "POST", body }),
      invalidatesTags: ["Projects"],
    }),
    deleteProject: build.mutation<void, number>({
      query: (id) => ({ url: `/projects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Projects"],
    }),
    // Tasks
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `/tasks?projectId=${projectId}`,
      providesTags: ["Tasks"],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (body) => ({ url: "/tasks", method: "POST", body }),
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `/tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: build.mutation<void, number>({
      query: (id) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tasks"],
    }),
    // Users
    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    createUser: build.mutation<
      User,
      { username: string; email: string; password: string; role?: string }
    >({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    updateUser: build.mutation<User, { userId: number; data: Partial<User> }>({
      query: ({ userId, data }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: build.mutation<void, number>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["Users"],
    }),
    // Teams
    getTeams: build.query<Team[], void>({
      query: () => "/teams",
      providesTags: ["Teams"],
    }),
    createTeam: build.mutation<Team, { teamName: string }>({
      query: (body) => ({ url: "/teams", method: "POST", body }),
      invalidatesTags: ["Teams"],
    }),
    updateTeam: build.mutation<Team, { teamId: number; teamName: string }>({
      query: ({ teamId, ...body }) => ({
        url: `/teams/${teamId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Teams"],
    }),
    deleteTeam: build.mutation<void, number>({
      query: (id) => ({ url: `/teams/${id}`, method: "DELETE" }),
      invalidatesTags: ["Teams"],
    }),
    addUserToTeam: build.mutation<void, { teamId: number; userId: number }>({
      query: ({ teamId, userId }) => ({
        url: `/teams/${teamId}/members`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: ["Teams", "Users"],
    }),
    removeUserFromTeam: build.mutation<void, number>({
      query: (userId) => ({
        url: `/teams/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teams", "Users"],
    }),
    // Attendance
    getAttendance: build.query<
      Attendance[],
      { userId?: number; month?: number; year?: number }
    >({
      query: ({ userId, month, year } = {}) => {
        const params = new URLSearchParams();
        if (userId) params.append("userId", String(userId));
        if (month) params.append("month", String(month));
        if (year) params.append("year", String(year));
        return `/attendance?${params.toString()}`;
      },
      providesTags: ["Attendance"],
    }),
    getTodayAttendance: build.query<Attendance[], void>({
      query: () => "/attendance/today",
      providesTags: ["Attendance"],
    }),
    getAttendanceSummary: build.query<any[], { month: number; year: number }>({
      query: ({ month, year }) =>
        `/attendance/summary?month=${month}&year=${year}`,
      providesTags: ["Attendance"],
    }),
    checkIn: build.mutation<
      Attendance,
      { userId: number; notes?: string; status?: string }
    >({
      query: (body) => ({ url: "/attendance/checkin", method: "POST", body }),
      invalidatesTags: ["Attendance"],
    }),
    checkOut: build.mutation<Attendance, number>({
      query: (attendanceId) => ({
        url: `/attendance/checkout/${attendanceId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Attendance"],
    }),
    markAttendance: build.mutation<Attendance, any>({
      query: (body) => ({ url: "/attendance/mark", method: "POST", body }),
      invalidatesTags: ["Attendance"],
    }),
    deleteAttendance: build.mutation<void, number>({
      query: (id) => ({ url: `/attendance/${id}`, method: "DELETE" }),
      invalidatesTags: ["Attendance"],
    }),
    // Campaigns
    getCampaigns: build.query<Campaign[], void>({
      query: () => "/campaigns",
      providesTags: ["Campaigns"],
    }),
    getCampaign: build.query<Campaign, number>({
      query: (id) => `/campaigns/${id}`,
      providesTags: ["Campaigns"],
    }),
    createCampaign: build.mutation<Campaign, Partial<Campaign>>({
      query: (body) => ({ url: "/campaigns", method: "POST", body }),
      invalidatesTags: ["Campaigns"],
    }),
    updateCampaign: build.mutation<
      Campaign,
      { id: number } & Partial<Campaign>
    >({
      query: ({ id, ...body }) => ({
        url: `/campaigns/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Campaigns"],
    }),
    deleteCampaign: build.mutation<void, number>({
      query: (id) => ({ url: `/campaigns/${id}`, method: "DELETE" }),
      invalidatesTags: ["Campaigns"],
    }),
    // Events
    getCalendarEvents: build.query<
      CalendarEvent[],
      { month?: number; year?: number }
    >({
      query: ({ month, year } = {}) => {
        const params = new URLSearchParams();
        if (month) params.append("month", String(month));
        if (year) params.append("year", String(year));
        return `/events?${params.toString()}`;
      },
      providesTags: ["Events"],
    }),
    getAllCalendarEvents: build.query<CalendarEvent[], void>({
      query: () => "/events/all",
      providesTags: ["Events"],
    }),
    createCalendarEvent: build.mutation<CalendarEvent, Partial<CalendarEvent>>({
      query: (body) => ({ url: "/events", method: "POST", body }),
      invalidatesTags: ["Events"],
    }),
    updateCalendarEvent: build.mutation<
      CalendarEvent,
      { id: number } & Partial<CalendarEvent>
    >({
      query: ({ id, ...body }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteCalendarEvent: build.mutation<void, number>({
      query: (id) => ({ url: `/events/${id}`, method: "DELETE" }),
      invalidatesTags: ["Events"],
    }),
    // Search
    searchItems: build.query<any, string>({
      query: (query) => `/search?query=${query}`,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddUserToTeamMutation,
  useRemoveUserFromTeamMutation,
  useGetAttendanceQuery,
  useGetTodayAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useMarkAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useGetCalendarEventsQuery,
  useGetAllCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useSearchItemsQuery,
} = api;
