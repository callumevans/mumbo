import path from "node:path";
import { resolve } from "path";
import { defineConfig } from "vite";
import { normalizePath } from "vite";
import dts from "vite-plugin-dts";
import vitePluginExternal from "vite-plugin-external";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        tsconfigPaths(),
        dts({
            exclude: "./src/Mumbo.spec.ts",
        }),
        vitePluginExternal({
            nodeBuiltins: true,
        }),
        viteStaticCopy({
            targets: [
                {
                    src: normalizePath(path.resolve(__dirname, "./package.json")),
                    dest: "./",
                },
            ],
        }),
    ],
    build: {
        minify: false,
        lib: {
            entry: resolve(__dirname, "src/Mumbo.ts"),
            name: "Mumbo",
            fileName: "Mumbo",
            formats: ["cjs"],
        },
    },
});
