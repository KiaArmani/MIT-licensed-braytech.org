import React from 'react';

// This was moved from utils/errorHandler as it was specific to the profile
// picker, but these error components could easily be made re-usable.

const BungieError = props => {
  const { code, status, message } = props;

  return (
    <div className='error'>
      <div className='sub-header sub'>
        <div>Error from Bungie</div>
      </div>
      <p>
        Error {code}: {status}
      </p>
      <p>{message}</p>
    </div>
  );
};

// Test by looking up 'mpHasFlavour' (no numbers), as this is an
// old Playstation account that has now moved to PC for Destiny 2.
const NoDestinyAccountError = () => (
  <div className='error'>
    <div className='sub-header sub'>
      <div>No Destiny Account Found</div>
    </div>
    <p>This Bungie account doesn't have any Destiny 2 characters</p>
  </div>
);

const PrivateProfileError = () => (
  <div className='error'>
    <div className='sub-header sub'>
      <div>Profile privacy</div>
    </div>
    <p>Your profile data may be set to private on Bungie.net.</p>
    <p>
      You can check here{' '}
      <a href='https://www.bungie.net/en/Profile/Settings?category=Privacy' target='_blank' rel='noopener noreferrer'>
        https://www.bungie.net&hellip;
      </a>{' '}
      Look for <em>Show my Progression (what I've completed in Destiny, and my current status)</em>.
    </p>
    <p>If I'm mistaken, I apologise. This error is generated when character progression data is unavailable, and this is the most likely cause.</p>
  </div>
);

const GenericError = () => (
  <div className='error'>
    <div className='sub-header sub'>
      <div>Don't touch my stuff</div>
    </div>
    <p>There was an unspecified error. It's pretty rude to break someone else's stuff like this...</p>
  </div>
);

const ProfileError = props => {
  const { error } = props;

  if (error.errorCode && error.errorCode === 1601) {
    return <NoDestinyAccountError />;
  }

  if (error.errorCode && error.errorStatus && error.message) {
    return <BungieError code={error.errorCode} status={error.errorStatus} message={error.message} />;
  }

  if (error.message === 'private') {
    return <PrivateProfileError />;
  }

  return <GenericError />;
};

export default ProfileError;
