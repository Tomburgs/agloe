import { AppProps } from 'next/app';
import { useEffectOnce } from 'react-use';
import { useRouter } from 'next/router';
import { storage } from '../constants';
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

        const isAccepted = localStorage.getItem(storage.USAGE_TRACKING_ACCEPTED) === '1';

        if (!isAccepted) {
            router.push('/accept');
        }
    });

    return (
        <Component { ...pageProps } />
    );
}
