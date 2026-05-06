import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const HOST_LANGUAGES = [
  { id: "javascript", label: "JavaScript", extensions: ["js"], scope: "source.js" },
  { id: "jsx", label: "JavaScript React", extensions: ["jsx"], scope: "source.jsx" },
  { id: "typescript", label: "TypeScript", extensions: ["ts"], scope: "source.ts" },
  { id: "tsx", label: "TypeScript React", extensions: ["tsx"], scope: "source.tsx" },
  { id: "sql", label: "SQL", extensions: ["sql"], scope: "source.sql" },
  { id: "java", label: "Java", extensions: ["java"], scope: "source.java" },
  { id: "go", label: "Go", extensions: ["go"], scope: "source.go" },
  { id: "rust", label: "Rust", extensions: ["rs"], scope: "source.rust" },
  { id: "python", label: "Python", extensions: ["py"], scope: "source.python" },
  { id: "csharp", label: "C#", extensions: ["cs"], scope: "source.cs" },
  { id: "cpp", label: "C++", extensions: ["cpp", "cc", "cxx", "hpp", "h"], scope: "source.cpp" },
  { id: "c", label: "C", extensions: ["c"], scope: "source.c" },
  { id: "php", label: "PHP", extensions: ["php"], scope: "source.php" },
  { id: "ruby", label: "Ruby", extensions: ["rb"], scope: "source.ruby" },
  { id: "kotlin", label: "Kotlin", extensions: ["kt"], scope: "source.kotlin" },
  { id: "swift", label: "Swift", extensions: ["swift"], scope: "source.swift" },
  { id: "html", label: "HTML", extensions: ["html"], scope: "text.html.basic" },
  { id: "css", label: "CSS", extensions: ["css"], scope: "source.css" },
  { id: "scss", label: "SCSS", extensions: ["scss"], scope: "source.css.scss" },
  { id: "json", label: "JSON", extensions: ["json"], scope: "source.json" },
  { id: "yaml", label: "YAML", extensions: ["yaml", "yml"], scope: "source.yaml" },
  { id: "markdown", label: "Markdown", extensions: ["md"], scope: "text.html.markdown" },
  { id: "dockerfile", label: "Dockerfile", extensions: ["dockerfile"], scope: "source.dockerfile" },
  { id: "shell", label: "Shell", extensions: ["sh", "bash", "zsh"], scope: "source.shell" }
];

const basePackagePath = path.join(ROOT, "package.base.json");
const packagePath = path.join(ROOT, "package.json");
const syntaxesDir = path.join(ROOT, "syntaxes", "wrappers");
const supportedPath = path.join(ROOT, "SUPPORTED_LANGUAGES.txt");

const basePackage = JSON.parse(await fs.readFile(basePackagePath, "utf8"));

await fs.mkdir(syntaxesDir, { recursive: true });

const baseLanguages = [
  {
    id: "codepurify",
    aliases: ["Codepurify", "codepurify"],
    extensions: [".codepurify", ".code"],
    configuration: "./config/language-configuration.json"
  }
];

const baseGrammars = [
  {
    language: "codepurify",
    scopeName: "source.codepurify",
    path: "./syntaxes/codepurify.tmLanguage.json"
  }
];

const generatedLanguages = [];
const generatedGrammars = [];

for (const lang of HOST_LANGUAGES) {
  const languageId = `codepurify-${lang.id}`;
  const scopeName = `${lang.scope}.codepurify`;
  const grammarPath = `./syntaxes/wrappers/codepurify-${lang.id}.tmLanguage.json`;

  generatedLanguages.push({
    id: languageId,
    aliases: [`Codepurify ${lang.label}`],
    extensions: lang.extensions.flatMap((ext) => [
      `.${ext}.codepurify`,
      `.${ext}.code` 
    ]),
    configuration: "./config/language-configuration.json"
  });

  generatedGrammars.push({
    language: languageId,
    scopeName,
    path: grammarPath
  });

  const grammar = {
    name: `Codepurify ${lang.label}`,
    scopeName,
    patterns: [
      { include: lang.scope },
      { include: "source.codepurify" }
    ]
  };

  await fs.writeFile(
    path.join(syntaxesDir, `codepurify-${lang.id}.tmLanguage.json`),
    `${JSON.stringify(grammar, null, 2)}\n` 
  );
}

basePackage.contributes ??= {};
basePackage.contributes.languages = [...baseLanguages, ...generatedLanguages];
basePackage.contributes.grammars = [...baseGrammars, ...generatedGrammars];

await fs.writeFile(packagePath, `${JSON.stringify(basePackage, null, 2)}\n`);

const supported = [
  "Codepurify Supported Languages",
  "",
  "Base extensions:",
  "- .codepurify",
  "- .code",
  "",
  "Host language template extensions:",
  ...HOST_LANGUAGES.flatMap((lang) => [
    "",
    `${lang.label}:`,
    ...lang.extensions.flatMap((ext) => [
      `- .${ext}.codepurify`,
      `- .${ext}.code` 
    ])
  ])
].join("\n");

await fs.writeFile(supportedPath, `${supported}\n`);

console.log("Generated package.json, wrapper grammars, and SUPPORTED_LANGUAGES.txt");
