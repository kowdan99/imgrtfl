import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatTrigger {
  type: "load" | "new_entry";
  entryContent?: string;
}

interface ChatPanelProps {
  getToken: () => Promise<string | null>;
  backendUrl: string | undefined;
  trigger: ChatTrigger | null;
  onTriggerHandled: () => void;
}

const ChatPanel = ({ getToken, backendUrl, trigger, onTriggerHandled }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!trigger) return;

    const runTrigger = async () => {
      setMessages([]);
      setIsLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`${backendUrl}/api/chat/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: [],
            trigger: trigger.type,
            new_entry: trigger.entryContent,
          }),
        });
        const data = await res.json();
        setMessages([{ role: "assistant", content: data.message }]);
      } catch (err) {
        console.error("Chat trigger failed:", err);
      } finally {
        setIsLoading(false);
        onTriggerHandled();
      }
    };

    runTrigger();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch (err) {
      console.error("Chat failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (messages.length === 0 && !isLoading) return null;

  return (
    <Box
      bg="rgba(255,255,255,0.1)"
      borderRadius="xl"
      p={4}
      border="1px solid rgba(255,255,255,0.2)"
    >
      <VStack spacing={3} align="stretch" maxH="280px" overflowY="auto" mb={3} pr={1}>
        {messages.map((m, i) => (
          <Box
            key={i}
            alignSelf={m.role === "user" ? "flex-end" : "flex-start"}
            bg={m.role === "user" ? "orange.400" : "whiteAlpha.800"}
            color={m.role === "user" ? "white" : "gray.800"}
            px={4}
            py={2}
            borderRadius="2xl"
            maxW="85%"
          >
            <Text fontSize="sm">{m.content}</Text>
          </Box>
        ))}
        {isLoading && (
          <Box alignSelf="flex-start" px={4} py={2}>
            <Spinner size="sm" color="whiteAlpha.800" />
          </Box>
        )}
        <div ref={bottomRef} />
      </VStack>

      <HStack>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Reply..."
          size="sm"
          borderRadius="xl"
          bg="rgba(255,255,255,0.35)"
          color="black"
          _placeholder={{ color: "gray.600" }}
          resize="none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button
          onClick={sendMessage}
          colorScheme="orange"
          borderRadius="full"
          size="sm"
          isLoading={isLoading}
          flexShrink={0}
        >
          Send
        </Button>
      </HStack>
    </Box>
  );
};

export default ChatPanel;
