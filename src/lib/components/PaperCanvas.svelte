<script>
    import { onMount } from 'svelte';
    import paper from 'paper';

    export let key = null;
    export let sketch = null;
    export let reset = null;
    export let debug = false;
    export let animate = true;
    export let ping = 0;

    let canvas;

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
