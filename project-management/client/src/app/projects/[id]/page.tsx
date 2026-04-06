"use client";
import { use } from "react";
import DashboardWrapper from "@/app/dashboardWrapper";
import KanbanBoard from "@/components/KanbanBoard";
import { useGetProjectsQuery } from "@/state/api";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: projects = [] } = useGetProjectsQuery();
  const project = projects.find((p: any) => p.id === Number(id));

  return (
    <DashboardWrapper>
      <KanbanBoard projectId={Number(id)} projectName={project?.name} />
    </DashboardWrapper>
  );
}
