import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import vitePluginExternal from 'vite-plugin-external';

export default defineConfig({
    plugins: [
        tsconfigPaths(),
        dts({
            exclude: "./src/Mumbo.spec.ts",
        }),
        vitePluginExternal({
            nodeBuiltins: true,
        })
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/Mumbo.ts"),
            name: "Mumbo",
            fileName: "Mumbo",
            formats: ["cjs"],
        },
    },
});
