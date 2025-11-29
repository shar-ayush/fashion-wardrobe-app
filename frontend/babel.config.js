module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Worklets plugin MUST be first
      "react-native-worklets/plugin",

      // Reanimated plugin MUST be last and MUST be uniquely named
      [
        "react-native-reanimated/plugin",
        {},
        "reanimated"
      ],
    ],
  };
};
