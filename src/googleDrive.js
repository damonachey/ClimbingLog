const API_BASE = "https://www.googleapis.com/drive/v3";
const UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";
const FOLDER_NAME = "ClimbingLog";
const FILE_NAME = "ticks.csv";
const FOLDER_ID_KEY = "climbing-log:driveFolderId";
const FILE_ID_KEY = "climbing-log:driveFileId";
const FOLDER_MIME = "application/vnd.google-apps.folder";

function extractErrorMessage(body) {
  try {
    return JSON.parse(body).error?.message ?? null;
  } catch {
    return null;
  }
}

async function driveFetch(token, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const message = extractErrorMessage(body) ?? response.statusText;
    const error = new Error(`Drive API request failed: ${response.status} ${message}`);
    error.status = response.status;
    throw error;
  }
  return response;
}

async function fileExists(token, id) {
  try {
    const res = await driveFetch(token, `${API_BASE}/files/${id}?fields=id,trashed`);
    const data = await res.json();
    return !data.trashed;
  } catch {
    return false;
  }
}

async function findFile(token, query) {
  const params = new URLSearchParams({ q: query, spaces: "drive", fields: "files(id,name)" });
  const res = await driveFetch(token, `${API_BASE}/files?${params}`);
  const data = await res.json();
  return data.files?.[0] ?? null;
}

async function createFile(token, metadata) {
  const res = await driveFetch(token, `${API_BASE}/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  return res.json();
}

async function getOrCreateFolderId(token) {
  const cached = localStorage.getItem(FOLDER_ID_KEY);
  if (cached && (await fileExists(token, cached))) return cached;

  const query = `name='${FOLDER_NAME}' and mimeType='${FOLDER_MIME}' and trashed=false`;
  const existing = await findFile(token, query);
  const id = existing?.id ?? (await createFile(token, { name: FOLDER_NAME, mimeType: FOLDER_MIME })).id;
  localStorage.setItem(FOLDER_ID_KEY, id);
  return id;
}

async function getOrCreateFileId(token, folderId) {
  const cached = localStorage.getItem(FILE_ID_KEY);
  if (cached && (await fileExists(token, cached))) return cached;

  const query = `name='${FILE_NAME}' and '${folderId}' in parents and trashed=false`;
  const existing = await findFile(token, query);
  let id = existing?.id;
  if (!id) {
    id = (await createFile(token, { name: FILE_NAME, parents: [folderId], mimeType: "text/csv" })).id;
    await uploadFile(token, id, "");
  }
  localStorage.setItem(FILE_ID_KEY, id);
  return id;
}

export async function ensureTicksFileId(token) {
  const folderId = await getOrCreateFolderId(token);
  return getOrCreateFileId(token, folderId);
}

export async function downloadFile(token, fileId) {
  const res = await driveFetch(token, `${API_BASE}/files/${fileId}?alt=media`);
  return res.text();
}

export async function uploadFile(token, fileId, text) {
  await driveFetch(token, `${UPLOAD_BASE}/files/${fileId}?uploadType=media`, {
    method: "PATCH",
    headers: { "Content-Type": "text/csv" },
    body: text,
  });
}
