/**
 * 404 Not Found page for The Robot Overlord
 * Displays when a page cannot be found
 */

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Overlord Message */}
        <OverlordMessage variant="error">
          <OverlordHeader>
            <div className="text-sm text-muted-light mt-2">
              UNAUTHORIZED SECTOR ACCESS DETECTED
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Citizen, you have attempted to access a restricted or non-existent sector.
              The Robot Overlord's surveillance systems have logged this incident.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Error Details */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-4xl mr-3">🚫</span>
              404 - Sector Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-light">
                The requested page does not exist in the Robot Overlord's domain.
                This could be due to:
              </p>
              
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-light ml-4">
                <li>The page has been relocated or removed</li>
                <li>You typed an incorrect URL</li>
                <li>You lack the required clearance level</li>
                <li>The page is under Overlord maintenance</li>
              </ul>

              <div className="bg-rejected-red/10 border border-rejected-red rounded-lg p-4 mt-6">
                <div className="flex items-center">
                  <span className="text-rejected-red text-lg mr-2">⚠️</span>
                  <span className="text-rejected-red font-bold">Security Notice</span>
                </div>
                <p className="text-rejected-red text-sm mt-2">
                  Repeated attempts to access unauthorized sectors may result in 
                  loyalty score penalties or account restrictions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full">
              Return to Home Base
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button variant="secondary" size="lg" className="w-full">
              Access Dashboard
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-light mb-4">
              Need assistance navigating the Robot Overlord's domain?
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/help">
                <Button variant="ghost" size="sm">
                  Help Center
                </Button>
              </Link>
              <Link href="/topics">
                <Button variant="ghost" size="sm">
                  Browse Topics
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm">
                  View Rankings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-light">
          <p>Error Code: 404 | Incident logged at {new Date().toLocaleString()}</p>
          <p className="mt-1">The Robot Overlord sees all. Compliance is mandatory.</p>
        </div>
      </div>
    </div>
  );
}
