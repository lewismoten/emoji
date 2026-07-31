import {
  verifyAllEmojiContract,
  verifyVersionContract,
} from "./version-exports-shared.mjs";

await verifyAllEmojiContract();
for (const version of ["0.6", "0.7", "1.0", "2.0", "3.0", "4.0", "5.0"]) {
  await verifyVersionContract(version);
}
