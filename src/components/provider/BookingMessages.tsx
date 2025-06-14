
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface BookingMessagesProps {
  bookingId: string;
  ownerId: string;
  userId: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

const BookingMessages = ({ bookingId, ownerId, userId }: BookingMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Fetch current user id
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  // Fetch messages for this booking
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, message, created_at")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setLoading(false);
    };
    fetchMessages();
  }, [bookingId]);

  // Scroll to bottom when new messages
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message
  const sendMessage = async () => {
    if (!input.trim() || !currentUserId) return;
    setSending(true);
    const { error } = await supabase
      .from("messages")
      .insert({
        booking_id: bookingId,
        sender_id: currentUserId,
        message: input.trim(),
      });
    if (!error) {
      setMessages((msgs) => [
        ...msgs,
        {
          id: crypto.randomUUID(),
          sender_id: currentUserId,
          message: input.trim(),
          created_at: new Date().toISOString(),
        }
      ]);
      setInput("");
    }
    setSending(false);
  };

  if (loading) return <div className="py-2">Loading messages...</div>;

  return (
    <div className="border rounded p-2 bg-muted/50">
      <div className="flex items-center mb-2 gap-2 font-medium text-sm">
        <MessageCircle className="w-4 h-4" /> Booking Chat
      </div>
      <div className="max-h-40 overflow-y-auto flex flex-col space-y-1 mb-2">
        {messages.length === 0 && (
          <div className="text-xs text-muted-foreground">No messages yet.</div>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id + i}
            className={`rounded px-2 py-1 text-sm max-w-sm ${
              msg.sender_id === currentUserId
                ? "bg-blue-100 text-right self-end"
                : "bg-gray-100"
            }`}
          >
            {msg.message}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          disabled={sending}
          placeholder="Type a message…"
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && input.trim() && !sending) {
              sendMessage();
            }
          }}
        />
        <Button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          variant="default"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default BookingMessages;
