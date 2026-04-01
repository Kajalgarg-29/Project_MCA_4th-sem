import SEODashboard from "@/components/SEO/SEODashboard";
import DashboardWrapper from "../dashboardWrapper";

export const metadata = {
  title: "SEO AI Suggestions",
  description: "AI-powered keyword recommendations, content gaps, and competitor analysis",
};

export default function SEOPage() {
  return (
    <DashboardWrapper>
      <SEODashboard />
    </DashboardWrapper>
  );
}
