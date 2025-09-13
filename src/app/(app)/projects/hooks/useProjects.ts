import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  slug: string;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: "ACTIVE" | "ARCHIVED";
}

// Query Keys
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: { page?: number; q?: string; status?: string }) =>
    [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// API Functions
async function fetchProjects(params: { page?: number; q?: string; status?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.q) searchParams.set("q", params.q);
  if (params.status) searchParams.set("status", params.status);

  const response = await fetch(`/api/projects?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  return response.json() as Promise<ProjectsResponse>;
}

async function fetchProject(id: string) {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Project not found");
    }
    throw new Error("Failed to fetch project");
  }
  return response.json() as Promise<Project>;
}

async function createProject(data: CreateProjectData) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create project");
  }
  return response.json() as Promise<Project>;
}

async function updateProject(id: string, data: UpdateProjectData) {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update project");
  }
  return response.json() as Promise<Project>;
}

async function deleteProject(id: string) {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete project");
  }
  return response.json();
}

// Hooks
export function useProjects(params: { page?: number; q?: string; status?: string } = {}) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => fetchProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createProject,
    onMutate: async (newProject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      // Snapshot previous value
      const previousProjects = queryClient.getQueriesData({ queryKey: projectKeys.lists() });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: projectKeys.lists() }, (old: ProjectsResponse | undefined) => {
        if (!old) return old;

        const optimisticProject: Project = {
          id: `temp-${Date.now()}`,
          ownerId: "temp",
          name: newProject.name,
          description: newProject.description,
          slug: newProject.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          ...old,
          projects: [optimisticProject, ...old.projects],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        };
      });

      return { previousProjects };
    },
    onSuccess: (project) => {
      toast.success("Project created successfully");
      router.push(`/projects/${project.id}`);
    },
    onError: (error: any, variables, context) => {
      // Rollback
      if (context?.previousProjects) {
        context.previousProjects.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.message || "Failed to create project");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      updateProject(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      const previousProject = queryClient.getQueryData(projectKeys.detail(id));
      const previousLists = queryClient.getQueriesData({ queryKey: projectKeys.lists() });

      // Optimistically update detail
      queryClient.setQueryData(projectKeys.detail(id), (old: any) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });

      // Optimistically update lists
      queryClient.setQueriesData({ queryKey: projectKeys.lists() }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          projects: old.projects.map((project: Project) =>
            project.id === id
              ? { ...project, ...data, updatedAt: new Date().toISOString() }
              : project
          ),
        };
      });

      return { previousProject, previousLists };
    },
    onSuccess: () => {
      toast.success("Project updated successfully");
    },
    onError: (error: any, { id }, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(id), context.previousProject);
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.message || "Failed to update project");
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      const previousLists = queryClient.getQueriesData({ queryKey: projectKeys.lists() });

      // Optimistically remove from lists
      queryClient.setQueriesData({ queryKey: projectKeys.lists() }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          projects: old.projects.filter((project: Project) => project.id !== id),
          pagination: {
            ...old.pagination,
            total: Math.max(0, old.pagination.total - 1),
          },
        };
      });

      return { previousLists };
    },
    onSuccess: () => {
      toast.success("Project deleted successfully");
    },
    onError: (error: any, id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.message || "Failed to delete project");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
