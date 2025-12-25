
/**
 * Compresses an image file and converts it to WebP format using client-side Canvas API.
 * 
 * @param file - The input image file (File object)
 * @param maxWidth - Maximum width for the resized image (default: 1200px)
 * @param quality - WebP quality (0 to 1, default: 0.8)
 * @returns Promise<string> - The base64 Data URL of the optimized WebP image
 */
export async function optimizeImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Draw image on canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Export as WebP
                // Note: toBlob is better for real uploads, but for localStorage mock we need DataURL
                const dataUrl = canvas.toDataURL('image/webp', quality);
                resolve(dataUrl);
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
}
