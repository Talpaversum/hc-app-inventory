import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(projectRoot, "dist", "runtime-package");
const packageName = "hc-app-inventory-runtime.tar.gz";
const packagePath = path.join(outputDir, packageName);
const publicBaseUrl = (
  process.env.RUNTIME_PACKAGE_PUBLIC_BASE_URL ??
  "http://host.docker.internal:4020"
).replace(/\/$/, "");
const inputPaths = [
  "docker-compose.app.yml",
  "index.html",
  "package-lock.json",
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "manifest",
  "migrations",
  "src",
];

function writeOctal(buffer, offset, length, value) {
  const text = value.toString(8).padStart(length - 1, "0");
  buffer.write(text, offset, length - 1, "ascii");
  buffer[offset + length - 1] = 0;
}

function createTarEntry(relativePath, content) {
  const archivePath = relativePath.split(path.sep).join("/");
  if (Buffer.byteLength(archivePath) > 100) {
    throw new Error(`Runtime package path is too long for tar: ${archivePath}`);
  }

  const header = Buffer.alloc(512, 0);
  header.write(archivePath, 0, 100, "utf8");
  writeOctal(header, 100, 8, 0o644);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, content.length);
  writeOctal(header, 136, 12, 0);
  header.fill(" ", 148, 156);
  header.write("0", 156, 1, "ascii");
  header.write("ustar", 257, 5, "ascii");
  header.write("00", 263, 2, "ascii");

  let checksum = 0;
  for (const byte of header) checksum += byte;
  writeOctal(header, 148, 8, checksum);

  const padding = Buffer.alloc((512 - (content.length % 512)) % 512, 0);
  return Buffer.concat([header, content, padding]);
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
    .join(",")}}`;
}

async function collectFiles(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  const entries = await readdir(absolutePath, { withFileTypes: true }).catch(
    () => null,
  );
  if (entries === null) return [relativePath];

  const files = [];
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const childPath = path.join(relativePath, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(childPath)));
    else if (entry.isFile()) files.push(childPath);
    else throw new Error(`Unsupported runtime package entry: ${childPath}`);
  }
  return files;
}

const files = (await Promise.all(inputPaths.map(collectFiles))).flat().sort();
const tarEntries = [];
for (const file of files) {
  tarEntries.push(
    createTarEntry(file, await readFile(path.join(projectRoot, file))),
  );
}

const archive = gzipSync(
  Buffer.concat([...tarEntries, Buffer.alloc(1024, 0)]),
  { mtime: 0 },
);
const sha256 = createHash("sha256").update(archive).digest("hex");
const manifestPath = path.join(projectRoot, "manifest", "app-manifest.json");
const manifestContent = await readFile(manifestPath);
const manifest = JSON.parse(manifestContent.toString("utf8"));
const manifestSha256 = createHash("sha256")
  .update(stableStringify(manifest))
  .digest("hex");
const catalog = {
  catalog_version: 1,
  publisher: {
    name: "Talpaversum local development catalog",
  },
  items: [
    {
      app_id: manifest.app_id,
      name: manifest.app_name,
      version: manifest.version,
      manifest_url: `${publicBaseUrl}/.well-known/hc-app-manifest.json`,
      base_url: publicBaseUrl,
      manifest_sha256: manifestSha256,
      author_namespace: "talpaversum",
      license_required: manifest.licensing?.required === true,
      license_issuer_url: manifest.licensing?.issuer_url ?? null,
      deployment: {
        type: "compose",
        package_url: `${publicBaseUrl}/${packageName}`,
        package_sha256: sha256,
        compose_file: "docker-compose.app.yml",
        service_name: "inventory",
        internal_base_url: "http://inventory:4010",
      },
    },
  ],
};

await mkdir(outputDir, { recursive: true });
await writeFile(packagePath, archive);
await writeFile(`${packagePath}.sha256`, `${sha256}  ${packageName}\n`);
await writeFile(path.join(outputDir, "app-manifest.json"), manifestContent);
await writeFile(
  path.join(outputDir, "app-catalog.json"),
  `${JSON.stringify(catalog, null, 2)}\n`,
);

console.info(`Created ${path.relative(projectRoot, packagePath)}`);
console.info(`Catalog ${publicBaseUrl}/.well-known/hc/app-catalog.json`);
console.info(`SHA-256 ${sha256}`);
