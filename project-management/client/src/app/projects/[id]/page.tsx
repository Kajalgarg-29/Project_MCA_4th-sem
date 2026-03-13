"use client";

import { useParams } from "next/navigation";
import DashboardWrapper from "@/app/dashboardWrapper";
import KanbanBoard from "@/components/KanbanBoard";

export default function ProjectPage() {
  const { id } = useParams();
  return (
    <DashboardWrapper>
      <KanbanBoard projectId={Number(id)} />
    </DashboardWrapper>
  );
}
