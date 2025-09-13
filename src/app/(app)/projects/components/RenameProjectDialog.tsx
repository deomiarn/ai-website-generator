"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { type Project, useUpdateProject } from "../hooks/useProjects";

const renameProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional(),
});

type RenameProjectForm = z.infer<typeof renameProjectSchema>;

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export function RenameProjectDialog({ open, onOpenChange, project }: RenameProjectDialogProps) {
  const updateProject = useUpdateProject();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RenameProjectForm>({
    resolver: zodResolver(renameProjectSchema),
    values: {
      name: project?.name || "",
      description: project?.description || "",
    },
  });

  const onSubmit = async (data: RenameProjectForm) => {
    if (!project) return;

    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          name: data.name,
          description: data.description || undefined,
        },
      });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !updateProject.isPending) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Update your project name and description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename-name">Project Name</Label>
            <Input
              id="rename-name"
              placeholder="Enter project name"
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
              disabled={updateProject.isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rename-description">Description (Optional)</Label>
            <Input
              id="rename-description"
              placeholder="Enter project description"
              {...register("description")}
              disabled={updateProject.isPending}
            />
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={updateProject.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
