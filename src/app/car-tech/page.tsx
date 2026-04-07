'use client';

import ProFeatureChat from '@/components/ProFeatureChat';

export default function CarTechPage() {
  return (
    <ProFeatureChat
      title="My Car's Tech"
      placeholder="What feature do you need help with?"
      mode="car_tech"
      emptyStateTitle="What feature do you need help with?"
      emptyStateDescription="Bluetooth pairing, navigation, heated seats, Apple CarPlay, key fob — ask anything about your car's technology."
    />
  );
}
