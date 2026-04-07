'use client';

import ProFeatureChat from '@/components/ProFeatureChat';

export default function UrgencyPage() {
  return (
    <ProFeatureChat
      title="How Urgent Is This?"
      placeholder="Describe what's happening..."
      mode="urgency"
      emptyStateTitle="Describe what's going on"
      emptyStateDescription="Tell us the symptoms and we'll categorize: Stop Driving / Get Checked Soon / Schedule Service."
    />
  );
}
