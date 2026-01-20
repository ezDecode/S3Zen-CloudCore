/**
 * Neo-Brutalism Toaster
 * Custom toast notifications with bold styling
 */

import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => {
  return (
    <SonnerToaster
      position="bottom-right"
      expand={false}
      richColors={false}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: `
            flex items-center gap-3 p-4 
            bg-[var(--color-ink)] text-[var(--color-cream)]
            border-3 border-[var(--border-color)]
            shadow-[5px_5px_0_var(--border-color)]
            font-display font-medium
            min-w-[300px]
          `,
          title: 'font-bold uppercase tracking-wide',
          description: 'text-[var(--color-cream)]/80 text-sm',
          actionButton: `
            btn btn-primary btn-sm
          `,
          cancelButton: `
            btn btn-ghost btn-sm
          `,
          success: `
            !bg-[var(--color-success)] !text-[var(--color-ink)]
          `,
          error: `
            !bg-[var(--color-error)] !text-white
          `,
          warning: `
            !bg-[var(--color-warning)] !text-[var(--color-ink)]
          `,
          info: `
            !bg-[var(--color-blue)] !text-white
          `,
        },
      }}
    />
  );
};

export default Toaster;
