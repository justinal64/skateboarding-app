
// Deterministic mock images for tricks
// In a real app, these would come from the database (trick.image_url)

export const getTrickImage = (trickId: string) => {
    // Use picsum with a seed based on ID to ensure the same trick always has the same image
    // size 600x600 for good quality
    return `https://picsum.photos/seed/${trickId}/600/600`;
};
