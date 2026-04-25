let currentScannerInstance = null;
let stream = null;
let scanningActive = false;
let decodeLock = false;

let lastScannedCode = null;
let lastScanTime = 0;

let fallbackTimer = null;
let visibilityPaused = false;

let currentTargetInputId = null;

function isDuplicate(code) {
    const now = Date.now();
    if (lastScannedCode === code && (now - lastScanTime) < 2000) return true;
    lastScannedCode = code;
    lastScanTime = now;
    return false;
}

async function startCamera(videoElement) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    const constraints = {
        video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = mediaStream;
    stream = mediaStream;
    await videoElement.play();
    await new Promise(resolve => {
        if (videoElement.readyState >= 2) return resolve();
        videoElement.onloadedmetadata = () => resolve();
    });
}

function stopScannerAndClose() {
    scanningActive = false;
    decodeLock = false;
    clearTimeout(fallbackTimer);
    if (currentScannerInstance) {
        if (typeof currentScannerInstance.stop === 'function') {
            try { currentScannerInstance.stop(); } catch(e) {}
        }
        if (typeof currentScannerInstance.reset === 'function') {
            try { currentScannerInstance.reset(); } catch(e) {}
        }
        currentScannerInstance = null;
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    const modal = document.getElementById('barcodeScannerModal');
    if (modal) modal.style.display = 'none';
    const video = document.getElementById('scannerVideo');
    if (video && video.srcObject) {
        video.srcObject = null;
    }
    currentTargetInputId = null;
}

document.addEventListener("visibilitychange", () => {
    visibilityPaused = document.hidden;
    if (visibilityPaused && stream) {
        stream.getTracks().forEach(t => t.enabled = false);
    } else if (!visibilityPaused && stream) {
        stream.getTracks().forEach(t => t.enabled = true);
    }
});

async function tryNativeBarcode(videoElement, onSuccess) {
    if (!("BarcodeDetector" in window)) return false;
    const formats = ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"];
    const detector = new BarcodeDetector({ formats });
    currentScannerInstance = detector;
    scanningActive = true;

    const loop = async () => {
        if (!scanningActive) return;
        if (decodeLock || visibilityPaused) {
            requestAnimationFrame(loop);
            return;
        }
        decodeLock = true;
        try {
            const barcodes = await detector.detect(videoElement);
            if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                if (!isDuplicate(code)) {
                    stopScannerAndClose();
                    onSuccess(code);
                    return;
                }
            }
        } catch(e) {}
        decodeLock = false;
        requestAnimationFrame(loop);
    };
    loop();
    return true;
}

