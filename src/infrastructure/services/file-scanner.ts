import fg from "fast-glob";

export interface ScanOptions {
  only?: string;
  exclude?: string;
}

// Binary and non-text files to ignore by default
const DEFAULT_IGNORE = [
  "**/*.png",
  "**/*.jpg",
  "**/*.jpeg",
  "**/*.gif",
  "**/*.webp",
  "**/*.ico",
  "**/*.svg",
  "**/*.pdf",
  "**/*.zip",
  "**/*.tar",
  "**/*.gz",
  "**/*.exe",
  "**/*.dll",
  "**/*.so",
  "**/*.dylib",
  "**/*.woff",
  "**/*.woff2",
  "**/*.ttf",
  "**/*.eot",
  "**/*.mp3",
  "**/*.mp4",
  "**/*.wav",
  "**/*.avi",
  "**/*.mov",
  "**/node_modules/**",
  "**/.git/**",
  "**/.DS_Store",
];

export async function scanTemplates(inputDir: string, options: ScanOptions = {}): Promise<string[]> {
  const pattern = options.only ? `${inputDir}/${options.only}` : `${inputDir}/**/*`;

  const ignore = [
    ...DEFAULT_IGNORE.map((p) => `${inputDir}/${p}`),
    ...(options.exclude ? [`${inputDir}/${options.exclude}`] : []),
  ];

  return fg(pattern, { ignore, onlyFiles: true });
}
