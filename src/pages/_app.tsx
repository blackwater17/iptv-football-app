import { AppProps } from 'next/app';
import Head from 'next/head';
import '../app/styles/styles.scss';

function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <link rel="icon" href="./favicon.ico" />
                <title>IPTV Football Client</title>
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default App;
