import React from 'react';
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
// Remove ServerStyleSheets import
import theme from '@/config/theme';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    // Simplified getInitialProps without ServerStyleSheets
    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
