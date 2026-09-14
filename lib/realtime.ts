type SendFunction = (data: string) => void;

const subscribers = new Set<SendFunction>();

export function subscribeToSyncStream(send: SendFunction) {
  subscribers.add(send);
  return () => {
    subscribers.delete(send);
  };
}

export function broadcastSyncEvent(eventData: any) {
  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  subscribers.forEach((send) => {
    try {
      send(payload);
    } catch {
      subscribers.delete(send);
    }
  });
}
