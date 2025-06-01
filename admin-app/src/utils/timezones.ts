export interface Timezone {
  value: string;
  label: string;
  offset: number;
}

export const timezones: Timezone[] = [
  { value: 'Pacific/Midway', label: '(GMT-11:00) Midway Island, Samoa', offset: -11 },
  { value: 'Pacific/Honolulu', label: '(GMT-10:00) Hawaii', offset: -10 },
  { value: 'America/Anchorage', label: '(GMT-09:00) Alaska', offset: -9 },
  { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time (US & Canada)', offset: -8 },
  { value: 'America/Denver', label: '(GMT-07:00) Mountain Time (US & Canada)', offset: -7 },
  { value: 'America/Phoenix', label: '(GMT-07:00) Arizona', offset: -7 },
  { value: 'America/Chicago', label: '(GMT-06:00) Central Time (US & Canada)', offset: -6 },
  { value: 'America/New_York', label: '(GMT-05:00) Eastern Time (US & Canada)', offset: -5 },
  { value: 'America/Bogota', label: '(GMT-05:00) Bogota, Lima, Quito', offset: -5 },
  { value: 'America/Halifax', label: '(GMT-04:00) Atlantic Time (Canada)', offset: -4 },
  { value: 'America/Caracas', label: '(GMT-04:00) Caracas, La Paz', offset: -4 },
  { value: 'America/Santiago', label: '(GMT-04:00) Santiago', offset: -4 },
  { value: 'America/St_Johns', label: '(GMT-03:30) Newfoundland', offset: -3.5 },
  { value: 'America/Sao_Paulo', label: '(GMT-03:00) Brasilia', offset: -3 },
  { value: 'America/Argentina/Buenos_Aires', label: '(GMT-03:00) Buenos Aires, Georgetown', offset: -3 },
  { value: 'America/Godthab', label: '(GMT-03:00) Greenland', offset: -3 },
  { value: 'Atlantic/South_Georgia', label: '(GMT-02:00) Mid-Atlantic', offset: -2 },
  { value: 'Atlantic/Azores', label: '(GMT-01:00) Azores', offset: -1 },
  { value: 'Atlantic/Cape_Verde', label: '(GMT-01:00) Cape Verde Is.', offset: -1 },
  { value: 'Europe/London', label: '(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London', offset: 0 },
  { value: 'Africa/Casablanca', label: '(GMT+00:00) Casablanca, Monrovia', offset: 0 },
  { value: 'Europe/Paris', label: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna', offset: 1 },
  { value: 'Europe/Belgrade', label: '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague', offset: 1 },
  { value: 'Europe/Brussels', label: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris', offset: 1 },
  { value: 'Africa/Algiers', label: '(GMT+01:00) West Central Africa', offset: 1 },
  { value: 'Europe/Athens', label: '(GMT+02:00) Athens, Bucharest, Istanbul', offset: 2 },
  { value: 'Europe/Kiev', label: '(GMT+02:00) Kiev, Minsk, Riga, Sofia, Tallinn, Vilnius', offset: 2 },
  { value: 'Africa/Cairo', label: '(GMT+02:00) Cairo', offset: 2 },
  { value: 'Africa/Harare', label: '(GMT+02:00) Harare, Pretoria', offset: 2 },
  { value: 'Asia/Jerusalem', label: '(GMT+02:00) Jerusalem', offset: 2 },
  { value: 'Europe/Moscow', label: '(GMT+03:00) Moscow, St. Petersburg, Volgograd', offset: 3 },
  { value: 'Asia/Kuwait', label: '(GMT+03:00) Kuwait, Riyadh', offset: 3 },
  { value: 'Africa/Nairobi', label: '(GMT+03:00) Nairobi', offset: 3 },
  { value: 'Asia/Baghdad', label: '(GMT+03:00) Baghdad', offset: 3 },
  { value: 'Asia/Tehran', label: '(GMT+03:30) Tehran', offset: 3.5 },
  { value: 'Asia/Dubai', label: '(GMT+04:00) Abu Dhabi, Muscat', offset: 4 },
  { value: 'Asia/Baku', label: '(GMT+04:00) Baku, Tbilisi, Yerevan', offset: 4 },
  { value: 'Asia/Kabul', label: '(GMT+04:30) Kabul', offset: 4.5 },
  { value: 'Asia/Karachi', label: '(GMT+05:00) Islamabad, Karachi, Tashkent', offset: 5 },
  { value: 'Asia/Yekaterinburg', label: '(GMT+05:00) Ekaterinburg', offset: 5 },
  { value: 'Asia/Kolkata', label: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi', offset: 5.5 },
  { value: 'Asia/Kathmandu', label: '(GMT+05:45) Kathmandu', offset: 5.75 },
  { value: 'Asia/Dhaka', label: '(GMT+06:00) Astana, Dhaka', offset: 6 },
  { value: 'Asia/Novosibirsk', label: '(GMT+06:00) Novosibirsk', offset: 6 },
  { value: 'Asia/Rangoon', label: '(GMT+06:30) Yangon (Rangoon)', offset: 6.5 },
  { value: 'Asia/Bangkok', label: '(GMT+07:00) Bangkok, Hanoi, Jakarta', offset: 7 },
  { value: 'Asia/Krasnoyarsk', label: '(GMT+07:00) Krasnoyarsk', offset: 7 },
  { value: 'Asia/Hong_Kong', label: '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi', offset: 8 },
  { value: 'Asia/Irkutsk', label: '(GMT+08:00) Irkutsk, Ulaan Bataar', offset: 8 },
  { value: 'Asia/Singapore', label: '(GMT+08:00) Kuala Lumpur, Singapore', offset: 8 },
  { value: 'Australia/Perth', label: '(GMT+08:00) Perth', offset: 8 },
  { value: 'Asia/Taipei', label: '(GMT+08:00) Taipei', offset: 8 },
  { value: 'Asia/Tokyo', label: '(GMT+09:00) Osaka, Sapporo, Tokyo', offset: 9 },
  { value: 'Asia/Seoul', label: '(GMT+09:00) Seoul', offset: 9 },
  { value: 'Asia/Yakutsk', label: '(GMT+09:00) Yakutsk', offset: 9 },
  { value: 'Australia/Adelaide', label: '(GMT+09:30) Adelaide', offset: 9.5 },
  { value: 'Australia/Darwin', label: '(GMT+09:30) Darwin', offset: 9.5 },
  { value: 'Australia/Brisbane', label: '(GMT+10:00) Brisbane', offset: 10 },
  { value: 'Australia/Canberra', label: '(GMT+10:00) Canberra, Melbourne, Sydney', offset: 10 },
  { value: 'Australia/Hobart', label: '(GMT+10:00) Hobart', offset: 10 },
  { value: 'Pacific/Guam', label: '(GMT+10:00) Guam, Port Moresby', offset: 10 },
  { value: 'Asia/Vladivostok', label: '(GMT+10:00) Vladivostok', offset: 10 },
  { value: 'Asia/Magadan', label: '(GMT+11:00) Magadan, Solomon Is., New Caledonia', offset: 11 },
  { value: 'Pacific/Auckland', label: '(GMT+12:00) Auckland, Wellington', offset: 12 },
  { value: 'Pacific/Fiji', label: '(GMT+12:00) Fiji, Kamchatka, Marshall Is.', offset: 12 },
  { value: 'Pacific/Tongatapu', label: '(GMT+13:00) Nuku\'alofa', offset: 13 },
];

export const getTimezoneByValue = (value: string): Timezone | undefined => {
  return timezones.find(timezone => timezone.value === value);
};

export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting user timezone:', error);
    return 'UTC';
  }
};

export const formatTimezoneOffset = (offset: number): string => {
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset);
  const minutes = (absOffset - hours) * 60;
  
  return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
