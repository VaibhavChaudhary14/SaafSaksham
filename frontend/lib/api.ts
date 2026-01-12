const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function submitReport(file: File, location: { latitude: number, longitude: number }, category: string, description: string) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('location', JSON.stringify(location));
    formData.append('category', category);
    formData.append('description', description);

    const response = await fetch(`${API_URL}/api/reports/`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to submit report');
    }

    return response.json();
}
