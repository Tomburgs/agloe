import { AppProps } from 'next/app';
import { useEffectOnce } from 'react-use';
import { useRouter } from 'next/router';
import mixpanel from 'mixpanel-browser';
import 'styles/_main.scss';

const mixpanelAppToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const isDevelopment = process.env.NODE_ENV === 'development';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter();

  useEffectOnce(() => {
    if (!mixpanelAppToken) {
      return;
    }

    mixpanel.init(mixpanelAppToken, { debug: isDevelopment });

    const isUserOptedIn = mixpanel.has_opted_in_tracking() === true;
    const isUserOptedOut = mixpanel.has_opted_out_tracking() === true;
    const isPreferenceSet = isUserOptedIn || isUserOptedOut;

    if (!isPreferenceSet) {
      router.replace('/accept');
    }
  });

  return <Component {...pageProps} />;
}
