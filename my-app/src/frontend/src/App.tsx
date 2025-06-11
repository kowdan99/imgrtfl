import * as React from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionBox = motion(Box);
const MotionText = motion(Text);
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
      px={6}
      py={{ base: 12, sm: 16, md: 20 }}
    >
      <MotionBox
        initial="hidden"
        animate="show"
        variants={fadeIn}
        bg="rgba(255, 255, 255, 0.25)"
        backdropFilter="blur(10px)"
        borderRadius="2xl"
        p={{ base: 8, sm: 10, md: 16 }}
        maxW={{ base: "90%", sm: "85%", md: "3xl" }}
        w="full"
        border="1px solid rgba(255, 255, 255, 0.2)"
        textAlign="center"
      >
        <VStack spacing={8}>
          <MotionText
            fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
            fontWeight="extrabold"
            color="blackAlpha.800"
            variants={fadeIn}
          >
            i'm grtfl <Text as="span">✨</Text>
          </MotionText>

          <MotionText
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
            fontWeight="medium"
            color="blackAlpha.700"
            variants={fadeIn}
            transition={{ delay: 0.1 }}
          >
            A step closer to gratitude
          </MotionText>

          <MotionText
            fontSize={{ base: "sm", sm: "md", md: "md" }}
            maxW="lg"
            color="blackAlpha.700"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            Journal what you're grateful for, and we'll randomly send those entries back to you as gentle reminders. Cultivate your gratitude mindset with a smile ✨
          </MotionText>

          <VStack spacing={4} pt={6}>
          <MotionButton
            as={Link}
            to="/signup"
            colorScheme="orange"
            size="lg"
            borderRadius="full"
            fontWeight="bold"
            px={{ base: 6, md: 10 }}
            maxW={{ base: "80%", md: "auto" }}
            variants={fadeIn}
            whileHover={{ scale: 1.05 }}
          >
            Start your gratitude journey
          </MotionButton>
            <MotionButton
              as={Link}
              to="/login"
              variant="ghost"
              size="lg"
              color="blackAlpha.800"
              fontWeight="medium"
              variants={fadeIn}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              Log In
            </MotionButton>
          </VStack>
        </VStack>
      </MotionBox>
    </Box>
  );
};
