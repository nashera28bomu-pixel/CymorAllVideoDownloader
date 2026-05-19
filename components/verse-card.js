/**
 * Cymor Bible App - Verse Card Component
 * Created by Legendary Smiley Cymor
 */

import { ShareEngine } from './share.js';

export const VerseCard = {
    /**
     * Creates a standard verse card HTML string
     * @param {string} text - The verse body
     * @param {string} ref - The book and chapter (e.g., John 3:16)
     * @param {boolean} isPremium - Whether to use the home page glass style
     */
    render(text, ref, isPremium = true) {
        const styleClasses = isPremium 
            ? "glass rounded-[32px] p-8 relative overflow-hidden" 
            : "bg-slate-900/40 border border-slate-800 rounded-2xl p-6";

        return `
            <div class="verse-card ${styleClasses}">
                ${isPremium ? '<div class="absolute top-0 left-0 w-1 h-16 bg-blue-500 mt-10"></div>' : ''}
                
                <p class="text-[10px] font-bold tracking-[0.2em] text-blue-400 uppercase mb-6">
                    Scripture Focus
                </p>

                <p class="text-xl leading-relaxed font-serif italic text-slate-100 mb-6">
                    "${text}"
                </p>

                <p class="text-blue-400 font-semibold mb-8">${ref}</p>

                <div class="flex gap-3">
                    <button onclick="VerseCard.handleShare('${ref}', '${text.replace(/'/g, "\\'")}')" 
                        class="flex-1 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-900/40">
                        Share Image
                    </button>

                    <button onclick="VerseCard.copyToClipboard('${text.replace(/'/g, "\\'")}')" 
                        class="w-14 bg-slate-800 rounded-2xl flex items-center justify-center active:scale-90 transition-transform">
                        📋
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Triggers the beautiful image share engine
     */
    async handleShare(ref, text) {
        try {
            await ShareEngine.shareAsImage(ref, text);
        } catch (error) {
            console.error("Verse sharing failed", error);
        }
    },

    /**
     * Quick copy to clipboard
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Verse copied to clipboard!");
        });
    }
};

// Expose to window so inline onclick handlers can find it
window.VerseCard = VerseCard;
