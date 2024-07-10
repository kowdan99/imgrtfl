import React, { EventHandler, useState } from "react"
import {
    ChakraProvider,
    Box,
    Button,
    Text,
    VStack,
    Grid,
    Input
    // theme,
} from "@chakra-ui/react"
import theme from './theme'
import '@fontsource/inter/900.css';
import axios from 'axios';
axios.defaults.headers.post['Content-Type'] = 'application/json';
const SignUp = () => {
    const [inputValue, setInputData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const [error, setError] = useState(null);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputData(e.target!.value)
    };
    const sendDataToAPI = async () => {
      setIsLoading(true);
        try {
          console.log("INPUT", inputValue)
          const response = await axios.post('http://localhost:3001/api/sendOTP', {inputValue}, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log(response);
          //setResponseData(response);
          setInputData(''); // Clear input after successful submission
        } catch (error: any) {
          setError(error);
        }
      };
    return (
        <div>
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
                    <Grid minH="100vh" p={3}>
                    <Input placeholder='Enter Phone Number' width={'auto'} marginTop={200} value={inputValue} onChange={handleInputChange}/>
                    <Button colorScheme='undefined' isLoading={isLoading} size='md' onClick={sendDataToAPI}>Send OTP</Button>
                    </Grid>
                    </VStack>
            </Grid>
            </Box>
            </ChakraProvider>
        </div>
    );
    
};

// const handleSignup =(phoneNumber: any) => {

// }

console.log(process.env.REACT_APP_TWILIO_ACCOUNT_SID)
export default SignUp;
