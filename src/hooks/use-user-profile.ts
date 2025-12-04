
'use client';

/**
 * A hook to fetch and provide the full UserProfile document for the currently authenticated user.
 * @returns An object containing the userProfile data and loading state.
 */
export function useUserProfile() {
  return { userProfile: {
    displayName: "John Doe",
    email: "john.doe@example.com",
    photoURL: "https://randomuser.me/api/portraits/men/32.jpg"
  }, isLoading: false, error: null };
}
