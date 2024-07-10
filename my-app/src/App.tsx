import * as React from "react"
import {
  ChakraProvider,
  Box,
  Button,
  Text,
  VStack,
  Grid,
  // theme,
} from "@chakra-ui/react"
import theme from './pages/theme'
import '@fontsource/inter/900.css';
import { Link } from 'react-router-dom';



export const App = () => (
  <ChakraProvider theme={theme}>
    <Box
   w='100%'
   h='1000px'
   bgGradient='linear(to-r, gray.300, yellow.400, pink.200)'
> 
<Grid minH="100vh" p={3}>
        <VStack spacing={50}>
        <Text fontSize='4xl' color={"black"}>i'm grtfl :) </Text>
        <Text fontSize='2xl' color={"black"}>A step closer to gratitude </Text>
        <Text fontSize='1xl' color={"black"} textAlign={"justify"}>journal what you're grateful for and we'll randomly sends those entries to you as reminders to hone your gratitude mindset.</Text>
        <Button colorScheme='undefined' marginTop={200} as={Link} to="/signup">Start you gratitude journey here</Button>
        <Button colorScheme='undefined'>Log In</Button>
        </VStack>
      </Grid>
</Box>
  </ChakraProvider>
)
