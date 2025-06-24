// 如果資料庫創建或開啟成功，會將 IDBDatabase實例 保存到 db 供後續使用。
let db;

const request = indexedDB.open("MyDatabase");
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const objectStore = db.createObjectStore("article", { keyPath: "type" });
};

request.onerror = (event) => {
  console.error("IndexedDB發生錯誤！", event.target.error);
};
request.onsuccess = (event) => {
  db = event.target.result;
  console.log(event.target);
};

export const insertData = (data) => {
  const transaction = db.transaction("article", "readwrite");
  const objectStore = transaction.objectStore("article");
  const request = objectStore.put(data);
  request.onsuccess = (event) => {
    console.log("資料暫存成功!", event.target.result);
  };

  request.onerror = (event) => {
    console.error(`暫存出現錯誤：${event.target.errorCode}`);
  };
};

export const getData = async (key) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("article");
    const objectStore = transaction.objectStore("article");
    const request = objectStore.get(key);
    request.onerror = (event) => {
      reject(event.target.error);
    };

    // 從keyPath得到儲存值
    request.onsuccess = (event) => {
      if(!event.target.result) return undefined;
      switch (event.target.result.type) {
        case "insert":
          resolve(event.target.result);
          break;
        case "edit":
          resolve(event.target.result);
          break;
      }
    };
  });
};

export const deleteData = (keyPath) => {
  const transaction = db.transaction("article", "readwrite");
  const objectStore = transaction.objectStore("article");
  const request = objectStore.delete(keyPath);
  request.onerror = (event) => {
    console.error(event.target.error);
  };
  request.onsuccess = (event) => {
    if (event.target.result) {
      console.log(event.target.result.content);
    }
  };
};
