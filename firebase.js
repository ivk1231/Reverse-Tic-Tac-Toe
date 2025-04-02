// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBb38zNSFDRJY1ncdX6zBGBLK_c_atnTl8",
  authDomain: "reverse-tick.firebaseapp.com",
  databaseURL: "https://reverse-tick-default-rtdb.firebaseio.com",
  projectId: "reverse-tick",
  storageBucket: "reverse-tick.firebasestorage.app",
  messagingSenderId: "126763932523",
  appId: "1:126763932523:web:200190bca24d1f79e50a2e",
  measurementId: "G-F17JF2EGJJ"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase:", error);
    
    // Show a subtle error message in offline mode
    const connectionStatus = document.getElementById('connection-status');
    if (connectionStatus) {
        connectionStatus.textContent = "Firebase connection error. Online mode may not work.";
    }
}

// Helper function to check if Firebase is initialized and connected
function isFirebaseConnected() {
    return firebase && firebase.apps.length > 0;
}

// Clean up inactive rooms (runs once per day if page is open)
const cleanUpInactiveRooms = () => {
    if (!isFirebaseConnected()) return;
    
    // Only keep rooms updated in the last 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const roomsRef = firebase.database().ref('rooms');
    roomsRef.once('value')
        .then(snapshot => {
            const rooms = snapshot.val();
            if (!rooms) return;
            
            Object.keys(rooms).forEach(roomId => {
                const room = rooms[roomId];
                
                // If the room has a timestamp and it's older than 24 hours, or if no players, delete it
                if (
                    (room.lastUpdated && room.lastUpdated < oneDayAgo) || 
                    (!room.players || !(room.players.x || room.players.o))
                ) {
                    firebase.database().ref('rooms/' + roomId).remove()
                        .then(() => console.log("Cleaned up inactive room:", roomId))
                        .catch(error => console.error("Error cleaning up room:", error));
                }
            });
        })
        .catch(error => console.error("Error checking for inactive rooms:", error));
};

// Run cleanup on page load and once per day if page stays open
setTimeout(cleanUpInactiveRooms, 1000 * 60); // Run after 1 minute
setInterval(cleanUpInactiveRooms, 1000 * 60 * 60 * 24); // Run daily 