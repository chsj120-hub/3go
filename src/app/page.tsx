import { HomeDashboard } from '@/modules/onboarding/components/HomeDashboard';
import { getHomeDashboardData } from '@/modules/onboarding/lib/home-data';

export default async function HomePage() {
  const initialData = await getHomeDashboardData();
  return <HomeDashboard initialData={initialData} />;
}
