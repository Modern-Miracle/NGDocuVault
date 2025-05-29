// Export all flow components
export * from './AuthFlow';
// TODO: Add these components when they are implemented
// export * from './DidCreationFlow';
// export * from './UserRoleSelection';
// export * from './AuthStatusCard';

// Flow step definitions
export interface FlowStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isOptional?: boolean;
  canSkip?: boolean;
}

export interface FlowConfig {
  steps: FlowStep[];
  onComplete?: () => void;
  onError?: (error: Error) => void;
  onStepChange?: (currentStep: number) => void;
  allowBackNavigation?: boolean;
  showProgress?: boolean;
}

export interface FlowState {
  currentStep: number;
  completedSteps: Set<number>;
  stepData: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

export type FlowAction =
  | { type: 'NEXT_STEP'; payload?: any }
  | { type: 'PREV_STEP' }
  | { type: 'GOTO_STEP'; payload: number }
  | { type: 'COMPLETE_STEP'; payload: { step: number; data?: any } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_FLOW' };