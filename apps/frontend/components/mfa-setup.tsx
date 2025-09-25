"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Smartphone,
  Key,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface MFASetupProps {
  onMFASetup?: (secret: string, backupCodes: string[]) => void;
  onMFADisable?: () => void;
  isEnabled?: boolean;
  lastUsed?: string;
}

export const MFASetup: React.FC<MFASetupProps> = ({
  onMFASetup,
  onMFADisable,
  isEnabled = false,
  lastUsed,
}) => {
  const [step, setStep] = useState<"setup" | "verify" | "backup" | "manage">(
    "setup",
  );
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Generate TOTP secret and QR code
  const generateTOTPSecret = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/mfa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate TOTP secret");
      }

      const data = await response.json();
      setSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to setup MFA");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify TOTP code
  const verifyTOTPCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          secret,
          code: verificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      const data = await response.json();
      setBackupCodes(data.backupCodes);
      setStep("backup");

      toast({
        title: "MFA Setup Successful",
        description:
          "Two-factor authentication has been enabled for your account.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Complete MFA setup
  const completeSetup = () => {
    if (onMFASetup) {
      onMFASetup(secret, backupCodes);
    }
    setStep("manage");
  };

  // Disable MFA
  const disableMFA = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/mfa/disable", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to disable MFA");
      }

      if (onMFADisable) {
        onMFADisable();
      }

      setStep("setup");
      setSecret("");
      setQrCodeUrl("");
      setBackupCodes([]);

      toast({
        title: "MFA Disabled",
        description:
          "Two-factor authentication has been disabled for your account.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable MFA");
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate backup codes
  const regenerateBackupCodes = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/mfa/backup-codes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate backup codes");
      }

      const data = await response.json();
      setBackupCodes(data.backupCodes);

      toast({
        title: "Backup Codes Regenerated",
        description:
          "New backup codes have been generated. Store them securely.",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to regenerate backup codes",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    });
  };

  // Download backup codes as text file
  const downloadBackupCodes = () => {
    const codesText = `MFA Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${backupCodes.join("\n")}`;
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mfa-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isEnabled && step !== "manage") {
    setStep("manage");
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication (MFA)
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your admin account with TOTP-based
          two-factor authentication
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">
                  MFA Enabled
                </span>
                {lastUsed && (
                  <Badge variant="secondary" className="text-xs">
                    Last used: {new Date(lastUsed).toLocaleDateString()}
                  </Badge>
                )}
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  MFA Disabled
                </span>
              </>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Setup Step */}
        {step === "setup" && !isEnabled && (
          <div className="space-y-4">
            <div className="text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">
                Set up Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Use an authenticator app like Google Authenticator, Authy, or
                1Password to generate verification codes.
              </p>
            </div>

            <Button
              onClick={generateTOTPSecret}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Start Setup
                </>
              )}
            </Button>
          </div>
        )}

        {/* Verify Step */}
        {step === "verify" && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app, then enter the
                6-digit code below.
              </p>
            </div>

            {qrCodeUrl && (
              <div className="flex justify-center">
                <Image
                  src={qrCodeUrl}
                  alt="TOTP QR Code"
                  width={200}
                  height={200}
                  className="border rounded-lg p-2"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep("setup")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={verifyTOTPCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </div>
          </div>
        )}

        {/* Backup Codes Step */}
        {step === "backup" && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">
                MFA Setup Complete!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Save these backup codes in a secure location. You can use them
                to access your account if you lose your device.
              </p>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Important:</strong> Each backup code can only be used
                once. Store them securely and treat them like passwords.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="bg-white p-2 rounded border text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyBackupCodes}
                variant="outline"
                className="flex-1"
              >
                Copy Codes
              </Button>
              <Button
                onClick={downloadBackupCodes}
                variant="outline"
                className="flex-1"
              >
                Download
              </Button>
            </div>

            <Button onClick={completeSetup} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </div>
        )}

        {/* Management Step */}
        {step === "manage" && isEnabled && (
          <div className="space-y-4">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">MFA is Active</h3>
              <p className="text-sm text-gray-600">
                Your account is protected with two-factor authentication.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Backup Codes</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Generate new backup codes if you've used some or want fresh
                  ones.
                </p>
                <Button
                  onClick={regenerateBackupCodes}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  {isLoading ? "Generating..." : "Generate New Codes"}
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 text-red-600">Disable MFA</h4>
                <p className="text-sm text-gray-600 mb-3">
                  This will remove two-factor authentication from your account.
                  Only disable if necessary.
                </p>
                <Button
                  onClick={disableMFA}
                  disabled={isLoading}
                  variant="destructive"
                  size="sm"
                >
                  {isLoading ? "Disabling..." : "Disable MFA"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MFASetup;
