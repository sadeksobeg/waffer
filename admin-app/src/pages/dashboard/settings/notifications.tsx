import React from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsLayout from '@/components/settings/SettingsLayout';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationSettingsPage() {
  const { t } = useTranslation('settings');
  const { userData } = useAuth();
  
  return (
    <DashboardLayout title={t('notifications.title')}>
      <SettingsLayout>
        <NotificationSettings />
      </SettingsLayout>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'settings'])),
    },
  };
};
