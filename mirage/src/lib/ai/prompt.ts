import { TLShape } from "tldraw";

interface ShapeItem {
    id: string;
    type: string;
    text: string;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    geo: string;
}

export function sceneToPrompt(shapes: TLShape[]): string {
    if (shapes.length === 0) return "A blank page.";

    // 1. Calculate Bounding Box to normalize coordinates
    const minX = Math.min(...shapes.map(s => s.x));
    const minY = Math.min(...shapes.map(s => s.y));

    // 2. Convert tldraw shapes to describable items with NORMALIZED positions
    const items: ShapeItem[] = shapes.map(s => {
        const props = s.props as Record<string, unknown>;
        return {
            id: s.id,
            type: s.type,
            text: (props.text as string) || "",
            // Normalize: Shift to 0,0 and add 40px padding
            x: Math.round(s.x - minX + 40),
            y: Math.round(s.y - minY + 40),
            w: Math.round((props.w as number) || 100),
            h: Math.round((props.h as number) || 100),
            color: (props.color as string) || "black",
            geo: (props.geo as string) || "rectangle"
        };
    }).sort((a, b) => a.y - b.y);

    // Build a CLEAR description of what was drawn
    let description = "BUILD A UI BASED ON THIS WIREFRAME:\n\n";
    description += `Total elements: ${items.length}\n\n`;

    // Describe each element clearly
    items.forEach((item, idx) => {
        description += `Element ${idx + 1}:\n`;
        description += `  - Type: ${item.type}${item.geo ? ` (${item.geo})` : ''}\n`;
        description += `  - Position: x=${item.x}, y=${item.y}\n`;
        description += `  - Size: ${item.w}x${item.h}px\n`;
        
        if (item.text) {
            description += `  - Text: "${item.text}"\n`;
        }
        
        if (item.color && item.color !== 'black') {
            description += `  - Color: ${item.color}\n`;
        }
        
        // Provide UI interpretation hints
        if (item.type === 'geo') {
            if (item.w > 300 && item.h > 200) {
                description += `  → Interpretation: This is a CARD or CONTAINER\n`;
            } else if (item.h < 60 && item.w > 150) {
                description += `  → Interpretation: This looks like a BUTTON or INPUT FIELD\n`;
            } else if (item.w < 80 && item.h < 80) {
                description += `  → Interpretation: This is an ICON or AVATAR\n`;
            } else {
                description += `  → Interpretation: This is a BOX/PANEL element\n`;
            }
        } else if (item.type === 'text') {
            description += `  → Interpretation: Display this text: "${item.text}"\n`;
        } else if (item.type === 'draw' || item.type === 'line' || item.type === 'arrow') {
            description += `  → Interpretation: This is a decorative stroke/line\n`;
        }
        
        description += '\n';
    });

    // Add generation rules
    description += `
GENERATION RULES:
1. Create a React component that visually MATCHES the wireframe above
2. Preserve the approximate layout and positioning (use flexbox/grid)
3. If there's text in an element, display that EXACT text
4. Use the specified colors when mentioned

TECHNICAL REQUIREMENTS:
- export default function App()
- Use ONLY inline Tailwind CSS classes
- If using icons: import { IconName } from 'lucide-react' (PascalCase)
- DO NOT import from shadcn-ui or any UI library
- Dark theme: zinc-950 background, zinc-800 borders, violet-600 accents
- Output ONLY the code, no markdown, no explanation
`;

    return description;
}
