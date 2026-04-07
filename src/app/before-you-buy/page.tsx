'use client';

import ProFeatureChat from '@/components/ProFeatureChat';

export default function BeforeYouBuyPage() {
  return (
    <ProFeatureChat
      title="Before You Buy"
      placeholder="Year, make, model of the car you're looking at..."
      mode="before_buy"
      emptyStateTitle="What car are you looking at?"
      emptyStateDescription="Tell us the year, make, model, and mileage of the used car you're considering. We'll give you a full intelligence report."
    />
  );
}
