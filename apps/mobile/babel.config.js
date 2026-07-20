export default {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "babel-plugin-import",
      {
        libraryName: "lucide-react-native",
        libraryDirectory: "dist/cjs/icons",
        camel2DashComponentName: true
      }
    ]
  ]
};
