import { io } from 'socket.io-client';

const socket = io('doubtmap-production.up.railway.app');

export default socket;