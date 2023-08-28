let tracing = false;
let polygon = [];
const siteMap = document.getElementById('site-map');
const startButton = document.getElementById('start-tracing');
const doneButton = document.getElementById('done-tracing');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const successModal = document.getElementById('success-modal');
const closeModalButton = document.getElementById('close-modal');

let zoomLevel = 1;
let panX = 0;
let panY = 0;
canvas.addEventListener('wheel', handleZoom);
document.addEventListener('keydown', handlePan);


function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPolygon(points) {
  if (points.length < 2) {
    console.log('124')
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas


  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  console.log('125')
  for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.closePath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function handleZoom(event) {
  if (event.ctrlKey) {
    event.preventDefault();
    const scaleFactor = 0.1;
    const zoomIn = event.deltaY < 0;
    
    if (zoomIn && zoomLevel < 2) {
      zoomLevel += scaleFactor;
    } else if (!zoomIn && zoomLevel > 0.5) {
      zoomLevel -= scaleFactor;
    }

    canvas.width = siteMap.width * zoomLevel;
    canvas.height = siteMap.height * zoomLevel;

    clearCanvas();
    drawPolygon(polygon);
  }
}

function handlePan(event) {
  if (event.ctrlKey) {
    event.preventDefault();
    const panSpeed = 20;

    if (event.key === 'ArrowUp') {
      panY -= panSpeed;
    } else if (event.key === 'ArrowDown') {
      panY += panSpeed;
    } else if (event.key === 'ArrowLeft') {
      panX -= panSpeed;
    } else if (event.key === 'ArrowRight') {
      panX += panSpeed;
    }

    clearCanvas();
    ctx.drawImage(siteMap, panX, panY, canvas.width, canvas.height);
    drawPolygon(polygon);
  }
}

startButton.addEventListener('click', () => {
    tracing = true;
    polygon = [];
    siteMap.style.cursor = 'crosshair';
    startButton.disabled = true;
    doneButton.disabled = false;
});

function promptWithLabel() {
    return new Promise(resolve => {
        const lotLabel = prompt('Enter Lot Label:');
        resolve(lotLabel);
    });
}

doneButton.addEventListener('click', async () => {
    tracing = false;
    siteMap.style.cursor = 'default';
    startButton.disabled = false;
    doneButton.disabled = true;

    const lotLabel = await promptWithLabel();
    const currentDateTime = new Date();
    const formattedDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');

    try {
        await fetch("/save", {
            method: "POST",
            body: JSON.stringify({
                label: lotLabel,
                datetime: formattedDateTime,
                polygon: polygon
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });

        console.log('Lot data saved successfully.');
        successModal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
});
closeModalButton.addEventListener('click', () => {
  successModal.style.display = 'none';
});
siteMap.addEventListener('click', (event) => {
    if (tracing) {
        const rect = siteMap.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        polygon.push({ x, y });

        if (polygon.length > 1) {
          clearCanvas();
          drawPolygon(polygon);
        }
    }
});
