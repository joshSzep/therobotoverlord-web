"use client";

import React from 'react';
import { TopicCreationForm } from '@/components/forms/TopicCreationForm';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { OverlordHeader } from '@/components/overlord/OverlordHeader';

export default function CreateTopicPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-overlord-bg">
        <OverlordHeader />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-overlord-light-text mb-2">
              Submit Topic for Approval
            </h1>
            <p className="text-overlord-muted">
              Propose a new topic for debate. Your submission will be evaluated by the Robot Overlord 
              for logic, relevance, and debate potential.
            </p>
          </div>
          
          <TopicCreationForm />
        </main>
      </div>
    </AuthGuard>
  );
}
