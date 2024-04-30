const API_URL = "http://localhost:8080";

export const findUserByUsername = async (username: string) => {
    try {
        const response = await fetch(`${API_URL}/users/by-username/${username}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error('Error fetching user by username:', err);
        return null; 
    }
}

export const findUserByEmail = async (email: string) => {
    try {
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(`${API_URL}/users/by-email?email=${encodedEmail}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error('Error fetching user by email:', err);
        return null;
    }
}
