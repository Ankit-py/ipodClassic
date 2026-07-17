/**
 * iPod Classic — React Native App Entry Point.
 *
 * Full-screen, no OS chrome. The phone screen IS the device.
 */

import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {IPodShell} from './src/components/IPodShell';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <IPodShell />
    </SafeAreaProvider>
  );
}

export default App;
