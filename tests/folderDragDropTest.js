
// Mock File System API
class MockFileSystemEntry {
    constructor(name, isFile, isDirectory, fullPath) {
        this.name = name;
        this.isFile = isFile;
        this.isDirectory = isDirectory;
        this.fullPath = fullPath || (isDirectory ? `/${name}` : `/${name}`);
    }
}

class MockFileSystemFileEntry extends MockFileSystemEntry {
    constructor(name, fullPath) {
        super(name, true, false, fullPath);
    }

    file(successCallback, errorCallback) {
        // Simulate getting a File object
        const file = {
            name: this.name,
            size: 1024,
            type: 'text/plain',
            lastModified: Date.now()
        };
        successCallback(file);
    }
}

class MockFileSystemDirectoryEntry extends MockFileSystemEntry {
    constructor(name, children = [], fullPath) {
        super(name, false, true, fullPath);
        this.children = children;
    }

    createReader() {
        let read = false;
        return {
            readEntries: (successCallback, errorCallback) => {
                if (!read) {
                    read = true;
                    successCallback(this.children);
                } else {
                    successCallback([]); // End of entries
                }
            }
        };
    }
}

// Mock DataTransferItem
class MockDataTransferItem {
    constructor(entry) {
        this.kind = 'file';
        this.entry = entry;
    }

    webkitGetAsEntry() {
        return this.entry;
    }

    getAsEntry() {
        return this.entry;
    }
}

// The function to test (copied from FileExplorer.jsx)
const getFilesFromDataTransferItems = async (items) => {
    const files = [];
    const queue = [];

    // Initial queue population
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : (item.getAsEntry ? item.getAsEntry() : null);
            if (entry) {
                queue.push(entry);
            }
        }
    }

    while (queue.length > 0) {
        const entry = queue.shift();
        if (entry.isFile) {
            try {
                const file = await new Promise((resolve, reject) => {
                    entry.file(resolve, reject);
                });
                // entry.fullPath usually starts with /, remove it
                const path = entry.fullPath.startsWith('/') ? entry.fullPath.slice(1) : entry.fullPath;
                files.push({ file, path });
            } catch (err) {
                console.error('Error reading file entry:', err);
            }
        } else if (entry.isDirectory) {
            try {
                const reader = entry.createReader();
                // readEntries might not return all entries in one call, need to loop until empty
                const readAllEntries = async () => {
                    let allEntries = [];
                    let done = false;
                    while (!done) {
                        const entries = await new Promise((resolve, reject) => {
                            reader.readEntries(resolve, reject);
                        });
                        if (entries.length === 0) {
                            done = true;
                        } else {
                            allEntries = [...allEntries, ...entries];
                        }
                    }
                    return allEntries;
                };

                const entries = await readAllEntries();
                queue.push(...entries);
            } catch (err) {
                console.error('Error reading directory entry:', err);
            }
        }
    }

    return files;
};

// Test Setup
async function runTests() {
    console.log('Starting Folder Drag and Drop Tests...');

    // Scenario 1: Single File
    console.log('\nTest 1: Single File');
    const file1 = new MockFileSystemFileEntry('test.txt', '/test.txt');
    const item1 = new MockDataTransferItem(file1);
    const results1 = await getFilesFromDataTransferItems([item1]);
    console.log('Results:', JSON.stringify(results1.map(r => ({ name: r.file.name, path: r.path })), null, 2));
    if (results1.length === 1 && results1[0].path === 'test.txt') {
        console.log('PASS');
    } else {
        console.log('FAIL');
    }

    // Scenario 2: Folder with one file
    console.log('\nTest 2: Folder with one file');
    const file2 = new MockFileSystemFileEntry('inside.txt', '/folder/inside.txt');
    const folder1 = new MockFileSystemDirectoryEntry('folder', [file2], '/folder');
    const item2 = new MockDataTransferItem(folder1);
    const results2 = await getFilesFromDataTransferItems([item2]);
    console.log('Results:', JSON.stringify(results2.map(r => ({ name: r.file.name, path: r.path })), null, 2));
    if (results2.length === 1 && results2[0].path === 'folder/inside.txt') {
        console.log('PASS');
    } else {
        console.log('FAIL');
    }

    // Scenario 3: Nested Folder Structure
    // root/
    //   - file1.txt
    //   - subfolder/
    //     - file2.txt
    console.log('\nTest 3: Nested Folder Structure');
    const file3 = new MockFileSystemFileEntry('file1.txt', '/root/file1.txt');
    const file4 = new MockFileSystemFileEntry('file2.txt', '/root/subfolder/file2.txt');
    const subfolder = new MockFileSystemDirectoryEntry('subfolder', [file4], '/root/subfolder');
    const root = new MockFileSystemDirectoryEntry('root', [file3, subfolder], '/root');
    const item3 = new MockDataTransferItem(root);
    const results3 = await getFilesFromDataTransferItems([item3]);
    // Sort results for consistent checking
    results3.sort((a, b) => a.path.localeCompare(b.path));
    console.log('Results:', JSON.stringify(results3.map(r => ({ name: r.file.name, path: r.path })), null, 2));

    if (results3.length === 2 &&
        results3[0].path === 'root/file1.txt' &&
        results3[1].path === 'root/subfolder/file2.txt') {
        console.log('PASS');
    } else {
        console.log('FAIL');
    }
}

runTests().catch(console.error);
