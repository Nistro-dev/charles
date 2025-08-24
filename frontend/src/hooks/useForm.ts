import { useState, useCallback } from 'react';
import { useForm as useReactHookForm, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface UseFormOptions<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
}

interface UseFormReturn<T extends FieldValues> {
  isSubmitting: boolean;
  submitError: string | null;
  clearSubmitError: () => void;
  handleSubmitWithError: (onSubmit: (data: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>;
}

export function useForm<T extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onSubmit',
}: UseFormOptions<T>): UseFormReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useReactHookForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode,
  });

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const handleSubmitWithError = useCallback(
    (onSubmit: (data: T) => Promise<void>) =>
      async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        setSubmitError(null);

        try {
          const isValid = await form.trigger();
          if (!isValid) {
            return;
          }

          const data = form.getValues();
          await onSubmit(data);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
          setSubmitError(errorMessage);
        } finally {
          setIsSubmitting(false);
        }
      },
    [form]
  );

  // Clear submit error when form values change
  const originalWatch = form.watch;
  form.watch = useCallback(
    (name?: Path<T> | Path<T>[]) => {
      if (submitError) {
        clearSubmitError();
      }
      return originalWatch(name as any);
    },
    [originalWatch, submitError, clearSubmitError]
  ) as any;

  return {
    ...form,
    isSubmitting,
    submitError,
    clearSubmitError,
    handleSubmitWithError,
  };
} 