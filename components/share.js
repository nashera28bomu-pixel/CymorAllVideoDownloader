/**
 * Cymor Bible App - Share Component
 * Developed by Legendary Smiley Cymor
 */

export const ShareEngine = {
    /**
     * Generates a beautiful image of a verse or prayer
     * @param {string} title - The Reference or Title
     * @param {string} text - The main content
     */
    async shareAsImage(title, text) {
        // 1. Create a temporary hidden container for the share card
        const shareArea = document.createElement('div');
        shareArea.style.position = 'absolute';
        shareArea.style.left = '-9999px';
        shareArea.style.top = '0';
        
        // 2. Build the "Beautiful Image" HTML structure
        shareArea.innerHTML = `
            <div id="render-target" style="
                width: 1080px; 
                height: 1350px; 
                background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
                padding: 80px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                color: #F1F5F9;
                font-family: 'Inter', sans-serif;
            ">
                <div style="margin-bottom: 60px;">
                    <div style="background: #2563EB; width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; font-weight: bold; font-size: 40px; box-shadow: 0 20px 40px rgba(37, 99, 235, 0.3);">C</div>
                    <h1 style="font-size: 28px; letter-spacing: 4px; text-transform: uppercase; color: #64748B;">Cymor Bible App</h1>
                </div>

                <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
                    <p style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 64px; line-height: 1.3; margin-bottom: 40px;">
                        "${text}"
                    </p>
                    <h2 style="font-size: 36px; color: #60A5FA; font-weight: 600; letter-spacing: 2px;">
                        — ${title}
                    </h2>
                </div>

                <div style="margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.1); pt: 40px; width: 100%;">
                    <p style="font-size: 20px; color: #475569; letter-spacing: 1px;">
                        Designed by CymorTechServices
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(shareArea);

        try {
            const canvas = await html2canvas(document.querySelector("#render-target"), {
                backgroundColor: "#0F172A",
                scale: 2, // High resolution for sharing
                logging: false,
                useCORS: true
            });

            // Convert to blob for sharing
            canvas.toBlob(async (blob) => {
                const file = new File([blob], 'cymor-share.png', { type: 'image/png' });
                
                // Check if the browser supports Native Sharing (Mobile Chrome/Safari)
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Cymor Bible App Share',
                        text: `Check out this inspiration from Cymor Bible App.`
                    });
                } else {
                    // Fallback: Download the image
                    const link = document.createElement('a');
                    link.download = `Cymor-Bible-${title.replace(/\s+/g, '-')}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                }
                
                // Cleanup
                document.body.removeChild(shareArea);
            });
        } catch (err) {
            console.error("Share failed:", err);
            document.body.removeChild(shareArea);
        }
    }
};
