import path from "node:path";
import { getDefaultConfig, mergeConfig } from "@react-native/metro-config";

const projectRoot = import.meta.dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = {
  projectRoot,
  resolver: {
    unstable_enableSymlinks: true,
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(workspaceRoot, "node_modules")
    ]
  },
  watchFolders: [workspaceRoot]
};

export default mergeConfig(getDefaultConfig(projectRoot), config);
