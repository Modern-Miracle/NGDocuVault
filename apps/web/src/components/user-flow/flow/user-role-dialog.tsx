'use client';

import { Button } from '@/components/ui/button';
import { Users, Building2, UserCircle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useRegisterHolder, useRegisterIssuer, useRegisterVerifier } from '@/hooks/use-docu-vault';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
interface UserRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: string) => void;
  className?: string;
}

export function UserRoleDialog({ isOpen, onClose, onSelectRole }: UserRoleDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { address } = useAccount();
  const { toast } = useToast();

  const registerHolder = useRegisterHolder();
  const registerIssuer = useRegisterIssuer();
  const registerVerifier = useRegisterVerifier();

  const handleRoleSelection = async (role: string) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setSelectedRole(role);
    setIsProcessing(true);

    try {
      switch (role) {
        case 'HOLDER_ROLE':
          await registerHolder.mutateAsync({ userAddr: address });
          toast.success('Successfully registered as Document Holder');
          break;
        case 'ISSUER_ROLE':
          await registerIssuer.mutateAsync({ issuerAddr: address });
          toast.success('Successfully registered as Document Issuer');
          break;
        case 'VERIFIER_ROLE':
          await registerVerifier.mutateAsync({ verifierAddr: address });
          toast.success('Successfully registered as Document Verifier');
          break;
        default:
          throw new Error('Invalid role selected');
      }

      onSelectRole(role);
    } catch (error) {
      console.error('Error registering role:', error);
      toast.error('Failed to register role', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsProcessing(false);
      setSelectedRole(null);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto bg-gradient-to-br from-background/97 to-background/95 border border-border/50 shadow-xl backdrop-blur-md rounded-xl overflow-hidden p-0">
        <div className="relative">
          {/* Decorative elements */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-70" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl opacity-70" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-24 bg-gradient-to-r from-transparent via-primary/5 to-transparent rotate-12 opacity-40" />
          </div>

          <div className="relative z-10 p-4 sm:p-6">
            <DialogHeader className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-br from-primary/90 via-primary to-primary/90 bg-clip-text text-transparent pb-1">
                  Choose Your Role in DocuVault
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-muted-foreground/90">
                  Select how you would like to participate in the DocuVault ecosystem
                </DialogDescription>
              </motion.div>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 py-4 sm:py-6"
            >
              {/* Holder Role Card (Default) */}
              <Card
                onClick={() => !isProcessing && handleRoleSelection('HOLDER_ROLE')}
                className={`group relative p-4 sm:p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/5 hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden ${
                  isProcessing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-0 right-0 p-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors duration-300 ring-4 ring-primary/10 group-hover:ring-primary/20" />
                </div>

                <div className="space-y-3 sm:space-y-4 relative z-10">
                  <div className="p-3 w-fit rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20 group-hover:ring-primary/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
                    <UserCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      Document Holder
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
                      Store, manage, and share your documents securely on the blockchain.
                    </p>
                  </div>
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      disabled={isProcessing}
                      className="w-full text-sm sm:text-base border-primary/20 bg-primary/5 hover:bg-primary/10 hover:text-primary group-hover:border-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing && selectedRole === 'HOLDER_ROLE' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <UserCircle className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Continue as Holder</span>
                          <span className="sm:hidden">Holder</span>
                          <CheckCircle2 className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
              {/* Issuer Role Card */}
              <Card
                onClick={() => !isProcessing && handleRoleSelection('ISSUER_ROLE')}
                className={`group relative p-4 sm:p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/5 hover:border-green-500/30 hover:shadow-md transition-all duration-300 overflow-hidden ${
                  isProcessing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-0 right-0 p-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40 group-hover:bg-green-500 transition-colors duration-300 ring-4 ring-green-500/10 group-hover:ring-green-500/20" />
                </div>

                <div className="space-y-3 sm:space-y-4 relative z-10">
                  <div className="p-3 w-fit rounded-lg bg-gradient-to-br from-green-500/15 to-green-500/5 text-green-600 ring-1 ring-green-500/20 group-hover:ring-green-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-green-700 transition-colors duration-300">
                      Document Issuer
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
                      Issue and certify official documents. For authorized institutions and organizations.
                    </p>
                  </div>
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      disabled={isProcessing}
                      className="w-full text-sm sm:text-base border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:text-green-600 group-hover:border-green-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing && selectedRole === 'ISSUER_ROLE' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Request Issuer Access</span>
                          <span className="sm:hidden">Issuer</span>
                          <CheckCircle2 className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Verifier Role Card */}
              <Card
                onClick={() => !isProcessing && handleRoleSelection('VERIFIER_ROLE')}
                className={`group relative p-4 sm:p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/5 hover:border-blue-500/30 hover:shadow-md transition-all duration-300 overflow-hidden ${
                  isProcessing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-0 right-0 p-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors duration-300 ring-4 ring-blue-500/10 group-hover:ring-blue-500/20" />
                </div>

                <div className="space-y-3 sm:space-y-4 relative z-10">
                  <div className="p-3 w-fit rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/5 text-blue-600 ring-1 ring-blue-500/20 group-hover:ring-blue-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-blue-700 transition-colors duration-300">
                      Document Verifier
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
                      Verify document authenticity and validity. For compliance and verification services.
                    </p>
                  </div>
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      disabled={isProcessing}
                      className="w-full text-sm sm:text-base border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:text-blue-600 group-hover:border-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing && selectedRole === 'VERIFIER_ROLE' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Request Verifier Access</span>
                          <span className="sm:hidden">Verifier</span>
                          <CheckCircle2 className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
              <DialogFooter className="pt-2">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    disabled={isProcessing}
                    className="border-border/60 text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
