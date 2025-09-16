import { useToast } from './use-toast';

export function useImageUpload() {
  const { toast } = useToast();

  const uploadImage = async (blobInfo: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', blobInfo.blob(), blobInfo.filename());

      // Upload to Postimages.org
      fetch('https://postimages.org/json/rr', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 200 && data.url) {
          toast({
            title: "Image uploaded successfully",
            description: "Your image has been uploaded and inserted into the editor.",
          });
          resolve(data.url);
        } else {
          const errorMessage = "Image upload failed. Please try again.";
          toast({
            title: "Upload failed",
            description: errorMessage,
            variant: "destructive",
          });
          reject(errorMessage);
        }
      })
      .catch((error) => {
        console.error('Image upload failed:', error);
        const errorMessage = "Image upload failed. Please check your connection and try again.";
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive",
        });
        reject(errorMessage);
      });
    });
  };

  return { uploadImage };
}
