import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidFiles';

export async function downloadAndroidStudioProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root folder
  const root = zip.folder('MetalDetector-AndroidApp');
  if (!root) return;

  // Add all files
  for (const file of ANDROID_PROJECT_FILES) {
    root.file(file.path, file.content);
  }

  // Generate blob
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);

  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'MetalDetector-AndroidStudio-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
