<script>
    import { onMount } from 'svelte';
    import paper from 'paper';

    export let key = null;
    export let name = null;
    export let sketch = null;
    export let reset = null;
    export let debug = false;
    export let animate = true;
    export let ping = 0;

    let exportedFrames = 0;

    let canvas;

    export function downloadFrame() {
        if (!canvas) {
            return;
        }
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        var ctx = tempCanvas.getContext('2d');

        // Fill the temp canvas with white background
        ctx.fillStyle = '#ffffff'; // Set color to white
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the original canvas onto the temp canvas
        ctx.drawImage(canvas, 0, 0);

        // Load and draw the watermark
        var watermark = new Image();
        watermark.src = 'watermark.png'; // Path to your watermark image
        watermark.onload = function() {
            // Set the desired width and height for the watermark
            var scale = 0.5; // Example scale factor (50%)
            var watermarkWidth = watermark.width * scale;
            var watermarkHeight = watermark.height * scale;

            // Position the watermark at the bottom right corner, adjust as needed
            var x = tempCanvas.width - watermarkWidth - 10; // 10px padding from right
            var y = tempCanvas.height - watermarkHeight - 10; // 10px padding from bottom

            ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight);

            // Now export the temp canvas as an image
            var image = tempCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');

            var link = document.createElement('a');
            link.download = getFrameFileName();
            link.href = image;
            link.target = '_blank';
            link.click();
            link.remove();
        };
    }

    const getFrameFileName = () => {
        let sketchName = "";
        if (name) {
            sketchName = name.toLowerCase();
            sketchName = sketchName.replaceAll(" ", "-");
            sketchName = sketchName.replaceAll("(", "");
            sketchName = sketchName.replaceAll(")", "");
            sketchName = sketchName.replaceAll(",", "");
            sketchName = sketchName.replaceAll(".", "");
        }
        return `d17e.dev-genuary2024-${sketchName}-${exportedFrames++}.png`;
    }

    onMount(() => {
        paper.setup(canvas);
        if (sketch && typeof sketch === 'function') {
            if (animate) {
                paper.view.onFrame = (event) => {
                    sketch(paper, event, debug);
                }
            }
            else {
                sketch(paper, null, debug);
            }
        } else {
            console.error('Draw function not provided or not a function');
        }
    });

    $: if (sketch) {
        if (paper && paper.project && paper.project.activeLayer) {
            paper.project.activeLayer.removeChildren();
        }
        if (reset) {
            reset();
        }
        if (animate) {
            if (paper && paper.view) {
                paper.view.onFrame = (event) => {
                    sketch(paper, event, debug);
                }
            }
        } else if (!animate) {
            paper.view.onFrame = null;
            sketch(paper, null, debug);
        }
    }

    $: if (ping) {
        if (!animate) {
            sketch(paper, null, debug);
        }
    }
</script>

<div class="canvas-container" id={key}>
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    canvas {
        border: 1px dashed black;
        width: 80vmin;
        aspect-ratio: 1;
    }

    .canvas-container {
        display: flex;
        justify-content: center;
        align-items: center;
        /*height: 100vh; !* Adjust height as needed *!*/
    }

</style>
