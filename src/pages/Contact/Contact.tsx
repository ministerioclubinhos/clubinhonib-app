import React, { useState, useRef, useEffect } from 'react';

interface MessageData {
  message: string;
  time: string;
}

export default function SSELongTask() {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connectSSE = () => {
    if (eventSourceRef.current) return;

    let token = localStorage.getItem('clientToken');
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem('clientToken', token);
    }

    console.log(`🔌 Connecting SSE with token: ${token}`);
    const eventSource = new EventSource(`http://localhost:3000/sse/stream?token=${token}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ SSE Connected');
      setIsConnected(true);
      setIsWaiting(true);
    };

    eventSource.onmessage = (event) => {
      const data: MessageData = JSON.parse(event.data);
      console.log('📡 Received SSE message:', data);

      setMessages((prev) => [...prev, data]);
      setIsWaiting(false);

      // ✅ Só remove o token quando recebe resposta da API
      localStorage.removeItem('clientToken');

      // ✅ Fecha a conexão após resposta
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };

    eventSource.onerror = (err) => {
      console.error('❌ SSE error or closed:', err);

      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('🛑 SSE connection closed by server');
      }

      // ❌ Não remove token no erro!
      // ❌ Só desconecta visualmente
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setIsWaiting(false);
    };
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('clientToken');
    if (savedToken) {
      console.log('🔄 Reconnecting SSE with saved token...');
      connectSSE();
    }
  }, []);

  const statusLabel = () => {
    if (isConnected && isWaiting) return '🟢 Conectado - Aguardando resposta...';
    if (isConnected && !isWaiting) return '✅ Resposta recebida - Conexão encerrando';
    return '🔴 Desconectado';
  };

  return (
    <div style={{ padding: '20px', marginTop: '100px' }}>
      <h3>Status: {statusLabel()}</h3>

      {!isConnected && (
        <button onClick={connectSSE}>
          Abrir Conexão
        </button>
      )}

      {messages.length > 0 && (
        <>
          <h4>Mensagens Recebidas:</h4>
          <ul>
            {messages.map((msg, idx) => (
              <li key={idx}>
                {msg.time} - {msg.message}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
