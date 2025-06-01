import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import DashboardPage from './dashboard/index';

export default function DashboardDirect() {
  return <DashboardPage />;
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'dashboard', 'analytics'])),
    },
  };
};
