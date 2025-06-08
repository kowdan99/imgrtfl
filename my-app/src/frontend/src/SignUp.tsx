import React, { useEffect } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import { SignUp, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      navigate("/onboarding");
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  return (
    <Box
      w="100%"
      h="100vh"
      bgGradient="linear(to-r, gray.300, yellow.400, pink.200)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={6}>
        <Text fontSize="4xl" color="black">
          i'm grtfl :)
        </Text>
        <Text fontSize="xl" color="black">
          A step closer to gratitude
        </Text>
        <SignUp
          path="/signup"
          routing="path"
          signInUrl="/login"
          afterSignUpUrl="/onboarding"
          appearance={{
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
          }}
        />
      </VStack>
    </Box>
  );
};

export default SignUpPage;
