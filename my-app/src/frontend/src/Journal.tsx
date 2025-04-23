import {
    Box,
    Button,
    Textarea,
    Text,
    VStack,
    Heading,
    Divider,
    useColorModeValue,
  } from "@chakra-ui/react";
  import { useState } from "react";
  import { useAuth, useUser } from "@clerk/clerk-react";
  
  const JournalPage = () => {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const [entry, setEntry] = useState("");
    const [entries, setEntries] = useState<string[]>([]);
  
    const handleSubmit = () => {
      if (entry.trim() !== "") {
        setEntries((prev) => [entry, ...prev]);
        setEntry("");
      }
    };
  
    return (
      <Box
        w="100%"
        minH="100vh"
        bgGradient="linear(to-br, gray.300, yellow.400, pink.200)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={{ base: 4, md: 8 }}
        py={{ base: 8, md: 16 }}
      >
        {isSignedIn ? (
          <Box
            bg="rgba(255, 255, 255, 0.15)"
            backdropFilter="blur(16px)"
            borderRadius="2xl"
            p={{ base: 6, md: 10 }}
            maxW="3xl"
            w="full"
            boxShadow="2xl"
            border="1px solid rgba(255, 255, 255, 0.2)"
          >
            <VStack spacing={6} align="stretch">
              <Heading
                size="lg"
                color="white"
                textAlign="center"
                fontWeight="extrabold"
                letterSpacing="tight"
              >
                Hey {user?.firstName || "friend"} 🌟
              </Heading>
  
              <Textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="I'm grateful for..."
                size="lg"
                borderRadius="xl"
                bg="rgba(255, 255, 255, 0.35)"
                _placeholder={{ color: "gray.600" }}
                _focus={{
                  borderColor: "orange.400",
                  boxShadow: "0 0 0 2px rgba(255, 165, 0, 0.6)",
                }}
                color="black"
                minH="120px"
                resize="none"
              />
  
              <Button
                colorScheme="orange"
                size="lg"
                fontWeight="bold"
                borderRadius="full"
                onClick={handleSubmit}
                transition="all 0.2s"
                _hover={{ transform: "scale(1.02)" }}
              >
                Save Entry
              </Button>
  
              <Divider borderColor="whiteAlpha.600" />
  
              <Text fontSize="xl" color="white" fontWeight="semibold">
                Your Past Entries
              </Text>
  
              <VStack spacing={4} align="stretch" maxH="40vh" overflowY="auto" pr={2}>
                {entries.length === 0 ? (
                  <Text color="whiteAlpha.800">No entries yet. Let’s begin 💭</Text>
                ) : (
                  entries.map((e, i) => (
                    <Box
                      key={i}
                      p={4}
                      bg="rgba(255, 255, 255, 0.25)"
                      borderRadius="xl"
                      color="black"
                      whiteSpace="pre-wrap"
                      boxShadow="md"
                      transition="all 0.2s"
                      _hover={{ bg: "rgba(255, 255, 255, 0.35)" }}
                    >
                      {e}
                    </Box>
                  ))
                )}
              </VStack>
            </VStack>
          </Box>
        ) : (
          <VStack spacing={6}>
            <Text fontSize="2xl" color="white" fontWeight="bold" textAlign="center">
              Please sign in to access your journal
            </Text>
            <Button
              colorScheme="orange"
              size="lg"
              borderRadius="xl"
              onClick={() => (window.location.href = "/login")}
            >
              Sign In
            </Button>
          </VStack>
        )}
      </Box>
    );
  };
  
  export default JournalPage;
  