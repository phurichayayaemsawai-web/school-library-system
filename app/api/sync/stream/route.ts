import { subscribeToSyncStream } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET() {
  let sendRef: ((data: string) => void) | null = null;
  let timer: NodeJS.Timeout | null = null;
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      sendRef = (data: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(data));
        } catch {
          if (unsubscribe) unsubscribe();
        }
      };

      unsubscribe = subscribeToSyncStream(sendRef);

      // Initial connection acknowledgment
      sendRef(`data: ${JSON.stringify({ type: "CONNECTED", timestamp: new Date().toISOString() })}\n\n`);

      // Heartbeat ping every 10 seconds to keep connection alive
      timer = setInterval(() => {
        if (sendRef) {
          try {
            sendRef(`: ping\n\n`);
          } catch {
            if (unsubscribe) unsubscribe();
            if (timer) clearInterval(timer);
          }
        }
      }, 10000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
