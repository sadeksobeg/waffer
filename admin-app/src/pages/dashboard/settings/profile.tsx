import React from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsLayout from '@/components/settings/SettingsLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileSettingsPage() {
  const { t } = useTranslation('settings');
  const { userData } = useAuth();
  
  return (
    <DashboardLayout title={t('profile.title')}>
      <SettingsLayout>
        <ProfileSettings />
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
