// Add this script to your HTML for debugging Firebase issues
document.addEventListener('DOMContentLoaded', function() {
    console.log("Debug script loaded");
    
    // Check if Firebase is defined
    if (typeof firebase === 'undefined') {
        console.error("Firebase is not defined. Scripts might not be loading correctly.");
    } else {
        console.log("Firebase object exists");
        
        // Check if Firebase apps are initialized
        console.log("Firebase apps:", firebase.apps);
        
        // Add a click event listener to the create room button for debugging
        const createRoomBtn = document.getElementById('create-room-btn');
        if (createRoomBtn) {
            console.log("Create room button found");
            
            // Add a test listener to verify the button works
            createRoomBtn.addEventListener('click', function() {
                console.log("Create room button clicked - from debug script");
                
                // Test Firebase connection
                if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                    const testRef = firebase.database().ref('test');
                    testRef.set({
                        timestamp: Date.now(),
                        test: true
                    }).then(() => {
                        console.log("Test write to Firebase successful");
                    }).catch(error => {
                        console.error("Test write to Firebase failed:", error);
                    });
                } else {
                    console.error("Firebase is not initialized for test write");
                }
            });
        } else {
            console.error("Create room button not found");
        }
    }
    
    // Check if all necessary Firebase modules are loaded
    setTimeout(() => {
        if (firebase.database) {
            console.log("Firebase database module is loaded");
        } else {
            console.error("Firebase database module is NOT loaded");
        }
    }, 1000);
}); 