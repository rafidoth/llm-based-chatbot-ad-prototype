"use client";

interface StreamingBubbleProps {
    content: string;
}

export function StreamingBubble({ content }: StreamingBubbleProps) {
    return (
        <div className="group py-5">
            <div className="mx-auto max-w-3xl px-4">
                <div className="flex gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="max-w-none text-sm">
                            <p className="whitespace-pre-wrap text-zinc-500 leading-7">
                                {content || ""}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
