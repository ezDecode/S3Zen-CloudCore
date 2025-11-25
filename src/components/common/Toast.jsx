import { toast } from "sonner"
import { Toaster } from "../ui/sonner"

// Hook to use toast
export const useToast = () => {
    return toast;
};

// Provider component (now just renders the Toaster)
export const ToastProvider = ({ children }) => {
    return (
        <>
            {children}
            <Toaster />
        </>
    );
};

// Export toast directly for non-hook usage if needed
export { toast };
