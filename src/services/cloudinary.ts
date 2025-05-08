const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!cloudName || !uploadPreset) {
  throw new Error('Missing Cloudinary configuration');
}

interface CloudinaryResponse {
  url: string;
  public_id: string;
}

export async function uploadImage(file: File): Promise<CloudinaryResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'gallery');

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  console.log('Upload debug info:', {
    url,
    cloudName,
    uploadPreset,
    fileInfo: {
      name: file.name,
      type: file.type,
      size: file.size
    }
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error || data
      });
      throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
    }

    console.log('Upload successful:', {
      url: data.secure_url,
      publicId: data.public_id
    });

    return {
      url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof Error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
    throw error;
  }
}

export async function deleteCloudinaryImage(_publicId: string): Promise<void> {
  // Since we're using unsigned uploads, we can't delete images from the frontend
  // You'll need to implement this on your backend with proper authentication
  console.warn('Image deletion from Cloudinary requires backend implementation with proper authentication');
}