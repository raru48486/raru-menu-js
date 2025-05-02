import { resolve } from 'path';
import { defineConfig } from 'vite';

const libraryName = 'rarumenu';
const libraryFileName = 'raru-menu'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/raru-menu.js'),
            name: libraryName,
            fileName: (format) => `${libraryFileName}.${format}.js`,
            cssFileName: libraryFileName,
        },
        sourcemap:true,
    },
});
