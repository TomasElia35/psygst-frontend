import { Loader2 } from 'lucide-react';

export default function Loader({ text = 'Cargando...', fullScreen = false }) {
    const content = (
        <div className="flex flex-col items-center justify-center p-8 gap-3 text-[var(--text-muted)]">
            <Loader2 className="animate-spin" size={32} color="var(--accent)" />
            <p className="text-sm font-medium">{text}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
                {content}
            </div>
        );
    }

    return content;
}
