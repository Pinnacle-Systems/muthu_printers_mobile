import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDefaultConfig, mergeConfig } from "@react-native/metro-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = {
  projectRoot,
  watchFolders: [workspaceRoot],
  resolver: {
    unstable_enableSymlinks: true,
    platforms: ["android", "ios", "native"],
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(workspaceRoot, "node_modules"),
    ],
   blockList: [
  /.*\/node_modules\/\.pnpm\/.*/,
  /.*\/\.git\/.*/,
  /(?!.*node_modules.*).*\/dist\/.*/,   // exclude node_modules from dist block
  /(?!.*node_modules.*).*\/build\/.*/,  // same for build
  /.*\/\.turbo\/.*/,
  /.*\/\.next\/.*/,
  /.*\/coverage\/.*/,
  /.*\/\.jest-cache\/.*/,
],
  },
  transformer: {
    unstable_allowRequireContext: true,
  },
  maxWorkers: 4,
};

export default mergeConfig(getDefaultConfig(projectRoot), config);