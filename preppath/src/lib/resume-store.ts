const RESUME_KEY = "preppath-resume";
const RESUME_NAME_KEY = "preppath-resume-name";
const RESUME_TYPE_KEY = "preppath-resume-type";

export async function saveResume(file: File): Promise<void> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  localStorage.setItem(RESUME_KEY, base64);
  localStorage.setItem(RESUME_NAME_KEY, file.name);
  localStorage.setItem(RESUME_TYPE_KEY, file.type || "application/pdf");
}

export function getSavedResume(): File | null {
  const base64 = localStorage.getItem(RESUME_KEY);
  const name = localStorage.getItem(RESUME_NAME_KEY);
  const type = localStorage.getItem(RESUME_TYPE_KEY);

  if (!base64 || !name) return null;

  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], name, { type: type || "application/pdf" });
  } catch {
    clearSavedResume();
    return null;
  }
}

export function getSavedResumeName(): string | null {
  return localStorage.getItem(RESUME_NAME_KEY);
}

export function clearSavedResume(): void {
  localStorage.removeItem(RESUME_KEY);
  localStorage.removeItem(RESUME_NAME_KEY);
  localStorage.removeItem(RESUME_TYPE_KEY);
}
