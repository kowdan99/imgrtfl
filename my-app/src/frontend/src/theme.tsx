import { extendTheme } from '@chakra-ui/react';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';

const theme = extendTheme({
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Poppins, sans-serif',
  },
});

export default theme;
