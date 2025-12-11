import { create } from 'zustand';

const useStore = create((set) => ({
  username: '',
  messages: [],
  onlineUsers: [],
  
  setUsername: (username) => set({ username }),
  
  addMessage: (message) => set((state) => {
    // Prevent duplicate messages
    const exists = state.messages.some(msg => msg.id === message.id);
    if (exists) return state;
    
    return {
      messages: [...state.messages, message]
    };
  }),
  
  setMessages: (messages) => set({ messages }),
  
  // Function to prepend older messages for infinite scroll pagination
  prependMessages: (olderMessages) => set((state) => {
    // Filter out any duplicates and prepend older messages
    const existingIds = new Set(state.messages.map(msg => msg.id));
    const newMessages = olderMessages.filter(msg => !existingIds.has(msg.id));
    
    return {
      messages: [...newMessages, ...state.messages]
    };
  }),
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));

export default useStore;