import { TLShape } from "tldraw";



export function sceneToPrompt(shapes: TLShape[]): string {
    if (shapes.length === 0) return "A blank page.";

    // 1. Normalize Shapes (convert tldraw shapes to generic generic bboxes)
    const items = shapes.map(s => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const props = s.props as any;
        return {
            id: s.id,
            type: s.type,
            text: props.text || "",
            x: s.x,
            y: s.y,
            w: props.w || 10,
            h: props.h || 10,
            color: props.color || "black"
        };
    }).sort((a, b) => a.y - b.y); // Sort by vertical position (reading order)

    // 2. Spatial Analysis Heuristics
    let analysis = "Create a React component using Tailwind CSS with the following layout:\n\n";

    // Detect "Main Containers" (Large Rectangles)
    const containers = items.filter(i => i.type === 'geo' && i.w > 300 && i.h > 200);
    const elements = items.filter(i => !containers.includes(i));

    if (containers.length > 0) {
        analysis += "CONTAINERS DETECTED:\n";
        containers.forEach(c => {
            analysis += `- A large container/section at (y=${Math.round(c.y)}) with ${c.color} background.\n`;
            // Find children inside this container
            const children = elements.filter(e => 
                e.x >= c.x && e.x <= c.x + c.w && 
                e.y >= c.y && e.y <= c.y + c.h
            );
            if (children.length > 0) {
                 analysis += "  Contains:\n";
                 describeElements(children, "  ", analysis);
            }
        });
    }

    // Describe loose elements
    const looseElements = elements.filter(e => 
        !containers.some(c => e.x >= c.x && e.x <= c.x + c.w && e.y >= c.y && e.y <= c.y + c.h)
    );

    if (looseElements.length > 0) {
        analysis += "\nLOOSE ELEMENTS:\n";
        describeElements(looseElements, "", analysis);
    }

    // 3. Prompt Engineering Injection
    analysis += `
    \nIMPORTANT DESIGN RULES:
    1. USE SHADCN/UI PATTERNS:
       - Inputs: 'flex h-10 w-full rounded-md border border-input bg-zinc-900/50 px-3 py-2 text-sm ring-offset-background'
       - Buttons: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'
       - Cards: 'rounded-xl border border-zinc-800 bg-zinc-950 text-card-foreground shadow-sm'
    
    2. ICONS:
       - Use 'lucide-react' icons where appropriate (e.g. if text is "Search", add a Search icon).
    
    3. THEME:
       - Dark Mode by default (Use zinc-950 for backgrounds, zinc-800 for borders).
       - Violet/Purple accents (violet-600).
    `;

    return analysis;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function describeElements(items: any[], indent: string, buffer: string) {
    items.forEach(item => {
        // Heuristic: Input Field (Rectangle + "Type here" or empty rect near label)
        if (item.type === 'geo' && item.h < 60 && item.w > 100) {
             buffer += `${indent}- An Input Field or Button (y=${Math.round(item.y)}). Text: "${item.text}"\n`;
        } 
        // Heuristic: Avatar / Icon (Small square/circle)
        else if (item.type === 'geo' && item.w < 60 && item.h < 60) {
             buffer += `${indent}- An Icon or Avatar (y=${Math.round(item.y)}).\n`;
        }
        else if (item.type === 'text') {
             // Heuristic: Header vs Label
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             if ((item.props as any)?.size === 'l' || (item.props as any)?.scale > 1.5) {
                 buffer += `${indent}- MAIN HEADER: "${item.text}"\n`;
             } else {
                 buffer += `${indent}- Text Label: "${item.text}"\n`;
             }
        }
        else {
             buffer += `${indent}- Element (${item.type}) at y=${Math.round(item.y)}\n`;
        }
    });
    return buffer;
}
