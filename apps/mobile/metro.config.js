import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDefaultConfig, mergeConfig } from "@react-native/metro-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = {
  projectRoot,
  resolver: {
    unstable_enableSymlinks: true,
    platforms: ["android", "ios", "native"],
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(workspaceRoot, "node_modules"),
    ],
  },
  watchFolders: [workspaceRoot],
};

export default mergeConfig(getDefaultConfig(projectRoot), config);