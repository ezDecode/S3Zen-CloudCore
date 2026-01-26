/**
 * DiagonalSeparator Component
 * Diagonal striped pattern matching ncdai design system
 * Used as visual divider between sections
 */

export const DiagonalSeparator = ({ className = '', height = 'h-10' }) => {
    return (
        <div
            className={`relative flex ${height} w-full border-x border-edge ${className}`}
            style={{
                backgroundImage: 'repeating-linear-gradient(315deg, var(--pattern-foreground) 0, var(--pattern-foreground) 1px, transparent 0, transparent 50%)',
                backgroundSize: '10px 10px',
            }}
        >
            <div
                className="absolute -left-[100vw] top-0 w-[200vw] h-full -z-1"
                style={{
                    backgroundImage: 'repeating-linear-gradient(315deg, var(--pattern-foreground) 0, var(--pattern-foreground) 1px, transparent 0, transparent 50%)',
                    backgroundSize: '10px 10px',
                    opacity: 0.56,
                }}
            />
        </div>
    );
};

export default DiagonalSeparator;
