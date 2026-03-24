/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider } from './store';
import { AppContent } from './components';

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
