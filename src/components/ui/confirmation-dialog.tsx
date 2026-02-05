'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  variant = 'destructive',
  loading = false
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              variant === 'destructive' 
                ? 'bg-red-100 text-red-600' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {variant === 'destructive' ? (
                <Trash2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <DialogDescription className="text-gray-600 leading-relaxed">
          {description}
        </DialogDescription>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easier usage
export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
  }>({
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const [loading, setLoading] = useState(false);

  const showConfirmation = (newConfig: typeof config) => {
    setConfig(newConfig);
    setIsOpen(true);
    setLoading(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await config.onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false);
    }
  };

  const ConfirmationDialogComponent = () => (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={config.title}
      description={config.description}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
      loading={loading}
    />
  );

  return {
    showConfirmation,
    ConfirmationDialog: ConfirmationDialogComponent,
    isLoading: loading,
  };
}