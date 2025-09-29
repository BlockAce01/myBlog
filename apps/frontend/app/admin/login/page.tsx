"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Key, Shield } from "lucide-react";
import { useCryptoAuth } from "@/hooks/use-crypto-auth";
import { setAuthToken } from "@/lib/data";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [challenge, setChallenge] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "challenge">("email");
  const [hasKeys, setHasKeys] = useState(false);

  const router = useRouter();
  const {
    isLoading,
    error,
    getChallenge,
    signChallenge,
    authenticate,
    hasPrivateKey,
  } = useCryptoAuth();

  const checkExistingKeys = useCallback(async () => {
    const exists = await hasPrivateKey();
    setHasKeys(exists);
  }, [hasPrivateKey]);

  useEffect(() => {
    checkExistingKeys();
  }, [checkExistingKeys]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    // Store email for key management
    localStorage.setItem("adminEmail", email);

    try {
      const challengeResponse = await getChallenge(email);
      if (challengeResponse) {
        setChallenge(challengeResponse.challenge);
        setUserId(challengeResponse.userId);
        setStep("challenge");
      }
    } catch {
      // Error is handled by the hook
    }
  };

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!challenge || !userId) {
      return;
    }

    try {
      // Sign the challenge
      const signature = await signChallenge(challenge);
      if (!signature) {
        return;
      }

      // Authenticate with the server
      const authResult = await authenticate(challenge, signature, userId);
      if (authResult?.success && authResult.token) {
        // Store the JWT token
        setAuthToken(authResult.token);

        // Redirect to dashboard
        router.push("/admin/dashboard");
      }
    } catch {
      // Error is handled by the hook
    }
  };

  const handleSetupKeys = () => {
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Admin Login
          </CardTitle>
          <CardDescription className="text-center">
            Secure cryptographic authentication for admin access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Status Alert */}
          {!hasKeys && (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <strong>No cryptographic keys found.</strong> You need to set up
                your keys first.
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal underline"
                  onClick={handleSetupKeys}
                >
                  Go to Dashboard →
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Input Step */}
          {step === "email" && hasKeys && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting Challenge...
                  </>
                ) : (
                  "Request Authentication Challenge"
                )}
              </Button>
            </form>
          )}

          {/* Challenge Response Step */}
          {step === "challenge" && hasKeys && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Authentication Challenge Received</strong>
                </AlertDescription>
              </Alert>

              <form onSubmit={handleChallengeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Challenge to Sign</Label>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-xs break-all">{challenge}</code>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing and Authenticating...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Sign Challenge & Login
                    </>
                  )}
                </Button>
              </form>

              <Button
                variant="outline"
                onClick={() => setStep("email")}
                disabled={isLoading}
                className="w-full"
              >
                ← Back to Email
              </Button>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Blog
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
