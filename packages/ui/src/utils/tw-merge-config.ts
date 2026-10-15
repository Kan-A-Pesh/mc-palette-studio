// AlignUI Typography Classes - Dynamic Pattern Matching

const typographyConfig = {
  title: ["h1", "h2", "h3", "h4", "h5", "h6"],
  label: ["xl", "lg", "md", "sm", "xs"],
  paragraph: ["xl", "lg", "md", "sm", "xs"],
  subheading: ["md", "sm", "xs", "2xs"],
  doc: ["label", "paragraph"],
  // Palette Studio sizes (apps/web globals.css `--text-st-*`)
  st: ["2xs", "xs", "sm", "md", "lg"],
};

const typographyPatterns = Object.entries(typographyConfig).flatMap(
  ([category, sizes]) => sizes.map((size) => `${category}-${size}`),
);

export const twMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [
        {
          text: typographyPatterns,
        },
      ],
    },
  },
};
