'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCryptoAuth } from '@/hooks/use-crypto-auth';
import { useToast } from '@/hooks/use-toast';
import { Key, Download, Upload, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface KeyManagementProps {
  email?: string;
  onKeyGenerated?: () => void;
  onEmailChange?: (email: string) => void;
}

export const AdminKeyManagement: React.FC<KeyManagementProps> = ({ email: initialEmail, onKeyGenerated, onEmailChange }) => {
  const [hasKeys, setHasKeys] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportedKey, setExportedKey] = useState<string | null>(null);
  const [importKey, setImportKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [email, setEmail] = useState(initialEmail || '');

  const { isLoading, error, generateKeyPair, registerPublicKey, exportPrivateKey, importPrivateKeyFromBackup, hasPrivateKey } = useCryptoAuth();
  const { toast } = useToast();



  useEffect(() => {
    checkExistingKeys();
  }, []);

  const checkExistingKeys = async () => {
    const exists = await hasPrivateKey();
    setHasKeys(exists);
  };

  const handleGenerateKeys = async () => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please provide an admin email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate key pair client-side using Web Crypto API
      const keyPair = await generateKeyPair();

      if (!keyPair) {
        throw new Error('Failed to generate key pair');
      }

      // Try to register the public key with the server
      const registrationSuccess = await registerPublicKey(email, keyPair.publicKey);

      if (registrationSuccess) {
        setHasKeys(true);
        toast({
          title: 'Keys Generated',
          description: 'Cryptographic keys have been generated and stored securely. Public key registered with server.',
        });
        onKeyGenerated?.();
      } else {
        throw new Error('Failed to register public key with server');
      }
    } catch (err) {
      console.error('Key generation error:', err);

      // Check if the error is because keys already exist
      if (err instanceof Error && err.message.includes('already has a registered public key')) {
        toast({
          title: 'Keys Already Exist',
          description: 'You already have cryptographic keys registered. Use the key rotation feature if you need to update them.',
          variant: 'default',
        });
        setHasKeys(true); // Update UI to show keys exist
        onKeyGenerated?.();
      } else {
        toast({
          title: 'Key Generation Failed',
          description: err instanceof Error ? err.message : 'An error occurred while generating keys.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportKey = async () => {
    try {
      const key = await exportPrivateKey();
      if (key) {
        setExportedKey(key);
        setShowExport(true);
        toast({
          title: 'Key Exported',
          description: 'Private key has been exported for backup. Store it securely!',
        });
      }
    } catch (err) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export private key.',
        variant: 'destructive',
      });
    }
  };

  const handleImportKey = async () => {
    if (!importKey.trim()) {
      toast({
        title: 'Import Failed',
        description: 'Please provide a private key to import.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await importPrivateKeyFromBackup(importKey);
      if (success) {
        setHasKeys(true);
        setImportKey('');
        toast({
          title: 'Key Imported',
          description: 'Private key has been imported successfully.',
        });
        onKeyGenerated?.();
      }
    } catch (err) {
      toast({
        title: 'Import Failed',
        description: 'Failed to import private key. Please check the format.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: 'Key copied to clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Cryptographic Key Management
          </CardTitle>
          <CardDescription>
            Manage your cryptographic keys for secure admin authentication.
            Private keys are stored locally and never transmitted to the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasKeys ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-medium">
                {hasKeys ? 'Keys Configured' : 'No Keys Found'}
              </span>
            </div>
            <Badge variant={hasKeys ? 'default' : 'secondary'}>
              {hasKeys ? 'Ready' : 'Setup Required'}
            </Badge>
          </div>

          {/* Email Input */}
          {!hasKeys && !initialEmail && (
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  onEmailChange?.(e.target.value);
                }}
                placeholder="Enter your admin email address"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Enter the email address associated with your admin account.
              </p>
            </div>
          )}

          {/* Generate Keys */}
          {!hasKeys && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Generate a new ECDSA P-256 key pair for secure authentication.
                Your private key will be stored securely in your browser.
              </p>
              <Button
                onClick={handleGenerateKeys}
                disabled={isGenerating || isLoading || (!email && !initialEmail)}
                className="w-full"
              >
                {isGenerating ? 'Generating Keys...' : 'Generate New Key Pair'}
              </Button>
            </div>
          )}

          {/* Key Management Actions */}
          {hasKeys && (
            <div className="space-y-4">
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Key */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Backup Private Key
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Export your private key for secure backup. Store it in a safe place.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleExportKey}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Export Key
                  </Button>
                </div>

                {/* Import Key */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Restore from Backup
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Import a previously exported private key.
                  </p>
                  <div className="space-y-2">
                    <textarea
                      placeholder="Paste your private key here..."
                      value={importKey}
                      onChange={(e) => setImportKey(e.target.value)}
                      className="w-full h-20 p-2 border rounded-md text-xs font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={handleImportKey}
                      disabled={isLoading || !importKey.trim()}
                      className="w-full"
                    >
                      Import Key
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Modal */}
          {showExport && exportedKey && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Private Key Export</p>
                  <p className="text-sm">
                    Store this key securely. It provides access to your admin account.
                    Never share it with anyone.
                  </p>
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                      {exportedKey}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(exportedKey)}
                    >
                      Copy to Clipboard
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowExport(false);
                        setExportedKey(null);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Private keys are stored locally in IndexedDB and never leave your device</p>
            <p>• All cryptographic operations happen client-side</p>
            <p>• The server only stores and verifies your public key</p>
            <p>• Regular key rotation is recommended for enhanced security</p>
            <p>• Always backup your private key in a secure location</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
