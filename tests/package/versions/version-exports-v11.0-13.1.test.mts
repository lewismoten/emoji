import { verifyVersionContract } from "./version-exports-shared.mjs";

for (const version of ["11.0", "12.0", "12.1", "13.0", "13.1"]) {
  await verifyVersionContract(version);
}
