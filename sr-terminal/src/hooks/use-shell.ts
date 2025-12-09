import { useCallback, useRef, useState } from 'react';
import type { Terminal } from '@xterm/xterm';
import { getWebContainerInstance, files } from '@/lib/webcontainer';
import { WebContainer, WebContainerProcess } from '@webcontainer/api';

export function useShell() {
  const [container, setContainer] = useState<WebContainer | null>(null);
  const shellProcesses = useRef<Map<string, { process: WebContainerProcess, writer: WritableStreamDefaultWriter<string> }>>(new Map());

  const startShell = useCallback(async (id: string, terminal: Terminal) => {
    try {
      const webcontainer = await getWebContainerInstance();
      setContainer(webcontainer);

      // Mount initial files only once generally, but safe to call repeatedly as it just overwrites
      if (shellProcesses.current.size === 0) {
          await webcontainer.mount(files);
      }

      // Spawn 'jsh'
      const shell = await webcontainer.spawn('jsh', {
        terminal: {
          cols: terminal.cols,
          rows: terminal.rows,
        },
      });
      
      const input = shell.input.getWriter();
      shellProcesses.current.set(id, { process: shell, writer: input });

      // Pipe process output to terminal
      shell.output.pipeTo(
        new WritableStream({
          write(data) {
            terminal.write(data);
          },
        })
      );

      // Pipe terminal input to process
      terminal.onData((data) => {
        input.write(data);
      });

      terminal.writeln(`\x1b[32m✔ Terminal [${id}] ready.\x1b[0m`);
      terminal.writeln('');

    } catch (error) {
        console.error(`Boot failed for ${id}:`, error);
        terminal.writeln('\x1b[31mCRITICAL ERROR: Kernel boot failed.\x1b[0m');
    }
  }, []);

  const runCommand = useCallback(async (command: string, id: string = 'main') => {
    const session = shellProcesses.current.get(id);
    if (session) {
      await session.writer.write(command);
    } else {
        console.warn(`Shell process ${id} not found.`);
    }
  }, []);

  return { startShell, container, runCommand };
}
