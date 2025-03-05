// main.js
import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';

function createWindow () {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000/');
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile('./build/index.html');
    }
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})