/**
 * Build script for Nexus AI Site
 * Generates optimized production files in /dist folder
 */

const fs = require('fs');
const path = require('path');

// Create dist folder
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true });
}
fs.mkdirSync(distPath);
fs.mkdirSync(path.join(distPath, 'i18n'));

// Copy and process files
async function build() {
    try {
        // Try to use minifiers if available
        let CleanCSS, minifyHTML, minifyJS;

        try {
            CleanCSS = require('clean-css');
        } catch (e) {
            console.log('clean-css not found, using raw CSS');
        }

        try {
            minifyHTML = require('html-minifier-terser').minify;
        } catch (e) {
            console.log('html-minifier-terser not found, using raw HTML');
        }

        try {
            const terser = require('terser');
            minifyJS = terser.minify;
        } catch (e) {
            console.log('terser not found, using raw JS');
        }

        // Process HTML
        let html = fs.readFileSync('index.html', 'utf8');
        if (minifyHTML) {
            html = await minifyHTML(html, {
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true,
                minifyJS: true
            });
        }
        fs.writeFileSync(path.join(distPath, 'index.html'), html);
        console.log('✓ index.html processed');

        // Process CSS
        let css = fs.readFileSync('styles.css', 'utf8');
        if (CleanCSS) {
            css = new CleanCSS({ level: 2 }).minify(css).styles;
        }
        fs.writeFileSync(path.join(distPath, 'styles.css'), css);
        console.log('✓ styles.css processed');

        // Process JS
        let js = fs.readFileSync('scripts.js', 'utf8');
        if (minifyJS) {
            const result = await minifyJS(js);
            js = result.code;
        }
        fs.writeFileSync(path.join(distPath, 'scripts.js'), js);
        console.log('✓ scripts.js processed');

        // Copy i18n files
        const i18nFiles = ['pt-BR.json', 'en.json', 'pt-PT.json'];
        for (const file of i18nFiles) {
            const content = fs.readFileSync(path.join('i18n', file), 'utf8');
            const minified = JSON.stringify(JSON.parse(content));
            fs.writeFileSync(path.join(distPath, 'i18n', file), minified);
        }
        console.log('✓ i18n files processed');

        // Calculate sizes
        const originalSize =
            fs.statSync('index.html').size +
            fs.statSync('styles.css').size +
            fs.statSync('scripts.js').size;

        const distSize =
            fs.statSync(path.join(distPath, 'index.html')).size +
            fs.statSync(path.join(distPath, 'styles.css')).size +
            fs.statSync(path.join(distPath, 'scripts.js')).size;

        console.log('\n📦 Build complete!');
        console.log(`   Original: ${(originalSize / 1024).toFixed(1)} KB`);
        console.log(`   Minified: ${(distSize / 1024).toFixed(1)} KB`);
        console.log(`   Saved: ${((1 - distSize / originalSize) * 100).toFixed(1)}%`);
        console.log('\n📁 Output: ./dist/');

    } catch (error) {
        console.error('Build error:', error);

        // Fallback: just copy files without minification
        console.log('\nFallback: copying files without minification...');
        fs.copyFileSync('index.html', path.join(distPath, 'index.html'));
        fs.copyFileSync('styles.css', path.join(distPath, 'styles.css'));
        fs.copyFileSync('scripts.js', path.join(distPath, 'scripts.js'));

        const i18nFiles = ['pt-BR.json', 'en.json', 'pt-PT.json'];
        for (const file of i18nFiles) {
            fs.copyFileSync(path.join('i18n', file), path.join(distPath, 'i18n', file));
        }

        console.log('✓ Files copied to dist/');
    }
}

build();
