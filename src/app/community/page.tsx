import { CommunityHub } from '@/modules/community/components/CommunityHub';
import { getCommunityData } from '@/modules/community/lib/community-data';

export default async function CommunityPage() {
  const initialData = await getCommunityData();
  return <CommunityHub initialData={initialData} />;
}