function loadZXing() {
    return new Promise((resolve, reject) => {
        if (window.ZXing) return resolve(window.ZXing);
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@zxing/library@latest';
        script.onload = () => resolve(window.ZXing);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function startZXing(videoElement, onSuccess, resultDiv) {
    const ZXingLib = await loadZXing();
    const reader = new ZXingLib.BrowserMultiFormatReader();
    currentScannerInstance = reader;
    scanningActive = true;
    if (resultDiv) resultDiv.innerHTML = 'جاري مسح الباركود...';

    fallbackTimer = setTimeout(() => {
        if (!scanningActive) return;
        switchToQuagga(videoElement, onSuccess, resultDiv);
    }, 3000);

    const devices = await ZXingLib.BrowserMultiFormatReader.listVideoInputDevices();
    const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) ||
                       devices.find(d => d.label.toLowerCase().includes('environment'));
    const deviceId = backCamera?.deviceId || devices[0]?.deviceId;

    reader.decodeFromVideoDevice(deviceId, videoElement, (result) => {
        if (!result || !scanningActive) return;
        const code = result.getText();
        if (isDuplicate(code)) return;
        clearTimeout(fallbackTimer);
        stopScannerAndClose();
        onSuccess(code);
    });
}

function loadQuagga() {
    return new Promise((resolve, reject) => {
        if (window.Quagga) return resolve(window.Quagga);
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js';
        script.onload = () => resolve(window.Quagga);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function switchToQuagga(videoElement, onSuccess, resultDiv) {
    const Quagga = await loadQuagga();
    currentScannerInstance = Quagga;
    if (resultDiv) resultDiv.innerHTML = 'جاري مسح الباركود...';

    Quagga.init({
        inputStream: {
            type: 'LiveStream',
            target: videoElement,
            constraints: { facingMode: 'environment' }
        },
        decoder: {
            readers: ['ean_reader', 'upc_reader', 'code_128_reader', 'code_39_reader', 'ean_8_reader']
        },
        locate: true
    }, (err) => {
        if (err) return;
        Quagga.start();
        scanningActive = true;
    });

    Quagga.offDetected();
    Quagga.onDetected((data) => {
        if (!scanningActive) return;
        const code = data?.codeResult?.code;
        if (isDuplicate(code)) return;
        stopScannerAndClose();
        onSuccess(code);
    });
}

async function startBarcodeScanner(targetInputId) {
    currentTargetInputId = targetInputId;
    const modal = document.getElementById('barcodeScannerModal');
    const video = document.getElementById('scannerVideo');
    const resultDiv = document.getElementById('scannerResult');

    if (!modal || !video) return;

    stopScannerAndClose();
    modal.style.display = 'flex';
    if (resultDiv) resultDiv.innerHTML = 'جاري تشغيل الكاميرا...';

    try {
        await startCamera(video);
        if (resultDiv) resultDiv.innerHTML = 'الكاميرا جاهزة، انتظر مسح الباركود...';

        const onSuccess = (code) => {
            const input = document.getElementById(targetInputId);
            if (input) input.value = code;
        };

        const nativeUsed = await tryNativeBarcode(video, onSuccess);
        if (nativeUsed) return;

        await startZXing(video, onSuccess, resultDiv);
    } catch (err) {
        console.error('Barcode scanner error:', err);
        if (resultDiv) resultDiv.innerHTML = '❌ تعذر فتح الكاميرا. استخدم الإدخال اليدوي.';
        alert('لا يمكن الوصول إلى الكاميرا. يرجى السماح بالوصول أو استخدام الإدخال اليدوي.');
        setTimeout(() => stopScannerAndClose(), 3000);
    }
}

async function startScannerForSearch() {
    const modal = document.getElementById('barcodeScannerModal');
    const video = document.getElementById('scannerVideo');
    const resultDiv = document.getElementById('scannerResult');

    if (!modal || !video) return;

    stopScannerAndClose();
    modal.style.display = 'flex';
    if (resultDiv) resultDiv.innerHTML = 'جاري تشغيل الكاميرا...';

    try {
        await startCamera(video);
        if (resultDiv) resultDiv.innerHTML = 'الكاميرا جاهزة، انتظر مسح الباركود...';

        const onSuccess = async (code) => {
            if (typeof db !== 'undefined') {
                const med = await db.meds.where('barcode').equals(code).first();
                if (med && typeof window.showMedDetails === 'function') {
                    window.showMedDetails(med);
                } else {
                    alert('لم يتم العثور على دواء بهذا الباركود');
                }
            } else {
                alert('قاعدة البيانات غير جاهزة');
            }
        };

        const nativeUsed = await tryNativeBarcode(video, onSuccess);
        if (nativeUsed) return;

        await startZXing(video, onSuccess, resultDiv);
    } catch (err) {
        console.error('Barcode scanner error:', err);
        if (resultDiv) resultDiv.innerHTML = '❌ تعذر فتح الكاميرا.';
        alert('لا يمكن الوصول إلى الكاميرا.');
        setTimeout(() => stopScannerAndClose(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const scanBarcodeBtn = document.getElementById('scanBarcodeBtn');
    if (scanBarcodeBtn) {
        scanBarcodeBtn.onclick = () => startBarcodeScanner('medBarcode');
    }
    
    const scanBarcodeGenBtn = document.getElementById('scanBarcodeGenBtn');
    if (scanBarcodeGenBtn) {
        scanBarcodeGenBtn.onclick = () => startBarcodeScanner('genBarcode');
    }
    
    const homeBarcodeBtn = document.getElementById('homeBarcodeBtn');
    if (homeBarcodeBtn) {
        homeBarcodeBtn.onclick = () => startScannerForSearch();
    }
    
    const barcodeSearchBtn = document.getElementById('barcodeSearchBtn');
    if (barcodeSearchBtn) {
        barcodeSearchBtn.onclick = () => startScannerForSearch();
    }
    
    const closeScannerModal = document.getElementById('closeScannerModal');
    if (closeScannerModal) closeScannerModal.onclick = stopScannerAndClose;
    
    const cancelScannerBtn = document.getElementById('cancelScannerBtn');
    if (cancelScannerBtn) cancelScannerBtn.onclick = stopScannerAndClose;
    
    const manualBarcodeBtn = document.getElementById('manualBarcodeBtn');
    if (manualBarcodeBtn) {
        manualBarcodeBtn.onclick = () => {
            const barcode = prompt('أدخل الباركود يدويًا:');
            if (barcode && barcode.trim()) {
                if (currentTargetInputId) {
                    const input = document.getElementById(currentTargetInputId);
                    if (input) input.value = barcode.trim();
                    stopScannerAndClose();
                } else {
                    stopScannerAndClose();
                    if (typeof db !== 'undefined') {
                        db.meds.where('barcode').equals(barcode.trim()).first().then(med => {
                            if (med && typeof window.showMedDetails === 'function') {
                                window.showMedDetails(med);
                            } else {
                                alert('لم يتم العثور على دواء بهذا الباركود');
                            }
                        });
                    } else {
                        alert('قاعدة البيانات غير جاهزة');
                    }
                }
            }
        };
    }
});

window.startBarcodeScanner = startBarcodeScanner;
window.startScannerForSearch = startScannerForSearch;
window.stopScannerAndClose = stopScannerAndClose;
