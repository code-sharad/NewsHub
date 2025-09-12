"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );

  function SignInContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    return (
      <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Sign in to your NewsHub account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm mb-2">
                There was a problem signing in. Please try again.
              </div>
            )}
            <Button
              className="w-full"
              onClick={() => signIn("google")}
              variant="default"
              size="lg"
            >
              Sign in with Google
            </Button>
            <div className="text-xs text-muted-foreground text-center mt-4">
              <Link href="/">Back to Home</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
