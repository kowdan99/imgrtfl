import { ColorModeScript } from "@chakra-ui/react"
import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { App } from "./App"
import reportWebVitals from "./reportWebVitals"
import * as serviceWorker from "./serviceWorker"
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react'
import { ChakraProvider } from "@chakra-ui/react"
import SignUpPage from "./SignUp"
import JournalPage from "./Journal"
import LoginPage from "./LogIn"
import theme from './theme'
import OnboardingPage from './Onboarding'
const container = document.getElementById("root")
if (!container) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(container)
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) {
  throw new Error("Missing Clerk publishable key in environment variables");
}

const withProviders = (component: React.ReactNode) => (
  <ClerkProvider publishableKey={clerkPubKey} >
    <ChakraProvider theme={theme}>{component}</ChakraProvider>
  </ClerkProvider>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: withProviders(<App />),
  },
  {
    path: '/signup/*',
    element: withProviders(<SignUpPage />),
  },
  {
    path: '/login/*',
    element: withProviders(<LoginPage />),
  },
  {
    path: '/onboarding',
    element: withProviders(<OnboardingPage />),
  },
  {
    path: '/gratitude',
    element: withProviders(<JournalPage />),
  },
])

root.render(
  <React.StrictMode>
    <ColorModeScript />
    <RouterProvider router={router} />
  </React.StrictMode>,
)


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

