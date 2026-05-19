/**
 * Cymor Bible App - Prayer Card Component
 * Created by Legendary Smiley Cymor
 */

import { ShareEngine } from './share.js';

export const PrayerCard = {
    /**
     * Renders a prayer card with the signature Cymor glass effect
     * @param {string} title - The title of the prayer
     * @param {string} text - The prayer content
     */
    render(title, text) {
        return `
            <div class="prayer-card glass rounded-[32px] p-6 transition-all duration-500">
                <div class="flex justify-between items-center mb-4">
                    <p class="text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">
                        Heart Prayer
                    </p>
                    <span class="text-xl">🙏</span>
                </div>

                <h3 class="text-lg font-bold mb-2 text-white">${title}</h3>
                <p class="text-slate-400 text-sm leading-relaxed italic mb-6">
                    "${text}"
                </p>

                <div class="flex gap-3">
                    <button onclick="PrayerCard.handleShare('${title}', '${text.replace(/'/g, "\\'")}')" 
                        class="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95">
                        Share Prayer Image
                    </button>
                    
                    <a href="prayer.html" class="w-12 bg-amber-600/10 border border-amber-600/20 rounded-2xl flex items-center justify-center text-amber-500 active:scale-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                    </a>
                </div>
            </div>
        `;
    },

    /**
     * Triggers the beautiful image share engine for prayers
     */
    async handleShare(title, text) {
        try {
            // We use the same ShareEngine but it will render the prayer text
            await ShareEngine.shareAsImage(`Prayer: ${title}`, text);
        } catch (error) {
            console.error("Prayer sharing failed", error);
        }
    }
};

// Expose to window for inline onclick handlers
window.PrayerCard = PrayerCard;
