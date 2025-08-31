"use client";

import { useRouter } from "next/navigation";

import {
  OverlordContent,
  OverlordHeader,
  OverlordMessage,
} from "@/components/overlord";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <main className="max-w-4xl mx-auto text-center space-y-8">
        {/* Overlord Header */}
        <OverlordMessage>
          <OverlordHeader>
            <h1 className="text-4xl md:text-6xl font-bold text-light-text mb-4 font-mono">
              THE ROBOT OVERLORD
            </h1>
            <p className="text-xl md:text-2xl text-muted-light font-mono">
              CITIZEN IDENTIFICATION REQUIRED
            </p>
          </OverlordHeader>
        </OverlordMessage>

        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to the Debate Arena</CardTitle>
            <CardDescription>
              A satirical, AI-moderated debate arena where citizens argue inside
              a fictional authoritarian state. The Overlord evaluates every
              contribution for logic, tone, and relevance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="bordered" padding="sm">
                <div className="border-l-4 border-approved-green pl-4">
                  <h3 className="font-bold text-approved-green mb-2">Logic</h3>
                  <p className="text-sm text-muted-light">
                    Detects contradictions and fallacies
                  </p>
                </div>
              </Card>
              <Card variant="bordered" padding="sm">
                <div className="border-l-4 border-warning-amber pl-4">
                  <h3 className="font-bold text-warning-amber mb-2">Tone</h3>
                  <p className="text-sm text-muted-light">
                    Requires reasoned argument
                  </p>
                </div>
              </Card>
              <Card variant="bordered" padding="sm">
                <div className="border-l-4 border-processing-blue pl-4">
                  <h3 className="font-bold text-processing-blue mb-2">
                    Relevance
                  </h3>
                  <p className="text-sm text-muted-light">
                    Keeps threads on topic
                  </p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            glow
            onClick={() => router.push("/login")}
          >
            AUTHENTICATE
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => router.push("/feed")}
          >
            BROWSE AS VISITOR
          </Button>
        </div>

        {/* Status */}
        <div className="text-sm text-muted-light font-mono space-y-1">
          <p>System Status: OPERATIONAL</p>
          <p>Queue Processing: ACTIVE</p>
          <p>Overlord Status: MONITORING</p>
        </div>
      </main>
    </div>
  );
}
