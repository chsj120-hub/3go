import { PhotospotWhiteStudio } from '@/modules/photospot/components/PhotospotWhiteStudio';
import { getPhotoSpotsData } from '@/modules/photospot/lib/photospot-data';

export default async function PhotospotPage() {
  const { spots, dataSource } = await getPhotoSpotsData();
  return <PhotospotWhiteStudio spots={spots} dataSource={dataSource} />;
}
