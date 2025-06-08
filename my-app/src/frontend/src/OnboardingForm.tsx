import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  RadioGroup,
  Radio,
  Stack,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";

interface FormValues {
  phone: string;
  useLLM: string; // "yes" or "no"
}

const OnboardingForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const toast = useToast();

  const backendUrl = process.env.REACT_APP_BACKEND_URL 

  return (
    <Box
      w="100%"
      h="100vh"
      bgGradient="linear(to-r, gray.300, yellow.400, pink.200)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg="rgba(255, 255, 255, 0.2)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.18)"
        borderRadius="2xl"
        p={8}
        maxW="500px"
        w="full"
        boxShadow="xl"
      >
        <VStack spacing={6} align="stretch">
          <Heading fontSize="3xl" textAlign="center" color="gray.800">
            Just a few more things 🌱
          </Heading>
          <Text fontSize="md" textAlign="center" color="gray.700">
            Help us personalize your gratitude experience
          </Text>

          <Formik
            initialValues={{
              name: "",
              phone: "",
              useLLM: "yes",
            }}
            validationSchema={Yup.object({
              name: Yup.string().required("Name is required"),
              phone: Yup.string()
                .required("Phone number is required")
                .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
              useLLM: Yup.string().required("Please choose an option"),
            })}
            onSubmit={async (values, actions) => {
              if (!user) return;

              const payload = {
                name: values.name || "", // optional fallback
                email: user.primaryEmailAddress?.emailAddress,
                phone_number: values.phone,
                use_llm_reminders: values.useLLM === "yes",
              };

              try {
                const token = await getToken();
                await axios.post(`${backendUrl}/api/users/`, payload, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                toast({
                  title: "Profile saved!",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });

                onSubmit(payload);
              } catch (err) {
                console.error("Failed to create user:", err);
                toast({
                  title: "Error saving profile",
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {(props) => (
              <Form>
                <VStack spacing={4} align="stretch">
                <Field name="name">
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl isInvalid={form.errors.name && form.touched.name}>
                      <FormLabel color="gray.800">Your Name</FormLabel>
                      <Input
                        {...field}
                        placeholder="e.g. Yousef"
                        bg="whiteAlpha.800"
                      />
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                  <Field name="phone">
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl
                        isInvalid={form.errors.phone && form.touched.phone}
                      >
                        <FormLabel color="gray.800">Phone Number</FormLabel>
                        <Input
                          {...field}
                          placeholder="+1234567890"
                          bg="whiteAlpha.800"
                        />
                        <FormErrorMessage>{form.errors.phone}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="useLLM">
                    {({ field }: { field: any }) => (
                      <FormControl>
                        <FormLabel color="gray.800">
                          Use AI to enhance your entries?
                        </FormLabel>
                        <RadioGroup
                          {...field}
                          onChange={field.onChange(field.name)}
                          value={field.value}
                        >
                          <Stack direction="row">
                            <Radio value="yes">Yes</Radio>
                            <Radio value="no">No</Radio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>
                    )}
                  </Field>

                  <Button
                    mt={4}
                    bg="orange.300"
                    color="black"
                    _hover={{ bg: "orange.400" }}
                    borderRadius="xl"
                    fontWeight="bold"
                    isLoading={props.isSubmitting}
                    type="submit"
                  >
                    Save and Continue
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>
        </VStack>
      </Box>
    </Box>
  );
};

export default OnboardingForm;
