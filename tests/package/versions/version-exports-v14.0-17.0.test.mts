import { verifyVersionContract } from "./version-exports-shared.mjs";

for (const version of ["14.0", "15.0", "15.1", "16.0", "17.0"]) {
  await verifyVersionContract(version);
}
