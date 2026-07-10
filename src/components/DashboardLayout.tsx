import React from 'react';

export const DashboardLayout = ({ session }: { session: any }) => (
  <div className="min-h-screen p-6">
    <h1 className="text-2xl font-bold">Welcome to NexaBank</h1>
    <p>User: {session.user.email}</p>
  </div>
);
