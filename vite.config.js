import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import vitePluginExternal from "vite-plugin-external";
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
