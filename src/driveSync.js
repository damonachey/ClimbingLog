import { parseTicks, serializeTicks } from "./parseCsv.js";
import { ensureTicksFileId, downloadFile, uploadFile } from "./googleDrive.js";

const PENDING_SYNC_KEY = "climbing-log:pendingSync";

export async function pullFromDrive(token) {
  const fileId = await ensureTicksFileId(token);
  const text = await downloadFile(token, fileId);
  return parseTicks(text);
}

export async function pushToDrive(token, ticks) {
  const fileId = await ensureTicksFileId(token);
  await uploadFile(token, fileId, serializeTicks(ticks));
}

export function isPendingSync() {
  return localStorage.getItem(PENDING_SYNC_KEY) === "1";
}

export function markPendingSync() {
  localStorage.setItem(PENDING_SYNC_KEY, "1");
}

export function clearPendingSync() {
  localStorage.removeItem(PENDING_SYNC_KEY);
}
