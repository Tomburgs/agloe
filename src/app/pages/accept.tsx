import { useRouter } from 'next/router';
import { css } from 'otion';
import { colors } from 'styles/colors';
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

  const onSetTrackingPreference = (isTrackingAccepted: boolean) => () => {
    mixpanel[isTrackingAccepted ? 'opt_in_tracking' : 'opt_out_tracking']();
    router.push('/');
  };

  return (
    <main className={main}>
      <div className={root}>
        <h1 className={heading}>Hej! 👋</h1>
        <h2 className={subheading}>Usage & Analytics</h2>
        <p className={text}>
          We wanted to let you know that we use MixPanel to collect information
          about how you interact with Agloe.
          <br />
          <br />
          If you don't wish to share this information with us you can always use
          Agloe by cloning the GitHub repository and running it locally.
        </p>
        <div className={buttonGroup}>
          <button
            className={buttonReject}
            onClick={onSetTrackingPreference(false)}
          >
            Reject
          </button>
          <button
            className={buttonAccept}
            onClick={onSetTrackingPreference(true)}
          >
            Accept
          </button>
        </div>
      </div>
    </main>
  );
}
