const fs = require('fs');
const path = require('path');

Promise.all([
    import('imagemin'),
    import('imagemin-webp'),
    import('imagemin-pngquant')
]).then(([imagemin, imageminWebp, imageminPngquant]) => {
    const imageminJpegtran = require('imagemin-jpegtran');

    const sourceDir = 'src/images/original';
    const outputDir = 'src/images/optimized';
    const excludedImages = ['airsoft.jpg', 'airsoft2.jpg', 'airsoft3.jpg'];

    // Function to check if a file is a PNG or JPG
    function isPNGorJPG(filename) {
        return filename.endsWith('.png') || filename.endsWith('.jpg');
    }

    // Function to check if a file is a WebP
    function isWebP(filename) {
        return filename.endsWith('.webp');
    }

    // Function to optimize and convert image to WebP
    async function optimizeImage(inputPath, outputPath) {
        await imagemin.default([inputPath], {
            destination: outputDir,
            plugins: [
                imageminJpegtran(), 
                imageminPngquant.default({ quality: [0.6, 0.8] }),
                imageminWebp.default({
                    quality: 50
                })
            ]
        });
    }

    // Function to optimize all images in source directory
    async function optimizeImages() {
        const files = fs.readdirSync(sourceDir);
        for (const file of files) {
            if (excludedImages.includes(file)) continue;
            const inputPath = path.join(sourceDir, file);
            const outputPath = path.join(outputDir, file);
            if (isPNGorJPG(file) || isWebP(file)) {
                await optimizeImage(inputPath, outputPath);
            } else {
                // If it's not a PNG or JPG, simply copy it to the output directory
                fs.copyFileSync(inputPath, outputPath);
            }
        }
    }

    // Run optimization
    optimizeImages().then(() => {
        console.log('Optimization complete!');
    }).catch(error => {
        console.error('Error optimizing images:', error);
    });
}).catch(error => {
    console.error('Error importing modules:', error);
});
