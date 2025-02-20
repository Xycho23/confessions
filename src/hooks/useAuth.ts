import { useState, useEffect } from 'react';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            // Simulate an authentication check
            const authStatus = await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 1000));
            setIsAuthenticated(authStatus);
            if (authStatus) {
                setUser({ name: 'John Doe' }); // Simulate user data
            }
        };

        checkAuth();
    }, []);

    return { isAuthenticated, user };
}
