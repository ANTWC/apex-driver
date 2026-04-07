'use client';

import ProFeatureChat from '@/components/ProFeatureChat';

export default function EstimatePage() {
  return (
    <ProFeatureChat
      title="Understand Your Estimate"
      placeholder="Describe or paste your estimate..."
      mode="estimate"
      emptyStateTitle="Photo or type your estimate"
      emptyStateDescription="Take a photo of your repair bill or type out the line items. We'll explain every charge and tell you if the prices are fair."
      allowImage
    />
  );
}
