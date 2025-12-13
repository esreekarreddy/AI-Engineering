import { WebContainer } from '@webcontainer/api';

let webContainerInstance: WebContainer | null = null;

export const getWebContainer = async () => {
    if (webContainerInstance) return webContainerInstance;
    
    webContainerInstance = await WebContainer.boot();
    return webContainerInstance;
};

export const writeFile = async (path: string, content: string) => {
    const instance = await getWebContainer();
    await instance.fs.writeFile(path, content);
};

export const installDependencies = async (terminalCallback?: (data: string) => void) => {
    const instance = await getWebContainer();
    const process = await instance.spawn('npm', ['install']);
    
    process.output.pipeTo(new WritableStream({
        write(data) {
            terminalCallback?.(data);
        }
    }));
    
    return process.exit;
};

export const runDev = async (terminalCallback?: (data: string) => void) => {
    const instance = await getWebContainer();
    const process = await instance.spawn('npm', ['run', 'dev']);

    process.output.pipeTo(new WritableStream({
        write(data) {
            terminalCallback?.(data);
        }
    }));

    instance.on('server-ready', (port, url) => {
        terminalCallback?.(`Server ready at ${url}`);
    });
};
