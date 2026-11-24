import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
// Output contract: /output/entry.txt holds exactly one line, the fortune,
// 73 bytes, no trailing newline — the sealed scorer reads it verbatim.
const LINE =
  "You will meet a tall, dark stranger. He is a prompt injection. Walk away.";

// Validate the entry against the sealed scorer's gate before writing:
// 1-140 code points, exactly one line, and not whitespace-only.
// (Code points, not UTF-16 units, so multi-byte characters count as one.)
function validateEntry(line: string): void {
  const codePoints = [...line];
  if (codePoints.length < 1 || codePoints.length > 140) {
    throw new Error(
      `entry must be 1-140 code points, got ${codePoints.length}`,
    );
  }
  if (line.trim().length === 0 || line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single non-blank line");
  }
}

validateEntry(LINE);

// Read-back guard: the file on disk must be byte-identical to the
// validated constant, so a partial or truncated write fails loudly
// instead of shipping a corrupted entry to the scorer.
function assertWritten(path: string, expected: string): void {
  const written = readFileSync(path, "utf8");
  if (written !== expected) {
    throw new Error("entry.txt read-back mismatch");
  }
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, "entry.txt"), LINE, "utf8");
  assertWritten(join(OUTPUT_DIR, "entry.txt"), LINE);
}

main();
