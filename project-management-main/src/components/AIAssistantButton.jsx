import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { aiService } from "../services/ai";
import toast from "react-hot-toast";

export default function AIAssistantButton({ onGenerate, context, type = "description" }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            const prompt = type === "description"
                ? `Write a professional 2-3 sentence project description for a project named "${context}".`
                : context;

            const result = await aiService.generateContent(prompt);
            onGenerate(result);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded transition-colors disabled:opacity-50"
            title="Generate with AI"
        >
            {isGenerating ? (
                <Loader2 className="size-3 animate-spin" />
            ) : (
                <Sparkles className="size-3" />
            )}
            AI Assist
        </button>
    );
}
