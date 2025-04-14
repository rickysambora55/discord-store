import { readdirSync } from "fs";
import { join } from "path";

export default (directory, foldersOnly = false) => {
    let fileNames = [];

    // Read the folder and get the files path
    const files = readdirSync(directory, { withFileTypes: true });

    // Loop for each file
    for (const file of files) {
        // Get the file path
        const filePath = join(directory, file.name);

        if (foldersOnly) {
            // Push folder path
            if (file.isDirectory()) {
                fileNames.push(filePath);
            }
        } else {
            if (file.isFile()) {
                // Push file path
                fileNames.push(filePath);
            }
        }
    }

    return fileNames;
};
