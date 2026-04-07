'use client';

import ProFeatureChat from '@/components/ProFeatureChat';

export default function ReplyTechPage() {
  return (
    <ProFeatureChat
      title="Reply to My Technician"
      placeholder="What did your tech/advisor say?"
      mode="reply_tech"
      emptyStateTitle="What did they tell you?"
      emptyStateDescription="Type or paste what your technician or service advisor said. We'll translate it, evaluate every recommendation, and give you the exact words to say back."
    />
  );
}
