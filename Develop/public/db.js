let db;

const request = indexedDB.open("budgettrack", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDb();
    }
};

// show err
request.onerror = function (event) {
    console.log("ERROR " + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
};

function checkDb() {
    const transaction = db.transaction(["pending"], readwrite);
    const store = transaction.objectStore("pending");
    const grabAll = store.grabAll();

    grabAll.onsuccess = function () {
        console.log(grabAll.result)
        if (grabAll.result.length > 0) {
            console.log(grabAll.result)
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(grabAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

// event listener for reconnection
window.addEventListener("online", checkDatabase);