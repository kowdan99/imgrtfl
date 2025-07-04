import * as React from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);
const MotionButton = motion(Button);

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const App = () => {
  const bgGradient = useColorModeValue(
    "linear(to-r, gray.300, yellow.400, pink.200)",
    "linear(to-r, gray.600, yellow.500, pink.300)"
  );

  return (
    <Box
      w="100%"
      minH="100vh"
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
    >
      <MotionBox
        initial="hidden"
        animate="show"
        variants={fadeIn}
        textAlign="center"
        maxW="3xl"
        w="full"
      >
        <VStack spacing={8}>
          <MotionHeading
            fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
            fontWeight="semibold"
            color="blackAlpha.800"
            variants={fadeIn}
          >
            Cultivate Gratitude. <br /> Receive Reflections.
          </MotionHeading>

          <MotionText
            fontSize={{ base: "md", sm: "lg" }}
            color="blackAlpha.700"
            maxW="lg"
            variants={fadeIn}
            transition={{ delay: 0.1 }}
          >
            imgrtfl sends your past moments of gratitude back to you via SMS —
            enhanced with LLM-powered reflection.
          </MotionText>
          
          <MotionButton
            as={Link}
            to="/signup"
            size="lg"
            bg="pink.200"
            _hover={{ bg: "pink.300" }}
            color="black"
            fontWeight="semibold"
            borderRadius="full"
            px={8}
            py={6}
            variants={fadeIn}
            whileHover={{ scale: 1.05 }}
          >
            Start journaling
          </MotionButton>

          <MotionButton
            as={Link}
            to="/login"
            variant="ghost"
            size="lg"
            color="blackAlpha.800"
            fontWeight="medium"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            Log In
          </MotionButton>
        </VStack>
      </MotionBox>
    </Box>
  );
};
