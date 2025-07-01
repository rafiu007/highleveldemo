'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { WorkspaceDetails } from '@/components/workspace/WorkspaceDetails';

const WorkspacePage: React.FC = () => {
  return (
    <Layout title="Workspace Settings">
      <WorkspaceDetails />
    </Layout>
  );
};

export default WorkspacePage;
