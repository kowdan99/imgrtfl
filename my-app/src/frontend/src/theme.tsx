import { extendTheme } from '@chakra-ui/react';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';

const theme = extendTheme({
  fonts: {
    heading: `'Geist', sans-serif`,
    body: `'Geist', sans-serif`,
  },
});

export default theme;
