import { Credentials, User } from "./interface";

const API_BASE_URL = process.env.BASE_DATABASE_URL;

const headers = new Headers({
    'Content-Type': 'application/json'
});

export async function authenticateUser(credentials: Credentials) {
    const response = await fetch(`${API_BASE_URL}/User/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify(credentials)
    });

    if (!response.ok) {
        throw new Error('Authentication failed');
    }

    const user = await response.json();

    return {
        id: user.sub, // Ensure this matches the user ID in your database
        email: user.email,
        username: user.userName,
        token: user.token
    };
}

export async function getUserByEmail(email: string) {
    console.log(`Checking endpoint: ${API_BASE_URL}/User/email/${email}`)
    try {
        const response = await fetch(`${API_BASE_URL}/User/email/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error('Failed to fetch user');
        }

        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error in getUserByEmail:', error);
        throw error;
    }
}

export async function getUserById(userId: string, token: string) {
    console.log(`${API_BASE_URL}/User/${userId}`);
    try {
        const response = await fetch(`${API_BASE_URL}/User/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Use the token in the Authorization header
            }
        });

        if (!response.ok) {
            console.error(`Error fetching user: ${response.status} ${response.statusText}`);
            throw new Error('User not found');
        }

        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error in getUserById:', error);
        throw error;
    }
}

export const createUser = async (user: User): Promise<any> => {
    try {
        console.log("Sending payload to create user:", user);
        const response = await fetch(`${API_BASE_URL}/User/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            console.error("Failed to create user:", response.statusText);
            throw new Error(`Failed to create user: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error in createUser:", error);
        throw error;
    }
};