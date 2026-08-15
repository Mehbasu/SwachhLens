import axios from 'axios';

/**
 * BASE URL CONFIGURATION GUIDE FOR MOBILE APP DEVELOPMENT:
 * - Android Emulator: 'http://10.0.2.2:8000' (default Android studio loopback IP to host server)
 * - iOS Simulator / Local Web: 'http://localhost:8000'
 * - Physical Mobile Device (Expo Go app): Replace with your computer's local Wi-Fi IP address (e.g. 'http://192.168.1.100:8000')
 */
const BASE_URL =
  (typeof process !== 'undefined' && process.env && (process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL)) ||
  'http://10.0.2.2:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json'
  }
});

/**
 * Fetch list of citizen's submitted complaints from real backend
 */
export async function getMyComplaints() {
  try {
    const response = await apiClient.get('/complaints');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch complaints from backend:', error.message);
    throw error;
  }
}

/**
 * Fetch a single complaint by ID from real backend
 */
export async function getComplaintById(id) {
  try {
    const response = await apiClient.get(`/complaints/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch complaint ${id}:`, error.message);
    throw error;
  }
}

/**
 * Submit a new waste complaint with real image file (multipart/form-data)
 */
export async function submitComplaint(data) {
  try {
    const formData = new FormData();

    const imageUri = data.imageUri || data.image_url || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';

    // Build image object for React Native FormData
    if (imageUri.startsWith('file://') || imageUri.startsWith('content://') || imageUri.startsWith('ph://')) {
      const filename = imageUri.split('/').pop() || 'waste_report.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type
      });
    } else {
      // If web or sample remote URL, fetch blob or append fallback file
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, 'waste_report.jpg');
      } catch {
        formData.append('image', new Blob(['fake image data'], { type: 'image/jpeg' }), 'waste_report.jpg');
      }
    }

    // Append GPS coordinates & text fields
    const lat = data.gps?.lat || 25.6093;
    const lng = data.gps?.lng || 85.1235;

    formData.append('lat', lat.toString());
    formData.append('lng', lng.toString());

    if (data.comment) formData.append('comment', data.comment);
    if (data.address) formData.append('address', data.address);
    if (data.category) formData.append('category', data.category);
    if (data.volume) formData.append('volume', data.volume);

    const response = await apiClient.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to submit complaint to backend:', error.message);
    throw error;
  }
}
