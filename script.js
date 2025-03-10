const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const photoGrid = document.getElementById('photoGrid');
const startButton = document.getElementById('start');
const downloadAllButton = document.getElementById('downloadAll');
const photoCountSelect = document.getElementById('photoCount');
const photoStripCanvas = document.getElementById('photoStrip');
const ctx = photoStripCanvas.getContext('2d');
let photoCount = 3;
let takenPhotos = [];

// Akses kamera dengan fleksibilitas resolusi
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(error => console.error("Gagal mengakses kamera:", error));

// Event listener untuk memilih jumlah foto
photoCountSelect.addEventListener('change', () => {
    photoCount = parseInt(photoCountSelect.value);
});

async function startPhotoBooth() {
    takenPhotos = [];
    photoGrid.innerHTML = "";
    downloadAllButton.style.display = "none";

    for (let i = 0; i < photoCount; i++) {
        for (let count = 3; count > 0; count--) {
            timerDisplay.innerText = `Ambil foto dalam ${count} detik...`;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        timerDisplay.innerText = "📸 Klik!";
        await takePhoto();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    timerDisplay.innerText = "📸 Selesai!";
    downloadAllButton.style.display = "inline";
    mergePhotosToFrame();
}

function takePhoto() {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const targetWidth = 150;
        const targetHeight = 200;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        context.drawImage(video, 0, 0, targetWidth, targetHeight);
        
        const imageData = canvas.toDataURL('image/png');
        takenPhotos.push(imageData);

        const img = new Image();
        img.src = imageData;
        img.classList.add('photo-frame');

        // Atur tampilan agar foto berjejer dari kiri ke kanan di sebelah kanan atas
        img.style.display = 'block';
        img.style.margin = '0'; // Tidak perlu margin khusus

        // Atur photoGrid agar foto tersusun ke kanan
        photoGrid.style.display = 'flex';
        photoGrid.style.flexDirection = 'row'; // Foto akan berjejer ke kanan
        photoGrid.style.alignItems = 'flex-start'; // Foto tetap di atas

        photoGrid.appendChild(img);
        resolve();
    });
}

function mergePhotosToFrame() {
    const cols = photoCount > 3 ? 2 : 1;
    const rows = Math.ceil(photoCount / cols);
    const frameWidth = cols * 180 + 40;
    const frameHeight = rows * 180 + 40;
    photoStripCanvas.width = frameWidth;
    photoStripCanvas.height = frameHeight;
    photoStripCanvas.style.display = 'block';
    photoStripCanvas.style.margin = 'auto';
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, frameWidth, frameHeight);
    ctx.strokeStyle = frameColorPicker.value; // Warna bingkai dari input color
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, frameWidth - 10, frameHeight - 10);
    
    let xOffset = (frameWidth - (cols * 160 + (cols - 1) * 20)) / 2; // Pusatkan gambar
    let yOffset = 20;
    takenPhotos.forEach((photo, index) => {
        const img = new Image();
        img.src = photo;
        img.onload = () => {
            ctx.drawImage(img, xOffset, yOffset, 160, 160);
            xOffset += 180;
            if ((index + 1) % cols === 0) {
                xOffset = (frameWidth - (cols * 160 + (cols - 1) * 20)) / 2;
                yOffset += 180;
            }
        };
    });
}


// Input untuk memilih warna bingkai
const frameColorPicker = document.createElement('input');
frameColorPicker.type = 'color';
frameColorPicker.id = 'frameColorPicker';
frameColorPicker.value = '#000000'; // Default warna hitam
document.body.appendChild(frameColorPicker);

frameColorPicker.addEventListener('input', (event) => {
    ctx.strokeStyle = event.target.value;
    redrawFrame();
});

function redrawFrame() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, photoStripCanvas.width, photoStripCanvas.height);
    ctx.strokeRect(5, 5, photoStripCanvas.width - 10, photoStripCanvas.height - 10);

    let xOffset = 20, yOffset = 20;
    takenPhotos.forEach((photo, index) => {
        const img = new Image();
        img.src = photo;
        img.onload = () => {
            ctx.drawImage(img, xOffset, yOffset, 160, 160); // Menyesuaikan ukuran gambar
            xOffset += 180;
            if ((index + 1) % 2 === 0) {
                xOffset = 20;
                yOffset += 180;
            }
        };
    });
}

function mergePhotosToFrame() {
    const cols = photoCount > 3 ? 2 : 1;
    const rows = Math.ceil(photoCount / cols);
    const frameWidth = cols * 180 + 40;
    const frameHeight = rows * 180 + 40;
    photoStripCanvas.width = frameWidth;
    photoStripCanvas.height = frameHeight;
    photoStripCanvas.style.display = 'block';
    photoStripCanvas.style.margin = 'auto';
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, frameWidth, frameHeight);
    ctx.strokeStyle = frameColorPicker.value; // Warna bingkai dari input color
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, frameWidth - 10, frameHeight - 10);
    
    let xOffset = (frameWidth - (cols * 160 + (cols - 1) * 20)) / 2; // Pusatkan gambar
    let yOffset = 20;
    takenPhotos.forEach((photo, index) => {
        const img = new Image();
        img.src = photo;
        img.onload = () => {
            ctx.drawImage(img, xOffset, yOffset, 160, 160);
            xOffset += 180;
            if ((index + 1) % cols === 0) {
                xOffset = (frameWidth - (cols * 160 + (cols - 1) * 20)) / 2;
                yOffset += 180;
            }
        };
    });
}


function downloadAllPhotos() {
    const link = document.createElement('a');
    link.download = 'photo_strip.png';
    link.href = photoStripCanvas.toDataURL('image/png');
    link.click();
}


startButton.addEventListener('click', startPhotoBooth);
downloadAllButton.addEventListener('click', downloadAllPhotos);
