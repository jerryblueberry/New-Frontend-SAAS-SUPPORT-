import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getCurrentUser } from '../../api/auth';
import './css/Profile.css'
const Profile = () => {
  const { signOut } = useAuth();
  
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) {
        signOut();
        return false;
      }
      return failureCount < 2;
    }
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  if (isError) return <div className="profile-error-message">Error loading user data</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img 
            src={user.profilePicture} 
            alt={`${user.firstName} ${user.lastName}`} 
            className="profile-avatar"
          />
          <div className="profile-verification-badge">
            {user.isVerified ? (
              <span className="profile-badge-verified">Verified</span>
            ) : (
              <span className="profile-badge-pending">Pending</span>
            )}
          </div>
        </div>
        <h1 className="profile-title">
          {user.firstName} {user.lastName}
        </h1>
        <p className="profile-role">{user.role}</p>
      </div>

      <div className="profile-details-grid">
        <div className="profile-detail-card">
          <h2 className="profile-detail-title">Personal Information</h2>
          <div className="profile-detail-list">
            <div className="profile-detail-item">
              <span className="profile-detail-label">First Name</span>
              <span className="profile-detail-value">{user.firstName}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Last Name</span>
              <span className="profile-detail-value">{user.lastName}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Email</span>
              <span className="profile-detail-value">{user.email}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Phone</span>
              <span className="profile-detail-value">
                {user.phone || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-detail-card">
          <h2 className="profile-detail-title">Account Details</h2>
          <div className="profile-detail-list">
            <div className="profile-detail-item">
              <span className="profile-detail-label">Role</span>
              <span className="profile-detail-value">{user.role}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Member Since</span>
              <span className="profile-detail-value">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Status</span>
              <span className={`profile-detail-value ${user.isVerified ? 'text-success' : 'text-warning'}`}>
                {user.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;