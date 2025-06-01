import React, { useState } from 'react';
import { useAccount, useBalance, useChainId, useEnsName, useEnsAvatar } from 'wagmi';
import {
  User,
  Shield,
  Copy,
  ExternalLink,
  Key,
  FileCheck,
  AlertCircle,
  Loader2,
  Activity,
  CheckCircle2,
  Users,
  UserPlus,
  UserMinus,
  Settings,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useClipboard } from '@/hooks/use-clipboard';
import { useAddressToDID, useResolveDidReg, useIsActive } from '@/hooks/use-did-registry';
import { useUserRolesByAddress } from '@/hooks/use-did-auth';
import { useRoles } from '@/hooks/use-did-auth';
import { useHolderDocuments, useAddAdmin, useRemoveAdmin, useGrantRole, useRevokeRole } from '@/hooks/use-docu-vault';
import { CONTRACTS } from '@/config/contract';
import { formatBalance } from '@/utils/helpers';
import { GetBalanceData } from 'wagmi/query';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Network configuration
const NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    explorer: 'https://etherscan.io',
    symbol: 'ETH',
  },
  5: {
    name: 'Goerli Testnet',
    explorer: 'https://goerli.etherscan.io',
    symbol: 'ETH',
  },
  11155111: {
    name: 'Sepolia Testnet',
    explorer: 'https://sepolia.etherscan.io',
    symbol: 'ETH',
  },
  137: {
    name: 'Polygon Mainnet',
    explorer: 'https://polygonscan.com',
    symbol: 'MATIC',
  },
  80001: {
    name: 'Mumbai Testnet',
    explorer: 'https://mumbai.polygonscan.com',
    symbol: 'MATIC',
  },
  42161: {
    name: 'Arbitrum One',
    explorer: 'https://arbiscan.io',
    symbol: 'ETH',
  },
  10: {
    name: 'Optimism',
    explorer: 'https://optimistic.etherscan.io',
    symbol: 'ETH',
  },
  31337: {
    name: 'Local Hardhat',
    explorer: '',
    symbol: 'ETH',
  },
} as const;

