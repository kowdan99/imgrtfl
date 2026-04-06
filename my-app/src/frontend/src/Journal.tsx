import {
  Box,
  Button,
  Textarea,
  Text,
  VStack,
  Heading,
  Divider,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatPanel from "./ChatPanel";

const JournalPage = () => {
  const navigate = useNavigate();

  const { user } = useUser();
  const toast = useToast();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [entries, setEntries] = useState<Array<{
    content: string;
    llm_reminder?: string;
    created_at: string;
    llm_reasoning_trace?: string;
    tags?:[string];
    moods?:string
  }>>([]);
  const [chatTrigger, setChatTrigger] = useState<{ type: "load" | "new_entry"; entryContent?: string } | null>(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL


  const validationSchema = Yup.object({
    content: Yup.string().required("Please write something."),
  });

  useEffect(() => {
    const verifyUser = async () => {
      const token = await getToken();
      const res = await axios.get(`${backendUrl}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data?.exists) {
        navigate("/onboarding");
      }
    };
    verifyUser();
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const fetchEntries = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${backendUrl}/api/entries/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEntries(res.data);
        if (res.data.length > 0) {
          setChatTrigger({ type: "load" });
        }
      } catch (err) {
        console.error("Failed to fetch entries:", err);
      }
    };
  
    fetchEntries();
  }, [isLoaded, isSignedIn]);

  const handleSubmit = async(values: { content: string }, actions: any) => {
    try {
      const token = await getToken(); // from Clerk
      const payload = {
        content: values.content,
      };
      console.log(payload)
      const response = await axios.post(`${backendUrl}/api/entries/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log(response)
      toast({
        title: "Entry saved!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
  
      // Update local UI
      const newEntry = {
        content: values.content,
        created_at: new Date().toISOString(), 
        llm_reminder: response.data.llm_reminder,
        llm_reasoning_trace: response.data.llm_reasoning_trace,
        mood:response.data.mood
      };
      setEntries((prev) => [newEntry, ...prev]);
      setChatTrigger({ type: "new_entry", entryContent: values.content });
      actions.resetForm();
  
    } catch (err) {
      console.error("Error saving entry:", err);
      toast({
        title: "Error saving entry",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
              {isLoaded && user?.firstName ? `Hey ${user.firstName} 🌟` : "Hey friend 🌟"}
            </Heading>

            <Formik
              initialValues={{ content: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Field name="content">
                    {({ field, form }: any) => (
                      <FormControl isInvalid={form.errors.content && form.touched.content}>
                        <FormLabel color="white">Gratitude Entry</FormLabel>
                        <Textarea
                          {...field}
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
                        <FormErrorMessage>{form.errors.content}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Button
                    type="submit"
                    colorScheme="orange"
                    size="lg"
                    fontWeight="bold"
                    borderRadius="full"
                    mt={4}
                    isLoading={isSubmitting}
                  >
                    Save Entry
                  </Button>
                </Form>
              )}
            </Formik>

            <Divider borderColor="whiteAlpha.600" />

            <Text fontSize="xl" color="white" fontWeight="semibold">
              Your Past Entries
            </Text>

            <VStack spacing={4} align="stretch" maxH="40vh" overflowY="auto" pr={2}>
              {entries.length === 0 ? (
                <Text color="whiteAlpha.800">No entries yet. Let’s begin 💭</Text>
              ) : (
                entries.map((entry, i) => (
                  <Box key={i} p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="md">
                    <Text color="gray.800" fontWeight="bold">
                      {new Date(entry.created_at).toLocaleString()} {/* Format date */}
                    </Text>
                    <Text color="gray.700" whiteSpace="pre-wrap">
                      {entry.content}
                    </Text>
                    {entry.llm_reminder && (
                    <Text color="orange.500" fontStyle="italic">
                      {entry.llm_reminder}
                    </Text>
                  )}
                  </Box>
                ))
              )}
            </VStack>

            <ChatPanel
              getToken={getToken}
              backendUrl={backendUrl}
              trigger={chatTrigger}
              onTriggerHandled={() => setChatTrigger(null)}
            />
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
