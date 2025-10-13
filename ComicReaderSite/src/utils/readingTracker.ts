// Demo function to show how to track reading progress
// Call this function when a user reads a chapter of a comic

export async function trackReadingProgress(
    comicId: string,
    comicTitle: string,
    comicCover: string,
    currentChapter: number,
    totalChapters: number
) {
    try {
        const response = await fetch('/api/reading', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                comicId,
                comicTitle,
                comicCover,
                chapter: currentChapter,
                totalChapters
            }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('Reading progress updated:', data.data);

            // Show notification if completed
            if (data.data.isCompleted) {
                console.log(`🎉 Congratulations! You've completed "${comicTitle}"!`);
            }

            return data.data;
        } else {
            console.error('Failed to update reading progress:', data.message);
        }
    } catch (error) {
        console.error('Error tracking reading progress:', error);
    }
}

// Example usage:
// When user finishes reading chapter 25 of Naruto (out of 72 total chapters):
// trackReadingProgress('comic_2', 'Naruto', 'https://example.com/naruto-cover.jpg', 25, 72);

// When user finishes the last chapter:
// trackReadingProgress('comic_1', 'One Piece', 'https://example.com/onepiece-cover.jpg', 1100, 1100);