const Profile: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const chainId = useChainId();
  const { isAdmin, isIssuer, isVerifier, isHolder, user: authUser } = useAuth();
  const { toast } = useToast();
  const { copy } = useClipboard();
  const [showPrivateKeyWarning, setShowPrivateKeyWarning] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  
  // Role management state
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isManagingRoles, setIsManagingRoles] = useState(false);

  // ENS Integration
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined });

  // DID Registry Integration - use DID from auth if available, otherwise fetch from registry
  const { data: registryDid, isLoading: isLoadingDid } = useAddressToDID(address);
  const userDid = authUser?.did || registryDid;
  const { data: didDocument } = useResolveDidReg(userDid || undefined);
  const { data: isDidActive } = useIsActive(userDid || undefined);

  // Role Management
  const { data: userRoles, isLoading: isLoadingRoles } = useUserRolesByAddress(address);
  const { data: docuVaultRoles } = useRoles(address);

  // Document Management
  const { data: userDocuments, isLoading: isLoadingDocuments } = useHolderDocuments(address as `0x${string}`);

  // Role Management Mutations
  const addAdminMutation = useAddAdmin();
  const removeAdminMutation = useRemoveAdmin();
  const grantRoleMutation = useGrantRole();
  const revokeRoleMutation = useRevokeRole();

  // Get current network configuration
  const currentNetwork = chainId ? NETWORKS[chainId as keyof typeof NETWORKS] : null;

  const copyToClipboard = async (text: string, itemName: string) => {
    const success = await copy(text);
    if (success) {
      setCopiedItem(itemName);
      toast.success(`${itemName} copied to clipboard!`);
      setTimeout(() => setCopiedItem(null), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (timestamp: bigint | undefined): string => {
    if (!timestamp) return 'N/A';
    return format(new Date(Number(timestamp) * 1000), 'PPP');
  };

  const handleExportPrivateKey = () => {
    setShowPrivateKeyWarning(true);
  };

  // Role management handlers
  const handleGrantRole = async () => {
    if (!selectedAddress || !selectedRole) {
      toast.error('Please select both address and role');
      return;
    }

    setIsManagingRoles(true);
    try {
      if (selectedRole === 'admin') {
        await addAdminMutation.mutateAsync({ adminAddress: selectedAddress as `0x${string}` });
        toast.success('Admin role granted successfully');
      } else {
        await grantRoleMutation.mutateAsync({ 
          role: selectedRole as `0x${string}`, 
          account: selectedAddress as `0x${string}` 
        });
        toast.success(`${selectedRole} role granted successfully`);
      }
      setSelectedAddress('');
      setSelectedRole('');
    } catch (error) {
      console.error('Error granting role:', error);
      toast.error('Failed to grant role');
    } finally {
      setIsManagingRoles(false);
    }
  };

  const handleRevokeRole = async () => {
    if (!selectedAddress || !selectedRole) {
      toast.error('Please select both address and role');
      return;
    }

    setIsManagingRoles(true);
    try {
      if (selectedRole === 'admin') {
        await removeAdminMutation.mutateAsync({ adminAddress: selectedAddress as `0x${string}` });
        toast.success('Admin role revoked successfully');
      } else {
        await revokeRoleMutation.mutateAsync({ 
          role: selectedRole as `0x${string}`, 
          account: selectedAddress as `0x${string}` 
        });
        toast.success(`${selectedRole} role revoked successfully`);
      }
      setSelectedAddress('');
      setSelectedRole('');
    } catch (error) {
      console.error('Error revoking role:', error);
      toast.error('Failed to revoke role');
    } finally {
      setIsManagingRoles(false);
    }
  };

  // Properly handle the documents array from GetDocumentsOutput
  const documentsArray: string[] = userDocuments?.documentIds || [];

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Wallet Not Connected</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Please connect your wallet to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8 p-6">
      {/* Enhanced Profile Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl p-8 border card-gradient">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage src={ensAvatar || undefined} alt={ensName || address || ''} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              {isDidActive && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {ensName || 'My Profile'}
              </h1>
              <p className="text-muted-foreground">
                {userDid ? (
                  <span className="flex items-center gap-3">
                    <code className="px-2 py-1 bg-white/60 dark:bg-gray-800/60 rounded text-xs font-mono">
                      DID: {userDid.slice(0, 20)}...
                    </code>
                    {isDidActive && (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </span>
                ) : (
                  'Manage your account and wallet settings'
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Admin
              </Badge>
            )}

            {isIssuer && (
              <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Issuer
              </Badge>
            )}
            {isVerifier && (
              <Badge
                variant="default"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              >
                Verifier
              </Badge>
            )}

            {isHolder && (
              <Badge
                variant="default"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              >
                Holder
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <TabsTrigger value="wallet" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Wallet
          </TabsTrigger>
          <TabsTrigger
            value="identity"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Identity
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Roles
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6 mt-6">
          <Card className="border border-primary/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 ">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Wallet Information
              </CardTitle>
              <CardDescription className="text-base">Your connected wallet details and balances</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Connected Address
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border">
                    <code className="font-mono text-sm flex-1 text-gray-800 dark:text-gray-200">{address}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => address && copyToClipboard(address, 'Address')}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {copiedItem === 'Address' ? (
                        <FileCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {currentNetwork?.explorer && (
                      <Button variant="ghost" size="icon" asChild className="hover:bg-gray-200 dark:hover:bg-gray-700">
                        <a
                          href={`${currentNetwork.explorer}/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Balance
                    </label>
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                        {formatBalance(balance as GetBalanceData)} {currentNetwork?.symbol || 'ETH'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Network
                    </label>
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
                        {currentNetwork?.name || `Chain ID: ${chainId}`}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Smart Contracts</h4>
                  <div className="grid gap-4">
                    {Object.entries(CONTRACTS).map(([name, address]) => (
                      <div key={name} className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          {name} Contract
                        </label>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border">
                          <code className="font-mono text-sm flex-1 text-gray-800 dark:text-gray-200">{address}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(address, name)}
                            className="hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            {copiedItem === name ? (
                              <FileCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          {currentNetwork?.explorer && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <a
                                href={`${currentNetwork.explorer}/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Identity Tab */}
        <TabsContent value="identity" className="space-y-6 mt-6">
          <Card className="border  border-primary/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Decentralized Identity
              </CardTitle>
              <CardDescription className="text-base">Your DID information and verification status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingDid ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <p className="text-sm text-muted-foreground">Loading identity information...</p>
                  </div>
                </div>
              ) : userDid ? (
                <>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      DID Identifier
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-xl border border-purple-200 dark:border-purple-800">
                      <code className="font-mono text-sm flex-1 text-purple-800 dark:text-purple-200">{userDid}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(userDid, 'DID')}
                        className="hover:bg-purple-200 dark:hover:bg-purple-800"
                      >
                        {copiedItem === 'DID' ? (
                          <FileCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {didDocument && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mr-2">
                            Status
                          </label>
                          <Badge
                            variant={didDocument.active ? 'outline' : 'secondary'}
                            className="text-sm px-3 text-primary border-primary bg-primary/10"
                          >
                            {didDocument.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Last Updated
                          </label>
                          <p className="text-sm font-medium">{formatDate(BigInt(didDocument.lastUpdated))}</p>
                        </div>
                      </div>

                      {didDocument.publicKey && (
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Public Key
                          </label>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border">
                            <code className="font-mono text-xs block overflow-x-auto text-gray-800 dark:text-gray-200">
                              {didDocument.publicKey}
                            </code>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-800 dark:text-amber-200">No DID Found</AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    You haven't created a decentralized identifier yet. Create one to participate in the document
                    verification system.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Roles Card */}
          <Card className="border border-primary/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Your Roles & Permissions</CardTitle>
              <CardDescription className="text-base">Roles assigned to your DID in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRoles ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-muted-foreground">Loading roles...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                      className={`p-6 rounded-xl border-2 transition-all ${
                        docuVaultRoles?.isAdmin
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <Shield
                        className={`h-10 w-10 mb-3 ${docuVaultRoles?.isAdmin ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
                      />
                      <h4 className="font-semibold text-lg mb-1">Administrator</h4>
                      <p className="text-sm text-muted-foreground">
                        {docuVaultRoles?.isAdmin ? 'Granted' : 'Not Granted'}
                      </p>
                    </div>
                    <div
                      className={`p-6 rounded-xl border-2 transition-all ${
                        docuVaultRoles?.isIssuer
                          ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <FileCheck
                        className={`h-10 w-10 mb-3 ${docuVaultRoles?.isIssuer ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                      />
                      <h4 className="font-semibold text-lg mb-1">Document Issuer</h4>
                      <p className="text-sm text-muted-foreground">
                        {docuVaultRoles?.isIssuer ? 'Granted' : 'Not Granted'}
                      </p>
                    </div>
                    <div
                      className={`p-6 rounded-xl border-2 transition-all ${
                        docuVaultRoles?.isVerifier
                          ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <CheckCircle2
                        className={`h-10 w-10 mb-3 ${docuVaultRoles?.isVerifier ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}
                      />
                      <h4 className="font-semibold text-lg mb-1">Document Verifier</h4>
                      <p className="text-sm text-muted-foreground">
                        {docuVaultRoles?.isVerifier ? 'Granted' : 'Not Granted'}
                      </p>
                    </div>
                  </div>

                  {userRoles && userRoles.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          All Assigned Roles
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {userRoles.map((role, index) => (
                            <Badge key={index} variant="outline" className="px-3 py-1">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6 mt-6">
          <Card className="border border-primary/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                  <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                Your Documents
              </CardTitle>
              <CardDescription className="text-base">Documents registered under your address</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    <p className="text-sm text-muted-foreground">Loading documents...</p>
                  </div>
                </div>
              ) : documentsArray && documentsArray.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {documentsArray.map((docId: string, index: number) => (
                      <div
                        key={index}
                        className="p-6 rounded-xl border bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded inline-block">
                              {docId}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Activity className="h-3 w-3" />
                              <span>Document #{index + 1}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Total Documents:{' '}
                        <span className="font-semibold text-foreground text-lg">{documentsArray.length}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-800 dark:text-blue-200">No Documents Found</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    You haven't registered any documents yet. Start by uploading and registering your first document.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Management Tab */}
        <TabsContent value="roles" className="space-y-6 mt-6">
          <Card className="border border-primary/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Role Management
              </CardTitle>
              <CardDescription className="text-base">Manage user roles and permissions in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Admin Role Check */}
              {!isAdmin ? (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-800 dark:text-amber-200">Admin Access Required</AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    You need administrator privileges to manage user roles.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {/* Role Grant Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Grant Role
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grant-address">User Address</Label>
                        <Input
                          id="grant-address"
                          placeholder="0x..."
                          value={selectedAddress}
                          onChange={(e) => setSelectedAddress(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grant-role">Role</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="issuer">Document Issuer</SelectItem>
                            <SelectItem value="verifier">Document Verifier</SelectItem>
                            <SelectItem value="holder">Document Holder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-2">
                        <Button
                          onClick={handleGrantRole}
                          disabled={!selectedAddress || !selectedRole || isManagingRoles}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isManagingRoles ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4 mr-2" />
                          )}
                          Grant Role
                        </Button>
                        <Button
                          onClick={handleRevokeRole}
                          disabled={!selectedAddress || !selectedRole || isManagingRoles}
                          variant="destructive"
                        >
                          {isManagingRoles ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <UserMinus className="h-4 w-4 mr-2" />
                          )}
                          Revoke Role
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Current Roles Overview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Your Current Roles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div
                        className={`p-4 rounded-xl border-2 transition-all ${
                          docuVaultRoles?.isAdmin
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Shield
                            className={`h-6 w-6 ${docuVaultRoles?.isAdmin ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
                          />
                          <div>
                            <h4 className="font-semibold">Administrator</h4>
                            <p className="text-sm text-muted-foreground">
                              {docuVaultRoles?.isAdmin ? 'Active' : 'Not Active'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`p-4 rounded-xl border-2 transition-all ${
                          docuVaultRoles?.isIssuer
                            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileCheck
                            className={`h-6 w-6 ${docuVaultRoles?.isIssuer ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                          />
                          <div>
                            <h4 className="font-semibold">Issuer</h4>
                            <p className="text-sm text-muted-foreground">
                              {docuVaultRoles?.isIssuer ? 'Active' : 'Not Active'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-xl border-2 transition-all ${
                          docuVaultRoles?.isVerifier
                            ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            className={`h-6 w-6 ${docuVaultRoles?.isVerifier ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}
                          />
                          <div>
                            <h4 className="font-semibold">Verifier</h4>
                            <p className="text-sm text-muted-foreground">
                              {docuVaultRoles?.isVerifier ? 'Active' : 'Not Active'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-xl border-2 transition-all ${
                          docuVaultRoles?.isHolder
                            ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <User
                            className={`h-6 w-6 ${docuVaultRoles?.isHolder ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}
                          />
                          <div>
                            <h4 className="font-semibold">Holder</h4>
                            <p className="text-sm text-muted-foreground">
                              {docuVaultRoles?.isHolder ? 'Active' : 'Not Active'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role Permissions Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Role Permissions</h3>
                    <div className="grid gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Administrator</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Grant and revoke user roles</li>
                          <li>• Manage system settings</li>
                          <li>• Access admin dashboard</li>
                          <li>• Pause/unpause contract operations</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Document Issuer</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Issue and verify documents</li>
                          <li>• Update document metadata</li>
                          <li>• Manage issued document registry</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Document Verifier</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Verify document authenticity</li>
                          <li>• Access verification tools</li>
                          <li>• Request document verification</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Document Holder</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Register and manage documents</li>
                          <li>• Share documents with others</li>
                          <li>• Control document access permissions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card className="border border-primary/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                  <Key className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                Advanced Options
              </CardTitle>
              <CardDescription className="text-base">Advanced wallet and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={handleExportPrivateKey}
                variant="outline"
                className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              >
                <Key className="h-4 w-4 mr-2" />
                Export Private Key
              </Button>

              {showPrivateKeyWarning && (
                <Alert variant="destructive" className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning: Security Risk!</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>
                      Never share your private key with anyone. Anyone with your private key has full control over your
                      wallet and funds.
                    </p>
                    <p>
                      This feature is for advanced users only. For security reasons, private key export is not available
                      through this interface.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPrivateKeyWarning(false)}
                      className="mt-3"
                    >
                      I Understand
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="border border-primary/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Need Help?</CardTitle>
              <CardDescription className="text-base">
                Get support for your account and document management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you need assistance with your account or have questions about document management, please contact our
                support team.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild className="hover:bg-blue-50 dark:hover:bg-blue-950">
                  <a href="mailto:support@docuvault.example.com">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
