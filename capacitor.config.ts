import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'clinicapp',
  webDir: 'frontend/clinicfront/build', // Keep your existing path

  // ADD THIS SECTION
  server: {
    androidScheme: 'http', // This forces the app to load as http://localhost
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;