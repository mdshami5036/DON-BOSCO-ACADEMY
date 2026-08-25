import { ref, uploadBytesResumable, getDownloadURL, uploadString } from 'firebase/storage';
import { storage_bucket, isFirebaseConfigured } from '../lib/firebase';

/**
 * Upload a file (e.g. Student Photo, Logo, Signature) to Firebase Cloud Storage
 * @param path Storage path (e.g. 'branding/logo.png', 'students/photos/stu-001.jpg')
 * @param file File, Blob, or base64 data string
 * @returns Promise<string> Download URL of the uploaded asset
 */
export async function uploadFileToFirebase(
  path: string,
  file: File | Blob | string,
  contentType?: string
): Promise<string> {
  if (!isFirebaseConfigured) {
    console.warn('Firebase Storage not configured, falling back to data URL / local path');
    if (typeof file === 'string') return file;
    return URL.createObjectURL(file as Blob);
  }

  try {
    const storageRef = ref(storage_bucket, path);

    if (typeof file === 'string') {
      // Base64 data URL upload
      if (file.startsWith('data:')) {
        const snapshot = await uploadString(storageRef, file, 'data_url');
        return await getDownloadURL(snapshot.ref);
      }
      // Raw string upload
      const snapshot = await uploadString(storageRef, file, 'raw', { contentType: contentType || 'text/plain' });
      return await getDownloadURL(snapshot.ref);
    }

    // File / Blob upload
    const metadata = contentType ? { contentType } : undefined;
    const snapshot = await uploadBytesResumable(storageRef, file, metadata);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    if (typeof file === 'string') return file;
    return URL.createObjectURL(file as Blob);
  }
}
