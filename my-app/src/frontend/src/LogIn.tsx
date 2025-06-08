// pages/Login.tsx
import React from 'react'
import { SignIn } from '@clerk/clerk-react'
import {
    ChakraProvider,
    Box,
    Button,
    Heading,
    Text,
    VStack,
    Grid,
    Input
    // theme,
} from "@chakra-ui/react"
import theme from './theme'
export {}
const LoginPage = () => {
  return (

            <Box
            w='100%'
            h='1000px'
            bgGradient='linear(to-r, gray.300, yellow.400, pink.200)'
             > 
                    <VStack spacing={50}>
                    <Text fontSize='4xl' color={"black"}>i'm grtfl :) </Text>
                    <Text fontSize='2xl' color={"black"}>A step closer to gratitude </Text>
                    <Grid minH="100vh" p={3}>
                    <SignIn path="/login" routing="path" signUpUrl="/signup" forceRedirectUrl="/gratitude" appearance={{
            elements: {
              card: {
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                padding: "2rem",
              },
              formButtonPrimary: {
                backgroundColor: "#F6AD55",
                color: "#1A202C",
                borderRadius: "12px",
                fontWeight: "bold",
                _hover: {
                  backgroundColor: "#DD6B20",
                },
              },
              headerTitle: { fontSize: "24px", color: "white" },
              headerSubtitle: { fontSize: "16px", color: "white" },
              dividerText: { color: "white" },
              formFieldLabel: { color: "white" },
              footer: { display: "none" },
              developer: { display: "none" },
            },
            variables: {
              colorPrimary: "#F6AD55",
              colorText: "white",
              fontSize: "16px",
              borderRadius: "20px",
            },
          }} />
                    </Grid>
                    </VStack>
            </Box>
  )
}

export default LoginPage
