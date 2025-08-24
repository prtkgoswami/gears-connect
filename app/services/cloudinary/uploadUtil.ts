const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

export const uploadImage = async (file: File): Promise<string> => {
  const base64 = await fileToBase64(file);

  const res = await fetch("/api/uploadImage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: base64 }),
  });

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.url as string;
};

export const deleteImages = async (urlList: string[]): Promise<void> => {
  console.log("Deleteing images", urlList);

  const res = await fetch("/api/deleteImages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls: urlList }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete images");
  }
};
