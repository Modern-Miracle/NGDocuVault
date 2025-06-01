import { fetchUserProfile } from '@docu/auth/actions';

interface User {
  address: string;
  name?: string;
  avatar?: string;
  did?: string;
  role?: string;
}

/**
 * Server Component for User Profile
 * Demonstrates direct server action usage in a server component
 */
export async function UserProfile() {
  // Fetch user data directly from server action
  const userData = await fetchUserProfile<User>();

  if (!userData) {
    return <div className="p-4 rounded-lg bg-red-50 text-red-700">User profile not available</div>;
  }

  // Ensure address is available to prevent TypeError
  if (!userData.address) {
    return <div className="p-4 rounded-lg bg-yellow-50 text-yellow-700">User address not available</div>;
  }

  return (
    <div className="p-6 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-4">
        {userData.avatar ? (
          <img src={userData.avatar} alt={userData.name || 'User avatar'} className="w-12 h-12 rounded-full" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {userData.name?.charAt(0) || userData.address.charAt(2) || '?'}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold">{userData.name || 'Anonymous User'}</h3>
          <p className="text-sm text-gray-500">{userData.address}</p>
          {userData.role && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
              {userData.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
