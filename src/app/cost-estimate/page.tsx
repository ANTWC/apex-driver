'use client';

import ProFeatureChat from '@/components/ProFeatureChat';

export default function CostEstimatePage() {
  return (
    <ProFeatureChat
      title="What Should I Expect?"
      placeholder="What repair or service do you need?"
      mode="cost_estimate"
      emptyStateTitle="What repair or service?"
      emptyStateDescription="Tell us the repair and your vehicle — we'll give you national average cost ranges so you know what's fair."
    />
  );
}
