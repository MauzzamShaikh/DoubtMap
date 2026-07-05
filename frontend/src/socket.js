import { io } from 'socket.io-client';

const socket = io('https://doubtmap-backend.onrender.com');

export default socket;