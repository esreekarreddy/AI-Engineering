import { useState, useEffect } from 'react';
import { getWebContainer } from '../lib/webcontainer';
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
    const [instance, setInstance] = useState<WebContainer | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function boot() {
            try {
                const wc = await getWebContainer();
                if (mounted) {
                    setInstance(wc);
                    wc.on('server-ready', (port, url) => {
                        setPreviewUrl(url);
                    });
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Failed to boot WebContainer:', err);
            }
        }

        boot();

        return () => {
            mounted = false;
        };
    }, []);

    return { instance, previewUrl, isLoading };
}
