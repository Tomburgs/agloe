import { useState } from 'react';
import { useRouter } from 'next/router';
import { css } from 'otion';
import { colors } from 'styles/colors';
import { storage } from '../constants';
import { typography } from 'styles/typography';
import mixpanel from 'mixpanel-browser';

const main = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  maxHeight: 600,
  textAlign: 'center',
});

const root = css({
  maxWidth: '500px',
});

const heading = css({
  color: typography.color.primary,
  fontWeight: 600,
  margin: 0,
});

const subheading = css({
  color: typography.color.primary,
  fontWeight: 600,
  margin: '12px 0',
});

const text = css({
  fontSize: typography.size[3],
  color: typography.color.primary,
  padding: '0 18px',
});

const buttonGroup = css({
  display: 'flex',
  justifyContent: 'center',
  marginTop: 20,
  gap: 20,
});

const button = {
  cursor: 'pointer',
  border: 0,
  borderRadius: 5,
  color: '#fff',
  fontSize: typography.size[4],
  height: 32,
  padding: '0 12px',
};

const buttonReject = css({
  ...button,
  color: '#000',
  backgroundColor: '#fafafa',
  border: '1px solid gray',
});

const buttonAccept = css({
  ...button,
  backgroundColor: colors.blue,
});

export default function Accept(): JSX.Element {
  const router = useRouter();
  const [isRejected, setIsRejected] = useState<boolean>(() => (
    typeof window !== 'undefined' && localStorage.getItem(storage.USAGE_TRACKING_ACCEPTED) === '0'
  ));

  const onRejectTracking = () => {
    localStorage.setItem(storage.USAGE_TRACKING_ACCEPTED, '0');
    setIsRejected(true);
  };

  const onAcceptTracking = () => {
    localStorage.setItem(storage.USAGE_TRACKING_ACCEPTED, '1');
    router.push('/');
    mixpanel.track('Tracking accepted');
  };

  return (
    <main className={main}>
      <div className={root}>
        {!isRejected ? (
          <>
            <h1 className={heading}>Hej! 👋</h1>
            <h2 className={subheading}>Usage & Analytics</h2>
            <p className={text}>
              We wanted to let you know that we use MixPanel to collect information about how you interact with Agloe.<br /><br />
              If you don't wish to share this information with us you can always use Agloe by cloning the GitHub repository and running it locally.
            </p>
            <div className={buttonGroup}>
              <button className={buttonReject} onClick={onRejectTracking}>
                Reject
              </button>
              <button className={buttonAccept} onClick={onAcceptTracking}>
                Accept
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>Tracking rejected 😵</h1>
            <p className={text}>
              You have opted-out of tracking. That's cool.<br/><br/>
              If you change your mind, click the button below.<br/>
              Otherwise feel free to clone the <a href="https://github.com/Tomburgs/agloe" rel="noreferrer" target="_blank">GitHub repository</a> and running the project locally by executing <code>`yarn && yarn dev`</code>.
            </p>
            <div className={buttonGroup}>
              <button className={buttonAccept} onClick={onAcceptTracking}>
                Accept tracking
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
