import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            position="top-right"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-zinc-950 group-[.toaster]:text-white group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg group-[.toaster]:font-sans",
                    description: "group-[.toast]:text-zinc-400 group-[.toast]:font-sans",
                    actionButton:
                        "group-[.toast]:bg-blue-500 group-[.toast]:text-white group-[.toast]:font-sans",
                    cancelButton:
                        "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400 group-[.toast]:font-sans",
                },
                style: {
                    fontFamily: 'var(--font-sans)',
                },
            }}
            style={{
                zIndex: 200,
            }}
            {...props}
        />
    )
}

export { Toaster }
