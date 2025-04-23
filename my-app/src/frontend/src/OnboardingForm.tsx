import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  VStack,
  Heading,
  Text,
  RadioGroup,
  Radio,
  Stack,
} from "@chakra-ui/react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";

interface FormValues {
  email: string;
  phone: string;
  entry: string;
  useLLM: string; // we'll use "yes" | "no" for better clarity in radios
}

const OnboardingForm = ({
  email,
  onSubmit,
}: {
  email: string;
  onSubmit: (data: FormValues) => void;
}) => {
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
              email: email,
              phone: "",
              entry: "",
              useLLM: "yes", // default to yes
            }}
            validationSchema={Yup.object({
              phone: Yup.string()
                .required("Phone number is required")
                .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
              entry: Yup.string().required("Please write at least one entry"),
              useLLM: Yup.string().required("Please choose an option"),
            })}
            onSubmit={(values, actions) => {
              onSubmit(values);
              actions.setSubmitting(false);
            }}
          >
            {(props) => (
              <Form>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel color="gray.800">Email</FormLabel>
                    <Input value={email} isReadOnly bg="whiteAlpha.800" />
                  </FormControl>

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

                  <Field name="entry">
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl
                        isInvalid={form.errors.entry && form.touched.entry}
                      >
                        <FormLabel color="gray.800">
                          First Gratitude Entry
                        </FormLabel>
                        <Textarea
                          {...field}
                          placeholder="I'm grateful for..."
                          bg="whiteAlpha.800"
                        />
                        <FormErrorMessage>{form.errors.entry}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="useLLM">
                    {({ field }: { field: any }) => (
                      <FormControl>
                        <FormLabel color="gray.800">
                          Use AI to enhance your entries?
                        </FormLabel>
                        <RadioGroup {...field} onChange={field.onChange(field.name)} value={field.value}>
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
