/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { spawnSync } from 'child_process';
import { promises } from 'fs';
import { join } from 'path';
import { BUILD_FOLDER, Platform, platform } from './constants';

export async function exists(path: string): Promise<boolean> {
    try {
        await promises.stat(path);

        return true;
    } catch (error) {
        return false;
    }
}

export function getBuildPath(commit: string): string {
    if (platform === Platform.WindowsX64 || platform === Platform.WindowsArm) {
        return join(BUILD_FOLDER, commit.substring(0, 6)); // keep the folder path small for windows max path length restrictions
    }

    return join(BUILD_FOLDER, commit);
}

export async function unzip(source: string, destination: string): Promise<void> {

    // *.zip: macOS, Windows
    if (source.endsWith('.zip')) {

        // Windows
        if (platform === Platform.WindowsX64 || platform === Platform.WindowsArm) {
            spawnSync('powershell.exe', [
                '-NoProfile',
                '-ExecutionPolicy', 'Bypass',
                '-NonInteractive',
                '-NoLogo',
                '-Command',
                `Microsoft.PowerShell.Archive\\Expand-Archive -Path "${source}" -DestinationPath "${destination}"`
            ]);
        }

        // macOS
        else {
            spawnSync('unzip', [source, '-d', destination]);
        }
    }

    // *.tar.gz: Linux
    else {
        if (!await exists(destination)) {
            await promises.mkdir(destination); // tar does not create extractDir by default
        }

        spawnSync('tar', ['-xzf', source, '-C', destination]);
    }
}
