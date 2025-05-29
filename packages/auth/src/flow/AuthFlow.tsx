import React, { useReducer, useCallback, useEffect } from 'react';
import { FlowConfig, FlowState, FlowAction } from './index';

const initialFlowState: FlowState = {
  currentStep: 0,
  completedSteps: new Set(),
  stepData: {},
  isLoading: false,
  error: null,
};

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'NEXT_STEP':
      const nextStep = Math.min(state.currentStep + 1, state.completedSteps.size);
      return {
        ...state,
        currentStep: nextStep,
        stepData: action.payload ? { ...state.stepData, [state.currentStep]: action.payload } : state.stepData,
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
      };

    case 'GOTO_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.payload, state.completedSteps.size)),
      };

    case 'COMPLETE_STEP':
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(action.payload.step);
      return {
        ...state,
        completedSteps: newCompletedSteps,
        stepData: action.payload.data 
          ? { ...state.stepData, [action.payload.step]: action.payload.data }
          : state.stepData,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'RESET_FLOW':
      return initialFlowState;

    default:
      return state;
  }
}

interface AuthFlowProps {
  config: FlowConfig;
  className?: string;
}

export function AuthFlow({ config, className = '' }: AuthFlowProps) {
  const [state, dispatch] = useReducer(flowReducer, initialFlowState);

  const {
    steps,
    onComplete,
    onError,
    onStepChange,
    allowBackNavigation = true,
    showProgress = true,
  } = config;

  // Notify parent of step changes
  useEffect(() => {
    onStepChange?.(state.currentStep);
  }, [state.currentStep, onStepChange]);

  // Handle flow completion
  useEffect(() => {
    if (state.currentStep >= steps.length && state.completedSteps.size === steps.length) {
      onComplete?.();
    }
  }, [state.currentStep, state.completedSteps.size, steps.length, onComplete]);

  // Handle errors
  useEffect(() => {
    if (state.error) {
      onError?.(new Error(state.error));
    }
  }, [state.error, onError]);

  const nextStep = useCallback((data?: any) => {
    // Mark current step as completed
    dispatch({ type: 'COMPLETE_STEP', payload: { step: state.currentStep, data } });
    
    // Move to next step if not at the end
    if (state.currentStep < steps.length - 1) {
      dispatch({ type: 'NEXT_STEP', payload: data });
    }
  }, [state.currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (allowBackNavigation && state.currentStep > 0) {
      dispatch({ type: 'PREV_STEP' });
    }
  }, [allowBackNavigation, state.currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      dispatch({ type: 'GOTO_STEP', payload: stepIndex });
    }
  }, [steps.length]);

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const resetFlow = useCallback(() => {
    dispatch({ type: 'RESET_FLOW' });
  }, []);

  // Render progress indicator
  const renderProgress = () => {
    if (!showProgress) return null;

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isActive = index === state.currentStep;
          const isCompleted = state.completedSteps.has(index);
          const isPastCompleted = index < state.currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                  ${isActive 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : isCompleted || isPastCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-gray-100 text-gray-500'
                  }
                  ${allowBackNavigation && (isCompleted || isPastCompleted) ? 'cursor-pointer' : ''}
                `}
                onClick={() => {
                  if (allowBackNavigation && (isCompleted || isPastCompleted)) {
                    goToStep(index);
                  }
                }}
              >
                {isCompleted && !isActive ? '✓' : index + 1}
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`
                    h-0.5 w-16 mx-2
                    ${isPastCompleted || isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const currentStepData = steps[state.currentStep];
  if (!currentStepData) {
    return null;
  }

  const StepComponent = currentStepData.component;

  return (
    <div className={`auth-flow ${className}`}>
      {renderProgress()}
      
      <div className="step-content">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
          <p className="text-gray-600 mt-1">{currentStepData.description}</p>
        </div>

        {state.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{state.error}</p>
            <button
              onClick={clearError}
              className="text-red-600 text-xs underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        <StepComponent
          nextStep={nextStep}
          prevStep={prevStep}
          goToStep={goToStep}
          setError={setError}
          clearError={clearError}
          setLoading={setLoading}
          resetFlow={resetFlow}
          isLoading={state.isLoading}
          canGoBack={allowBackNavigation && state.currentStep > 0}
          canSkip={currentStepData.canSkip}
          stepData={state.stepData[state.currentStep]}
          allStepData={state.stepData}
          currentStepIndex={state.currentStep}
          totalSteps={steps.length}
        />
      </div>
    </div>
  );
}