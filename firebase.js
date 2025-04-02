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

// Test if Firebase is working correctly
function validateFirebaseConnection() {
    if (!isFirebaseConnected()) {
        console.error("Firebase is not initialized");
        const firebaseStatus = document.getElementById("firebase-status");
        if (firebaseStatus) {
            firebaseStatus.textContent = "Firebase Status: Not initialized";
            firebaseStatus.style.color = "red";
        }
        return;
    }
    
    // Update status to testing
    const firebaseStatus = document.getElementById("firebase-status");
    if (firebaseStatus) {
        firebaseStatus.textContent = "Firebase Status: Testing permissions...";
        firebaseStatus.style.color = "orange";
    }
    
    // Check database rules
    console.log("Checking database rules...");
    const rulesRef = firebase.database().ref('.info/connected');
    
    // Create a test entry to verify write permissions
    const testId = '_test_' + Date.now();
    console.log("Testing write with ID:", testId);
    const testRef = firebase.database().ref(testId);
    testRef.set({
        timestamp: Date.now(),
        test: true
    })
    .then(() => {
        console.log("Firebase write permission confirmed");
        if (firebaseStatus) {
            firebaseStatus.textContent = "Firebase Status: Connected (read/write OK)";
            firebaseStatus.style.color = "green";
        }
        // Remove the test data
        return testRef.remove();
    })
    .then(() => {
        console.log("Test entry removed successfully");
    })
    .catch(error => {
        console.error("Firebase validation error:", error);
        const connectionStatus = document.getElementById('connection-status');
        if (connectionStatus) {
            connectionStatus.textContent = "Firebase permission error: " + error.message;
            connectionStatus.style.color = "red";
        }
        
        if (firebaseStatus) {
            firebaseStatus.textContent = "Firebase Status: Permission Error";
            firebaseStatus.style.color = "red";
        }
    });
}

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
    
    // Add connection status monitoring
    const connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", (snap) => {
        if (snap.val() === true) {
            console.log("Connected to Firebase");
            const connectionStatus = document.getElementById("connection-status");
            const firebaseStatus = document.getElementById("firebase-status");
            
            if (connectionStatus) {
                connectionStatus.textContent = "Connected to Firebase";
                connectionStatus.style.color = "green";
                // Clear this message after 5 seconds
                setTimeout(() => {
                    if (connectionStatus.textContent === "Connected to Firebase") {
                        connectionStatus.textContent = "";
                    }
                }, 5000);
            }
            
            if (firebaseStatus) {
                firebaseStatus.textContent = "Firebase Status: Connected";
                firebaseStatus.style.color = "green";
            }
            
            // Validate Firebase permissions
            validateFirebaseConnection();
        } else {
            console.warn("Not connected to Firebase");
            const connectionStatus = document.getElementById("connection-status");
            const firebaseStatus = document.getElementById("firebase-status");
            
            if (connectionStatus) {
                connectionStatus.textContent = "Not connected to Firebase - online play unavailable";
                connectionStatus.style.color = "red";
            }
            
            if (firebaseStatus) {
                firebaseStatus.textContent = "Firebase Status: Disconnected";
                firebaseStatus.style.color = "red";
            }
        }
    });
} catch (error) {
    console.error("Error initializing Firebase:", error);
    
    // Show a subtle error message in offline mode
    const connectionStatus = document.getElementById('connection-status');
    if (connectionStatus) {
        connectionStatus.textContent = "Firebase connection error. Online mode may not work.";
        connectionStatus.style.color = "red";
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