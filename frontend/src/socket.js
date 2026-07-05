import { io } from 'socket.io-client';

const socket = io("https://doubtmap-production.up.railway.app");

export default socket;